'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        description: 'Please make sure both passwords are identical.',
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters long.',
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            email_confirm: true,
          },
        },
      });

      if (error) {
        // Handle specific error cases with user-friendly messages
        if (error.message.includes('rate limit')) {
          toast.error('Too many signup attempts', {
            description:
              'Please wait a few minutes before trying again. Our email service has rate limits to prevent spam.',
          });
        } else if (error.message.includes('already registered')) {
          toast.error('Account already exists', {
            description:
              'This email is already registered. Please try logging in instead.',
            action: {
              label: 'Go to Login',
              onClick: () => router.push('/login'),
            },
          });
        } else if (error.message.includes('invalid email')) {
          toast.error('Invalid email address', {
            description: 'Please enter a valid email address.',
          });
        } else if (
          error.message.includes('SMTP') ||
          error.message.includes('email')
        ) {
          toast.error('Unable to send verification email', {
            description:
              'There was a problem sending your verification email. Please try again in a few minutes or contact support.',
          });
        } else {
          toast.error('Signup failed', {
            description: 'Unable to create your account. Please try again.',
          });
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        setEmailSent(true);
        toast.success('Account created successfully! 🎉', {
          description: 'Please check your email to verify your account.',
          duration: 6000,
        });
        // Don't redirect immediately - show email sent message
      }
    } catch {
      toast.error('An unexpected error occurred', {
        description:
          'Something went wrong. Please try again or contact support if the problem persists.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-6 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-md p-8 space-y-6">
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
            Create your AICA account
          </p>
        </div>

        {emailSent ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-16 h-16 mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verify your email
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                We&apos;ve sent a verification email to <strong>{email}</strong>
              </p>
              <p className="text-xs text-gray-500 text-center">
                Please check your inbox and click the verification link to
                activate your AICA account.
              </p>
            </div>

            <Button
              onClick={() => window.open('https://mail.google.com', '_blank')}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
            >
              Open Gmail
            </Button>

            <Button
              onClick={() => router.push('/login')}
              className="w-full h-11 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md"
            >
              Go to Login
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  setEmailSent(false);
                  toast.info('You can try signing up again');
                }}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                try again
              </button>
            </p>
          </div>
        ) : (
          <>
            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4 text-left">
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
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password..."
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
                    Creating account...
                  </>
                ) : (
                  'Sign up'
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Log in
              </Link>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              By signing up, you acknowledge that you understand and agree to
              our{' '}
              <Link href="#" className="underline hover:text-gray-700">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link href="#" className="underline hover:text-gray-700">
                Privacy Policy
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
