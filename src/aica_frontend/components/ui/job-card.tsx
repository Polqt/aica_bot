"use client";

import { cn } from "@/lib/utils";
import React from 'react';

interface JobCardProps {
  children: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

interface JobCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface JobCardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface JobCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface JobCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface JobCardCompanyProps {
  children: React.ReactNode;
  className?: string;
}

interface JobCardMatchProps {
  percentage: number;
  className?: string;
}

interface JobCardSalaryProps {
  children: React.ReactNode;
  className?: string;
}

export const JobCard = ({ 
  children, 
  isSelected = false, 
  onClick, 
  className 
}: JobCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors",
        isSelected && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20",
        className
      )}
    >
      {children}
    </div>
  );
};

export const JobCardHeader = ({ children, className }: JobCardHeaderProps) => {
  return (
    <div className={cn("mb-2", className)}>
      {children}
    </div>
  );
};

export const JobCardContent = ({ children, className }: JobCardContentProps) => {
  return (
    <div className={cn("mb-2", className)}>
      {children}
    </div>
  );
};

export const JobCardFooter = ({ children, className }: JobCardFooterProps) => {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      {children}
    </div>
  );
};

export const JobCardTitle = ({ children, className }: JobCardTitleProps) => {
  return (
    <h3 className={cn("text-lg font-medium text-slate-800 dark:text-slate-100", className)}>
      {children}
    </h3>
  );
};

export const JobCardCompany = ({ children, className }: JobCardCompanyProps) => {
  return (
    <p className={cn("text-slate-600 dark:text-slate-300", className)}>
      {children}
    </p>
  );
};

export const JobCardMatch = ({ percentage, className }: JobCardMatchProps) => {
  // Determine match percentage color
  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-orange-600 dark:text-orange-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  return (
    <span className={cn("text-sm font-medium", getMatchColor(percentage), className)}>
      {percentage}% Match
    </span>
  );
};

export const JobCardSalary = ({ children, className }: JobCardSalaryProps) => {
  return (
    <span className={cn("text-sm text-slate-500 dark:text-slate-400", className)}>
      {children}
    </span>
  );
};
