'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText, Code, Target } from 'lucide-react';

interface UserStats {
  profile_completed: boolean;
  total_skills: number;
  technical_skills_count: number;
}

interface MatchingStats {
  average_score: number;
  total_matches: number;
}

interface UserProfile {
  experience_years?: number;
}

interface ProfileOverviewCardProps {
  userProfile: UserProfile | null;
  userStats: UserStats | null;
  matchingStats: MatchingStats | null;
}

interface ProgressItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'emerald' | 'purple';
  description: string;
}

function ProgressItem({
  icon,
  label,
  value,
  color,
  description,
}: ProgressItemProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-600',
    purple: 'from-purple-500 to-purple-600 text-purple-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-gray-600">{icon}</div>
          <span className="font-medium text-gray-900 text-sm">{label}</span>
        </div>
        <span
          className={`text-xl font-bold ${colorClasses[color].split(' ')[2]}`}
        >
          {Math.round(value)}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full bg-gradient-to-r ${colorClasses[color]
            .split(' ')
            .slice(0, 2)
            .join(' ')}`}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1.5">{description}</p>
    </div>
  );
}

export function ProfileOverviewCard({
  userProfile,
  userStats,
  matchingStats,
}: ProfileOverviewCardProps) {
  const profileCompletion = userStats?.profile_completed ? 100 : 60;
  const skillCoverage = Math.min((userStats?.total_skills || 0) * 5, 100);
  const matchQuality = (matchingStats?.average_score || 0) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100 py-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-[18px] font-semibold text-gray-900">
              Profile Insights
            </CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-600 mt-1">
            Your job search effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <ProgressItem
            icon={<FileText className="w-4 h-4" />}
            label="Profile Completeness"
            value={profileCompletion}
            color="blue"
            description={
              userStats?.profile_completed
                ? 'Profile is complete ✓'
                : 'Complete your profile for better matches'
            }
          />
          <ProgressItem
            icon={<Code className="w-4 h-4" />}
            label="Skill Coverage"
            value={skillCoverage}
            color="emerald"
            description={`${userStats?.total_skills || 0} skills identified`}
          />
          <ProgressItem
            icon={<Target className="w-4 h-4" />}
            label="Match Quality"
            value={matchQuality}
            color="purple"
            description="Average match score across recommendations"
          />
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {userProfile?.experience_years || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">Years Exp.</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">
                  {userStats?.technical_skills_count || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">Tech Skills</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {matchingStats?.total_matches || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">Matches</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
