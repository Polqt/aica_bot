import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { MAX_POLLS, POLL_INTERVAL_MS } from '@/lib/constants/upload';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export type ProcessingStatus =
  | 'not_uploaded'
  | 'processing'
  | 'parsing'
  | 'matching'
  | 'finalizing'
  | 'completed'
  | 'error'
  | 'not_found';

interface StatusResponse {
  status: ProcessingStatus;
  message?: string;
  step?: string;
  matches_found?: number;
}

export const useResumeProcessing = () => {
  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatus>('not_uploaded');
  const [pollCount, setPollCount] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef(true);
  const hasShownCompletionToastRef = useRef(false); // Prevent duplicate toasts

  const { getAuthToken } = useAuth();

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const checkProcessingStatus = useCallback(async (): Promise<void> => {
    const token = getAuthToken();
    if (!token || !isComponentMountedRef.current) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/processing-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: StatusResponse = await response.json();

      if (!isComponentMountedRef.current) return;

      const newStatus = data.step || data.status;
      const validStatuses: ProcessingStatus[] = [
        'not_uploaded',
        'processing',
        'parsing',
        'matching',
        'finalizing',
        'completed',
        'error',
        'not_found',
      ];

      if (validStatuses.includes(newStatus as ProcessingStatus)) {
        setProcessingStatus(newStatus as ProcessingStatus);
      } else {
        setProcessingStatus('processing');
      }

      if (data.status === 'completed') {
        const matchCount = data.matches_found || 0;
        stopPolling();

        // Only show toast once
        if (!hasShownCompletionToastRef.current) {
          hasShownCompletionToastRef.current = true;
          toast.success(
            `Resume processed successfully! Found ${matchCount} job matches.`,
          );
        }
        // Navigation is handled by the upload page component
      } else if (data.status === 'error') {
        stopPolling();
        toast.error(
          data.message || 'Resume processing failed. Please try again.',
        );
      }
    } catch {
      if (isComponentMountedRef.current) {
        setProcessingStatus('error');
        toast.error('Failed to check processing status.');
      }
    }
  }, [getAuthToken, stopPolling]);

  const startPolling = useCallback(() => {
    let currentPollCount = 0;

    const pollInterval = setInterval(async () => {
      if (currentPollCount >= MAX_POLLS) {
        clearInterval(pollInterval);
        return;
      }

      await checkProcessingStatus();
      currentPollCount++;
      setPollCount(currentPollCount);
    }, POLL_INTERVAL_MS);

    pollIntervalRef.current = pollInterval;
  }, [checkProcessingStatus]);

  const resetProcessing = useCallback(() => {
    setProcessingStatus('not_uploaded');
    setPollCount(0);
    hasShownCompletionToastRef.current = false; // Reset toast flag
    stopPolling();
  }, [stopPolling]);

  // Handle timeout
  useEffect(() => {
    if (
      pollCount >= MAX_POLLS &&
      processingStatus !== 'completed' &&
      processingStatus !== 'error'
    ) {
      setProcessingStatus('error');
      toast.error('Processing timeout. Please try uploading again.');
      stopPolling();
    }
  }, [pollCount, processingStatus, stopPolling]);

  return {
    processingStatus,
    setProcessingStatus,
    pollCount,
    checkProcessingStatus,
    startPolling,
    stopPolling,
    resetProcessing,
  };
};
