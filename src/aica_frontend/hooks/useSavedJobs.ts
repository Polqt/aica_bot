import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { SavedJob } from '@/types/jobMatch';
import { toast } from 'sonner';

export function useSavedJobs() {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSavedJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const jobs = await apiClient.getSavedJobs();
      setSavedJobs(jobs);
      setSavedJobIds(jobs.map(job => job.job_id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load saved jobs';
      setError(errorMessage);
      setSavedJobs([]);
      setSavedJobIds([]);

      // Don't show error toast for auth errors (handled by apiClient)
      if (!errorMessage.includes('Authentication expired')) {
        toast.error('Failed to load saved jobs');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const saveJob = useCallback(
    async (jobId: string, isRecommendation: boolean = false) => {
      if (savedJobIds.includes(jobId)) {
        toast.info('Job already saved');
        return;
      }

      setSavingJobId(jobId);
      try {
        const savedJob = await apiClient.saveJob(jobId, isRecommendation);
        setSavedJobs(prev => [...prev, savedJob]);
        setSavedJobIds(prev => [...prev, jobId]);
        toast.success('Job saved successfully');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to save job';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setSavingJobId(null);
      }
    },
    [savedJobIds],
  );

  const removeJob = useCallback(async (jobId: string) => {
    setSavingJobId(jobId);
    try {
      await apiClient.removeSavedJob(jobId);
      setSavedJobs(prev => prev.filter(job => job.job_id !== jobId));
      setSavedJobIds(prev => prev.filter(id => id !== jobId));
      toast.success('Job removed from saved jobs');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to remove job';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSavingJobId(null);
    }
  }, []);

  return {
    savedJobIds,
    savedJobs,
    savingJobId,
    loading,
    error,
    saveJob,
    removeJob,
    refreshSavedJobs,
  };
}
