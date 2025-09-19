'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  BookmarkMinus,
  ExternalLink,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { SavedJob } from '@/types/jobMatch';
import {
  getConfidenceColor,
  getConfidenceIcon,
  getMatchScoreColor,
} from '@/lib/utils/getConfidence';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function SavedJobsPage() {
  const { savedJobs, loading, error, removeJob, refreshSavedJobs } = useSavedJobs();
  const { getAuthToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [removingJobId, setRemovingJobId] = useState<string | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      return;
    }
    refreshSavedJobs();
  }, [getAuthToken, refreshSavedJobs]);

  // Set first job as selected when jobs load
  useEffect(() => {
    if (savedJobs.length > 0 && !selectedJob) {
      setSelectedJob(savedJobs[0]);
    }
  }, [savedJobs, selectedJob]);

  const handleRemoveJob = async (jobId: string) => {
    setRemovingJobId(jobId);
    try {
      await removeJob(jobId);

      if (selectedJob?.job_id === jobId) {
        const remainingJobs = savedJobs.filter(job => job.job_id !== jobId);
        if (remainingJobs.length > 0) {
          setSelectedJob(remainingJobs[0]);
        } else {
          setSelectedJob(null);
        }
      }
    } finally {
      setRemovingJobId(null);
    }
  };

  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch =
      searchTerm === '' ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.tags && job.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      ));

    const matchesFilter =
      filterType === 'all' ||
      (job.type && job.type.toLowerCase() === filterType.toLowerCase());

    return matchesSearch && matchesFilter;
  })
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Loading Saved Jobs
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Fetching your saved opportunities...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 text-red-600 dark:text-red-400">⚠️</div>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Error Loading Saved Jobs
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error}
            </p>
            <Button
              onClick={refreshSavedJobs}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
        <div className="flex items-center gap-3">
          {savedJobs.length > 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </motion.div>

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-300px)] min-h-[500px]"
      >
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {filteredJobs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Saved Jobs Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Start exploring job matches and save the ones that interest you!
                </p>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Find Jobs
                </Button>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, index) => (
              <motion.div
                key={job.job_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                layout
              >
              <Card
                className={`cursor-pointer transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-800/80 ${
                  selectedJob?.job_id === job.job_id
                    ? 'ring-2 ring-violet-500 shadow-lg shadow-violet-500/10 bg-white/90 dark:bg-slate-800/90'
                    : ''
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
                        {job.title || 'Job Title'}
                      </h3>
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <Building className="w-4 h-4 mr-1" />
                        {job.company}
                      </div>
                    </div>
                    <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                      <span
                        className={`border ${getConfidenceColor(
                          job.confidence && job.confidence.trim() ? job.confidence : 'Unknown',
                        )} flex items-center gap-1 px-2 py-1 rounded-md`}
                      >
                        {getConfidenceIcon(job.confidence && job.confidence.trim() ? job.confidence : 'Unknown')}
                        <span className="font-medium ml-1">
                          {(job.confidence && job.confidence.trim() ? job.confidence : 'Unknown').charAt(0).toUpperCase() +
                            (job.confidence && job.confidence.trim() ? job.confidence : 'Unknown').slice(1)}
                        </span>
                      </span>
                      <span
                        className={`ml-2 font-bold ${getMatchScoreColor(
                          job.match_score || job.matchScore || 0,
                        )}`}
                      >
                        {((job.match_score || job.matchScore || 0) * 100).toFixed(0)}% match
                      </span>
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                        {job.salary}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      Saved {job.savedDate || job.saved_at}
                    </div>
                  </div>

                  {/* Skills and Coverage */}
                  <div className="space-y-2 mt-3">
                    <div className="flex flex-wrap gap-1">
                      {job.matched_skills && job.matched_skills.slice(0, 2).map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="secondary"
                          className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {job.matched_skills && job.matched_skills.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.matched_skills.length - 2} more
                        </Badge>
                      )}
                    </div>

                    {job.skill_coverage !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-green-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.round(job.skill_coverage * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 min-w-[2.5rem]">
                          {Math.round(job.skill_coverage * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            ))}
            </AnimatePresence>
          )}
        </div>

        <div className="lg:col-span-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {selectedJob ? (
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
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
                      {selectedJob.salary && (
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {selectedJob.salary}
                        </span>
                      )}
                      <Badge className={`border ${getConfidenceColor(selectedJob.confidence && selectedJob.confidence.trim() ? selectedJob.confidence : 'Unknown')} flex items-center gap-1 px-2 py-1 rounded-md`}>
                        {getConfidenceIcon(selectedJob.confidence && selectedJob.confidence.trim() ? selectedJob.confidence : 'Unknown')}
                        <span className="font-medium ml-1">
                          {(selectedJob.confidence && selectedJob.confidence.trim() ? selectedJob.confidence : 'Unknown').charAt(0).toUpperCase() + (selectedJob.confidence && selectedJob.confidence.trim() ? selectedJob.confidence : 'Unknown').slice(1)}
                        </span>
                      </Badge>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Saved {selectedJob.savedDate || selectedJob.saved_at}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${getMatchScoreColor(
                        selectedJob.match_score || selectedJob.matchScore || 0,
                      )}`}
                    >
                      {((selectedJob.match_score || selectedJob.matchScore || 0) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      match
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* AI Reasoning Section */}
                {selectedJob.ai_reasoning && selectedJob.ai_reasoning.trim() && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        AI Analysis
                      </h3>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                      {selectedJob.ai_reasoning}
                    </p>
                  </div>
                )}

                {/* Skill Analysis Section */}
                <div className="grid gap-4">
                  {/* Skill Coverage */}
                  {selectedJob.skill_coverage !== undefined && selectedJob.skill_coverage >= 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-700/50">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        Skill Coverage
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Match Rate</span>
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {Math.round(selectedJob.skill_coverage * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.round(selectedJob.skill_coverage * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {selectedJob.matched_skills?.length || 0} of {(selectedJob.matched_skills?.length || 0) + (selectedJob.missing_critical_skills?.length || 0)} skills matched
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Matched Skills */}
                  {selectedJob.matched_skills && selectedJob.matched_skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">★</span>
                        </div>
                        Your Matching Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.matched_skills.map((skill, index) => (
                          <Badge
                            key={index}
                            className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Critical Skills */}
                  {selectedJob.missing_critical_skills && selectedJob.missing_critical_skills.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200/50 dark:border-amber-700/50">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">⚠</span>
                        </div>
                        Skills to Develop
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.missing_critical_skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        Consider learning these skills to improve your match rate
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Job Description
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.matched_skills && selectedJob.matched_skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                      Matched Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.matched_skills.map((tag, index) => (
                        <Badge
                          key={index}
                          className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
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
                )}

                {selectedJob.tags && selectedJob.tags.length > 0 && (
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
                )}

                <div className="flex gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <Button
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                    onClick={() => selectedJob && window.open(selectedJob.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                  <Button
                    variant="neutral"
                    className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700"
                    onClick={() => handleRemoveJob(selectedJob.job_id)}
                    disabled={removingJobId === selectedJob.job_id}
                  >
                    {removingJobId === selectedJob.job_id ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <BookmarkMinus className="w-4 h-4 mr-2" />
                    )}
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center bg-white/70 dark:bg-slate-800/70">
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Select a job to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}
