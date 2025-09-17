'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AuthCarouselWrapperProps {
  className?: string;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export function AuthCarouselWrapper({
  onCollapseChange,
}: AuthCarouselWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };


  return (
    <div className="relative h-full group">
      {/* Toggle Button - Outside the carousel container */}
      <motion.button
        onClick={handleToggleCollapse}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'absolute z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200 dark:border-slate-700',
          'top-4 left-4 opacity-0 group-hover:opacity-100',
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        )}
      </motion.button>
    </div>
  );
}
