import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useAuth = () => {
  const router = useRouter();

  const getAuthToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Authentication required', {
        description: 'Please log in to continue.',
      });
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return null;
    }
    return token;
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    toast.info('Logged out successfully');
    router.push('/login');
  }, [router]);

  const handleAuthError = useCallback(() => {
    // Clear expired token
    localStorage.removeItem('access_token');

    toast.error('Session expired', {
      description: 'Please log in again to continue.',
      duration: 3000,
    });

    setTimeout(() => {
      router.push('/login');
    }, 1500);
  }, [router]);

  return {
    getAuthToken,
    logout,
    handleAuthError,
  };
};
