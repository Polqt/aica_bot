import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export type ProfileCompletionStatus =
  | 'idle'
  | 'generating'
  | 'matching'
  | 'completed'
  | 'error';

interface GenerateMatchesResponse {
  success: boolean;
  message: string;
  matches_found: number;
}

export const useProfileCompletion = () => {
  const [status, setStatus] = useState<ProfileCompletionStatus>('idle');
  const [matchesFound, setMatchesFound] = useState(0);
  const isProcessingRef = useRef(false);
  const router = useRouter();
  const { getAuthToken } = useAuth();

  useEffect(() => {
    return () => {
      isProcessingRef.current = false;
    };
  }, []);

  const completeProfileAndMatch = useCallback(async (): Promise<boolean> => {
    if (isProcessingRef.current) return false;

    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication required');
      return false;
    }

    isProcessingRef.current = true;
    setStatus('generating');

    try {
      // Update profile_completed flag
      await fetch(`${API_BASE_URL}/resume/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_completed: true }),
      });

      // Generate job matches
      setStatus('matching');
      const response = await fetch(`${API_BASE_URL}/auth/generate-matches`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GenerateMatchesResponse = await response.json();

      if (data.success) {
        setMatchesFound(data.matches_found);
        setStatus('completed');
        toast.success(
          `Profile completed! Found ${data.matches_found} job matches.`,
        );

        // Navigate to job matches page
        setTimeout(() => {
          router.push('/job-matches');
        }, 1500);

        return true;
      } else {
        throw new Error(data.message || 'Failed to generate matches');
      }
    } catch (error) {
      setStatus('error');
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to complete profile and generate matches';
      toast.error(errorMessage);
      return false;
    } finally {
      isProcessingRef.current = false;
    }
  }, [getAuthToken, router]);

  const reset = useCallback(() => {
    setStatus('idle');
    setMatchesFound(0);
    isProcessingRef.current = false;
  }, []);

  return {
    status,
    matchesFound,
    completeProfileAndMatch,
    reset,
  };
};
