'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  BookmarkMinus,
  ExternalLink,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Calendar,
  Target,
} from 'lucide-react';

const savedJobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$120k - $150k',
    savedDate: '2 days ago',
    type: 'Full-time',
    matchScore: 94,
    tags: ['React', 'TypeScript', 'Next.js'],
    description:
      "Join our innovative team to build cutting-edge web applications using modern technologies. You'll work on scalable solutions that impact millions of users worldwide.",
    requirements: [
      '5+ years React experience',
      'TypeScript proficiency',
      'Team leadership skills',
    ],
  },
  {
    id: 2,
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$100k - $130k',
    savedDate: '1 week ago',
    type: 'Full-time',
    matchScore: 89,
    tags: ['Node.js', 'React', 'MongoDB'],
    description:
      "Be part of a fast-growing startup where you'll have the opportunity to shape the product from the ground up using cutting-edge technologies.",
    requirements: [
      'Full-stack development experience',
      'Node.js proficiency',
      'Startup experience preferred',
    ],
  },
  {
    id: 3,
    title: 'React Developer',
    company: 'Design Studio LLC',
    location: 'New York, NY',
    salary: '$90k - $120k',
    savedDate: '2 weeks ago',
    type: 'Full-time',
    matchScore: 87,
    tags: ['React', 'CSS', 'UI/UX'],
    description:
      'Create beautiful and responsive user interfaces for our diverse clientele. Work closely with designers to bring creative visions to life.',
    requirements: [
      '3+ years React experience',
      'Strong CSS skills',
      'UI/UX understanding',
    ],
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    location: 'Austin, TX',
    salary: '$110k - $140k',
    savedDate: '3 weeks ago',
    type: 'Full-time',
    matchScore: 82,
    tags: ['AWS', 'Docker', 'Kubernetes'],
    description:
      'Help us scale our infrastructure and implement best practices for deployment, monitoring, and security in a cloud-native environment.',
    requirements: [
      'AWS certification preferred',
      'Container orchestration experience',
      'CI/CD expertise',
    ],
  },
  {
    id: 5,
    title: 'Backend Engineer',
    company: 'FinTech Innovations',
    location: 'Boston, MA',
    salary: '$105k - $135k',
    savedDate: '1 month ago',
    type: 'Full-time',
    matchScore: 85,
    tags: ['Python', 'Django', 'PostgreSQL'],
    description:
      'Build robust and secure backend systems for financial applications. Work with cutting-edge fintech solutions that handle millions of transactions.',
    requirements: [
      'Python/Django expertise',
      'Database optimization skills',
      'Security best practices',
    ],
  },
];

export default function SavedJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(savedJobs[0]);
  const [filterType, setFilterType] = useState('all');

  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch =
      searchTerm === '' ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesFilter =
      filterType === 'all' ||
      job.type.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-slate-600 dark:text-slate-400';
  };

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
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500" />
            Saved Jobs
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Keep track of opportunities that caught your interest
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Sort by Date
          </Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
            <Search className="w-4 h-4 mr-2" />
            Find More Jobs
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Saved
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {savedJobs.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Avg. Match Score
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {Math.round(
                    savedJobs.reduce((acc, job) => acc + job.matchScore, 0) /
                      savedJobs.length,
                  )}
                  %
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  This Week
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  3
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    +2 from last week
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search saved jobs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
        >
          <option value="all">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </select>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-400px)]"
      >
        {/* Job List */}
        <div className="lg:col-span-2 space-y-4 overflow-y-auto">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg ${
                  selectedJob.id === job.id
                    ? 'ring-2 ring-violet-500 shadow-lg shadow-violet-500/10'
                    : ''
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <Building className="w-4 h-4 mr-1" />
                        {job.company}
                      </div>
                    </div>
                    <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                      {job.matchScore}% match
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                      {job.salary}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      Saved {job.savedDate}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {job.tags.slice(0, 2).map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {job.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{job.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Job Details */}
        <div className="lg:col-span-3">
          <Card className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-slate-900 dark:text-white mb-2">
                    {selectedJob.title}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
                    <span className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {selectedJob.company}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedJob.location}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {selectedJob.salary}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Saved {selectedJob.savedDate}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${getMatchScoreColor(
                        selectedJob.matchScore,
                      )}`}
                    >
                      {selectedJob.matchScore}%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      match
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 overflow-y-auto">
              {/* Job Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Job Description
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((req, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-slate-600 dark:text-slate-400"
                    >
                      <span className="text-emerald-500 mt-1">✓</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700"
                >
                  <BookmarkMinus className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
