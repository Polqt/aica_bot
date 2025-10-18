'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useResumeProcessing } from '@/hooks/useResumeProcessing';
import FileUploader from '@/components/FileUploader';
import ProcessingStatusDisplay from '@/components/ProcessingStatusDisplay';
import { AlertTriangle } from 'lucide-react';

export default function ResumeUpload() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'replace' | 'merge' | null;

  const { selectedFile, isUploading, error, handleFileChange, uploadFile } =
    useFileUpload(mode);

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
        // Always redirect to job-matches after successful upload
        // This allows users to immediately see their matched jobs
        router.push('/job-matches?from=upload');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [processingStatus, router, mode]);

  return (
    <div className="flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl space-y-8"
      >
        <div className="text-start space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">
            AICA, MEET MY RESUME!
          </h1>
          <p className="text-gray-500 text-base font-medium">
            Let AICA analyze your tech and soft skills
          </p>

          {mode === 'replace' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">
                <strong>Replace Mode:</strong> All existing profile data will be
                cleared and replaced with new resume data
              </p>
            </motion.div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all p-8 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 border border-red-200 bg-red-50 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          <FileUploader
            selectedFile={selectedFile}
            isUploading={isUploading}
            error={error}
            onFileChange={handleFileChange}
            onUpload={handleUpload}
          />

          {processingStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ProcessingStatusDisplay
                status={processingStatus}
                pollCount={pollCount}
                onRetry={handleUpload}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
