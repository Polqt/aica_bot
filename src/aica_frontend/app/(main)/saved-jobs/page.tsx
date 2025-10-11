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
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function SavedJobsPage() {
  const { savedJobs, loading, error, removeJob, refreshSavedJobs } =
    useSavedJobs();
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
      (job.tags &&
        job.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        ));

    const matchesFilter =
      filterType === 'all' ||
      (job.type && job.type.toLowerCase() === filterType.toLowerCase());

    return matchesSearch && matchesFilter;
  });
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-6 h-6 text-gray-600 animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading saved jobs
            </h3>
            <p className="text-sm text-gray-500">
              Fetching your saved opportunities...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-red-600 text-xl">⚠️</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Saved Jobs
            </h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button
              onClick={refreshSavedJobs}
              className="bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:shadow-md transition-all duration-150"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-semibold text-gray-900">Saved Jobs</h1>
          </div>
          <p className="text-base text-gray-500">
            Keep track of opportunities that caught your interest
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedJobs.length > 0 && (
            <div className="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
              {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search saved jobs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow hover:border-gray-300"
          />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow hover:border-gray-300 cursor-pointer"
        >
          <option value="all">All types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">PART-TIME</option>
          <option value="contract">CONTRACT</option>
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-300px)] min-h-[500px]"
      >
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {filteredJobs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No saved jobs yet
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  Start exploring job matches and save the ones that interest
                  you to build your collection
                </p>
                <Button className="bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-medium px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-150">
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
                    className={`cursor-pointer transition-all duration-150 hover:bg-gray-50 ${
                      selectedJob?.job_id === job.job_id
                        ? 'border-gray-300 bg-gray-50 ring-1 ring-gray-300'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                            {job.title || 'Job Title'}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Building className="w-4 h-4 mr-1.5" />
                            {job.company}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            className={`px-2 py-0.5 text-xs font-medium ${
                              job.confidence === 'high'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : job.confidence === 'medium'
                                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {(job.confidence && job.confidence.trim()
                              ? job.confidence
                              : 'Unknown'
                            )
                              .charAt(0)
                              .toUpperCase() +
                              (job.confidence && job.confidence.trim()
                                ? job.confidence
                                : 'Unknown'
                              ).slice(1)}
                          </Badge>
                          <span className="text-sm font-medium text-gray-900">
                            {(
                              (job.match_score || job.matchScore || 0) * 100
                            ).toFixed(0)}
                            % Match
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5" />
                          {job.location}
                        </div>
                        {job.salary && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1.5" />
                            {job.salary}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1.5" />
                          Saved {job.savedDate || job.saved_at}
                        </div>
                      </div>

                      {/* Skills and Coverage */}
                      <div className="space-y-2.5 mt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {job.matched_skills &&
                            job.matched_skills
                              .slice(0, 2)
                              .map((tag, tagIndex) => (
                                <Badge
                                  key={tagIndex}
                                  variant="secondary"
                                  className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  {tag}
                                </Badge>
                              ))}
                          {job.matched_skills &&
                            job.matched_skills.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200"
                              >
                                +{job.matched_skills.length - 2} more
                              </Badge>
                            )}
                        </div>

                        {job.skill_coverage !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-600 h-full transition-all duration-150 rounded-full"
                                style={{
                                  width: `${Math.round(
                                    job.skill_coverage * 100,
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600 min-w-[2.5rem]">
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

        <div className="lg:col-span-3 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
          {selectedJob ? (
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-gray-900 mb-2 font-semibold">
                      {selectedJob.title}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-3 text-gray-500 text-sm">
                      <span className="flex items-center">
                        <Building className="w-4 h-4 mr-1.5" />
                        {selectedJob.company}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1.5" />
                        {selectedJob.location}
                      </span>
                      {selectedJob.salary && (
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1.5" />
                          {selectedJob.salary}
                        </span>
                      )}
                      <Badge
                        className={`px-2 py-0.5 text-xs font-medium ${
                          selectedJob.confidence === 'high'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : selectedJob.confidence === 'medium'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {(selectedJob.confidence &&
                        selectedJob.confidence.trim()
                          ? selectedJob.confidence
                          : 'Unknown'
                        )
                          .charAt(0)
                          .toUpperCase() +
                          (selectedJob.confidence &&
                          selectedJob.confidence.trim()
                            ? selectedJob.confidence
                            : 'Unknown'
                          ).slice(1)}
                      </Badge>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5" />
                        Saved {selectedJob.savedDate || selectedJob.saved_at}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-center ml-4">
                    <div className="text-2xl font-semibold text-gray-900">
                      {(
                        (selectedJob.match_score ||
                          selectedJob.matchScore ||
                          0) * 100
                      ).toFixed(0)}
                      %
                    </div>
                    <div className="text-xs text-gray-500">Match</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* AI Reasoning Section */}
                {selectedJob.ai_reasoning &&
                  selectedJob.ai_reasoning.trim() && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-gray-900 text-white rounded flex items-center justify-center font-semibold text-xs">
                          AI
                        </div>
                        <h3 className="text-base font-medium text-gray-900">
                          AI Analysis
                        </h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {selectedJob.ai_reasoning}
                      </p>
                    </div>
                  )}

                {/* Skill Analysis Section */}
                <div className="grid gap-4">
                  {/* Skill Coverage */}
                  {selectedJob.skill_coverage !== undefined &&
                    selectedJob.skill_coverage >= 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-5 h-5 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-semibold">
                            ✓
                          </div>
                          Skill Coverage
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Match rate
                            </span>
                            <span className="text-base font-medium text-gray-900">
                              {Math.round(selectedJob.skill_coverage * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full transition-all duration-500 ease-out rounded-full"
                              style={{
                                width: `${Math.round(
                                  selectedJob.skill_coverage * 100,
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {selectedJob.matched_skills?.length || 0} of{' '}
                            {(selectedJob.matched_skills?.length || 0) +
                              (selectedJob.missing_critical_skills?.length ||
                                0)}{' '}
                            skills matched
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Matched Skills */}
                  {selectedJob.matched_skills &&
                    selectedJob.matched_skills.length > 0 && (
                      <div>
                        <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <div className="w-5 h-5 bg-green-600 text-white rounded flex items-center justify-center text-xs font-semibold">
                            ★
                          </div>
                          Your Matching Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.matched_skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Missing Critical Skills */}
                  {selectedJob.missing_critical_skills &&
                    selectedJob.missing_critical_skills.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                        <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <div className="w-5 h-5 bg-amber-600 text-white rounded flex items-center justify-center text-xs font-semibold">
                            !
                          </div>
                          Skills to Develop
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedJob.missing_critical_skills.map(
                            (skill, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="px-2 py-0.5 text-xs font-medium bg-white text-amber-700 border border-amber-300"
                              >
                                {skill}
                              </Badge>
                            ),
                          )}
                        </div>
                        <p className="text-xs text-amber-700">
                          Consider learning these skills to improve your match
                          rate
                        </p>
                      </div>
                    )}
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3">
                    Job Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.matched_skills &&
                  selectedJob.matched_skills.length > 0 && (
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-3">
                        Matched Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.matched_skills.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedJob.requirements &&
                  selectedJob.requirements.length > 0 && (
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-3">
                        Requirements
                      </h3>
                      <ul className="space-y-2">
                        {selectedJob.requirements.map((req, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-700 text-sm"
                          >
                            <span className="text-green-600 mt-0.5 text-base">
                              ✓
                            </span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedJob.tags && selectedJob.tags.length > 0 && (
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-3">
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150"
                    onClick={() =>
                      selectedJob && window.open(selectedJob.url, '_blank')
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply now
                  </Button>
                  <Button
                    className="bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-medium py-2.5 rounded-lg flex-1 shadow-sm hover:shadow-md transition-all duration-150"
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
            <Card className="h-full flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardContent>
                <p className="text-gray-500 text-sm">
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
