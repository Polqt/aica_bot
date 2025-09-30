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
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white border-4 border-black p-12 shadow-[12px_12px_0px_0px_black]"
          >
            <div className="w-16 h-16 bg-violet-600 border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-black text-black uppercase mb-2 tracking-wide">
              LOADING SAVED JOBS
            </h3>
            <p className="text-gray-700 font-black uppercase">
              FETCHING YOUR SAVED OPPORTUNITIES...
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
            className="text-center bg-white border-4 border-black p-12 shadow-[12px_12px_0px_0px_black]"
          >
            <div className="w-16 h-16 bg-red-600 border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="text-white font-black text-xl">⚠️</div>
            </div>
            <h3 className="text-xl font-black text-black uppercase mb-2 tracking-wide">
              ERROR LOADING SAVED JOBS
            </h3>
            <p className="text-gray-700 font-black mb-6 uppercase">
              {error}
            </p>
            <Button
              onClick={refreshSavedJobs}
              className="bg-black text-white border-4 border-black hover:bg-violet-600 hover:text-white font-black uppercase tracking-wide px-8 py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200"
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
              <Star className="w-8 h-8" />
            </div>
            SAVED JOBS
          </h1>
          <p className="text-gray-700 font-black text-lg uppercase tracking-wide">
            KEEP TRACK OF OPPORTUNITIES THAT CAUGHT YOUR INTEREST
          </p>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
          <input
            type="text"
            placeholder="SEARCH SAVED JOBS..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-4 border-black font-black uppercase placeholder:text-gray-500 focus:outline-none focus:border-violet-600 focus:bg-violet-50 shadow-[6px_6px_0px_0px_black] transition-all duration-200"
          />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-6 py-4 bg-white border-4 border-black font-black uppercase focus:outline-none focus:border-violet-600 focus:bg-violet-50 shadow-[6px_6px_0px_0px_black] transition-all duration-200"
        >
          <option value="all">ALL TYPES</option>
          <option value="full-time">FULL-TIME</option>
          <option value="part-time">PART-TIME</option>
          <option value="contract">CONTRACT</option>
        </select>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-400px)] min-h-[500px]"
      >
        {/* Job List */}
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {filteredJobs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_black]">
                <div className="w-16 h-16 bg-violet-600 border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-black uppercase tracking-wide mb-3">
                  NO SAVED JOBS YET
                </h3>
                <p className="text-gray-700 font-black mb-6 uppercase text-sm tracking-wide">
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
                className={`cursor-pointer transition-all duration-300 bg-white border-4 border-black hover:shadow-[8px_8px_0px_0px_black] hover:-translate-y-1 ${
                  selectedJob?.job_id === job.job_id
                    ? 'shadow-[6px_6px_0px_0px_black] bg-violet-50 border-violet-600'
                    : ''
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-black text-black mb-2 line-clamp-1 uppercase tracking-wide text-lg">
                        {job.title || 'JOB TITLE'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-700 mb-3 font-black uppercase">
                        <Building className="w-5 h-5 mr-2 text-black" />
                        {job.company}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Badge className="bg-violet-100 border-2 border-black text-black font-black uppercase text-xs px-3 py-1">
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
                      </Badge>
                      <div className="text-center">
                        <div className={`text-2xl font-black bg-violet-100 px-3 py-1 border-2 border-black ${getMatchScoreColor(
                          job.match_score || job.matchScore || 0,
                        )}`}>
                          {((job.match_score || job.matchScore || 0) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs font-black text-gray-700 uppercase mt-1">MATCH</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-700 font-black">
                    <div className="flex items-center uppercase">
                      <MapPin className="w-5 h-5 mr-2 text-black" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center uppercase">
                        <DollarSign className="w-5 h-5 mr-2 text-black" />
                        {job.salary}
                      </div>
                    )}
                    <div className="flex items-center uppercase">
                      <Clock className="w-5 h-5 mr-2 text-black" />
                      SAVED {new Date(job.savedDate || job.saved_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Skills and Coverage */}
                  <div className="space-y-3 mt-4">
                    <div className="flex flex-wrap gap-2">
                      {job.matched_skills && job.matched_skills.slice(0, 3).map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          className="text-xs bg-black text-white border-2 border-black font-bold uppercase"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {job.matched_skills && job.matched_skills.length > 3 && (
                        <Badge className="text-xs bg-violet-100 text-black border-2 border-black font-bold uppercase">
                          +{job.matched_skills.length - 3} MORE
                        </Badge>
                      )}
                    </div>

                    {job.skill_coverage !== undefined && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-black uppercase">
                          <span>SKILL COVERAGE</span>
                          <span>{Math.round(job.skill_coverage * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 border-2 border-black h-3">
                          <div
                            className="bg-violet-600 h-full transition-all duration-300"
                            style={{ width: `${Math.round(job.skill_coverage * 100)}%` }}
                          ></div>
                        </div>
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

        {/* Job Details */}
        <div className="lg:col-span-3 overflow-y-auto pr-2 custom-scrollbar">
          {selectedJob ? (
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
              <CardHeader className="border-b-4 border-black bg-violet-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-black text-black uppercase tracking-wide mb-3">
                      {selectedJob.title}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-6 text-gray-700 font-black uppercase text-lg">
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
                        SAVED {new Date(selectedJob.savedDate || selectedJob.saved_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-4xl font-black bg-violet-100 px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_black] ${getMatchScoreColor(
                        selectedJob.match_score || selectedJob.matchScore || 0,
                      )}`}
                    >
                      {((selectedJob.match_score || selectedJob.matchScore || 0) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm font-black text-gray-700 uppercase mt-2">
                      MATCH SCORE
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {/* AI Reasoning Section */}
                {selectedJob.ai_reasoning && selectedJob.ai_reasoning.trim() && (
                  <div className="bg-violet-50 border-4 border-black p-6 shadow-[4px_4px_0px_0px_black]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-violet-600 text-white flex items-center justify-center font-black text-sm border-2 border-black">
                        AI
                      </div>
                      <h3 className="text-xl font-black text-black uppercase tracking-wide">
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
                    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_black]">
                      <h3 className="text-xl font-black text-black mb-4 flex items-center gap-3 uppercase tracking-wide">
                        <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-sm font-black">
                          ✓
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
                        <div className="w-full bg-gray-200 border-2 border-black h-6">
                          <div
                            className="bg-violet-600 h-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.round(selectedJob.skill_coverage * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-sm font-black text-gray-600 uppercase">
                          {selectedJob.matched_skills?.length || 0} OF {(selectedJob.matched_skills?.length || 0) + (selectedJob.missing_critical_skills?.length || 0)} SKILLS MATCHED
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Matched Skills */}
                  {selectedJob.matched_skills && selectedJob.matched_skills.length > 0 && (
                    <div>
                      <h3 className="text-xl font-black text-black mb-4 flex items-center gap-3 uppercase tracking-wide">
                        <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-sm font-black">
                          ★
                        </div>
                        YOUR MATCHING SKILLS
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedJob.matched_skills.map((skill, index) => (
                          <Badge
                            key={index}
                            className="bg-black text-white border-2 border-black font-bold uppercase px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Critical Skills */}
                  {selectedJob.missing_critical_skills && selectedJob.missing_critical_skills.length > 0 && (
                    <div className="bg-violet-50 border-4 border-black p-6 shadow-[4px_4px_0px_0px_black]">
                      <h3 className="text-xl font-black text-black mb-4 flex items-center gap-3 uppercase tracking-wide">
                        <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-sm font-black">
                          !
                        </div>
                        SKILLS TO DEVELOP
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedJob.missing_critical_skills.map((skill, index) => (
                          <Badge
                            key={index}
                            className="border-2 border-black bg-white text-black font-bold uppercase px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm font-black text-gray-600 mt-3 uppercase tracking-wide">
                        CONSIDER LEARNING THESE SKILLS TO IMPROVE YOUR MATCH RATE
                      </p>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                {selectedJob.description && (
                  <div>
                    <h3 className="text-xl font-black text-black mb-4 uppercase tracking-wide">
                      JOB DESCRIPTION
                    </h3>
                    <p className="text-gray-700 font-bold leading-relaxed text-lg">
                      {selectedJob.description}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div>
                    <h3 className="text-xl font-black text-black mb-4 uppercase tracking-wide">
                      REQUIREMENTS
                    </h3>
                    <ul className="space-y-3">
                      {selectedJob.requirements.map((req, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-4 text-gray-700 font-bold text-lg"
                        >
                          <span className="text-black mt-1 text-xl font-black">✓</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Required Skills */}
                {selectedJob.tags && selectedJob.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-black text-black mb-4 uppercase tracking-wide">
                      REQUIRED SKILLS
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedJob.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="bg-violet-600 text-white border-2 border-black font-bold uppercase px-3 py-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t-4 border-black">
                  <Button
                    className="flex-1 bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide py-4 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
                    onClick={() => selectedJob && window.open(selectedJob.url, '_blank')}
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    APPLY NOW
                  </Button>
                  <Button
                    className="flex-1 bg-white text-black border-4 border-black hover:bg-violet-600 hover:text-white font-black uppercase tracking-wide py-4 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
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
            <Card className="h-full flex items-center justify-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-violet-600 border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-700 font-black uppercase text-lg tracking-wide">
                    SELECT A JOB TO VIEW DETAILS
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}
