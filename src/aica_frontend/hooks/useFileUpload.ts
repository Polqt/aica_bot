import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { MAX_FILE_SIZE_MB, ALLOWED_FILE_TYPES } from '@/lib/constants/upload';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface ApiError {
  detail?: string;
  message?: string;
}

export const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const { getAuthToken, logout } = useAuth();

  const validateFile = useCallback((file: File): string | null => {
    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type as (typeof ALLOWED_FILE_TYPES)[number],
      )
    ) {
      return 'Invalid file type. Please upload a PDF, DOC, or DOCX file.';
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
    }

    return null;
  }, []);

  const handleFileChange = useCallback(
    (files: File[]): void => {
      if (!files.length) return;

      const file = files[0];
      const validationError = validateFile(file);

      if (validationError) {
        toast.error(validationError);
        setError(validationError);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError('');
      toast.success('File selected successfully!');
    },
    [validateFile],
  );

  const uploadFile = useCallback(async (): Promise<boolean> => {
    if (!selectedFile) {
      toast.error('Please select a file first.');
      return false;
    }

    const token = getAuthToken();
    if (!token) return false;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/auth/upload-resume`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorData = responseData as ApiError;
        const errorMessage =
          errorData.detail || errorData.message || 'Upload failed';

        if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.');
        } else if (response.status === 413) {
          throw new Error(
            'File too large. Please use a file smaller than 10MB.',
          );
        } else if (response.status === 400) {
          throw new Error(errorMessage);
        } else {
          throw new Error(`Upload failed: ${errorMessage}`);
        }
      }

      toast.success('Resume uploaded successfully! Processing...');
      setIsUploading(false);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed.';

      if (errorMessage.includes('Authentication expired')) {
        toast.error('Your session has expired. Redirecting to login...');
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        toast.error(errorMessage);
      }

      setError(errorMessage);
      setIsUploading(false);
      return false;
    }
  }, [selectedFile, getAuthToken, logout]);

  const resetUpload = useCallback(() => {
    setSelectedFile(null);
    setError('');
    setIsUploading(false);
  }, []);

  return {
    selectedFile,
    isUploading,
    error,
    handleFileChange,
    uploadFile,
    resetUpload,
  };
};
