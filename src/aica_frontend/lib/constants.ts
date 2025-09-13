export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 30000, // 30 seconds
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx'],
} as const;

export const PROCESSING = {
  MAX_POLLS: 30,
  POLL_INTERVAL_MS: 2000,
  TIMEOUT_MS: 60000, // 1 minute
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
} as const;

export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    UPLOAD: '/upload',
    DASHBOARD: '/dashboard',
  },
  API: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
    UPLOAD_RESUME: '/auth/upload-resume',
    PROCESSING_STATUS: '/auth/processing-status',
    SKILLS: '/auth/skills',
    LOGOUT: '/auth/logout',
  },
} as const;

export const PROCESSING_STATUS = {
  NOT_UPLOADED: 'not_uploaded',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  NOT_FOUND: 'not_found',
} as const;

export const SKILL_CATEGORIES = {
  TECHNICAL: 'technical',
  SOFT: 'soft',
  INDUSTRY: 'industry',
  JOB_TITLE: 'job_title',
} as const;
