'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: {
    title: string;
    description?: string;
  }[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;

          return (
            <div key={index} className="flex flex-col items-center relative">
              <div
                className={cn(
                  'w-10 h-10 rounded-sm border-2 border-black dark:border-white flex items-center justify-center font-bold text-sm relative transition-all duration-200',
                  isCompleted && 'bg-violet-600 text-white',
                  isCurrent &&
                    'bg-white dark:bg-black text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)]',
                  !isCompleted && !isCurrent && 'bg-white/50 dark:bg-black/50',
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span
                  className={cn(
                    'text-sm font-bold uppercase tracking-wide',
                    (isCompleted || isCurrent) && 'text-black dark:text-white',
                    !isCompleted &&
                      !isCurrent &&
                      'text-gray-400 dark:text-gray-500',
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-[calc(100%+0.5rem)] w-[calc(200%-1rem)] h-0.5 -translate-y-1/2">
                  <div
                    className={cn(
                      'h-full',
                      isCompleted
                        ? 'bg-violet-600'
                        : 'bg-gray-200 dark:bg-gray-700',
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
