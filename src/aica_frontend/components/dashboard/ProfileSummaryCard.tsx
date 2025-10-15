'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Briefcase,
  GraduationCap,
  Code,
  MapPin,
  LucideIcon,
} from 'lucide-react';

interface UserStats {
  total_skills: number;
}

interface UserProfile {
  experience_years?: number;
  education_level?: string;
  location?: string;
}

interface ProfileSummaryCardProps {
  userProfile: UserProfile | null;
  userStats: UserStats | null;
}

interface SummaryItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  bgColor: string;
  iconColor: string;
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  bgColor,
  iconColor,
}: SummaryItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={`p-2 rounded-lg ${bgColor} flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 font-medium">{label}</p>
        <p className="font-semibold text-gray-900 text-sm truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ProfileSummaryCard({
  userProfile,
  userStats,
}: ProfileSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100 py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-[18px] font-semibold text-gray-900">
              Profile Summary
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <SummaryItem
            icon={Briefcase}
            label="Experience"
            value={`${userProfile?.experience_years || 0} years`}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <SummaryItem
            icon={GraduationCap}
            label="Education"
            value={userProfile?.education_level || 'Not specified'}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <SummaryItem
            icon={Code}
            label="Total Skills"
            value={`${userStats?.total_skills || 0} skills`}
            bgColor="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <SummaryItem
            icon={MapPin}
            label="Location"
            value={userProfile?.location || 'Not specified'}
            bgColor="bg-amber-50"
            iconColor="text-amber-600"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
