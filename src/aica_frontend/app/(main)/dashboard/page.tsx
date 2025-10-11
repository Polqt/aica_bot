'use client';

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
  FileText,
  Star,
  ChevronRight,
  MapPin,
  Building,
  Bookmark,
} from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="max-w-[1200px] mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">
          Welcome back, Alex!
        </h1>
        <p className="text-lg text-gray-500">Here&apos;s your job search overview</p>
      </div>


      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-medium">
                    Recent Job Matches
                  </CardTitle>
                  <CardDescription>
                    AI-powered matches based on your profile
                  </CardDescription>
                </div>
                <Button variant="neutral" asChild>
                  <Link href="/job-matches">
                    View all
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentMatches.map((match, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-4 hover:bg-gray-50 transition-colors border-b last:border-0 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {match.title}
                        </h3>
                        {match.isNew && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {match.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {match.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {match.salary}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-purple-700">
                        {match.matchScore}% match
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-medium">
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and updates</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button
                  variant="neutral"
                  className="w-full justify-start text-gray-700 hover:text-gray-900"
                  asChild
                >
                  <Link
                    href="/user-profile"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Update your profile
                  </Link>
                </Button>
                <Button
                  variant="neutral"
                  className="w-full justify-start text-gray-700 hover:text-gray-900"
                  asChild
                >
                  <Link href="/job-matches" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Find new matches
                  </Link>
                </Button>
                <Button
                  variant="neutral"
                  className="w-full justify-start text-gray-700 hover:text-gray-900"
                  asChild
                >
                  <Link href="/saved-jobs" className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    View saved jobs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
