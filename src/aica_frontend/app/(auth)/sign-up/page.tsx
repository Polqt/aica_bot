'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { NeoCard } from '@/components/ui/neo-card';
import { NeoButton } from '@/components/ui/neo-button';
import { NeoForm, NeoFormField, NeoFormInput } from '@/components/ui/neo-form';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SignupFormData } from '@/types/auth';
import { API_BASE_URL } from '@/lib/constants/api';
import { validateEmail, validatePassword } from '@/lib/utils/errorHandler';

type ValidationError = string | null;

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = (): ValidationError => {
    const { email, password, confirmPassword } = formData;

    if (!email.trim() || !password || !confirmPassword) {
      return 'All fields are required';
    }

    if (!validateEmail(email)) {
      return 'Please enter a valid email address';
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return passwordError;
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Failed to create account');
      } else {
        setSuccess(
          'Account created successfully! Please check your email to verify your account.',
        );
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(prev => !prev);
    } else {
      setShowConfirmPassword(prev => !prev);
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
                      Sign up
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-black dark:text-white">
                    Create Account
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Join us to get started
                  </p>
                </div>

                <NeoForm onSubmit={handleSignup} className="space-y-6">
                  <NeoFormField>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 z-10" />
                      <NeoFormInput
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="EMAIL ADDRESS"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-12"
                        disabled={loading}
                      />
                    </div>
                  </NeoFormField>

                  <NeoFormField>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 z-10" />
                      <NeoFormInput
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="PASSWORD"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-12 pr-12"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('password')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors z-10"
                        disabled={loading}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </NeoFormField>

                  <NeoFormField>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 z-10" />
                      <NeoFormInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="CONFIRM PASSWORD"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-12 pr-12"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          togglePasswordVisibility('confirmPassword')
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors z-10"
                        disabled={loading}
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
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

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative"
                    >
                      <div className="absolute -inset-1 bg-green-500 rotate-1"></div>
                      <div className="relative bg-green-50 dark:bg-green-950 border-2 border-green-600 p-4 text-center">
                        <p className="text-green-700 dark:text-green-300 font-bold text-sm tracking-wide">
                          {success.toUpperCase()}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <NeoButton
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 font-black tracking-widest group"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>CREATING ACCOUNT...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <span>CREATE ACCOUNT</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    )}
                  </NeoButton>

                  <div className="text-center mt-8">
                    <p className="text-base font-bold text-gray-700 dark:text-gray-300">
                      ALREADY HAVE AN ACCOUNT?{' '}
                      <Link
                        href="/login"
                        className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors duration-300 underline decoration-2 underline-offset-4 hover:decoration-4"
                      >
                        SIGN IN
                      </Link>
                    </p>
                  </div>
                </NeoForm>
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
              BY SIGNING UP, YOU AGREE TO OUR{' '}
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
