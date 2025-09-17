'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, FileText, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { UserProfile } from '@/types/user';
import { ProcessingStatusResponse } from '@/types/api';

export default function ChoicePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldShowChoice, setShouldShowChoice] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setIsChecking(false);
          setShouldShowChoice(true);
          return;
        }

        const profile: UserProfile = await apiClient.getUserProfile();

        const processingStatus: ProcessingStatusResponse = await apiClient.getProcessingStatus();

        if (profile.resume_uploaded || processingStatus.status === 'completed') {
          router.push('/dashboard');
          return;
        }

        // Show choice page if neither condition is met
        setShouldShowChoice(true);
      } catch (error) {
        console.error('Error checking user status:', error);
        // If there's an error (e.g., no auth), show the choice page
        setShouldShowChoice(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserStatus();
  }, [router]);

  const handleUploader = () => {
    router.push('/upload');
  };

  const handleProfileBuilder = () => {
    router.push('/(onboarding)/profile');
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Checking your status...
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Please wait while we check your account setup.
          </p>
        </motion.div>
      </div>
    );
  }

  // Don't render choice page if user should be redirected
  if (!shouldShowChoice) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl"
      >
        <div className="relative group">
          <div className="absolute -inset-2 bg-violet-600 rotate-1 rounded-none opacity-60"></div>
          <div className="absolute -inset-1 bg-violet-500 -rotate-1 rounded-none opacity-40"></div>

          <Card className="relative bg-white dark:bg-gray-900 border-4 border-black dark:border-violet-300 rounded-none shadow-none transform transition-all duration-300 hover:-translate-y-2 hover:translate-x-2">
            <CardHeader className="text-center p-12">
              <div className="flex justify-center mb-6">
                <div className="bg-violet-600 text-white px-6 py-3 transform rotate-2 font-black text-lg tracking-wider border-2 border-black">
                  CHOOSE YOUR PATH
                </div>
              </div>

              <CardTitle className="text-4xl font-black tracking-tight text-black dark:text-white mb-4">
                WHAT WOULD YOU LIKE TO DO?
              </CardTitle>
              <CardDescription className="text-xl font-bold text-gray-700 dark:text-gray-300 tracking-wide">
                SELECT AN OPTION TO GET STARTED WITH YOUR JOURNEY
              </CardDescription>
            </CardHeader>

            <CardContent className="p-12 pt-0">
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-violet-400 rotate-1 opacity-30"></div>
                  <div className="relative bg-gray-50 dark:bg-gray-800 border-3 border-black dark:border-violet-300 p-8 h-full">
                    <div className="text-center space-y-6">
                      <div className="inline-block">
                        <div className="bg-violet-600 text-white p-4 transform -rotate-2 border-2 border-black">
                          <Upload className="w-8 h-8" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-black dark:text-white tracking-wide">
                        RESUME UPLOADER
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 font-bold">
                        UPLOAD YOUR EXISTING RESUME TO GET PERSONALIZED JOB MATCHES AND AI INSIGHTS
                      </p>
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-black rotate-2 group-hover:rotate-1 transition-transform duration-300"></div>
                        <Button
                          onClick={handleUploader}
                          className="relative w-full h-14 bg-violet-600 hover:bg-violet-700 border-3 border-black text-white font-black text-base tracking-widest rounded-none transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="flex items-center justify-center space-x-3 group">
                            <span>UPLOAD RESUME</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-violet-400 -rotate-1 opacity-30"></div>
                  <div className="relative bg-gray-50 dark:bg-gray-800 border-3 border-black dark:border-violet-300 p-8 h-full">
                    <div className="text-center space-y-6">
                      <div className="inline-block">
                        <div className="bg-violet-600 text-white p-4 transform rotate-2 border-2 border-black">
                          <FileText className="w-8 h-8" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-black dark:text-white tracking-wide">
                        RESUME/PROFILE BUILDER
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 font-bold">
                        BUILD YOUR PROFESSIONAL PROFILE FROM SCRATCH WITH OUR GUIDED PROCESS
                      </p>
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-black -rotate-2 group-hover:-rotate-1 transition-transform duration-300"></div>
                        <Button
                          onClick={handleProfileBuilder}
                          className="relative w-full h-14 bg-violet-600 hover:bg-violet-700 border-3 border-black text-white font-black text-base tracking-widest rounded-none transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="flex items-center justify-center space-x-3 group">
                            <span>BUILD PROFILE</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="inline-block relative">
            <div className="absolute -inset-1 bg-black rotate-1 opacity-20"></div>
            <div className="relative bg-white dark:bg-gray-900 border-2 border-black dark:border-violet-300 px-6 py-3">
              <p className="text-sm font-black text-gray-700 dark:text-gray-300 tracking-wider">
                CHOOSE THE OPTION THAT BEST FITS YOUR NEEDS
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}