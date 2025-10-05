'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NeoCard } from '@/components/ui/neo-card';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useResumeProcessing } from '@/hooks/useResumeProcessing';
import FileUploader from '@/components/FileUploader';
import ProcessingStatusDisplay from '@/components/ProcessingStatusDisplay';

export default function ResumeUpload() {
  const router = useRouter();

  const {
    selectedFile,
    isUploading,
    error,
    handleFileChange,
    uploadFile,
  } = useFileUpload();

  const {
    processingStatus,
    setProcessingStatus,
    pollCount,
    checkProcessingStatus,
    startPolling,
  } = useResumeProcessing();

  const handleUpload = async (): Promise<void> => {
    const success = await uploadFile();
    if (success) {
      setProcessingStatus('processing');

      setTimeout(() => {
        checkProcessingStatus();
        startPolling();
      }, 500);
    }
  };

  React.useEffect(() => {
    if (processingStatus === 'completed') {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [processingStatus, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
          UPLOAD RESUME
        </h1>
        <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
          GET STARTED BY UPLOADING YOUR RESUME
        </p>
      </div>

      <div className="relative">
        <div className="absolute -inset-1 bg-violet-600/5 transform rotate-1 rounded-2xl" />
        <NeoCard variant="elevated" className="relative">
          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-red-500 rotate-1"></div>
                  <div className="relative bg-red-50 dark:bg-red-950 border-2 border-red-600 p-4 text-center">
                    <p className="text-red-700 dark:text-red-300 font-bold text-sm tracking-wide">
                      {error.toUpperCase()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <FileUploader
              selectedFile={selectedFile}
              isUploading={isUploading}
              error={error}
              onFileChange={handleFileChange}
              onUpload={handleUpload}
              onSkip={() => router.push('/dashboard')}
            />

            {processingStatus !== undefined && processingStatus !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <ProcessingStatusDisplay
                  status={processingStatus}
                  pollCount={pollCount}
                  onRetry={handleUpload}
                />
              </motion.div>
            )}
          </div>
        </NeoCard>
      </div>
    </motion.div>
  );
}
