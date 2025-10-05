'use client';

import { cn } from '@/lib/utils';
import {
  JobCard as JobCardPrimitive,
  JobCardHeader,
  JobCardContent,
  JobCardFooter,
  JobCardTitle,
  JobCardCompany,
  JobCardMatch,
  JobCardSalary,
} from '@/components/ui/job-card';

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  matchPercentage: number;
  salaryRange: string;
  isSelected?: boolean;
  onClick?: (jobId: string) => void;
  className?: string;
}

export default function JobCard({
  id,
  title,
  company,
  matchPercentage,
  salaryRange,
  isSelected = false,
  onClick,
  className,
}: JobCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <JobCardPrimitive
      isSelected={isSelected}
      onClick={handleClick}
      className={cn(
        'bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200',
        className,
      )}
    >
      <JobCardHeader className="space-y-2">
        <JobCardTitle className="text-xl font-bold tracking-tight">
          {title}
        </JobCardTitle>
      </JobCardHeader>

      <JobCardContent>
        <JobCardCompany>{company}</JobCardCompany>
      </JobCardContent>

      <JobCardFooter>
        <JobCardMatch percentage={matchPercentage} />
        <JobCardSalary>{salaryRange}</JobCardSalary>
      </JobCardFooter>
    </JobCardPrimitive>
  );
}
