export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://team-10-985528130976.as.r.appspot.com';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    UPLOAD_RESUME: '/auth/upload-resume',
    PROCESSING_STATUS: '/auth/processing-status',
    PROFILE: '/auth/profile',
  },
  JOBS: {
    SAVED_JOBS: '/jobs/saved-jobs',
  },
  RESUME: {
    SKILLS: '/resume/skills',
    EDUCATION: '/resume/education',
    EXPERIENCE: '/resume/experience',
    SUMMARY: '/resume/summary',
  },
} as const;
