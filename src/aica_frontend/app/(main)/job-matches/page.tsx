'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Search,
  MapPin,
  Building,
  ExternalLink,
  RefreshCw,
  Zap,
  BookmarkPlus,
  BookmarkCheck,
  Sparkles,
  Clock,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { JobMatch, MatchingStats } from '@/types/jobMatch';
import {
  getConfidenceColor,
  getConfidenceIcon,
  getMatchScoreColor,
} from '@/lib/utils/getConfidence';
import { useSavedJobs } from '@/hooks/useSavedJobs';

export default function JobMatchesPage() {
  const { savedJobIds, savingJobId, saveJob, removeJob, refreshSavedJobs } =
    useSavedJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [, setStats] = useState<MatchingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);

  const checkProcessingStatus = useCallback(async () => {
    try {
      setIsCheckingStatus(true);
      const status = await apiClient.get<{
        status: string;
        message?: string;
        matches_found?: number;
      }>('/auth/processing-status');

      setProcessingStatus(status.status);

      if (
        status.status === 'processing' ||
        status.status === 'parsing' ||
        status.status === 'matching' ||
        status.status === 'finalizing'
      ) {
        setTimeout(checkProcessingStatus, 3000);
      } else if (status.status === 'completed') {
        setProcessingStatus('completed');
      }
    } catch {
      setProcessingStatus('not_processing');
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  // Load job matches
  const loadJobMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const matches = await apiClient.get<JobMatch[]>('/jobs/matches');
      setJobMatches(matches);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load job matches';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await apiClient.get<MatchingStats>('/jobs/stats');
      setStats(statsData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load stats';
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    checkProcessingStatus();
    refreshSavedJobs();
  }, [checkProcessingStatus, refreshSavedJobs]);

  useEffect(() => {
    // Always try to load matches - they might exist from resume builder or previous sessions
    if (!isCheckingStatus) {
      loadJobMatches();
      loadStats();
    }
  }, [
    isCheckingStatus,
    loadJobMatches,
    loadStats,
  ]);

  const refreshMatches = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Try to generate new matches using current resume builder data
      try {
        await apiClient.generateMatches();
      } catch (genError) {
        console.warn('Could not generate new matches:', genError);
        // Fall back to finding matches the old way
        await apiClient.post('/jobs/find-matches');
      }

      await Promise.all([loadJobMatches(), loadStats()]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh matches';
      setError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (jobMatches.length > 0 && !selectedJob) {
      setSelectedJob(jobMatches[0]);
    }
  }, [jobMatches, selectedJob]);

  // Filter matches
  const filteredMatches = jobMatches.filter(match => {
    const matchesSearch =
      searchTerm === '' ||
      match.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === 'all' || match.confidence === filter;

    return matchesSearch && matchesFilter;
  });

  if (loading && jobMatches.length === 0) {
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
              FINDING YOUR PERFECT MATCHES
            </h3>
            <p className="text-gray-700 font-bold">
              OUR AI IS ANALYZING THOUSANDS OF OPPORTUNITIES JUST FOR YOU...
            </p>
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
            <Sparkles className="w-12 h-12 text-black" />
            AI JOB MATCHES
          </h1>
          <p className="text-gray-700 font-bold text-lg mt-4 pl-8">
            DISCOVER OPPORTUNITIES TAILORED TO YOUR UNIQUE SKILLS AND ASPIRATIONS
          </p>
        </div>
        <div className="flex items-center gap-4">
          {jobMatches.length > 0 && (
            <div className="text-lg font-black text-gray-700 uppercase">
              {jobMatches.length} MATCHES FOUND
            </div>
          )}
          <Button
            onClick={refreshMatches}
            disabled={refreshing}
            className="bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide px-8 py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200"
          >
            {refreshing ? (
              <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <Zap className="w-5 h-5 mr-3" />
            )}
            {refreshing ? 'FINDING MATCHES...' : 'REFRESH MATCHES'}
          </Button>
        </div>
      </motion.div>

      {isCheckingStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gray-100 border-4 border-black">
            <CardContent className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-black mr-4" />
              <span className="text-black font-black uppercase tracking-wide">
                CHECKING PROCESSING STATUS...
              </span>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {(processingStatus === 'processing' ||
        processingStatus === 'parsing' ||
        processingStatus === 'matching' ||
        processingStatus === 'finalizing') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-yellow-200 border-4 border-black">
            <CardContent className="py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-black mr-6" />
                  <div>
                    <h3 className="font-black text-black uppercase tracking-wide text-xl">
                      {processingStatus === 'parsing' &&
                        'ANALYZING YOUR RESUME...'}
                      {processingStatus === 'matching' &&
                        'FINDING PERFECT MATCHES...'}
                      {processingStatus === 'finalizing' &&
                        'FINALIZING RESULTS...'}
                      {processingStatus === 'processing' &&
                        'PROCESSING YOUR PROFILE...'}
                    </h3>
                    <p className="text-black font-bold text-lg">
                      OUR AI IS WORKING HARD TO FIND THE BEST OPPORTUNITIES FOR
                      YOU. THIS USUALLY TAKES 1-2 MINUTES.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
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
            placeholder="SEARCH JOB MATCHES..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-4 border-black font-bold text-black placeholder-black uppercase tracking-wide focus:outline-none focus:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-6 py-4 bg-white border-4 border-black font-bold text-black uppercase tracking-wide focus:outline-none focus:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
        >
          <option value="all">ALL CONFIDENCE LEVELS</option>
          <option value="high">HIGH CONFIDENCE</option>
          <option value="medium">MEDIUM CONFIDENCE</option>
          <option value="low">LOW CONFIDENCE</option>
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid lg:grid-cols-5 gap-12 h-[calc(100vh-300px)] min-h-[500px]"
      >
        <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
          {filteredMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-full min-h-[300px]"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-black border-4 border-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[8px_8px_0px_0px_black]">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-black text-black uppercase tracking-wide mb-3">
                  {searchTerm || filter !== 'all' ? 'NO MATCHES FOUND' : 'NO JOB MATCHES YET'}
                </h3>
                <p className="text-gray-700 font-bold mb-6 max-w-xs uppercase tracking-wide">
                  {searchTerm || filter !== 'all'
                    ? 'TRY ADJUSTING YOUR SEARCH OR FILTERS'
                    : 'CLICK "REFRESH MATCHES" TO FIND JOBS TAILORED TO YOUR SKILLS'
                  }
                </p>
                {(searchTerm || filter !== 'all') && (
                  <Button
                    variant="neutral"
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                    className="text-sm font-black uppercase bg-black text-white border-2 border-black hover:bg-white hover:text-black"
                  >
                    CLEAR FILTERS
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            filteredMatches.map((match, index) => (
            <motion.div
              key={match.job_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 bg-white border-4 border-black hover:shadow-[8px_8px_0px_0px_black] hover:-translate-y-2 ${
                  selectedJob?.job_id === match.job_id
                    ? 'ring-4 ring-black shadow-[8px_8px_0px_0px_black]'
                    : ''
                }`}
                onClick={() => setSelectedJob(match)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-black text-black mb-2 line-clamp-1 uppercase tracking-wide text-lg">
                        {match.job_title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-700 mb-3 font-bold uppercase">
                        <Building className="w-5 h-5 mr-2 text-black" />
                        {match.company}
                      </div>
                    </div>
                    <Badge className="bg-black text-white border-2 border-black font-bold uppercase">
                      <span
                        className={`border-2 ${getConfidenceColor(
                          match.confidence,
                        )} flex items-center gap-2 px-3 py-1 rounded-lg`}
                      >
                        {getConfidenceIcon(match.confidence)}
                        <span className="font-black ml-1 uppercase">
                          {match.confidence?.charAt(0).toUpperCase() +
                            match.confidence?.slice(1) || 'Unknown'}
                        </span>
                      </span>
                      <span
                        className={`ml-3 font-black ${getMatchScoreColor(
                          match.match_score,
                        )}`}
                      >
                        {(match.match_score * 100).toFixed(0)}% MATCH
                      </span>
                    </Badge>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700 font-bold uppercase">
                    {match.location && (
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-3 text-black" />
                        {match.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-black" />
                    </div>
                  </div>
                  {/* Skills and Coverage */}
                  <div className="space-y-3 mt-4">
                    <div className="flex flex-wrap gap-2">
                      {match.matched_skills.slice(0, 2).map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          className="text-sm bg-violet-600 text-white border-2 border-black font-bold uppercase px-3 py-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {match.matched_skills.length > 2 && (
                        <Badge className="text-sm bg-black text-white border-2 border-black font-bold uppercase px-3 py-1">
                          +{match.matched_skills.length - 2} MORE
                        </Badge>
                      )}
                    </div>

                    {match.skill_coverage !== undefined && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 border-2 border-black rounded-full h-3">
                          <div
                            className="bg-black h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.round(match.skill_coverage * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-black text-black min-w-[2.5rem] uppercase">
                          {Math.round(match.skill_coverage * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            ))
          )}
        </div>

        <div className="lg:col-span-3 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
          {selectedJob ? (
            <Card className="bg-white border-4 border-black">
              <CardHeader className="border-b-4 border-black">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-black text-black uppercase tracking-wide mb-3">
                      {selectedJob.job_title}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-6 text-gray-700 font-bold uppercase text-lg">
                      <span className="flex items-center">
                        <Building className="w-6 h-6 mr-3 text-black" />
                        {selectedJob.company}
                      </span>
                      {selectedJob.location && (
                        <span className="flex items-center">
                          <MapPin className="w-6 h-6 mr-3 text-black" />
                          {selectedJob.location}
                        </span>
                      )}
                      <Badge className={`border-2 ${getConfidenceColor(selectedJob.confidence)} flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase`}>
                        {getConfidenceIcon(selectedJob.confidence)}
                        <span className="font-black ml-2">
                          {selectedJob.confidence?.charAt(0).toUpperCase() +
                            selectedJob.confidence?.slice(1) || 'Unknown'}
                        </span>
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-black ${getMatchScoreColor(
                        selectedJob.match_score,
                      )}`}
                    >
                      {(selectedJob.match_score * 100).toFixed(0)}%
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
                <div className="flex gap-6 pt-6 border-t-4 border-black">
                  <Button
                    className="flex-1 bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200"
                    onClick={() => window.open(selectedJob.job_url, '_blank')}
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    VIEW JOB
                  </Button>
                  <Button
                    variant="neutral"
                    className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-black uppercase py-4 flex-1"
                    disabled={savingJobId === selectedJob.job_id}
                    onClick={() => {
                      if (savedJobIds.includes(selectedJob.job_id)) {
                        removeJob(selectedJob.job_id);
                      } else {
                        saveJob(selectedJob.job_id);
                      }
                    }}
                  >
                    {savedJobIds.includes(selectedJob.job_id) ? (
                      <BookmarkCheck className="w-5 h-5 mr-3" />
                    ) : (
                      <BookmarkPlus className="w-5 h-5 mr-3" />
                    )}
                    {savedJobIds.includes(selectedJob.job_id)
                      ? 'UNSAVE'
                      : 'SAVE'}
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
