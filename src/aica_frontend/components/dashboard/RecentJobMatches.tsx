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
    <Link href="/job-matches">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="p-5 hover:bg-gray-50 transition-colors group cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {match.job_title}
              </h3>
              <Badge
                variant="secondary"
                className={getConfidenceBadgeColor(match.confidence)}
              >
                {match.confidence}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{match.company}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{match.location}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {match.matched_skills.slice(0, 4).map((skill, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                >
                  {skill}
                </Badge>
              ))}
              {match.matched_skills.length > 4 && (
                <Badge
                  variant="outline"
                  className="text-xs bg-gray-50 text-gray-600"
                >
                  +{match.matched_skills.length - 4}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div
              className={`text-2xl font-bold ${getMatchScoreColor(
                match.match_score,
              )}`}
            >
              {formatMatchScore(match.match_score)}
            </div>
            <p className="text-xs text-gray-500">match</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function EmptyState({ hasNoData }: { hasNoData: boolean }) {
  return (
    <div className="py-16 px-6 text-center">
      <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-base font-semibold text-gray-900 mb-2">
        No job matches yet
      </h3>
      <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
        {hasNoData
          ? 'Upload your resume to get AI-powered job recommendations'
          : 'We are finding the best matches for you'}
      </p>
      <Button asChild>
        <Link
          href={hasNoData ? '/upload' : '/job-matches'}
          className="inline-flex items-center gap-2"
        >
          {hasNoData ? 'Upload Resume' : 'View All Jobs'}
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
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-[18px] font-semibold text-gray-900">
                  Recent Matches
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-gray-600 mt-1">
                AI-powered job recommendations tailored to your profile
              </CardDescription>
            </div>
            {matches.length > 0 && (
              <Button variant="neutral" size="sm" asChild>
                <Link href="/job-matches" className="flex items-center gap-1.5">
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {matches.length > 0 ? (
            <div className="divide-y divide-gray-100">
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
