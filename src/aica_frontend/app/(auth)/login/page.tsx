'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/constants/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        // Check if it's an email verification issue
        if (
          authError.message.includes('Email not confirmed') ||
          authError.message.includes('not verified') ||
          authError.message.includes('email_not_confirmed')
        ) {
          toast.error('Email not verified', {
            description:
              'Please verify your email address before logging in. Check your inbox for the verification link.',
            action: {
              label: 'Resend Email',
              onClick: async () => {
                try {
                  await supabase.auth.resend({
                    type: 'signup',
                    email: email,
                  });
                  toast.success('Verification email sent!', {
                    description: 'Please check your inbox and spam folder.',
                  });
                } catch {
                  toast.error('Failed to resend email', {
                    description: 'Please try again in a few minutes.',
                  });
                }
              },
            },
          });
        } else if (authError.message.includes('Invalid login credentials')) {
          toast.error('Incorrect email or password', {
            description:
              'The email or password you entered is incorrect. Please try again.',
          });
        } else if (authError.message.includes('Email not found')) {
          toast.error('Account not found', {
            description:
              'No account found with this email. Please sign up first.',
            action: {
              label: 'Sign up',
              onClick: () => router.push('/sign-up'),
            },
          });
        } else {
          toast.error('Unable to log in', {
            description:
              "We couldn't log you in. Please check your credentials and try again.",
          });
        }
        setLoading(false);
        return;
      }

      if (authData.user && authData.session) {
        // Store the access token
        localStorage.setItem('access_token', authData.session.access_token);

        // Also sync with backend to ensure user exists in database
        try {
          await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${authData.session.access_token}`,
            },
          });
        } catch {
          // Backend sync error (non-critical)
        }

        toast.success('Welcome back! 👋', {
          description: 'You have successfully logged in.',
        });

        // Redirect to choice page
        setTimeout(() => {
          router.push('/choice');
        }, 500);
      }
    } catch {
      toast.error('An unexpected error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md p-8 space-y-6">
        <Link href="/" className="cursor-pointer group inline-block">
          <Image
            src="/AICA logo full.svg"
            alt="AICA Logo"
            width={180}
            height={60}
            className="object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Your AI Career Partner
          </h1>
          <p className="text-gray-500 text-base font-medium">
            Log in to your AICA account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password..."
              required
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-md"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link
            href="/sign-up"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Sign up
          </Link>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          By continuing, you acknowledge that you understand and agree to our{' '}
          <Link href="#" className="underline hover:text-gray-700">
            Terms & Conditions
          </Link>{' '}
          and{' '}
          <Link href="#" className="underline hover:text-gray-700">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
