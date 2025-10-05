'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NeoCard } from '@/components/ui/neo-card';
import { NeoButton } from '@/components/ui/neo-button';
import { NeoForm, NeoFormField, NeoFormInput } from '@/components/ui/neo-form';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/constants/api';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Check your email for the confirmation first!');
      } else {
        localStorage.setItem('access_token', data.access_token);
        router.push('/choice');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="relative">
            <NeoCard variant="elevated" className="relative">
              <div className="p-8">
                <div className="text-center space-y-3 mb-8">
                  <div className="inline-block">
                    <div className="bg-violet-600 text-white px-4 py-2 text-sm">
                      Sign in
                    </div>
                  </div>
                  <h1 className="text-2xl font-semibold text-black dark:text-white">
                    Welcome Back
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access your account
                  </p>
                </div>

                <NeoForm onSubmit={handleLogin} className="space-y-6">
                  <NeoFormField>
                    <div className="relative">
                      <NeoFormInput
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="EMAIL ADDRESS"
                        required
                        className="pl-12"
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-5 h-5" />
                    </div>
                  </NeoFormField>

                  <NeoFormField>
                    <div className="relative">
                      <NeoFormInput
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="PASSWORD"
                        required
                        className="pl-12"
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-5 h-5" />
                    </div>
                  </NeoFormField>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative"
                    >
                      <div className="absolute -inset-1 bg-red-500 rotate-1"></div>
                      <div className="relative bg-red-50 dark:bg-red-950 border-2 border-red-600 p-4 text-center">
                        <p className="text-red-700 dark:text-red-300 font-bold text-sm tracking-wide">
                          {error.toUpperCase()}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <NeoButton
                    type="submit"
                    className="w-full h-14 font-black tracking-widest group"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>SIGNING IN...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <span>SIGN IN</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    )}
                  </NeoButton>
                </NeoForm>

                <div className="mt-8 text-center">
                  <p className="text-base font-bold text-gray-700 dark:text-gray-300">
                    DON&apos;T HAVE AN ACCOUNT?{' '}
                    <Link
                      href="/sign-up"
                      className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors duration-300 underline decoration-2 underline-offset-4 hover:decoration-4"
                    >
                      SIGN UP FREE
                    </Link>
                  </p>
                </div>
              </div>
            </NeoCard>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 tracking-wider">
              BY SIGNING IN, YOU AGREE TO OUR{' '}
              <Link
                href="#"
                className="text-violet-600 hover:text-violet-700 underline decoration-2"
              >
                TERMS
              </Link>{' '}
              AND{' '}
              <Link
                href="#"
                className="text-violet-600 hover:text-violet-700 underline decoration-2"
              >
                PRIVACY
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
