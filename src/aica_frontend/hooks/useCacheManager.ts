'use client';

import { useCallback, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { JobMatch, MatchingStats, SavedJob } from '@/types/jobMatch';
import { toast } from 'sonner';

const CACHE_KEYS = {
  JOB_MATCHES: 'aica_job_matches',
  RECOMMENDATIONS: 'aica_recommendations',
  MATCHING_STATS: 'aica_matching_stats',
  SAVED_JOBS: 'aica_saved_jobs',
  CACHE_TIMESTAMP: 'aica_cache_timestamp',
};

const CACHE_DURATION_MS = {
  DEFAULT: 5 * 60 * 1000, // 5 minutes
  PROFILE: 30 * 60 * 1000, // 30 minutes
};

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheManager {
  private static instance: CacheManager;

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private isExpired(expiresAt: number): boolean {
    return Date.now() > expiresAt;
  }

  set<T>(
    key: string,
    data: T,
    ttlMs: number = CACHE_DURATION_MS.DEFAULT,
  ): void {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(cacheData));
      }
    } catch (e) {
      console.warn('Failed to cache data:', e);
    }
  }

  get<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') return null;

      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData: CachedData<T> = JSON.parse(cached);

      if (this.isExpired(cacheData.expiresAt)) {
        this.remove(key);
        return null;
      }

      return cacheData.data;
    } catch (e) {
      console.warn('Failed to retrieve cached data:', e);
      this.remove(key);
      return null;
    }
  }

  remove(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Failed to remove cache:', e);
    }
  }

  clear(...keys: string[]): void {
    keys.forEach(key => this.remove(key));
  }

  clearAll(): void {
    Object.values(CACHE_KEYS).forEach(key => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('Failed to clear all cache:', e);
      }
    });
  }
}

export const cacheManager = CacheManager.getInstance();

/**
 * Hook for managing job matches with caching
 * Only re-fetches when cache is invalid or user explicitly triggers regeneration
 */
export function useJobMatchesWithCache() {
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [recommendations, setRecommendations] = useState<JobMatch[]>([]);
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for cached data on mount
  useEffect(() => {
    const cachedMatches = cacheManager.get<JobMatch[]>(CACHE_KEYS.JOB_MATCHES);
    const cachedStats = cacheManager.get<MatchingStats>(
      CACHE_KEYS.MATCHING_STATS,
    );
    const cachedRecommendations = cacheManager.get<JobMatch[]>(
      CACHE_KEYS.RECOMMENDATIONS,
    );

    if (cachedMatches) setJobMatches(cachedMatches);
    if (cachedStats) setMatchingStats(cachedStats);
    if (cachedRecommendations) setRecommendations(cachedRecommendations);
  }, []);

  const loadJobMatches = useCallback(async (skipCache = false) => {
    // Check cache first if not skipping
    if (!skipCache) {
      const cached = cacheManager.get<JobMatch[]>(CACHE_KEYS.JOB_MATCHES);
      if (cached) {
        setJobMatches(cached);
        // Clear recommendations when we have real matches from cache
        if (cached.length > 0) {
          setRecommendations([]);
        }
        setError(null);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const matches = await apiClient.get<JobMatch[]>('/jobs/matches?limit=50');

      setJobMatches(matches || []);

      // Cache the results
      if (matches) {
        cacheManager.set(
          CACHE_KEYS.JOB_MATCHES,
          matches,
          CACHE_DURATION_MS.DEFAULT,
        );
      }

      // If we got real matches, clear recommendations
      if (matches && matches.length > 0) {
        setRecommendations([]);
        // Clear recommendations cache so they don't come back
        cacheManager.remove(CACHE_KEYS.RECOMMENDATIONS);
      } else {
        // Only load recommendations if no real matches exist
        const recommendedJobs = await apiClient.getJobRecommendations(20);
        setRecommendations((recommendedJobs as JobMatch[]) || []);
        if (recommendedJobs) {
          cacheManager.set(
            CACHE_KEYS.RECOMMENDATIONS,
            recommendedJobs as JobMatch[],
            CACHE_DURATION_MS.DEFAULT,
          );
        }
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load job matches';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async (skipCache = false) => {
    if (!skipCache) {
      const cached = cacheManager.get<MatchingStats>(CACHE_KEYS.MATCHING_STATS);
      if (cached) {
        setMatchingStats(cached);
        return;
      }
    }

    try {
      const stats = await apiClient.get<MatchingStats>('/jobs/stats');
      setMatchingStats(stats);
      if (stats) {
        cacheManager.set(
          CACHE_KEYS.MATCHING_STATS,
          stats,
          CACHE_DURATION_MS.DEFAULT,
        );
      }
    } catch {
      // Stats are optional, silently fail
    }
  }, []);

  const regenerateMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Trigger regeneration on backend
      await apiClient.post('/jobs/find-matches');

      // Force refresh with cache bypass
      await loadJobMatches(true);
      await loadStats(true);

      toast.success('Job matches regenerated successfully!');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to regenerate matches';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadJobMatches, loadStats]);

  const clearMatches = useCallback(async () => {
    try {
      await apiClient.delete('/jobs/matches');
      setJobMatches([]);
      setMatchingStats(null);
      setRecommendations([]);
      cacheManager.clear(
        CACHE_KEYS.JOB_MATCHES,
        CACHE_KEYS.MATCHING_STATS,
        CACHE_KEYS.RECOMMENDATIONS,
      );
      toast.success('All matches cleared');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear matches';
      toast.error(errorMessage);
    }
  }, []);

  return {
    jobMatches,
    recommendations,
    matchingStats,
    loading,
    error,
    loadJobMatches,
    loadStats,
    regenerateMatches,
    clearMatches,
  };
}

/**
 * Hook for managing saved jobs with caching
 */
export function useSavedJobsWithCache() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for cached data on mount
  useEffect(() => {
    const cached = cacheManager.get<SavedJob[]>(CACHE_KEYS.SAVED_JOBS);
    if (cached) setSavedJobs(cached);
  }, []);

  const loadSavedJobs = useCallback(async (skipCache = false) => {
    if (!skipCache) {
      const cached = cacheManager.get<SavedJob[]>(CACHE_KEYS.SAVED_JOBS);
      if (cached) {
        setSavedJobs(cached);
        setError(null);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const jobs = await apiClient.getSavedJobs();
      setSavedJobs(jobs);
      cacheManager.set(CACHE_KEYS.SAVED_JOBS, jobs, CACHE_DURATION_MS.DEFAULT);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load saved jobs';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveJob = useCallback(async (jobId: string) => {
    try {
      const savedJob = await apiClient.saveJob(jobId);
      setSavedJobs(prev => [...prev, savedJob]);

      // Invalidate cache
      cacheManager.remove(CACHE_KEYS.SAVED_JOBS);

      toast.success('Job saved successfully');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save job';
      toast.error(errorMessage);
    }
  }, []);

  const removeJob = useCallback(async (jobId: string) => {
    try {
      await apiClient.removeSavedJob(jobId);
      setSavedJobs(prev => prev.filter(job => job.job_id !== jobId));

      // Invalidate cache
      cacheManager.remove(CACHE_KEYS.SAVED_JOBS);

      toast.success('Job removed from saved jobs');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to remove job';
      toast.error(errorMessage);
    }
  }, []);

  return {
    savedJobs,
    loading,
    error,
    loadSavedJobs,
    saveJob,
    removeJob,
  };
}

export { CACHE_KEYS, CACHE_DURATION_MS };
