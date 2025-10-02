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

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6"
      >
        <div className="relative">
          <div className="absolute -left-2 sm:-left-4 top-0 w-2 h-full bg-black transform -skew-x-12" />
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-black uppercase tracking-wide pl-4 sm:pl-8 flex items-center gap-2 sm:gap-4">
            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-black" />
            <span className="leading-tight">WELCOME BACK, ALEX!</span>
          </h1>
          <p className="text-gray-700 font-bold text-base sm:text-lg mt-2 sm:mt-4 pl-4 sm:pl-8">
            HERE&apos;S YOUR JOB SEARCH OVERVIEW
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Button
            asChild
            className="bg-black text-white border-4 border-black hover:bg-white hover:text-black font-black uppercase tracking-wide px-4 sm:px-8 py-3 sm:py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200 text-sm sm:text-base"
          >
            <Link href="/user-profile">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              UPDATE PROFILE
            </Link>
          </Button>
          <Button
            asChild
            className="bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide px-4 sm:px-8 py-3 sm:py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200 text-sm sm:text-base"
          >
            <Link href="/job-matches">
              FIND NEW MATCHES
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
            </Link>
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white border-4 border-black">
            <CardHeader className="border-b-4 border-black pb-6">
              <div>
                <CardTitle className="flex items-center gap-3 text-black font-black uppercase tracking-wide text-2xl">
                  <Target className="w-6 h-6 text-black" />
                  RECENT JOB MATCHES
                </CardTitle>
                <CardDescription className="text-gray-700 font-bold text-lg mt-2">
                  AI-powered matches based on your profile
                </CardDescription>
              </div>
              <Button
                asChild
                className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold uppercase mt-4"
                size="sm"
              >
                <Link href="/job-matches">
                  VIEW ALL
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              {recentMatches.map((match, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 border-4 border-black bg-white hover:shadow-[8px_8px_0px_0px_black] transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-black text-black uppercase tracking-wide group-hover:text-violet-600 transition-colors text-lg">
                          {match.title}
                        </h3>
                        {match.isNew && (
                          <span className="px-3 py-1 text-sm font-black bg-black text-white border-2 border-black uppercase tracking-wide">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-700 space-x-6 mb-3 font-bold">
                        <span className="flex items-center uppercase">
                          <Building className="w-5 h-5 mr-2 text-black" />
                          {match.company}
                        </span>
                        <span className="flex items-center uppercase">
                          <MapPin className="w-5 h-5 mr-2 text-black" />
                          {match.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-black">
                          {match.salary}
                        </span>
                        <span className="text-sm text-gray-600 font-bold uppercase">
                          {match.timeAgo}
                        </span>
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col items-end">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-sm font-black text-gray-700 uppercase">
                          MATCH
                        </span>
                        <span className="text-2xl font-black text-black">
                          {match.matchScore}%
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white border-2 border-black hover:bg-white hover:text-black font-bold"
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
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-8"
        >
          <Card className="bg-white border-4 border-black">
            <CardHeader>
              <CardTitle className="text-black font-black uppercase tracking-wide text-xl">
                QUICK ACTIONS
              </CardTitle>
              <CardDescription className="text-gray-700 font-bold text-lg">
                Boost your job search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                asChild
                className="w-full justify-start bg-black text-white border-2 border-black hover:bg-white hover:text-black font-black uppercase tracking-wide py-4"
              >
                <Link href="/user-profile">
                  <FileText className="w-5 h-5 mr-4" />
                  UPDATE RESUME
                </Link>
              </Button>

              <Button
                asChild
                className="w-full justify-start bg-black text-white border-2 border-black hover:bg-white hover:text-black font-black uppercase tracking-wide py-4"
              >
                <Link href="/saved-jobs">
                  <Star className="w-5 h-5 mr-4" />
                  VIEW SAVED JOBS
                </Link>
              </Button>

              <Button
                asChild
                className="w-full justify-start bg-violet-600 text-white border-2 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide py-4"
              >
                <Link href="/job-matches">
                  <Target className="w-5 h-5 mr-4" />
                  FIND MORE MATCHES
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
