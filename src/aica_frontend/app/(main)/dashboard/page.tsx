'use client';

import { motion } from 'motion/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Target,
  Clock,
  ArrowRight,
  FileText,
  Star,
  TrendingUp,
  Eye,
  ChevronRight,
  MapPin,
  Building,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  {
    label: 'Total Matches',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Target,
    color: 'from-blue-500 to-blue-600',
  },
  {
    label: 'Profile Views',
    value: '156',
    change: '+8%',
    trend: 'up',
    icon: Eye,
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    label: 'Applications',
    value: '12',
    change: '+3',
    trend: 'up',
    icon: FileText,
    color: 'from-violet-500 to-violet-600',
  },
  {
    label: 'Saved Jobs',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: Star,
    color: 'from-amber-500 to-amber-600',
  },
];

const recentMatches = [
  {
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$120k - $150k',
    matchScore: 94,
    timeAgo: '2 hours ago',
    isNew: true,
  },
  {
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$100k - $130k',
    matchScore: 89,
    timeAgo: '1 day ago',
    isNew: false,
  },
  {
    title: 'React Developer',
    company: 'Design Studio',
    location: 'New York, NY',
    salary: '$90k - $120k',
    matchScore: 87,
    timeAgo: '2 days ago',
    isNew: false,
  },
];

const activities = [
  {
    type: 'application',
    message: 'Applied to Frontend Developer at TechCorp',
    time: '2 hours ago',
  },
  {
    type: 'match',
    message: 'New job match: React Developer',
    time: '1 day ago',
  },
  {
    type: 'save',
    message: 'Saved Full Stack Engineer position',
    time: '2 days ago',
  },
  {
    type: 'view',
    message: 'Profile viewed by 3 companies',
    time: '3 days ago',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            Welcome back, Alex! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Here&apos;s your job search overview and latest opportunities
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            asChild
            variant="neutral"
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
          >
            <Link href="/user-profile">
              <FileText className="w-4 h-4 mr-2" />
              Update Profile
            </Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
          >
            <Link href="/job-matches">
              Find New Matches
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Target className="w-5 h-5 text-violet-600" />
                  Recent Job Matches
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  AI-powered matches based on your profile
                </CardDescription>
              </div>
              <Button
                asChild
                variant="neutral"
                size="sm"
                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20"
              >
                <Link href="/job-matches">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMatches.map((match, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {match.title}
                        </h3>
                        {match.isNew && (
                          <span className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 space-x-4 mb-2">
                        <span className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {match.company}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {match.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {match.salary}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {match.timeAgo}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Match
                        </span>
                        <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                          {match.matchScore}%
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="neutral"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              <Button
                asChild
                className="w-full mt-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              >
                <Link href="/job-matches">
                  Explore All Matches
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Clock className="w-5 h-5 text-violet-600" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Your job search timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Boost your job search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                variant="neutral"
                className="w-full justify-start bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700"
              >
                <Link href="/user-profile">
                  <FileText className="w-4 h-4 mr-3" />
                  Update Resume
                </Link>
              </Button>

              <Button
                asChild
                variant="neutral"
                className="w-full justify-start bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700"
              >
                <Link href="/saved-jobs">
                  <Star className="w-4 h-4 mr-3" />
                  View Saved Jobs
                </Link>
              </Button>

              <Button
                asChild
                variant="neutral"
                className="w-full justify-start bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700"
              >
                <Link href="/job-matches">
                  <Target className="w-4 h-4 mr-3" />
                  Find More Matches
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
