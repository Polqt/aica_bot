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
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AuthCarouselWrapper } from '@/components/AuthCarousel';
import { authContent } from '@/lib/constants/app-data';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCarouselCollapsed, setIsCarouselCollapsed] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        }/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Check your email for the confirmation first!');
      } else {
        localStorage.setItem('access_token', data.access_token);
        try {
          const profileResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
            }/auth/profile`,
            {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
              },
            },
          );

          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            if (!profile.resume_uploaded) {
              router.push('/upload');
            } else {
              router.push('/dashboard');
            }
          } else {
            router.push('/dashboard');
          }
        } catch {
          router.push('/dashboard');
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Left Section - Carousel */}
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

      {/* Right Section - Login Form */}
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
          <Card className="glass-card border-0 shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {authContent.login.title}
              </CardTitle>
              <CardDescription className="text-center">
                {authContent.login.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 relative z-0"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 relative z-0"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50/50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <p className="text-red-600 dark:text-red-400 text-sm text-center">
                      {error}
                    </p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 btn-modern group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/sign-up"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{' '}
              <Link
                href="#"
                className="underline hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="#"
                className="underline hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
