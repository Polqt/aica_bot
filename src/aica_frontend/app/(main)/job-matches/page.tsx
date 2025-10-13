'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, RefreshCw, Zap, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { JobMatch, MatchingStats } from '@/types/jobMatch';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { ProcessingStatusBanner } from '@/components/ProcessingStatusBanner';
import { JobCard } from '@/components/JobCard';
import { JobDetails } from '@/components/JobDetails';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';

export default function JobMatchesPage() {
  const { savedJobIds, savingJobId, saveJob, removeJob, refreshSavedJobs } =
    useSavedJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [, setStats] = useState<MatchingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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
      const matches = await apiClient.get<JobMatch[]>('/jobs/matches');
      setJobMatches(matches);
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
    checkProcessingStatus();
    refreshSavedJobs();
  }, [checkProcessingStatus, refreshSavedJobs]);

  useEffect(() => {
    if (!isCheckingStatus) {
      loadJobMatches();
      loadStats();
    }
  }, [isCheckingStatus, loadJobMatches, loadStats]);

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

  useEffect(() => {
    if (jobMatches.length > 0 && !selectedJob) {
      setSelectedJob(jobMatches[0]);
    }
  }, [jobMatches, selectedJob]);

  // Filter matches
  const filteredMatches = jobMatches.filter(match => {
    const matchesSearch =
      searchTerm === '' ||
      match.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === 'all' || match.confidence === filter;

    return matchesSearch && matchesFilter;
  });

  if (loading && jobMatches.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center bg-white rounded-lg p-8 shadow-sm"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-6 h-6 text-gray-600 animate-spin" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Finding Your Perfect Matches
            </h3>
            <p className="text-gray-500">
              Our AI is analyzing thousands of opportunities...
            </p>
          </motion.div>
        </div>
      </div>
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
              AI Job Matches
            </h1>
          </div>
          <p className="text-base text-gray-500">
            Discover opportunities tailored to your skills
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
          <Button
            onClick={refreshMatches}
            disabled={refreshing}
            className="bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-medium px-4 py-2 shadow-sm hover:shadow-md transition-all duration-150 rounded-md flex items-center gap-2"
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {refreshing ? 'Finding matches...' : 'Refresh matches'}
          </Button>
        </div>
      </motion.div>

      {isCheckingStatus && <ProcessingStatusBanner status="checking" />}

      {(processingStatus === 'processing' ||
        processingStatus === 'parsing' ||
        processingStatus === 'matching' ||
        processingStatus === 'finalizing') && (
        <ProcessingStatusBanner
          status={
            processingStatus as
              | 'processing'
              | 'parsing'
              | 'matching'
              | 'finalizing'
          }
        />
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-full min-h-[300px]"
            >
              <div className="text-center bg-white rounded-lg p-6 max-w-sm">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  {searchTerm || filter !== 'all'
                    ? 'No matches found'
                    : 'No job matches yet'}
                </h3>
                <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Click "Refresh matches" to find jobs tailored to your skills'}
                </p>
                {(searchTerm || filter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                    className="bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-medium px-4 py-2 rounded-md text-sm shadow-sm hover:shadow-md transition-all duration-150"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </motion.div>
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
    </div>
  );
}
