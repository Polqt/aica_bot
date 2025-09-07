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
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { AuthCarouselWrapper } from '@/components/AuthCarousel';
import { authContent } from '@/lib/constants/app-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SignupResponse {
  access_token?: string;
  message?: string;
  detail?: string;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

type ValidationError = string | null;

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
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

    // Clear errors when user starts typing
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

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        setSuccess(
          'Account created successfully! Redirecting to resume upload...',
        );
        setTimeout(() => {
          router.push('/upload');
        }, 1500);
      } else {
        setSuccess(
          data.message ||
            'Account created successfully! Please check your email to confirm your account.',
        );
        setTimeout(() => {
          router.push('/upload');
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
      {/* Left Section - Carousel */}
      <div className={`hidden lg:block min-h-screen p-4 transition-all duration-500 ease-in-out ${isCarouselCollapsed ? 'w-20' : 'w-1/3'}`}>
        <AuthCarouselWrapper 
          className="h-full" 
          onCollapseChange={setIsCarouselCollapsed}
        />
      </div>

      {/* Right Section - Sign Up Form */}
      <div className={`min-h-screen flex items-center p-4 lg:p-8 transition-all duration-500 ease-in-out ${isCarouselCollapsed ? 'flex-1 justify-center' : 'flex-1 justify-center'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card border-0 shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">{authContent.signUp.title}</CardTitle>
              <CardDescription className="text-center">
                {authContent.signUp.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20 relative z-0"
                      disabled={loading}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Password (min. 6 characters)"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20 relative z-0"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('password')}
                      className="absolute right-3 top-3 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors z-10"
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

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20 relative z-0"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute right-3 top-3 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors z-10"
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

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50/50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-50/50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <p className="text-green-600 dark:text-green-400 text-sm">
                        {success}
                      </p>
                    </div>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 btn-modern group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
