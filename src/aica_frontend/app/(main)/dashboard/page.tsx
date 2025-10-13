'use client';

import { useState, useEffect } from 'react';
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
import {
  Target,
  FileText,
  ChevronRight,
  MapPin,
  Building,
  TrendingUp,
  Code,
  Briefcase,
  GraduationCap,
  ArrowUpRight,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/lib/constants/api';

// ============================================================================
// Type Definitions
// ============================================================================

interface UserStats {
  profile_completed: boolean;
  resume_uploaded: boolean;
  resume_processed: boolean;
  total_skills: number;
  technical_skills_count: number;
  soft_skills_count: number;
  has_job_matches: boolean;
  best_match_score: number;
}

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

interface MatchingStats {
  total_matches: number;
  average_score: number;
  high_confidence_matches: number;
  medium_confidence_matches: number;
  low_confidence_matches: number;
  last_updated: string | null;
}

interface UserProfile {
  full_name: string;
  email: string;
  location?: string;
  experience_years?: number;
  education_level?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

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

// ============================================================================
// Main Component
// ============================================================================

// ============================================================================
// Main Component
// ============================================================================

export default function DashboardPage() {
  const { getAuthToken } = useAuth();

  // State Management
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<JobMatch[]>([]);
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(
    null,
  );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [profileRes, summaryRes, matchesRes, statsRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/resume-builder/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/resume-builder/summary`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/jobs/matches?limit=5`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/jobs/stats`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        // Process profile data
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData);
        }

        // Process summary data
        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          setUserStats({
            profile_completed: summary.profile?.profile_completed || false,
            resume_uploaded: summary.profile?.resume_uploaded || false,
            resume_processed: summary.profile?.resume_processed || false,
            total_skills: summary.skills?.length || 0,
            technical_skills_count:
              summary.skills?.filter(
                (s: { skill_category: string }) =>
                  s.skill_category === 'technical',
              )?.length || 0,
            soft_skills_count:
              summary.skills?.filter(
                (s: { skill_category: string }) => s.skill_category === 'soft',
              )?.length || 0,
            has_job_matches: false,
            best_match_score: 0,
          });
        }

        // Process matches data
        if (matchesRes.ok) {
          const matches = await matchesRes.json();
          setRecentMatches(matches);
          if (matches.length > 0) {
            setUserStats(prev =>
              prev
                ? {
                    ...prev,
                    has_job_matches: true,
                    best_match_score: Math.max(
                      ...matches.map((m: JobMatch) => m.match_score),
                    ),
                  }
                : null,
            );
          }
        }

        // Process stats data
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setMatchingStats(stats);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getAuthToken]);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent mx-auto" />
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900">
            Something went wrong
          </h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  const hasNoData = !userProfile && recentMatches.length === 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="space-y-1">
            <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight">
              {userProfile?.full_name
                ? `Welcome back, ${userProfile.full_name.split(' ')[0]}`
                : 'Dashboard'}
            </h1>
            <p className="text-gray-600">
              {userProfile?.location ||
                'Track your job search progress and opportunities'}
            </p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatsCard
            icon={<Target className="w-5 h-5" />}
            title="Job Matches"
            value={matchingStats?.total_matches || 0}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatsCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Avg Match"
            value={formatMatchScore(matchingStats?.average_score || 0)}
            bgColor="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatsCard
            icon={<Code className="w-5 h-5" />}
            title="Skills"
            value={userStats?.total_skills || 0}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatsCard
            icon={<Star className="w-5 h-5" />}
            title="High Confidence"
            value={matchingStats?.high_confidence_matches || 0}
            bgColor="bg-amber-50"
            iconColor="text-amber-600"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Job Matches */}
            <RecentJobMatches matches={recentMatches} hasNoData={hasNoData} />

            {/* Profile Overview */}
            <ProfileOverviewCard
              userProfile={userProfile}
              userStats={userStats}
              matchingStats={matchingStats}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActionsCard />

            {/* Profile Summary */}
            <ProfileSummaryCard
              userProfile={userProfile}
              userStats={userStats}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
}

function StatsCard({ icon, title, value, bgColor, iconColor }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">{title}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
              <div className={iconColor}>{icon}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface RecentJobMatchesProps {
  matches: JobMatch[];
  hasNoData: boolean;
}

function RecentJobMatches({ matches, hasNoData }: RecentJobMatchesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[18px] font-semibold text-gray-900">
                Recent Matches
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                AI-powered job recommendations
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
            <EmptyState
              icon={<Target className="w-12 h-12" />}
              title="No job matches yet"
              description={
                hasNoData
                  ? 'Upload your resume to get AI-powered job recommendations'
                  : 'We are finding the best matches for you'
              }
              actionLabel={hasNoData ? 'Upload Resume' : 'View All Jobs'}
              actionHref={hasNoData ? '/upload' : '/job-matches'}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface JobMatchItemProps {
  match: JobMatch;
  index: number;
}

function JobMatchItem({ match, index }: JobMatchItemProps) {
  return (
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
              <Building className="w-4 h-4" />
              <span className="truncate">{match.company}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
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
  );
}

interface ProfileOverviewCardProps {
  userProfile: UserProfile | null;
  userStats: UserStats | null;
  matchingStats: MatchingStats | null;
}

function ProfileOverviewCard({
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
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 py-4">
          <CardTitle className="text-[18px] font-semibold text-gray-900">
            Profile Overview
          </CardTitle>
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
                ? 'Profile is complete'
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
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userProfile?.experience_years || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">Years Exp.</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats?.technical_skills_count || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">Tech Skills</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
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

function QuickActionsCard() {
  const actions = [
    {
      href: '/user-profile',
      icon: <FileText className="w-4 h-4" />,
      label: 'Update Profile',
      description: 'Edit your information',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      href: '/job-matches',
      icon: <Target className="w-4 h-4" />,
      label: 'Find Matches',
      description: 'Discover opportunities',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      href: '/saved-jobs',
      icon: <Star className="w-4 h-4" />,
      label: 'Saved Jobs',
      description: 'View bookmarks',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 py-4">
          <CardTitle className="text-[18px] font-semibold text-gray-900">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="neutral"
              className="w-full justify-start h-auto py-3 hover:bg-gray-50"
              asChild
            >
              <Link href={action.href} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <div className={action.iconColor}>{action.icon}</div>
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {action.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {action.description}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ProfileSummaryCardProps {
  userProfile: UserProfile | null;
  userStats: UserStats | null;
}

function ProfileSummaryCard({
  userProfile,
  userStats,
}: ProfileSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 py-4">
          <CardTitle className="text-[18px] font-semibold text-gray-900">
            Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <SummaryItem
            icon={<Briefcase className="w-5 h-5" />}
            label="Experience"
            value={`${userProfile?.experience_years || 0} years`}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <SummaryItem
            icon={<GraduationCap className="w-5 h-5" />}
            label="Education"
            value={userProfile?.education_level || 'Not specified'}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <SummaryItem
            icon={<Code className="w-5 h-5" />}
            label="Total Skills"
            value={`${userStats?.total_skills || 0} skills`}
            bgColor="bg-emerald-50"
            iconColor="text-emerald-600"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface SummaryItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
  iconColor: string;
}

function SummaryItem({
  icon,
  label,
  value,
  bgColor,
  iconColor,
}: SummaryItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${bgColor} flex-shrink-0`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600">{label}</p>
        <p className="font-semibold text-gray-900 text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="py-16 px-6 text-center">
      <div className="text-gray-300 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      <Button asChild>
        <Link href={actionHref} className="inline-flex items-center gap-2">
          {actionLabel}
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}
