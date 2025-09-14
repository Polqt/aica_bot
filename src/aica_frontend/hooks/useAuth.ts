import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useAuth = () => {
  const router = useRouter();

  const getAuthToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please log in first to upload your resume.');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return null;
    }
    return token;
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    router.push('/login');
  }, [router]);

  return {
    getAuthToken,
    logout,
  };
};
