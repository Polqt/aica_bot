'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/lib/constants/api';
import {
  TopJobTitlesCard,
  TopSkillsChart,
  RecentJobMatches,
} from '@/components/dashboard';
import { PageLoader } from '@/components/PageLoader';

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

interface TopSkill {
  name: string;
  count: number;
  category: string;
}

interface TopJobTitle {
  title: string;
  count: number;
  avgMatchScore: number;
}

interface SkillCategoryData {
  category: string;
  count: number;
  color: string;
}

export default function DashboardPage() {
  const { getAuthToken } = useAuth();

  // State Management
  const [, setUserStats] = useState<UserStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<JobMatch[]>([]);
  const [, setMatchingStats] = useState<MatchingStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for enhanced dashboard
  const [topSkills, setTopSkills] = useState<TopSkill[]>([]);
  const [topJobTitles, setTopJobTitles] = useState<TopJobTitle[]>([]);
  const [, setSkillCategoryData] = useState<SkillCategoryData[]>([]);

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
            fetch(`${API_BASE_URL}/jobs/matches?limit=50`, {
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
          const skills = summary.skills || [];

          setUserStats({
            profile_completed: summary.profile?.profile_completed || false,
            resume_uploaded: summary.profile?.resume_uploaded || false,
            resume_processed: summary.profile?.resume_processed || false,
            total_skills: skills.length,
            technical_skills_count: skills.filter(
              (s: { skill_category: string }) =>
                s.skill_category === 'technical',
            ).length,
            soft_skills_count: skills.filter(
              (s: { skill_category: string }) => s.skill_category === 'soft',
            ).length,
            has_job_matches: false,
            best_match_score: 0,
          });

          // Process skill category data for pie chart
          const technicalCount = skills.filter(
            (s: { skill_category: string }) => s.skill_category === 'technical',
          ).length;
          const softCount = skills.filter(
            (s: { skill_category: string }) => s.skill_category === 'soft',
          ).length;
          const otherCount = skills.filter(
            (s: { skill_category: string }) =>
              s.skill_category !== 'technical' && s.skill_category !== 'soft',
          ).length;

          setSkillCategoryData(
            [
              {
                category: 'Technical',
                count: technicalCount,
                color: '#3b82f6',
              },
              { category: 'Soft Skills', count: softCount, color: '#10b981' },
              { category: 'Other', count: otherCount, color: '#f59e0b' },
            ].filter(item => item.count > 0),
          );
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

            // Calculate top skills from matches
            const skillFrequency: Record<
              string,
              { count: number; category: string }
            > = {};
            matches.forEach((match: JobMatch) => {
              match.matched_skills.forEach((skill: string) => {
                if (!skillFrequency[skill]) {
                  skillFrequency[skill] = { count: 0, category: 'technical' };
                }
                skillFrequency[skill].count++;
              });
            });

            const sortedSkills = Object.entries(skillFrequency)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 5)
              .map(([name, data]) => ({
                name,
                count: data.count,
                category: data.category,
              }));
            setTopSkills(sortedSkills);

            // Calculate top job titles
            const titleFrequency: Record<
              string,
              { count: number; totalScore: number }
            > = {};
            matches.forEach((match: JobMatch) => {
              const title = match.job_title;
              if (!titleFrequency[title]) {
                titleFrequency[title] = { count: 0, totalScore: 0 };
              }
              titleFrequency[title].count++;
              titleFrequency[title].totalScore += match.match_score;
            });

            const sortedTitles = Object.entries(titleFrequency)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 3)
              .map(([title, data]) => ({
                title,
                count: data.count,
                avgMatchScore: data.totalScore / data.count,
              }));
            setTopJobTitles(sortedTitles);
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

  if (loading) {
    return <PageLoader text="Loading your dashboard..." size="lg" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900">
            Something went wrong
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const hasNoData = !userProfile && recentMatches.length === 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="space-y-1">
            <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight">
              {userProfile?.full_name
                ? `Welcome back, ${userProfile.full_name.split(' ')[0]} 👋`
                : 'Dashboard'}
            </h1>
            <p className="text-gray-600 text-base">
              {userProfile?.location
                ? `${userProfile.location} • Track your job search progress and opportunities`
                : 'Track your job search progress and opportunities'}
            </p>
          </div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Job Matches - Left Column */}
          <div className="xl:col-span-1">
            <RecentJobMatches
              matches={recentMatches.slice(0, 5)}
              hasNoData={hasNoData}
            />
          </div>

          {/* Charts - Right Columns */}
          <div className="xl:col-span-2 space-y-6">
            <TopJobTitlesCard jobTitles={topJobTitles} />
            <TopSkillsChart topSkills={topSkills} />
          </div>
        </div>
      </div>
    </div>
  );
}
