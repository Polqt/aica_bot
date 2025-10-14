'use client';

import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'center' | 'inline';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'center',
}: EmptyStateProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center bg-white rounded-lg p-6 max-w-sm mx-auto"
    >
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-medium px-4 py-2 rounded-md text-sm shadow-sm hover:shadow-md transition-all duration-150"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );

  if (variant === 'center') {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        {content}
      </div>
    );
  }

  return content;
}
