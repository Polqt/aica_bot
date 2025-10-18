'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, RefreshCw, Zap, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { JobMatch, MatchingStats } from '@/types/jobMatch';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { JobCard } from '@/components/JobCard';
import { JobDetails } from '@/components/JobDetails';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';

export default function JobMatchesPage() {
  const { savedJobIds, savingJobId, saveJob, removeJob, refreshSavedJobs } =
    useSavedJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [recommendations, setRecommendations] = useState<JobMatch[]>([]);
  const [, setStats] = useState<MatchingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showingRecommendations, setShowingRecommendations] = useState(false);

  const checkProcessingStatus = useCallback(async () => {
    try {
      setIsCheckingStatus(true);
      const status = await apiClient.get<{
        status: string;
        message?: string;
        matches_found?: number;
      }>('/auth/processing-status');

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

  const loadJobMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Force cache bypass to ensure fresh data
      const timestamp = new Date().getTime();
      const matches = await apiClient.get<JobMatch[]>(
        `/jobs/matches?_t=${timestamp}`,
      );
      setJobMatches(matches);

      // If no matches, load recommendations
      if (!matches || matches.length === 0) {
        setShowingRecommendations(true);
        const recommendedJobs = await apiClient.getJobRecommendations(20);
        setRecommendations(recommendedJobs as JobMatch[]);
      } else {
        setShowingRecommendations(false);
        setRecommendations([]);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load job matches';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await apiClient.get<MatchingStats>('/jobs/stats');
      setStats(statsData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load stats';
      setError(errorMessage);
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
      loadJobMatches();
      loadStats();
    }
  }, [isCheckingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload matches when page becomes visible (e.g., after navigating back)
  // Debounced to prevent multiple rapid calls
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        !isCheckingStatus &&
        !loading
      ) {
        // Debounce to prevent multiple calls
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          loadJobMatches();
          loadStats();
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isCheckingStatus, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshMatches = async () => {
    try {
      setRefreshing(true);
      setError(null);

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
        await apiClient.post('/jobs/find-matches');
      }

      await Promise.all([loadJobMatches(), loadStats()]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh matches';
      setError(errorMessage);
      toast.error('Failed to refresh matches', {
        description: errorMessage,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const clearAllMatches = async () => {
    try {
      setIsClearing(true);
      await apiClient.delete('/jobs/matches');

      toast.success('All matches cleared', {
        description: 'You can refresh to find new matches anytime',
      });

      // Clear local state and reload
      setJobMatches([]);
      setSelectedJob(null);
      await Promise.all([loadJobMatches(), loadStats()]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear matches';
      toast.error('Failed to clear matches', {
        description: errorMessage,
      });
    } finally {
      setIsClearing(false);
    }
  };

  const regenerateAllMatches = async () => {
    try {
      setIsClearing(true);
      setRefreshing(true);

      // Step 1: Clear all existing matches
      await apiClient.delete('/jobs/matches');

      toast.info('Cleared old matches, generating fresh ones...', {
        description: 'This may take a moment',
      });

      // Step 2: Generate completely new matches
      try {
        const result = await apiClient.generateMatches();

        if ((result.matches_saved ?? 0) > 0) {
          toast.success(
            `Generated ${result.matches_saved} fresh job matches!`,
            {
              description: `AI analyzed ${result.matches_found} jobs and found the best matches for you`,
            },
          );
        } else {
          toast.info('No matches found', {
            description:
              'Try updating your skills or check back later for new job postings',
          });
        }
      } catch {
        await apiClient.post('/jobs/find-matches');
      }

      // Step 3: Reload the matches
      await Promise.all([loadJobMatches(), loadStats()]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to regenerate matches';
      toast.error('Failed to regenerate matches', {
        description: errorMessage,
      });
    } finally {
      setIsClearing(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const displayedJobs = showingRecommendations ? recommendations : jobMatches;
    if (displayedJobs.length > 0 && !selectedJob) {
      setSelectedJob(displayedJobs[0]);
    }
  }, [jobMatches, recommendations, showingRecommendations, selectedJob]);

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
    (loading || isCheckingStatus) && jobMatches.length === 0;

  // Determine processing status to show
  const activeProcessingStatus = isCheckingStatus
    ? ('checking' as const)
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

      {showingRecommendations && (
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
                No Perfect Matches Yet
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
        onConfirm={clearAllMatches}
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
        onConfirm={regenerateAllMatches}
        variant="default"
        loading={isClearing || refreshing}
      />
    </div>
  );
}
