'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

const NeoButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'default', size = 'md', isActive = false, ...props },
    ref,
  ) => {
    const baseStyles =
      'font-bold uppercase tracking-wide transition-all duration-200 border-2 transform';

    const variants = {
      default:
        'bg-violet-600 hover:bg-violet-700 text-white border-black dark:border-white',
      outline:
        'bg-white dark:bg-black text-black dark:text-white border-black dark:border-white hover:bg-violet-50 dark:hover:bg-violet-950',
      ghost:
        'border-transparent hover:border-black dark:hover:border-white bg-transparent',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const shadowStyles = isActive
      ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.8)] translate-y-[-2px]'
      : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.8)] hover:translate-y-[-2px]';

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          shadowStyles,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

NeoButton.displayName = 'NeoButton';

export { NeoButton };
