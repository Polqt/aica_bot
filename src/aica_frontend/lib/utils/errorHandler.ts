export interface ApiError {
  detail?: string;
  message?: string;
  status?: number;
}

export class AppError extends Error {
  public status: number;
  public code: string;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'UNKNOWN_ERROR',
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  FILE_ERROR: 'FILE_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

export const handleApiError = (error: unknown): string => {
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Unable to connect to the server. Please try again.';
  }

  // Handle AppError
  if (error instanceof AppError) {
    return error.message;
  }

  // Handle API response errors
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    if (apiError.detail) return apiError.detail;
    if (apiError.message) return apiError.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.';
};

export const logError = (error: unknown, context: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }

  // In production, you might want to send to logging service
  // logToService(error, context);
};

export const validateFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Please upload a PDF, DOC, or DOCX file.';
  }

  if (file.size > maxSize) {
    return 'File too large. Maximum size is 10MB.';
  }

  if (file.size === 0) {
    return 'File is empty. Please select a valid file.';
  }

  return null;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  return null;
};
