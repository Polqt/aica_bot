'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

        let hasResumeBuilderData = false;
        try {
          const skills = await apiClient.getUserSkills();
          hasResumeBuilderData =
            skills.technical_skills.length > 0 || skills.soft_skills.length > 0;
        } catch {
          // Silent error - skills check is not critical
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm text-center"
      >
        <div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100 tracking-tight">
          Checking your profile...
        </h2>
      </motion.div>
    );
  }

  if (!shouldShowChoice) return null;

  return (
    <div className="flex flex-col justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2 whitespace-nowrap">
          YOUR JOURNEY BEGINS HERE!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose how to create your profile
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-6 w-full max-w-lg"
      >
        <button
          onClick={() => router.push('/upload')}
          className="group bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6 text-left hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-neutral-800 group-hover:bg-gray-100 dark:group-hover:bg-neutral-700 transition-colors">
              <Upload className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Upload your resume
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Let us extract your information
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => router.push('/profile')}
          className="group bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6 text-left hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-neutral-800 group-hover:bg-gray-100 dark:group-hover:bg-neutral-700 transition-colors">
              <FileText className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Fill out manually
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create your profile step by step
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </motion.div>
    </div>
  );
}
