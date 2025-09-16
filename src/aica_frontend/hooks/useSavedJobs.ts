import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export function useSavedJobs() {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  const refreshSavedJobs = useCallback(async () => {
    try {
      const savedJobs = await apiClient.getSavedJobs();
      setSavedJobIds(savedJobs.map((j: unknown) => (j as { job_id: string }).job_id));
    } catch {
      setSavedJobIds([]);
    }
  }, []);

  const saveJob = useCallback(
    async (jobId: string) => {
      if (savedJobIds.includes(jobId)) return;
      setSavingJobId(jobId);
      try {
        await apiClient.saveJob(jobId);
        setSavedJobIds([...savedJobIds, jobId]);
      } catch {}
      setSavingJobId(null);
    },
    [savedJobIds],
  );

  return {
    savedJobIds,
    savingJobId,
    saveJob,
    refreshSavedJobs,
  };
}
