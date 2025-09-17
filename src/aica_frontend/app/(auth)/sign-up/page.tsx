'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { AuthCarouselWrapper } from '@/components/AuthCarousel';
import { SignupResponse, SignupFormData } from '@/types/auth';
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
  const [isCarouselCollapsed, setIsCarouselCollapsed] = useState(false);
  const router = useRouter();

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

      const data: SignupResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || `HTTP ${response.status}: Signup failed`,
        );
      }

      // Check if email confirmation is required
      if (data.email_confirmation_required) {
        setSuccess(
          'Account created successfully! Please check your email and confirm your account before proceeding.',
        );

        setTimeout(() => {
          window.open('https://mail.google.com', '_blank');

          router.push(
            '/login?message=Please confirm your email and then log in',
          );
        }, 2000);
      } else if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        setSuccess(
          'Account created successfully! Redirecting to choice...',
        );
        setTimeout(() => {
          router.push('/choice');
        }, 1500);
      } else {
        setSuccess(
          data.message ||
            'Account created successfully! Please log in to continue.',
        );
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
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
      <div
        className={`hidden lg:block min-h-screen p-4 transition-all duration-500 ease-in-out ${
          isCarouselCollapsed ? 'w-20' : 'w-1/3'
        }`}
      >
        <AuthCarouselWrapper
          className="h-full"
          onCollapseChange={setIsCarouselCollapsed}
        />
      </div>

      {/* Right Section - Sign Up Form */}
      <div
        className={`min-h-screen flex items-center p-4 lg:p-8 transition-all duration-500 ease-in-out ${
          isCarouselCollapsed
            ? 'flex-1 justify-center'
            : 'flex-1 justify-center'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="relative group">
            <Card className="relative bg-white dark:bg-gray-900 border-4 border-black dark:border-violet-300 rounded-none shadow-none transform transition-all duration-300 hover:-translate-y-1 hover:translate-x-1">
              <CardHeader className="space-y-6 p-8">
                <div className="text-center space-y-3">
                  <div className="inline-block">
                    <div className="bg-violet-600 text-white px-4 py-2 transform -rotate-2 font-black text-sm tracking-wider">
                      SIGN UP
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tight text-black dark:text-white">
                    CREATE ACCOUNT
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-gray-700 dark:text-gray-300">
                    Join us to get started
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-0">
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-violet-400 rounded-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-600 dark:text-gray-400 z-10" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="EMAIL ADDRESS"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-12 h-14 bg-gray-50 dark:bg-gray-800 border-3 border-black dark:border-violet-300 rounded-none focus:border-violet-600 dark:focus:border-violet-400 focus:ring-0 font-bold placeholder:font-bold placeholder:text-gray-500 text-black dark:text-white transition-all duration-300"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-violet-400 rounded-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-600 dark:text-gray-400 z-10" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="PASSWORD"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-12 pr-12 h-14 bg-gray-50 dark:bg-gray-800 border-3 border-black dark:border-violet-300 rounded-none focus:border-violet-600 dark:focus:border-violet-400 focus:ring-0 font-bold placeholder:font-bold placeholder:text-gray-500 text-black dark:text-white transition-all duration-300"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('password')}
                        className="absolute right-4 top-4 h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors z-10"
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
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-violet-400 rounded-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-600 dark:text-gray-400 z-10" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="CONFIRM PASSWORD"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-12 pr-12 h-14 bg-gray-50 dark:bg-gray-800 border-3 border-black dark:border-violet-300 rounded-none focus:border-violet-600 dark:focus:border-violet-400 focus:ring-0 font-bold placeholder:font-bold placeholder:text-gray-500 text-black dark:text-white transition-all duration-300"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          togglePasswordVisibility('confirmPassword')
                        }
                        className="absolute right-4 top-4 h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors z-10"
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
                  </div>
                </div>

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

                <div className="relative group">
                  <div className="absolute -inset-1 bg-black rotate-2 group-hover:rotate-1 transition-transform duration-300"></div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-14 bg-violet-600 hover:bg-violet-700 border-3 border-black text-white font-black text-base tracking-widest rounded-none transition-all duration-300 transform hover:-translate-y-1 disabled:hover:translate-y-0"
                    size="lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>CREATING ACCOUNT...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3 group">
                        <span>CREATE ACCOUNT</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-8 relative">
                <Separator className="border-2 border-black dark:border-violet-300" />
              </div>

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
            </CardContent>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
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
