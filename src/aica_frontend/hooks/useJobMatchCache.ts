'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JobMatch, MatchingStats, SavedJob } from '@/types/jobMatch';
import {
  UserProfile,
  UserSkill,
  UserEducation,
  UserExperience,
} from '@/types/user';
import { DashboardStats } from '@/types/dashboard';



/**
 * Helper function to check if cache has expired
 */
const isExpired = (expiresAt: number | null): boolean => {
  if (!expiresAt) return true;
  return Date.now() > expiresAt;
};

/**
 * Helper function to calculate expiration timestamp
 */
const getExpirationTime = (ttlMs: number): number => {
  return Date.now() + ttlMs;
};

// Default TTL in milliseconds (5 minutes for most data, 30 minutes for profiles)
export const CACHE_TTL = {
  DEFAULT: 5 * 60 * 1000, // 5 minutes
  PROFILE: 30 * 60 * 1000, // 30 minutes
};

interface JobMatchCacheStore {
  // Job Matches Cache
  jobMatches: JobMatch[] | null;
  jobMatchesExpiresAt: number | null;

  jobMatchesRecommendations: JobMatch[] | null;
  recommendationsExpiresAt: number | null;

  matchingStats: MatchingStats | null;
  statsExpiresAt: number | null;

  // Saved Jobs Cache
  savedJobs: SavedJob[] | null;
  savedJobsExpiresAt: number | null;

  // User Profile Cache
  userProfile: UserProfile | null;
  profileExpiresAt: number | null;

  userSkills: UserSkill[] | null;
  skillsExpiresAt: number | null;

  userEducation: UserEducation[] | null;
  educationExpiresAt: number | null;

  userExperience: UserExperience[] | null;
  experienceExpiresAt: number | null;

  // Dashboard Cache
  dashboardStats: DashboardStats | null;
  dashboardStatsExpiresAt: number | null;

  dashboardMatches: JobMatch[] | null;
  dashboardMatchesExpiresAt: number | null;

  // Last match generation timestamp for tracking regeneration requests
  lastMatchGenerationTime: number | null;

  // Cache setters - store data and expiration info
  setJobMatches: (matches: JobMatch[], ttlMs?: number) => void;
  setJobMatchesRecommendations: (
    recommendations: JobMatch[],
    ttlMs?: number,
  ) => void;
  setMatchingStats: (stats: MatchingStats, ttlMs?: number) => void;
  setSavedJobs: (jobs: SavedJob[], ttlMs?: number) => void;
  setUserProfile: (profile: UserProfile, ttlMs?: number) => void;
  setUserSkills: (skills: UserSkill[], ttlMs?: number) => void;
  setUserEducation: (education: UserEducation[], ttlMs?: number) => void;
  setUserExperience: (experience: UserExperience[], ttlMs?: number) => void;
  setDashboardStats: (stats: DashboardStats, ttlMs?: number) => void;
  setDashboardMatches: (matches: JobMatch[], ttlMs?: number) => void;
  setLastMatchGenerationTime: (time: number) => void;

  // Cache getters with expiration check
  getJobMatches: () => JobMatch[] | null;
  getJobMatchesRecommendations: () => JobMatch[] | null;
  getMatchingStats: () => MatchingStats | null;
  getSavedJobs: () => SavedJob[] | null;
  getUserProfile: () => UserProfile | null;
  getUserSkills: () => UserSkill[] | null;
  getUserEducation: () => UserEducation[] | null;
  getUserExperience: () => UserExperience[] | null;
  getDashboardStats: () => DashboardStats | null;
  getDashboardMatches: () => JobMatch[] | null;

  // Cache invalidation
  invalidateJobMatches: () => void;
  invalidateSavedJobs: () => void;
  invalidateUserProfile: () => void;
  invalidateAllCaches: () => void;
  invalidateDashboard: () => void;
}

export const useJobMatchCache = create<JobMatchCacheStore>()(
  persist(
    (set, get) => ({
      // Initial state
      jobMatches: null,
      jobMatchesExpiresAt: null,
      jobMatchesRecommendations: null,
      recommendationsExpiresAt: null,
      matchingStats: null,
      statsExpiresAt: null,
      savedJobs: null,
      savedJobsExpiresAt: null,
      userProfile: null,
      profileExpiresAt: null,
      userSkills: null,
      skillsExpiresAt: null,
      userEducation: null,
      educationExpiresAt: null,
      userExperience: null,
      experienceExpiresAt: null,
      dashboardStats: null,
      dashboardStatsExpiresAt: null,
      dashboardMatches: null,
      dashboardMatchesExpiresAt: null,
      lastMatchGenerationTime: null,

      // Setter functions with TTL
      setJobMatches: (matches, ttlMs = CACHE_TTL.DEFAULT) =>
        set({
          jobMatches: matches,
          jobMatchesExpiresAt: getExpirationTime(ttlMs),
        }),

      setJobMatchesRecommendations: (
        recommendations,
        ttlMs = CACHE_TTL.DEFAULT,
      ) =>
        set({
          jobMatchesRecommendations: recommendations,
          recommendationsExpiresAt: getExpirationTime(ttlMs),
        }),

      setMatchingStats: (stats, ttlMs = CACHE_TTL.DEFAULT) =>
        set({
          matchingStats: stats,
          statsExpiresAt: getExpirationTime(ttlMs),
        }),

      setSavedJobs: (jobs, ttlMs = CACHE_TTL.DEFAULT) =>
        set({
          savedJobs: jobs,
          savedJobsExpiresAt: getExpirationTime(ttlMs),
        }),

      setUserProfile: (profile, ttlMs = CACHE_TTL.PROFILE) =>
        set({
          userProfile: profile,
          profileExpiresAt: getExpirationTime(ttlMs),
        }),

      setUserSkills: (skills, ttlMs = CACHE_TTL.PROFILE) =>
        set({
          userSkills: skills,
          skillsExpiresAt: getExpirationTime(ttlMs),
        }),

      setUserEducation: (education, ttlMs = CACHE_TTL.PROFILE) =>
        set({
          userEducation: education,
          educationExpiresAt: getExpirationTime(ttlMs),
        }),

      setUserExperience: (experience, ttlMs = CACHE_TTL.PROFILE) =>
        set({
          userExperience: experience,
          experienceExpiresAt: getExpirationTime(ttlMs),
        }),

      setDashboardStats: (stats, ttlMs = CACHE_TTL.DEFAULT) =>
        set({
          dashboardStats: stats,
          dashboardStatsExpiresAt: getExpirationTime(ttlMs),
        }),

      setDashboardMatches: (matches, ttlMs = CACHE_TTL.DEFAULT) =>
        set({
          dashboardMatches: matches,
          dashboardMatchesExpiresAt: getExpirationTime(ttlMs),
        }),

      setLastMatchGenerationTime: (time: number) =>
        set({ lastMatchGenerationTime: time }),

      // Getter functions with expiration check
      getJobMatches: () => {
        const state = get();
        if (isExpired(state.jobMatchesExpiresAt)) {
          set({ jobMatches: null, jobMatchesExpiresAt: null });
          return null;
        }
        return state.jobMatches;
      },

      getJobMatchesRecommendations: () => {
        const state = get();
        if (isExpired(state.recommendationsExpiresAt)) {
          set({
            jobMatchesRecommendations: null,
            recommendationsExpiresAt: null,
          });
          return null;
        }
        return state.jobMatchesRecommendations;
      },

      getMatchingStats: () => {
        const state = get();
        if (isExpired(state.statsExpiresAt)) {
          set({ matchingStats: null, statsExpiresAt: null });
          return null;
        }
        return state.matchingStats;
      },

      getSavedJobs: () => {
        const state = get();
        if (isExpired(state.savedJobsExpiresAt)) {
          set({ savedJobs: null, savedJobsExpiresAt: null });
          return null;
        }
        return state.savedJobs;
      },

      getUserProfile: () => {
        const state = get();
        if (isExpired(state.profileExpiresAt)) {
          set({ userProfile: null, profileExpiresAt: null });
          return null;
        }
        return state.userProfile;
      },

      getUserSkills: () => {
        const state = get();
        if (isExpired(state.skillsExpiresAt)) {
          set({ userSkills: null, skillsExpiresAt: null });
          return null;
        }
        return state.userSkills;
      },

      getUserEducation: () => {
        const state = get();
        if (isExpired(state.educationExpiresAt)) {
          set({ userEducation: null, educationExpiresAt: null });
          return null;
        }
        return state.userEducation;
      },

      getUserExperience: () => {
        const state = get();
        if (isExpired(state.experienceExpiresAt)) {
          set({ userExperience: null, experienceExpiresAt: null });
          return null;
        }
        return state.userExperience;
      },

      getDashboardStats: () => {
        const state = get();
        if (isExpired(state.dashboardStatsExpiresAt)) {
          set({ dashboardStats: null, dashboardStatsExpiresAt: null });
          return null;
        }
        return state.dashboardStats;
      },

      getDashboardMatches: () => {
        const state = get();
        if (isExpired(state.dashboardMatchesExpiresAt)) {
          set({ dashboardMatches: null, dashboardMatchesExpiresAt: null });
          return null;
        }
        return state.dashboardMatches;
      },

      // Invalidation functions
      invalidateJobMatches: () =>
        set({
          jobMatches: null,
          jobMatchesExpiresAt: null,
          jobMatchesRecommendations: null,
          recommendationsExpiresAt: null,
          matchingStats: null,
          statsExpiresAt: null,
        }),

      invalidateSavedJobs: () =>
        set({
          savedJobs: null,
          savedJobsExpiresAt: null,
        }),

      invalidateUserProfile: () =>
        set({
          userProfile: null,
          profileExpiresAt: null,
          userSkills: null,
          skillsExpiresAt: null,
          userEducation: null,
          educationExpiresAt: null,
          userExperience: null,
          experienceExpiresAt: null,
        }),

      invalidateDashboard: () =>
        set({
          dashboardStats: null,
          dashboardStatsExpiresAt: null,
          dashboardMatches: null,
          dashboardMatchesExpiresAt: null,
        }),

      invalidateAllCaches: () =>
        set({
          jobMatches: null,
          jobMatchesExpiresAt: null,
          jobMatchesRecommendations: null,
          recommendationsExpiresAt: null,
          matchingStats: null,
          statsExpiresAt: null,
          savedJobs: null,
          savedJobsExpiresAt: null,
          userProfile: null,
          profileExpiresAt: null,
          userSkills: null,
          skillsExpiresAt: null,
          userEducation: null,
          educationExpiresAt: null,
          userExperience: null,
          experienceExpiresAt: null,
          dashboardStats: null,
          dashboardStatsExpiresAt: null,
          dashboardMatches: null,
          dashboardMatchesExpiresAt: null,
          lastMatchGenerationTime: null,
        }),
    }),
    {
      name: 'job-match-cache', // localStorage key
      version: 1,
      // Persist all state to localStorage
      partialize: state => state,
    },
  ),
);
