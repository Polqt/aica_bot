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

      // Start processing status checks with delays
      setTimeout(() => {
        checkProcessingStatus();
        startPolling();
      }, 500);
    }
  };

  const handleSkip = (): void => {
    router.push('/dashboard');
  };

  const handleRetry = (): void => {
    resetProcessing();
    resetUpload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Resume Upload</CardTitle>
            <CardDescription className="text-lg">
              Upload your resume to get personalized job matches and insights
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {processingStatus === 'not_uploaded' ? (
              <FileUploader
                selectedFile={selectedFile}
                isUploading={isUploading}
                error={error}
                onFileChange={handleFileChange}
                onUpload={handleUpload}
                onSkip={handleSkip}
              />
            ) : (
              <ProcessingStatusDisplay
                status={processingStatus}
                pollCount={pollCount}
                onRetry={handleRetry}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
