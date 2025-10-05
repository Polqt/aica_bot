'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const NeoForm = React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(
  ({ className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(
          'space-y-6 bg-white dark:bg-black border-2 border-black dark:border-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)]',
          className,
        )}
        {...props}
      />
    );
  },
);

NeoForm.displayName = 'NeoForm';

const NeoFormField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('space-y-2', className)} {...props} />;
  },
);

NeoFormField.displayName = 'NeoFormField';

const NeoFormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-bold uppercase tracking-wide text-black dark:text-white',
          className,
        )}
        {...props}
      />
    );
  },
);

NeoFormLabel.displayName = 'NeoFormLabel';

const NeoFormInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full px-4 py-2 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-400 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] transition-all duration-200',
          className,
        )}
        {...props}
      />
    );
  },
);

NeoFormInput.displayName = 'NeoFormInput';

export { NeoForm, NeoFormField, NeoFormLabel, NeoFormInput };
