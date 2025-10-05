'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
  isActive?: boolean;
}

const NeoCard = React.forwardRef<HTMLDivElement, NeoCardProps>(
  ({ className, variant = 'default', isActive = false, ...props }, ref) => {
    const baseStyles =
      'relative bg-white dark:bg-black border-2 border-black dark:border-white transition-all duration-200';

    const variants = {
      default: '',
      elevated: 'transform rotate-1',
    };

    const shadowStyles = isActive
      ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.8)] translate-y-[-2px]'
      : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.8)] hover:translate-y-[-2px]';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], shadowStyles, className)}
        {...props}
      />
    );
  },
);

NeoCard.displayName = 'NeoCard';

const NeoCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 border-b-2 border-black dark:border-white', className)}
    {...props}
  />
));

NeoCardHeader.displayName = 'NeoCardHeader';

const NeoCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props} />
));

NeoCardContent.displayName = 'NeoCardContent';

const NeoCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 border-t-2 border-black dark:border-white', className)}
    {...props}
  />
));

NeoCardFooter.displayName = 'NeoCardFooter';

export { NeoCard, NeoCardHeader, NeoCardContent, NeoCardFooter };
