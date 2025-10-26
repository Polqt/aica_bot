'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, RefreshCw, Zap, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { JobMatch } from '@/types/jobMatch';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { useJobMatchesWithCache, cacheManager } from '@/hooks/useCacheManager';
import { JobCard } from '@/components/JobCard';
import { JobDetails } from '@/components/JobDetails';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';

export default function JobMatchesPage() {
  const searchParams = useSearchParams();
  const isFromUpload = searchParams.get('from') === 'upload';

  const { savedJobIds, savingJobId, saveJob, removeJob, refreshSavedJobs } =
    useSavedJobs();
  const {
    jobMatches,
    recommendations,
    loading,
    loadJobMatches,
    loadStats,
    regenerateMatches,
    clearMatches,
  } = useJobMatchesWithCache();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  // Start with false - will be set to true only if we have recommendations and no matches
  const [showingRecommendations, setShowingRecommendations] = useState(false);
  const [pollingForMatches, setPollingForMatches] = useState(false);

  const checkProcessingStatus = useCallback(async () => {
    try {
      setIsCheckingStatus(true);
      const status = await apiClient.get<{
        status: string;
        message?: string;
        matches_found?: number;
      }>('/auth/processing-status');

      console.log('[page.tsx] Processing status check:', {
        status: status.status,
        message: status.message,
        matchesFound: status.matches_found,
        timestamp: new Date().toISOString(),
      });

      setProcessingStatus(status.status);

      if (
        status.status === 'processing' ||
        status.status === 'parsing' ||
        status.status === 'matching' ||
        status.status === 'finalizing'
      ) {
        setTimeout(checkProcessingStatus, 3000);
      } else if (status.status === 'completed') {
        setProcessingStatus('completed');
      }
    } catch {
      setProcessingStatus('not_processing');
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  useEffect(() => {
    // Only check processing status on initial mount
    checkProcessingStatus();
    refreshSavedJobs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Load matches after status check completes
    if (!isCheckingStatus) {
      // If coming from upload and still processing, wait for completion
      if (
        isFromUpload &&
        (processingStatus === 'processing' ||
          processingStatus === 'parsing' ||
          processingStatus === 'matching' ||
          processingStatus === 'finalizing')
      ) {
        console.log('[page.tsx] Still processing, waiting for completion');
        return;
      }
      // If coming from upload, ALWAYS skip cache for fresh data
      // OR if processing status shows completed, force fresh data
      const shouldSkipCache =
        isFromUpload ||
        processingStatus === 'completed' ||
        processingStatus === 'not_processing';

      // When coming from upload, also skip recommendations until we confirm matches exist
      const shouldSkipRecommendations = isFromUpload;

      console.log('[page.tsx] Loading job matches:', {
        isFromUpload,
        processingStatus,
        shouldSkipCache,
        shouldSkipRecommendations,
        isCheckingStatus,
        timestamp: new Date().toISOString(),
      });
      loadJobMatches(shouldSkipCache, shouldSkipRecommendations);
      loadStats(shouldSkipCache);
    }
  }, [isCheckingStatus, processingStatus, isFromUpload]); // eslint-disable-line react-hooks/exhaustive-deps

  // When processing completes, clear cache and reload fresh matches
  useEffect(() => {
    if (processingStatus === 'completed' && !isCheckingStatus) {
      console.log(
        '[page.tsx] Processing completed, clearing cache and reloading',
      );

      // Clear cache so we fetch fresh data from backend
      cacheManager.clear(
        'aica_job_matches',
        'aica_matching_stats',
        'aica_recommendations',
      );

      // Force reload fresh data from database
      loadJobMatches(true); // skipCache = true
      loadStats(true); // skipCache = true

      // Reset processing status to prevent repeated clearing
      setProcessingStatus(null);
    }
  }, [processingStatus, isCheckingStatus, loadJobMatches, loadStats]);

  // Polling effect for when coming from upload and still processing
  useEffect(() => {
    if (
      isFromUpload &&
      (processingStatus === 'processing' ||
        processingStatus === 'parsing' ||
        processingStatus === 'matching' ||
        processingStatus === 'finalizing') &&
      !isCheckingStatus
    ) {
      setPollingForMatches(true);

      const pollInterval = setInterval(async () => {
        try {
          const status = await apiClient.get<{
            status: string;
            message?: string;
            matches_found?: number;
          }>('/auth/processing-status');

          console.log('[page.tsx] Polling status:', {
            status: status.status,
            matchesFound: status.matches_found,
            timestamp: new Date().toISOString(),
          });

          if (status.status === 'completed') {
            console.log(
              '[page.tsx] Processing completed via polling, loading fresh matches',
            );
            setProcessingStatus('completed');
            setPollingForMatches(false);
            clearInterval(pollInterval);

            // Clear cache and load fresh data
            cacheManager.clear(
              'aica_job_matches',
              'aica_matching_stats',
              'aica_recommendations',
            );

            loadJobMatches(true);
            loadStats(true);
          }
        } catch (error) {
          console.error('Error polling processing status:', error);
        }
      }, 3000); // Poll every 3 seconds

      return () => {
        clearInterval(pollInterval);
        setPollingForMatches(false);
      };
    } else {
      setPollingForMatches(false);
    }
  }, [
    isFromUpload,
    processingStatus,
    isCheckingStatus,
    loadJobMatches,
    loadStats,
  ]);

  // Update showingRecommendations based on jobMatches and recommendations state
  // This ensures we always prioritize real matches over recommendations
  useEffect(() => {
    const hasRealMatches = jobMatches && jobMatches.length > 0;
    const hasRecommendations = recommendations && recommendations.length > 0;

    console.log('[page.tsx] Display state update:', {
      jobMatchesLength: jobMatches?.length || 0,
      recommendationsLength: recommendations?.length || 0,
      hasRealMatches,
      hasRecommendations,
      willShowRecommendations: !hasRealMatches && hasRecommendations,
      timestamp: new Date().toISOString(),
    });

    // Only show recommendations if we have NO real matches but DO have recommendations
    setShowingRecommendations(!hasRealMatches && hasRecommendations);
  }, [jobMatches, recommendations]);

  const refreshMatches = useCallback(async () => {
    try {
      setRefreshing(true);

      // Try to generate new matches using current resume builder data
      try {
        const result = await apiClient.generateMatches();

        // Show success message with details
        if ((result.new_matches ?? 0) > 0) {
          toast.success(`Added ${result.new_matches} new job matches!`, {
            description:
              (result.duplicates_skipped ?? 0) > 0
                ? `${result.duplicates_skipped} jobs were already in your matches`
                : `You now have ${result.total_matches_now} total matches`,
          });
        } else if ((result.duplicates_skipped ?? 0) > 0) {
          toast.info('No new matches found', {
            description: `All ${result.duplicates_skipped} matching jobs are already in your list`,
          });
        } else {
          toast.info('No new matches found', {
            description:
              'Try updating your skills or check back later for new job postings',
          });
        }
      } catch {
        // Fallback to resume-based matching
        const result = await apiClient.post<{
          new_matches?: number;
          duplicates_skipped?: number;
          total_matches_now?: number;
        }>('/jobs/find-matches');

        if (result && (result.new_matches ?? 0) > 0) {
          toast.success(`Added ${result.new_matches} new job matches!`);
        }
      }

      // Clear cache BEFORE reload to ensure fresh data
      cacheManager.clear(
        'aica_job_matches',
        'aica_matching_stats',
        'aica_recommendations',
      );

      // Force refresh with cache bypass
      await loadJobMatches(true); // skipCache = true
      await loadStats(true); // skipCache = true
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh matches';
      toast.error('Failed to refresh matches', {
        description: errorMessage,
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadJobMatches, loadStats]);

  const handleClearMatches = useCallback(async () => {
    try {
      setIsClearing(true);
      await clearMatches();
      setSelectedJob(null);
      setShowClearDialog(false);
    } finally {
      setIsClearing(false);
    }
  }, [clearMatches]);

  const handleRegenerateMatches = useCallback(async () => {
    try {
      setRefreshing(true);
      await regenerateMatches();
      setSelectedJob(null);
      setShowRegenerateDialog(false);
    } finally {
      setRefreshing(false);
    }
  }, [regenerateMatches]);

  // Memoize filtered matches to prevent unnecessary recalculations
  const filteredMatches = useMemo(() => {
    const displayJobs = showingRecommendations ? recommendations : jobMatches;

    return displayJobs.filter(match => {
      const matchesSearch =
        searchTerm === '' ||
        match.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filter === 'all' || match.confidence === filter;

      return matchesSearch && matchesFilter;
    });
  }, [jobMatches, recommendations, showingRecommendations, searchTerm, filter]);

  // Check if we should show loading skeleton
  const showLoadingSkeleton =
    (loading || isCheckingStatus || pollingForMatches) &&
    jobMatches.length === 0 &&
    recommendations.length === 0;

  // Determine processing status to show
  const activeProcessingStatus = isCheckingStatus
    ? ('checking' as const)
    : pollingForMatches
    ? ('processing' as const)
    : processingStatus === 'processing' ||
      processingStatus === 'parsing' ||
      processingStatus === 'matching' ||
      processingStatus === 'finalizing'
    ? (processingStatus as 'processing' | 'parsing' | 'matching' | 'finalizing')
    : undefined;

  if (showLoadingSkeleton) {
    return (
      <LoadingState
        icon={RefreshCw}
        title="Finding Your Perfect Matches"
        description="Our AI is analyzing thousands of opportunities..."
        showSkeleton={true}
        showProcessingStatus={!!activeProcessingStatus}
        processingStatus={activeProcessingStatus}
        variant="full"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-semibold text-gray-900">
              {showingRecommendations
                ? 'Job Recommendations'
                : 'AI Job Matches'}
            </h1>
          </div>
          <p className="text-base text-gray-500">
            {showingRecommendations
              ? 'Browse job postings while we find your perfect matches'
              : 'Discover opportunities tailored to your skills'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowClearDialog(true)}
            disabled={loading || jobMatches.length === 0 || isClearing}
            variant="neutral"
            className="border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-600 font-medium px-4 py-2 shadow-sm hover:shadow-md transition-all duration-150 rounded-md flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={refreshMatches}
              disabled={refreshing || isClearing}
              className="bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-medium px-4 py-2 shadow-sm hover:shadow-md transition-all duration-150 rounded-md flex items-center gap-2"
            >
              {refreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {refreshing ? 'Finding matches...' : 'Refresh Matches'}
            </Button>

            <Button
              onClick={() => setShowRegenerateDialog(true)}
              disabled={refreshing || isClearing || jobMatches.length === 0}
              variant="neutral"
              className="border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium px-4 py-2 shadow-sm hover:shadow-md transition-all duration-150 rounded-md flex items-center gap-2"
              title="Clear all matches and generate fresh ones from scratch"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate All
            </Button>
          </div>
        </div>
      </motion.div>

      {showingRecommendations && !pollingForMatches && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                {isFromUpload
                  ? 'Processing Your Resume'
                  : 'No Perfect Matches Yet'}
              </h3>
              <p className="text-sm text-blue-800">
                We couldn&apos;t find jobs that match your current skills. Here
                are some recent job postings you might be interested in. Try
                updating your skills in your profile or uploading your resume to
                get personalized matches!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search job matches..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow hover:border-gray-300"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow hover:border-gray-300 cursor-pointer"
        >
          <option value="all">All confidence levels</option>
          <option value="high">High confidence</option>
          <option value="medium">Medium confidence</option>
          <option value="low">Low confidence</option>
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-300px)] min-h-[500px]"
      >
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2">
          {filteredMatches.length === 0 ? (
            <EmptyState
              icon={Search}
              title={
                searchTerm || filter !== 'all'
                  ? 'No matches found'
                  : showingRecommendations
                  ? 'No recommendations available'
                  : 'No job matches yet'
              }
              description={
                searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : showingRecommendations
                  ? 'Check back later for new job postings'
                  : 'Click "Refresh matches" to find jobs tailored to your skills'
              }
              actionLabel={
                searchTerm || filter !== 'all' ? 'Clear filters' : undefined
              }
              onAction={
                searchTerm || filter !== 'all'
                  ? () => {
                      setSearchTerm('');
                      setFilter('all');
                    }
                  : undefined
              }
              variant="center"
            />
          ) : (
            filteredMatches.map((match, index) => (
              <JobCard
                key={match.job_id}
                job={match}
                isSelected={selectedJob?.job_id === match.job_id}
                onClick={() => setSelectedJob(match)}
                index={index}
                variant="match"
              />
            ))
          )}
        </div>

        <div className="lg:col-span-3 overflow-y-auto pr-2">
          {selectedJob ? (
            <JobDetails
              job={selectedJob}
              variant="match"
              isSaved={savedJobIds.includes(selectedJob.job_id)}
              isSaving={savingJobId === selectedJob.job_id}
              onSave={() => saveJob(selectedJob.job_id)}
              onUnsave={() => removeJob(selectedJob.job_id)}
            />
          ) : (
            <Card className="h-full flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardContent>
                <p className="text-gray-500 text-sm">
                  Select a job to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      <ConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        title="Clear All Job Matches"
        description="Are you sure you want to clear ALL job matches? This action cannot be undone. You can refresh to find new matches anytime."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearMatches}
        variant="destructive"
        loading={isClearing}
      />

      <ConfirmDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
        title="Regenerate All Job Matches"
        description="This will delete all existing matches and generate completely fresh matches based on your current skills. Your saved jobs will NOT be affected. This may take a moment. Continue?"
        confirmText="Regenerate All"
        cancelText="Cancel"
        onConfirm={handleRegenerateMatches}
        variant="default"
        loading={isClearing || refreshing}
      />
    </div>
  );
}
