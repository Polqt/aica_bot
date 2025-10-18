'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  variant?: 'spinner' | 'spinner-with-text' | 'minimal';
  text?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PageLoader({
  variant = 'spinner-with-text',
  text = 'Loading...',
  fullScreen = true,
  size = 'md',
}: PageLoaderProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinnerSize = sizeClasses[size];

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-3"
    >
      <Loader2 className={`${spinnerSize} animate-spin text-blue-600`} />
      {variant === 'spinner-with-text' && (
        <p className="text-sm text-gray-500 font-medium">{text}</p>
      )}
    </motion.div>
  );

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-12">{content}</div>;
}
