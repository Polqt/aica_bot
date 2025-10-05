'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface NeoBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary';
}

const NeoBadge = React.forwardRef<HTMLDivElement, NeoBadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center rounded-sm px-3 py-1 text-sm font-bold uppercase tracking-wide border-2 transition-all duration-200';

    const variants = {
      default:
        'bg-violet-600 text-white border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]',
      outline:
        'bg-white dark:bg-black text-black dark:text-white border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]',
      secondary:
        'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          'hover:translate-y-[-2px]',
          className,
        )}
        {...props}
      />
    );
  },
);

NeoBadge.displayName = 'NeoBadge';

export { NeoBadge };
