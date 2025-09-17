'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    resetUpload,
  } = useFileUpload();

  const {
    processingStatus,
    setProcessingStatus,
    pollCount,
    checkProcessingStatus,
    startPolling,
    resetProcessing,
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

  const handleSkip = (): void => {
    router.push('/(onboarding)/profile');
  };

  const handleRetry = (): void => {
    resetProcessing();
    resetUpload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl"
      >
        <div className="relative group">
          <div className="absolute -inset-2 bg-violet-600 rotate-1 rounded-none opacity-60"></div>
          <div className="absolute -inset-1 bg-violet-500 -rotate-1 rounded-none opacity-40"></div>

          <Card className="relative bg-white dark:bg-gray-900 border-4 border-black dark:border-violet-300 rounded-none shadow-none transform transition-all duration-300 hover:-translate-y-2 hover:translate-x-2">
            <CardHeader className="text-center p-12">
              <div className="flex justify-center mb-6">
                <div className="bg-violet-600 text-white px-6 py-3 transform rotate-2 font-black text-lg tracking-wider border-2 border-black">
                  UPLOAD
                </div>
              </div>

              <CardTitle className="text-4xl font-black tracking-tight text-black dark:text-white mb-4">
                RESUME UPLOAD
              </CardTitle>
              <CardDescription className="text-xl font-bold text-gray-700 dark:text-gray-300 tracking-wide">
                UPLOAD YOUR RESUME TO GET PERSONALIZED JOB MATCHES AND INSIGHTS
              </CardDescription>
            </CardHeader>

            <CardContent className="p-12 pt-0">
              <div className="space-y-8">
                {processingStatus === 'not_uploaded' ? (
                  <div className="space-y-8">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative"
                    >
                      <div className="absolute -inset-1 bg-violet-400 rotate-1 opacity-30"></div>
                      <div className="relative bg-gray-50 dark:bg-gray-800 border-3 border-black dark:border-violet-300 p-8">
                        <FileUploader
                          selectedFile={selectedFile}
                          isUploading={isUploading}
                          error={error}
                          onFileChange={handleFileChange}
                          onUpload={handleUpload}
                          onSkip={handleSkip}
                        />
                      </div>
                    </motion.div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                      >
                        <div className="absolute -inset-1 bg-red-500 -rotate-1"></div>
                        <div className="relative bg-red-50 dark:bg-red-950 border-3 border-red-600 p-6 text-center">
                          <p className="text-red-700 dark:text-red-300 font-black text-lg tracking-wide">
                            {error.toUpperCase()}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="relative"
                    >
                      <div className="absolute -inset-0.5 bg-violet-200 dark:bg-violet-900 rotate-0.5 opacity-50"></div>
                      <div className="relative bg-violet-50 dark:bg-violet-950 border-2 border-violet-300 dark:border-violet-600 p-6">
                        <h3 className="font-black text-lg text-violet-800 dark:text-violet-200 mb-4 tracking-wide">
                          SUPPORTED FORMATS:
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {['PDF', 'DOC', 'DOCX', 'TXT'].map(
                            (format, index) => (
                              <div
                                key={format}
                                className={`bg-white dark:bg-gray-800 border-2 border-violet-400 p-3 text-center font-bold text-violet-700 dark:text-violet-300 transform ${
                                  index % 2 === 0 ? 'rotate-1' : '-rotate-1'
                                }`}
                              >
                                .{format}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    <div className="absolute -inset-1 bg-violet-400 rotate-0.5 opacity-40"></div>
                    <div className="relative bg-gray-50 dark:bg-gray-800 border-3 border-black dark:border-violet-300 p-8">
                      <ProcessingStatusDisplay
                        status={processingStatus}
                        pollCount={pollCount}
                        onRetry={handleRetry}
                      />
                    </div>
                  </motion.div>
                )}
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
                YOUR DATA IS SECURE AND ENCRYPTED
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
