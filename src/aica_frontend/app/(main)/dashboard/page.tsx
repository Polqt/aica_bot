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
  ArrowRight,
  FileText,
  Star,
  ChevronRight,
  MapPin,
  Building,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

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

const stats = [
  { label: 'TOTAL MATCHES', value: '47', icon: Target, color: 'text-violet-600' },
  { label: 'SAVED JOBS', value: '12', icon: Star, color: 'text-yellow-600' },
  { label: 'APPLICATIONS', value: '8', icon: TrendingUp, color: 'text-green-600' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute -left-4 top-0 w-3 h-full bg-violet-600 transform -skew-x-12" />
        <div className="pl-8">
          <h1 className="text-4xl lg:text-6xl font-black text-black uppercase tracking-wide flex items-center gap-4 mb-2">
            <div className="bg-violet-600 text-white p-3 border-4 border-black shadow-[6px_6px_0px_0px_black]">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="leading-tight">WELCOME BACK, ALEX!</span>
          </h1>
          <p className="text-gray-700 font-black text-lg uppercase tracking-wide">
            HERE&apos;S YOUR JOB SEARCH OVERVIEW
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-black mb-1">{stat.value}</div>
                <div className="text-sm font-black text-gray-700 uppercase tracking-wide">{stat.label}</div>
              </div>
              <div className={`p-3 bg-violet-100 border-2 border-black ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
            <CardHeader className="border-b-4 border-black pb-6 bg-violet-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-black font-black uppercase tracking-wide text-2xl">
                    <div className="bg-black text-white p-2 border-2 border-black">
                      <Target className="w-6 h-6" />
                    </div>
                    RECENT JOB MATCHES
                  </CardTitle>
                  <CardDescription className="text-gray-700 font-black text-lg uppercase mt-2">
                    AI-powered matches based on your profile
                  </CardDescription>
                </div>
                <Button
                  asChild
                  className="bg-black text-white border-4 border-black hover:bg-violet-600 hover:text-white font-black uppercase tracking-wide px-6 py-3 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
                  size="sm"
                >
                  <Link href="/job-matches">
                    VIEW ALL
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {recentMatches.map((match, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 border-4 border-black bg-white hover:shadow-[8px_8px_0px_0px_black] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-black text-black uppercase tracking-wide group-hover:text-violet-600 transition-colors text-lg">
                          {match.title}
                        </h3>
                        {match.isNew && (
                          <div className="bg-violet-600 text-white px-3 py-1 border-2 border-black font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_black]">
                            NEW
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-700 space-x-6 mb-4 font-black uppercase">
                        <span className="flex items-center">
                          <Building className="w-5 h-5 mr-2 text-black" />
                          {match.company}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-5 h-5 mr-2 text-black" />
                          {match.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-black" />
                          {match.timeAgo}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-black bg-violet-100 px-3 py-1 border-2 border-black">
                          {match.salary}
                        </span>
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col items-end">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-black text-black bg-violet-100 px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_black]">
                          {match.matchScore}%
                        </div>
                        <div className="text-sm font-black text-gray-700 uppercase mt-1">MATCH</div>
                      </div>
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-violet-600 text-white border-2 border-black hover:bg-black hover:text-white font-black shadow-[4px_4px_0px_0px_black]"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              <Button
                asChild
                className="w-full mt-6 bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200"
              >
                <Link href="/job-matches">
                  EXPLORE ALL MATCHES
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
            <CardHeader className="border-b-4 border-black pb-6 bg-violet-50">
              <CardTitle className="text-black font-black uppercase tracking-wide text-xl flex items-center gap-3">
                <div className="bg-black text-white p-2 border-2 border-black">
                  <Star className="w-5 h-5" />
                </div>
                QUICK ACTIONS
              </CardTitle>
              <CardDescription className="text-gray-700 font-black text-lg uppercase">
                Boost your job search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Button
                asChild
                className="w-full justify-start bg-black text-white border-4 border-black hover:bg-violet-600 hover:text-white font-black uppercase tracking-wide py-4 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
              >
                <Link href="/user-profile">
                  <FileText className="w-5 h-5 mr-4" />
                  UPDATE RESUME
                </Link>
              </Button>

              <Button
                asChild
                className="w-full justify-start bg-black text-white border-4 border-black hover:bg-violet-600 hover:text-white font-black uppercase tracking-wide py-4 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
              >
                <Link href="/saved-jobs">
                  <Star className="w-5 h-5 mr-4" />
                  VIEW SAVED JOBS
                </Link>
              </Button>

              <Button
                asChild
                className="w-full justify-start bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide py-4 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
              >
                <Link href="/job-matches">
                  <Target className="w-5 h-5 mr-4" />
                  FIND MORE MATCHES
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card className="bg-violet-50 border-4 border-black shadow-[8px_8px_0px_0px_black]">
            <CardHeader className="pb-4">
              <CardTitle className="text-black font-black uppercase tracking-wide text-lg">
                TODAY&apos;S ACTIVITY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white border-2 border-black">
                <span className="font-black text-gray-700 uppercase text-sm">NEW MATCHES</span>
                <span className="font-black text-violet-600 text-lg">+3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white border-2 border-black">
                <span className="font-black text-gray-700 uppercase text-sm">PROFILE VIEWS</span>
                <span className="font-black text-green-600 text-lg">+12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white border-2 border-black">
                <span className="font-black text-gray-700 uppercase text-sm">SAVED JOBS</span>
                <span className="font-black text-yellow-600 text-lg">+2</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
