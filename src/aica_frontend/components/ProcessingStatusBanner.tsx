'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

type ProcessingStatusType =
  | 'processing'
  | 'parsing'
  | 'matching'
  | 'finalizing'
  | 'checking';

interface ProcessingStatusBannerProps {
  status: ProcessingStatusType;
}

const getStatusContent = (status: ProcessingStatusType) => {
  switch (status) {
    case 'parsing':
      return {
        title: 'Analyzing your resume...',
        description: 'Our AI is working hard to find the best opportunities.',
      };
    case 'matching':
      return {
        title: 'Finding perfect matches...',
        description: 'Our AI is working hard to find the best opportunities.',
      };
    case 'finalizing':
      return {
        title: 'Finalizing results...',
        description: 'Our AI is working hard to find the best opportunities.',
      };
    case 'processing':
      return {
        title: 'Processing your profile...',
        description: 'Our AI is working hard to find the best opportunities.',
      };
    case 'checking':
      return {
        title: 'Checking processing status...',
        description: null,
      };
    default:
      return {
        title: 'Processing...',
        description: 'Please wait while we process your request.',
      };
  }
};

export const ProcessingStatusBanner: React.FC<ProcessingStatusBannerProps> = ({
  status,
}) => {
  const content = getStatusContent(status);
  const isChecking = status === 'checking';

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className={`${
          isChecking ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
        } border shadow-sm mb-6`}
      >
        <CardContent
          className={`${
            isChecking ? 'flex items-center justify-center py-4' : 'py-4'
          }`}
        >
          <div className="flex items-center">
            <RefreshCw
              className={`${isChecking ? 'h-4 w-4' : 'h-5 w-5'} animate-spin ${
                isChecking ? 'text-gray-600' : 'text-blue-600'
              } ${isChecking ? 'mr-2' : 'mr-3'}`}
            />
            <div>
              <h3
                className={`font-medium ${
                  isChecking ? 'text-gray-600' : 'text-blue-900'
                }`}
              >
                {content.title}
              </h3>
              {content.description && (
                <p className="text-blue-700 text-sm">{content.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProcessingStatusBanner;
