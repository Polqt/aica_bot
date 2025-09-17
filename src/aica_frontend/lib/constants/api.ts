export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    UPLOAD_RESUME: '/auth/upload-resume',
    PROCESSING_STATUS: '/auth/processing-status',
    PROFILE: '/auth/profile',
    SKILLS: '/auth/skills',
  },
  JOBS: {
    SAVED_JOBS: '/jobs/saved',
  },
} as const;