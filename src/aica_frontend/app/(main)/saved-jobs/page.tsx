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
      <div className="space-y-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-black border-4 border-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[8px_8px_0px_0px_black]">
              <RefreshCw className="w-10 h-10 text-white animate-spin" />
            </div>
            <h3 className="text-2xl font-black text-black uppercase tracking-wide mb-3">
              LOADING SAVED JOBS
            </h3>
            <p className="text-gray-700 font-bold">
              FETCHING YOUR SAVED OPPORTUNITIES...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-red-600 border-4 border-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[8px_8px_0px_0px_black]">
              <div className="w-8 h-8 text-white font-black text-xl">⚠️</div>
            </div>
            <h3 className="text-2xl font-black text-black uppercase tracking-wide mb-3">
              ERROR LOADING SAVED JOBS
            </h3>
            <p className="text-gray-700 font-bold mb-6">
              {error}
            </p>
            <Button
              onClick={refreshSavedJobs}
              className="bg-black text-white border-4 border-black hover:bg-white hover:text-black font-black uppercase tracking-wide px-8 py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5 mr-3" />
              TRY AGAIN
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div className="relative">
          <div className="absolute -left-4 top-0 w-2 h-full bg-black transform -skew-x-12" />
          <h1 className="text-4xl lg:text-6xl font-black text-black uppercase tracking-wide pl-8 flex items-center gap-4">
            <Star className="w-12 h-12 text-black" />
            SAVED JOBS
          </h1>
          <p className="text-gray-700 font-bold text-lg mt-4 pl-8">
            KEEP TRACK OF OPPORTUNITIES THAT CAUGHT YOUR INTEREST
          </p>
        </div>
        <div className="flex items-center gap-4">
          {savedJobs.length > 0 && (
            <div className="text-lg font-black text-gray-700 uppercase">
              {savedJobs.length} SAVED JOB{savedJobs.length !== 1 ? 'S' : ''}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black w-6 h-6" />
          <input
            type="text"
            placeholder="SEARCH SAVED JOBS..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-4 border-black font-bold text-black placeholder-black uppercase tracking-wide focus:outline-none focus:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
          />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-6 py-4 bg-white border-4 border-black font-bold text-black uppercase tracking-wide focus:outline-none focus:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
        >
          <option value="all">ALL TYPES</option>
          <option value="full-time">FULL-TIME</option>
          <option value="part-time">PART-TIME</option>
          <option value="contract">CONTRACT</option>
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid lg:grid-cols-5 gap-12 h-[calc(100vh-300px)] min-h-[500px]"
      >
        <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
          {filteredJobs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-black border-4 border-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[8px_8px_0px_0px_black]">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-black text-black uppercase tracking-wide mb-3">
                  NO SAVED JOBS YET
                </h3>
                <p className="text-gray-700 font-bold mb-6 uppercase tracking-wide">
                  START EXPLORING JOB MATCHES AND SAVE THE ONES THAT INTEREST YOU!
                </p>
                <Button className="bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide px-8 py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200">
                  <Search className="w-5 h-5 mr-3" />
                  FIND JOBS
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
                className={`cursor-pointer transition-all duration-300 bg-white border-4 border-black hover:shadow-[8px_8px_0px_0px_black] hover:-translate-y-2 ${
                  selectedJob?.job_id === job.job_id
                    ? 'ring-4 ring-black shadow-[8px_8px_0px_0px_black]'
                    : ''
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-black text-black mb-2 line-clamp-1 uppercase tracking-wide text-lg">
                        {job.title || 'JOB TITLE'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-700 mb-3 font-bold uppercase">
                        <Building className="w-5 h-5 mr-2 text-black" />
                        {job.company}
                      </div>
                    </div>
                    <Badge className="bg-black text-white border-2 border-black font-bold uppercase">
                      <span
                        className={`border-2 ${getConfidenceColor(
                          job.confidence && job.confidence.trim() ? job.confidence : 'Unknown',
                        )} flex items-center gap-2 px-3 py-1 rounded-lg`}
                      >
                        {getConfidenceIcon(job.confidence && job.confidence.trim() ? job.confidence : 'Unknown')}
                        <span className="font-black ml-1 uppercase">
                          {(job.confidence && job.confidence.trim() ? job.confidence : 'Unknown').charAt(0).toUpperCase() +
                            (job.confidence && job.confidence.trim() ? job.confidence : 'Unknown').slice(1)}
                        </span>
                      </span>
                      <span
                        className={`ml-3 font-black ${getMatchScoreColor(
                          job.match_score || job.matchScore || 0,
                        )}`}
                      >
                        {((job.match_score || job.matchScore || 0) * 100).toFixed(0)}% MATCH
                      </span>
                    </Badge>
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
                      {job.matched_skills && job.matched_skills.slice(0, 2).map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          className="text-sm bg-violet-600 text-white border-2 border-black font-bold uppercase px-3 py-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {job.matched_skills && job.matched_skills.length > 2 && (
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
                            style={{ width: `${Math.round(job.skill_coverage * 100)}%` }}
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
            <Card className="bg-white border-4 border-black">
              <CardHeader className="border-b-4 border-black">
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
                      <Badge className={`border-2 ${getConfidenceColor(selectedJob.confidence && selectedJob.confidence.trim() ? selectedJob.confidence : 'Unknown')} flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase`}>
                        {getConfidenceIcon(selectedJob.confidence && selectedJob.confidence.trim() ? selectedJob.confidence : 'Unknown')}
                        <span className="font-black ml-2">
                          {(selectedJob.confidence && selectedJob.confidence.trim() ? selectedJob.confidence : 'Unknown').charAt(0).toUpperCase() + (selectedJob.confidence && selectedJob.confidence.trim() ? selectedJob.confidence : 'Unknown').slice(1)}
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
                      {((selectedJob.match_score || selectedJob.matchScore || 0) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm font-black text-gray-700 uppercase">
                      MATCH
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {/* AI Reasoning Section */}
                {selectedJob.ai_reasoning && selectedJob.ai_reasoning.trim() && (
                  <div className="bg-gray-100 border-4 border-black rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-8 h-8 bg-black rounded-2xl flex items-center justify-center">
                        <span className="text-white text-sm font-black">AI</span>
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
                  {selectedJob.skill_coverage !== undefined && selectedJob.skill_coverage >= 0 && (
                    <div className="bg-green-100 border-4 border-black rounded-2xl p-6">
                      <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-4 uppercase tracking-wide">
                        <div className="w-8 h-8 bg-black rounded-2xl flex items-center justify-center">
                          <span className="text-white text-sm font-black">✓</span>
                        </div>
                        SKILL COVERAGE
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-gray-700 uppercase">MATCH RATE</span>
                          <span className="text-2xl font-black text-black">
                            {Math.round(selectedJob.skill_coverage * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 border-2 border-black rounded-full h-4">
                          <div
                            className="bg-black h-4 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.round(selectedJob.skill_coverage * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-sm font-bold text-gray-600 uppercase">
                          {selectedJob.matched_skills?.length || 0} of {(selectedJob.matched_skills?.length || 0) + (selectedJob.missing_critical_skills?.length || 0)} skills matched
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Matched Skills */}
                  {selectedJob.matched_skills && selectedJob.matched_skills.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-4 uppercase tracking-wide">
                        <div className="w-8 h-8 bg-violet-600 border-2 border-black rounded-2xl flex items-center justify-center">
                          <span className="text-white text-sm font-black">★</span>
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
                  {selectedJob.missing_critical_skills && selectedJob.missing_critical_skills.length > 0 && (
                    <div className="bg-yellow-100 border-4 border-black rounded-2xl p-6">
                      <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-4 uppercase tracking-wide">
                        <div className="w-8 h-8 bg-black rounded-2xl flex items-center justify-center">
                          <span className="text-white text-sm font-black">⚠</span>
                        </div>
                        SKILLS TO DEVELOP
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedJob.missing_critical_skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-2 border-black text-black font-bold uppercase px-4 py-2 text-sm bg-yellow-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-gray-700 uppercase mt-3">
                        CONSIDER LEARNING THESE SKILLS TO IMPROVE YOUR MATCH RATE
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

                {selectedJob.matched_skills && selectedJob.matched_skills.length > 0 && (
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

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
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
                    onClick={() => selectedJob && window.open(selectedJob.url, '_blank')}
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
