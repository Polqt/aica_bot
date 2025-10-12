'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export interface JobCardData {
  job_id: string;
  title?: string;
  job_title?: string;
  company: string;
  location: string;
  match_score?: number;
  matchScore?: number;
  confidence?: string;
  matched_skills?: string[];
  skill_coverage?: number;
  salary?: string;
  saved_at?: string;
  savedDate?: string;
}

interface JobCardProps {
  job: JobCardData;
  isSelected: boolean;
  onClick: () => void;
  index?: number;
  variant?: 'match' | 'saved';
}

export function JobCard({
  job,
  isSelected,
  onClick,
  index = 0,
  variant = 'match',
}: JobCardProps) {
  const jobTitle = job.title || job.job_title || 'Job Title';
  const matchScore = (job.match_score || job.matchScore || 0) * 100;
  const savedTime = variant === 'saved' ? job.savedDate || job.saved_at : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ delay: 0.1 * index, duration: 0.3 }}
      layout
    >
      <Card
        className={`cursor-pointer transition-all duration-150 hover:bg-gray-50 ${
          isSelected
            ? 'border-gray-300 bg-gray-50 ring-1 ring-gray-300'
            : 'border-transparent hover:border-gray-300'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          {/* Title and Company */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                {jobTitle}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <Building className="w-4 h-4 mr-1.5" />
                {job.company}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                className={`px-2 py-0.5 text-xs font-medium ${
                  job.confidence === 'high'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : job.confidence === 'medium'
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                {(job.confidence && job.confidence.trim()
                  ? job.confidence
                  : 'Unknown'
                )
                  .charAt(0)
                  .toUpperCase() +
                  (job.confidence && job.confidence.trim()
                    ? job.confidence
                    : 'Unknown'
                  ).slice(1)}
              </Badge>
              <span className="text-sm font-medium text-gray-900">
                {matchScore.toFixed(0)}% Match
              </span>
            </div>
          </div>

          {/* Location, Salary, and Time Info */}
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1.5" />
              {job.location}
            </div>
            {job.salary && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1.5" />
                {job.salary}
              </div>
            )}
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              {savedTime ? `Saved ${savedTime}` : 'Recently posted'}
            </div>
          </div>

          {/* Skills and Coverage */}
          <div className="space-y-2.5 mt-3">
            <div className="flex flex-wrap gap-1.5">
              {job.matched_skills &&
                job.matched_skills.slice(0, 2).map((tag, tagIndex) => (
                  <Badge
                    key={tagIndex}
                    variant="secondary"
                    className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {tag}
                  </Badge>
                ))}
              {job.matched_skills && job.matched_skills.length > 2 && (
                <Badge
                  variant="secondary"
                  className="px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200"
                >
                  +{job.matched_skills.length - 2} more
                </Badge>
              )}
            </div>

            {job.skill_coverage !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-150 rounded-full"
                    style={{
                      width: `${Math.round(job.skill_coverage * 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-600 min-w-[2.5rem]">
                  {Math.round(job.skill_coverage * 100)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
