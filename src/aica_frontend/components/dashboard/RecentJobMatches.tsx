'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, ChevronRight, MapPin, Building } from 'lucide-react';
import Link from 'next/link';

interface JobMatch {
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  match_score: number;
  matched_skills: string[];
  confidence: string;
  created_at: string;
}

interface RecentJobMatchesProps {
  matches: JobMatch[];
  hasNoData: boolean;
}

const getConfidenceBadgeColor = (confidence: string): string => {
  const colors: Record<string, string> = {
    high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    colors[confidence.toLowerCase()] ||
    'bg-gray-50 text-gray-700 border-gray-200'
  );
};

const getMatchScoreColor = (score: number): string => {
  if (score >= 0.8) return 'text-emerald-600';
  if (score >= 0.6) return 'text-blue-600';
  return 'text-amber-600';
};

const formatMatchScore = (score: number): string => {
  return `${(score * 100).toFixed(0)}%`;
};

function JobMatchItem({ match, index }: { match: JobMatch; index: number }) {
  return (
    <Link href="/job-matches" className="block">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="p-3.5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group cursor-pointer border-b border-gray-100 last:border-b-0"
      >
        <div className="space-y-2.5">
          {/* Header with title and score */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1">
                {match.job_title}
              </h3>
              <Badge
                variant="secondary"
                className={`${getConfidenceBadgeColor(
                  match.confidence,
                )} text-[10px] px-2 py-0.5 font-medium`}
              >
                {match.confidence} confidence
              </Badge>
            </div>
            <div className="flex flex-col items-center justify-center flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-3 py-2 min-w-[60px] group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-200">
              <div
                className={`text-lg font-bold ${getMatchScoreColor(
                  match.match_score,
                )} group-hover:scale-110 transition-transform duration-200`}
              >
                {formatMatchScore(match.match_score)}
              </div>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider font-medium">
                match
              </p>
            </div>
          </div>

          {/* Company and Location */}
          <div className="space-y-1.5 pl-0.5">
            <div className="flex items-center gap-2 text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
              <Building className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span className="truncate font-medium">{match.company}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span className="truncate">{match.location}</span>
            </div>
          </div>

          {/* Skills */}
          {match.matched_skills.length > 0 && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="flex flex-wrap gap-1">
                {match.matched_skills.slice(0, 3).map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-1.5 py-0.5 font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {match.matched_skills.length > 3 && (
                  <span className="inline-flex items-center text-[10px] bg-gray-100 text-gray-600 rounded-md px-1.5 py-0.5 font-medium">
                    +{match.matched_skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

function EmptyState({ hasNoData }: { hasNoData: boolean }) {
  return (
    <div className="py-12 px-6 text-center">
      <div className="relative inline-block mb-4">
        <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50"></div>
        <Target className="w-14 h-14 text-blue-400 relative" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">
        No job matches yet
      </h3>
      <p className="text-sm text-gray-600 mb-6 max-w-xs mx-auto leading-relaxed">
        {hasNoData
          ? 'Upload your resume to get AI-powered job recommendations tailored to your skills'
          : 'We are finding the best job matches for you. Check back soon!'}
      </p>
      <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
        <Link
          href={hasNoData ? '/upload' : '/job-matches'}
          className="inline-flex items-center gap-2"
        >
          {hasNoData ? 'Upload Resume' : 'View All Jobs'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}

export function RecentJobMatches({
  matches,
  hasNoData,
}: RecentJobMatchesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="h-full"
    >
      <Card className="border border-gray-200 shadow-sm bg-white h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardHeader className="border-b border-gray-100 py-4 px-5 bg-gradient-to-r from-gray-50/50 to-transparent">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-[17px] font-semibold text-gray-900">
                  Top Job Matches
                </CardTitle>
                <CardDescription className="text-xs text-gray-600 mt-0.5">
                  AI-powered recommendations
                </CardDescription>
              </div>
              {matches.length > 0 && (
                <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {matches.length}
                </div>
              )}
            </div>
            {matches.length > 0 && (
              <Button
                variant="neutral"
                size="sm"
                asChild
                className="w-full shadow-sm hover:shadow transition-shadow"
              >
                <Link
                  href="/job-matches"
                  className="flex items-center justify-center gap-1.5"
                >
                  View all matches
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto">
          {matches.length > 0 ? (
            <div>
              {matches.map((match, index) => (
                <JobMatchItem key={match.job_id} match={match} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState hasNoData={hasNoData} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
