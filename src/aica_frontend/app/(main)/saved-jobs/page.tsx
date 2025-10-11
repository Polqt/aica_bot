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

                      <div className="space-y-3 text-sm text-gray-700 font-bold uppercase">
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 mr-3 text-black" />
                          {job.location}
                        </div>
                        {job.salary && (
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 mr-3 text-black" />
                            {job.salary}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 mr-3 text-black" />
                          SAVED {job.savedDate || job.saved_at}
                        </div>
                      </div>

                      {/* Skills and Coverage */}
                      <div className="space-y-3 mt-4">
                        <div className="flex flex-wrap gap-2">
                          {job.matched_skills &&
                            job.matched_skills
                              .slice(0, 2)
                              .map((tag, tagIndex) => (
                                <Badge
                                  key={tagIndex}
                                  className="text-sm bg-violet-600 text-white border-2 border-black font-bold uppercase px-3 py-1"
                                >
                                  {tag}
                                </Badge>
                              ))}
                          {job.matched_skills &&
                            job.matched_skills.length > 2 && (
                              <Badge className="text-sm bg-black text-white border-2 border-black font-bold uppercase px-3 py-1">
                                +{job.matched_skills.length - 2} MORE
                              </Badge>
                            )}
                        </div>

                        {job.skill_coverage !== undefined && (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 border-2 border-black rounded-full h-3">
                              <div
                                className="bg-black h-3 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.round(
                                    job.skill_coverage * 100,
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-black text-black min-w-[2.5rem] uppercase">
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
            <Card className="bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-200 rounded-lg">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-black text-black uppercase tracking-wide mb-3">
                      {selectedJob.title}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-6 text-gray-700 font-bold uppercase text-lg">
                      <span className="flex items-center">
                        <Building className="w-6 h-6 mr-3 text-black" />
                        {selectedJob.company}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-6 h-6 mr-3 text-black" />
                        {selectedJob.location}
                      </span>
                      {selectedJob.salary && (
                        <span className="flex items-center">
                          <DollarSign className="w-6 h-6 mr-3 text-black" />
                          {selectedJob.salary}
                        </span>
                      )}
                      <Badge
                        className={`border-2 ${getConfidenceColor(
                          selectedJob.confidence &&
                            selectedJob.confidence.trim()
                            ? selectedJob.confidence
                            : 'Unknown',
                        )} flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase`}
                      >
                        {getConfidenceIcon(
                          selectedJob.confidence &&
                            selectedJob.confidence.trim()
                            ? selectedJob.confidence
                            : 'Unknown',
                        )}
                        <span className="font-black ml-2">
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
                        </span>
                      </Badge>
                      <span className="flex items-center">
                        <Clock className="w-6 h-6 mr-3 text-black" />
                        SAVED {selectedJob.savedDate || selectedJob.saved_at}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-black ${getMatchScoreColor(
                        selectedJob.match_score || selectedJob.matchScore || 0,
                      )}`}
                    >
                      {(
                        (selectedJob.match_score ||
                          selectedJob.matchScore ||
                          0) * 100
                      ).toFixed(0)}
                      %
                    </div>
                    <div className="text-sm font-black text-gray-700 uppercase">
                      MATCH
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {/* AI Reasoning Section */}
                {selectedJob.ai_reasoning &&
                  selectedJob.ai_reasoning.trim() && (
                    <div className="bg-gray-100 border-4 border-black rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-8 h-8 bg-black rounded-2xl flex items-center justify-center">
                          <span className="text-white text-sm font-black">
                            AI
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-black uppercase tracking-wide">
                          AI ANALYSIS
                        </h3>
                      </div>
                      <p className="text-gray-700 font-bold leading-relaxed text-lg">
                        {selectedJob.ai_reasoning}
                      </p>
                    </div>
                  )}

                {/* Skill Analysis Section */}
                <div className="grid gap-6">
                  {/* Skill Coverage */}
                  {selectedJob.skill_coverage !== undefined &&
                    selectedJob.skill_coverage >= 0 && (
                      <div className="bg-green-100 border-4 border-black rounded-2xl p-6">
                        <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-4 uppercase tracking-wide">
                          <div className="w-8 h-8 bg-black rounded-2xl flex items-center justify-center">
                            <span className="text-white text-sm font-black">
                              ✓
                            </span>
                          </div>
                          SKILL COVERAGE
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-black text-gray-700 uppercase">
                              MATCH RATE
                            </span>
                            <span className="text-2xl font-black text-black">
                              {Math.round(selectedJob.skill_coverage * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 border-2 border-black rounded-full h-4">
                            <div
                              className="bg-black h-4 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${Math.round(
                                  selectedJob.skill_coverage * 100,
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-sm font-bold text-gray-600 uppercase">
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
                        <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-4 uppercase tracking-wide">
                          <div className="w-8 h-8 bg-violet-600 border-2 border-black rounded-2xl flex items-center justify-center">
                            <span className="text-white text-sm font-black">
                              ★
                            </span>
                          </div>
                          YOUR MATCHING SKILLS
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {selectedJob.matched_skills.map((skill, index) => (
                            <Badge
                              key={index}
                              className="bg-violet-600 text-white border-2 border-black font-bold uppercase px-4 py-2 text-sm"
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
                      <div className="bg-yellow-100 border-4 border-black rounded-2xl p-6">
                        <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-4 uppercase tracking-wide">
                          <div className="w-8 h-8 bg-black rounded-2xl flex items-center justify-center">
                            <span className="text-white text-sm font-black">
                              ⚠
                            </span>
                          </div>
                          SKILLS TO DEVELOP
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {selectedJob.missing_critical_skills.map(
                            (skill, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="border-2 border-black text-black font-bold uppercase px-4 py-2 text-sm bg-yellow-200"
                              >
                                {skill}
                              </Badge>
                            ),
                          )}
                        </div>
                        <p className="text-sm font-bold text-gray-700 uppercase mt-3">
                          CONSIDER LEARNING THESE SKILLS TO IMPROVE YOUR MATCH
                          RATE
                        </p>
                      </div>
                    )}
                </div>

                <div>
                  <h3 className="text-2xl font-black text-black mb-4 uppercase tracking-wide">
                    JOB DESCRIPTION
                  </h3>
                  <p className="text-gray-700 font-bold leading-relaxed text-lg">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.matched_skills &&
                  selectedJob.matched_skills.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-black text-black mb-4 uppercase tracking-wide">
                        MATCHED SKILLS
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedJob.matched_skills.map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-violet-600 text-white border-2 border-black font-bold uppercase px-4 py-2 text-sm"
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
                      <h3 className="text-2xl font-black text-black mb-4 uppercase tracking-wide">
                        REQUIREMENTS
                      </h3>
                      <ul className="space-y-3">
                        {selectedJob.requirements.map((req, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-4 text-gray-700 font-bold text-lg"
                          >
                            <span className="text-black mt-1 text-xl">✓</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedJob.tags && selectedJob.tags.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-black text-black mb-4 uppercase tracking-wide">
                      REQUIRED SKILLS
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedJob.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="bg-violet-600 text-white border-2 border-black font-bold uppercase px-4 py-2 text-sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-6 pt-6 border-t-4 border-black">
                  <Button
                    className="flex-1 bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200"
                    onClick={() =>
                      selectedJob && window.open(selectedJob.url, '_blank')
                    }
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    APPLY NOW
                  </Button>
                  <Button
                    variant="neutral"
                    className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-black uppercase py-4 flex-1"
                    onClick={() => handleRemoveJob(selectedJob.job_id)}
                    disabled={removingJobId === selectedJob.job_id}
                  >
                    {removingJobId === selectedJob.job_id ? (
                      <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                    ) : (
                      <BookmarkMinus className="w-5 h-5 mr-3" />
                    )}
                    REMOVE
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center bg-white border-4 border-black">
              <CardContent>
                <p className="text-gray-700 font-bold uppercase tracking-wide">
                  SELECT A JOB TO VIEW DETAILS
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}
