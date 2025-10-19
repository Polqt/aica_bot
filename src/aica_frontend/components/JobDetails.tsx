'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MapPin,
  Building,
  ExternalLink,
  Clock,
  DollarSign,
  BookmarkPlus,
  BookmarkCheck,
  BookmarkMinus,
  RefreshCw,
} from 'lucide-react';
import { capitalizeSkill } from '@/lib/utils/skillCapitalization';

export interface JobDetailsData {
  job_id: string;
  job_title?: string;
  title?: string;
  company: string;
  location?: string;
  salary?: string;
  match_score?: number;
  matchScore?: number;
  confidence?: string;
  job_url?: string;
  url?: string;
  ai_reasoning?: string;
  skill_coverage?: number;
  matched_skills?: string[];
  missing_critical_skills?: string[];
  description?: string;
  requirements?: string[];
  tags?: string[];
  skills?: string[];
  saved_at?: string;
  savedDate?: string;
}

interface JobDetailsProps {
  job: JobDetailsData;
  variant: 'match' | 'saved';
  isSaved?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onUnsave?: () => void;
  isRemoving?: boolean;
  onRemove?: () => void;
}

export function JobDetails({
  job,
  variant,
  isSaved = false,
  isSaving = false,
  onSave,
  onUnsave,
  isRemoving = false,
  onRemove,
}: JobDetailsProps) {
  const jobTitle = job.job_title || job.title || 'Job Title';
  const jobUrl = job.job_url || job.url || '#';
  const matchScore = (job.match_score || job.matchScore || 0) * 100;

  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl text-gray-900 mb-2 font-semibold">
              {jobTitle}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-3 text-gray-500 text-sm">
              <span className="flex items-center">
                <Building className="w-4 h-4 mr-1.5" />
                {job.company}
              </span>
              {job.location && (
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  {job.location}
                </span>
              )}
              {job.salary && (
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1.5" />
                  {job.salary}
                </span>
              )}
              {job.confidence && (
                <Badge
                  className={`px-2 py-0.5 text-xs font-medium ${
                    job.confidence === 'high'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : job.confidence === 'medium'
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : job.confidence === 'recommendation'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  {job.confidence === 'recommendation'
                    ? 'Suggested'
                    : job.confidence.charAt(0).toUpperCase() +
                      job.confidence.slice(1)}
                </Badge>
              )}
              {variant === 'saved' && (job.saved_at || job.savedDate) && (
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  Saved {job.savedDate || job.saved_at}
                </span>
              )}
            </CardDescription>
          </div>
          {job.confidence !== 'recommendation' &&
            (job.match_score !== undefined || job.matchScore !== undefined) && (
              <div className="text-center ml-4">
                <div className="text-2xl font-semibold text-gray-900">
                  {matchScore.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">Match</div>
              </div>
            )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* AI Reasoning Section */}
        {job.ai_reasoning && job.ai_reasoning.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex items-center justify-center shadow-sm flex-shrink-0 p-1">
                <Image
                  src="/AICA Logo.svg"
                  alt="AICA"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  AI Analysis
                </h3>
                <p className="text-xs text-gray-500">
                  Personalized insights based on your profile
                </p>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <p
                className="text-gray-700 leading-relaxed text-[15px]"
                dangerouslySetInnerHTML={{
                  __html: job.ai_reasoning
                    // Match Analysis pattern (from job_matching.py)
                    .replace(
                      /\*\*Match Analysis:\*\*/g,
                      '<strong class="text-gray-900 font-bold">Match Analysis:</strong>',
                    )
                    // AI Analyzer patterns
                    .replace(
                      /\*\*Match Score: ([^*]+)\*\*/g,
                      '<strong class="text-gray-900 font-bold">Match Score: $1</strong>',
                    )
                    .replace(
                      /\*\*Position: ([^*]+)\*\*/g,
                      '<strong class="text-gray-900 font-bold">Position: $1</strong>',
                    )
                    .replace(
                      /\*\*Skills Analysis:\*\*/g,
                      '<strong class="text-gray-900 font-bold">Skills Analysis:</strong>',
                    )
                    .replace(
                      /\*\*Direct Matches \(([^)]+)\):\*\*/g,
                      '<strong class="text-gray-900 font-bold">Direct Matches ($1):</strong>',
                    )
                    .replace(
                      /\*\*Related Skills \(([^)]+)\):\*\*/g,
                      '<strong class="text-gray-900 font-bold">Related Skills ($1):</strong>',
                    )
                    .replace(
                      /\*\*Skills to Develop \(([^)]+)\):\*\*/g,
                      '<strong class="text-gray-900 font-bold">Skills to Develop ($1):</strong>',
                    )
                    .replace(
                      /\*\*Recommendation:\*\*/g,
                      '<strong class="text-gray-900 font-bold">Recommendation:</strong>',
                    )
                    // RAG-based analysis patterns
                    .replace(
                      /\*\*SKILL ALIGNMENT \(100-120 words\)\*\*/g,
                      '<strong class="text-gray-900 font-bold">SKILL ALIGNMENT</strong>',
                    )
                    .replace(
                      /\*\*SKILL ALIGNMENT\*\*/g,
                      '<strong class="text-gray-900 font-bold">SKILL ALIGNMENT</strong>',
                    )
                    .replace(
                      /\*\*APPLICATION RECOMMENDATION \(60-80 words\)\*\*/g,
                      '<strong class="text-gray-900 font-bold">APPLICATION RECOMMENDATION</strong>',
                    )
                    .replace(
                      /\*\*APPLICATION RECOMMENDATION\*\*/g,
                      '<strong class="text-gray-900 font-bold">APPLICATION RECOMMENDATION</strong>',
                    )
                    .replace(
                      /\*\*IMPROVEMENT STEPS \(60-80 words\)\*\*/g,
                      '<strong class="text-gray-900 font-bold">IMPROVEMENT STEPS</strong>',
                    )
                    .replace(
                      /\*\*IMPROVEMENT STEPS\*\*/g,
                      '<strong class="text-gray-900 font-bold">IMPROVEMENT STEPS</strong>',
                    )
                    .replace(/\n/g, '<br />'),
                }}
              />
            </div>
          </motion.div>
        )}

        {job.confidence !== 'recommendation' && (
          <div className="grid gap-4">
            {job.skill_coverage !== undefined && job.skill_coverage >= 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-semibold">
                    ✓
                  </div>
                  Skill Coverage
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Match rate</span>
                    <span className="text-base font-medium text-gray-900">
                      {Math.round(job.skill_coverage * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-500 ease-out rounded-full"
                      style={{
                        width: `${Math.round(job.skill_coverage * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {job.matched_skills?.length || 0} of{' '}
                    {(job.matched_skills?.length || 0) +
                      (job.missing_critical_skills?.length || 0)}{' '}
                    skills matched
                  </p>
                </div>
              </div>
            )}

            {/* Matched Skills */}
            {job.matched_skills && job.matched_skills.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-600 text-white rounded flex items-center justify-center text-xs font-semibold">
                    ★
                  </div>
                  Your Matching Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.matched_skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {capitalizeSkill(skill)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Critical Skills */}
            {job.missing_critical_skills &&
              job.missing_critical_skills.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 bg-amber-600 text-white rounded flex items-center justify-center text-xs font-semibold">
                      !
                    </div>
                    Skills to Develop
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.missing_critical_skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-2 py-0.5 text-xs font-medium bg-white text-amber-700 border border-amber-300"
                      >
                        {capitalizeSkill(skill)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700">
                    Consider learning these skills to improve your match rate
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Job Description */}
        {job.description && job.description.trim() && (
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">
              Job Description
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        )}

        {job.requirements && job.requirements.length > 0 && (
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">
              Requirements
            </h3>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-700 text-sm"
                >
                  <span className="text-green-600 mt-0.5 text-base">✓</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Required Skills from tags or skills */}
        {((job.tags && job.tags.length > 0) ||
          (job.skills && job.skills.length > 0)) && (
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(job.tags || job.skills || []).map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {capitalizeSkill(skill)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150"
            onClick={() => window.open(jobUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {variant === 'saved' ? 'Apply now' : 'View job'}
          </Button>

          {variant === 'match' && (
            <Button
              className="flex-1 bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-medium py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150"
              disabled={isSaving}
              onClick={isSaved ? onUnsave : onSave}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 mr-2" />
              ) : (
                <BookmarkPlus className="w-4 h-4 mr-2" />
              )}
              {isSaved ? 'Unsave' : 'Save'}
            </Button>
          )}

          {variant === 'saved' && onRemove && (
            <Button
              className="bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-medium py-2.5 rounded-lg flex-1 shadow-sm hover:shadow-md transition-all duration-150"
              onClick={onRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BookmarkMinus className="w-4 h-4 mr-2" />
              )}
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
