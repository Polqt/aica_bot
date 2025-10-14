'use client';

import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { ProcessingStatusBanner } from '@/components/ProcessingStatusBanner';
import { JobListSkeleton } from '@/components/ui/job-list-skeleton';

interface LoadingStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  showSkeleton?: boolean;
  showProcessingStatus?: boolean;
  processingStatus?:
    | 'processing'
    | 'parsing'
    | 'matching'
    | 'finalizing'
    | 'checking';
  variant?: 'center' | 'full';
}

export function LoadingState({
  icon: Icon,
  title = 'Loading...',
  description,
  showSkeleton = false,
  showProcessingStatus = false,
  processingStatus,
  variant = 'center',
}: LoadingStateProps) {
  // If showing skeleton, render skeleton layout
  if (showSkeleton) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Show processing status banner if provided */}
        {showProcessingStatus && processingStatus && (
          <ProcessingStatusBanner status={processingStatus} />
        )}

        {/* Header skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-2 mb-6"
        >
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-5 w-72 bg-gray-200 rounded-lg animate-pulse" />
        </motion.div>

        {/* Job list skeleton */}
        <JobListSkeleton count={5} />
      </div>
    );
  }

  // Otherwise, show centered loading state
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center bg-white rounded-lg p-8 shadow-sm"
    >
      {Icon && (
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon className="w-6 h-6 text-gray-600 animate-spin" />
        </div>
      )}
      <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500">{description}</p>}
    </motion.div>
  );

  if (variant === 'full') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      {content}
    </div>
  );
}
