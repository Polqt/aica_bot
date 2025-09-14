'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { ProcessingStatus } from '@/hooks/useResumeProcessing';
import { getStatusContent } from '@/lib/utils/processing';
import { MAX_POLLS } from '@/lib/constants/upload';

interface ProcessingStatusDisplayProps {
  status: ProcessingStatus;
  pollCount: number;
  onRetry: () => void;
}

export const ProcessingStatusDisplay: React.FC<
  ProcessingStatusDisplayProps
> = ({ status, pollCount, onRetry }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
      case 'parsing':
      case 'matching':
      case 'finalizing':
        return (
          <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
        );
      case 'completed':
        return (
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        );
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  const statusContent = getStatusContent(status);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        {getStatusIcon()}
      </div>

      <div>
        <h3 className="text-xl font-semibold">{statusContent.title}</h3>
        <p className="mt-2 text-muted-foreground">
          {statusContent.description}
        </p>

        {statusContent.showProgress && (
          <p className="text-xs text-muted-foreground mt-2">
            Attempt {pollCount + 1} of {MAX_POLLS}
          </p>
        )}
      </div>

      {status === 'error' && (
        <Button onClick={onRetry} className="btn-modern">
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

export default ProcessingStatusDisplay;