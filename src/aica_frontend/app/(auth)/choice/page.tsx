'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NeoCard } from '@/components/ui/neo-card';
import { NeoButton } from '@/components/ui/neo-button';
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
        const processingStatus: ProcessingStatusResponse =
          await apiClient.getProcessingStatus();

        // Also check if user has resume builder data (skills indicate completion)
        let hasResumeBuilderData = false;
        try {
          const skills = await apiClient.getUserSkills();
          hasResumeBuilderData =
            skills.technical_skills.length > 0 || skills.soft_skills.length > 0;
        } catch (e) {
          console.log('Could not check skills:', e);
        }

        if (
          profile.profile_completed ||
          hasResumeBuilderData ||
          profile.resume_uploaded ||
          processingStatus.status === 'processing'
        ) {
          router.push('/dashboard');
        } else {
          setShouldShowChoice(true);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setShouldShowChoice(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserStatus();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full"
        >
          <NeoCard variant="elevated" className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-black tracking-wide text-gray-900 dark:text-gray-100">
              CHECKING YOUR PROFILE...
            </h2>
          </NeoCard>
        </motion.div>
      </div>
    );
  }

  if (!shouldShowChoice) {
    return null;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
            GET STARTED
          </h1>
          <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
            CHOOSE HOW TO CREATE YOUR PROFILE
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-6"
      >
        <div className="relative transform hover:rotate-1 transition-transform duration-300">
          <NeoButton
            variant="outline"
            onClick={() => router.push('/upload')}
            className="w-full h-auto p-8 group"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-600/20 rounded-full blur-lg transform group-hover:scale-125 transition-transform" />
                <Upload className="w-12 h-12 relative z-10 text-violet-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-black tracking-wide">
                  UPLOAD YOUR RESUME
                </h3>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  LET US EXTRACT YOUR INFORMATION
                </p>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </div>
          </NeoButton>
        </div>

        <div className="relative transform hover:-rotate-1 transition-transform duration-300">
          <NeoButton
            variant="outline"
            onClick={() => router.push('/onboarding')}
            className="w-full h-auto p-8 group"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-600/20 rounded-full blur-lg transform group-hover:scale-125 transition-transform" />
                <FileText className="w-12 h-12 relative z-10 text-violet-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-black tracking-wide">
                  FILL OUT MANUALLY
                </h3>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  CREATE YOUR PROFILE STEP BY STEP
                </p>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </div>
          </NeoButton>
        </div>
      </motion.div>
    </div>
  );
}
