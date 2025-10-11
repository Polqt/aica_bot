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
  Clock,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { JobMatch, MatchingStats } from '@/types/jobMatch';
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
    if (!isCheckingStatus) {
      loadJobMatches();
      loadStats();
    }
  }, [isCheckingStatus, loadJobMatches, loadStats]);

  const refreshMatches = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Try to generate new matches using current resume builder data
      try {
        await apiClient.generateMatches();
      } catch {
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center bg-white rounded-lg p-8 shadow-sm"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-6 h-6 text-gray-600 animate-spin" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Finding Your Perfect Matches
            </h3>
            <p className="text-gray-500">
              Our AI is analyzing thousands of opportunities...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-semibold text-gray-900">
              AI Job Matches
            </h1>
          </div>
          <p className="text-base text-gray-500">
            Discover opportunities tailored to your skills
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={refreshMatches}
            disabled={refreshing}
            className="bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-medium px-4 py-2 shadow-sm hover:shadow-md transition-all duration-150 rounded-md flex items-center gap-2"
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {refreshing ? 'Finding matches...' : 'Refresh matches'}
          </Button>
        </div>
      </motion.div>

      {isCheckingStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="flex items-center justify-center py-4">
              <RefreshCw className="h-4 w-4 animate-spin text-gray-600 mr-2" />
              <span className="text-gray-600 font-medium">
                Checking processing status...
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
          <Card className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_black]">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-black mr-4" />
                  <div>
                    <h3 className="font-black text-black uppercase tracking-wide">
                      {processingStatus === 'parsing' &&
                        'ANALYZING YOUR RESUME...'}
                      {processingStatus === 'matching' &&
                        'FINDING PERFECT MATCHES...'}
                      {processingStatus === 'finalizing' &&
                        'FINALIZING RESULTS...'}
                      {processingStatus === 'processing' &&
                        'PROCESSING YOUR PROFILE...'}
                    </h3>
                    <p className="text-gray-700 font-bold text-sm uppercase">
                      OUR AI IS WORKING HARD TO FIND THE BEST OPPORTUNITIES.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search job matches..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow hover:border-gray-300"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow hover:border-gray-300 cursor-pointer"
        >
          <option value="all">All confidence levels</option>
          <option value="high">High confidence</option>
          <option value="medium">Medium confidence</option>
          <option value="low">Low confidence</option>
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-300px)] min-h-[500px]"
      >
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2">
          {filteredMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-full min-h-[300px]"
            >
              <div className="text-center bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_black]">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-black text-black mb-2 uppercase">
                  {searchTerm || filter !== 'all'
                    ? 'NO MATCHES FOUND'
                    : 'NO JOB MATCHES YET'}
                </h3>
                <p className="text-gray-700 font-bold mb-4 max-w-xs uppercase text-sm">
                  {searchTerm || filter !== 'all'
                    ? 'TRY ADJUSTING YOUR SEARCH OR FILTERS'
                    : 'CLICK "REFRESH MATCHES" TO FIND JOBS TAILORED TO YOUR SKILLS'}
                </p>
                {(searchTerm || filter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                    className="bg-black text-white border-2 border-black hover:bg-white hover:text-black font-black uppercase text-sm"
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
                  className={`cursor-pointer transition-all duration-150 hover:bg-gray-50 ${
                    selectedJob?.job_id === match.job_id
                      ? 'border-gray-300 bg-gray-50 ring-1 ring-gray-300'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedJob(match)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                          {match.job_title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Building className="w-4 h-4 mr-1.5" />
                          {match.company}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          className={`px-2 py-0.5 text-xs font-medium ${
                            match.confidence === 'high'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : match.confidence === 'medium'
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {match.confidence?.charAt(0).toUpperCase() +
                            match.confidence?.slice(1) || 'Unknown'}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">
                          {(match.match_score * 100).toFixed(0)}% Match
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-500">
                      {match.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5" />
                          {match.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5" />
                        Recently posted
                      </div>
                    </div>
                    {/* Skills */}
                    <div className="space-y-2 mt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {match.matched_skills
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
                        {match.matched_skills.length > 2 && (
                          <Badge
                            variant="secondary"
                            className="px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200"
                          >
                            +{match.matched_skills.length - 2} more
                          </Badge>
                        )}
                      </div>

                      {match.skill_coverage !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full transition-all duration-150 rounded-full"
                              style={{
                                width: `${Math.round(
                                  match.skill_coverage * 100,
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-black text-black min-w-[2.5rem] uppercase">
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

        <div className="lg:col-span-3 overflow-y-auto pr-2">
          {selectedJob ? (
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
              <CardHeader className="border-b-4 border-black">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-black mb-2 font-black uppercase tracking-wide">
                      {selectedJob.job_title}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-4 text-gray-700 font-bold">
                      <span className="flex items-center uppercase">
                        <Building className="w-4 h-4 mr-1" />
                        {selectedJob.company}
                      </span>
                      {selectedJob.location && (
                        <span className="flex items-center uppercase">
                          <MapPin className="w-4 h-4 mr-1" />
                          {selectedJob.location}
                        </span>
                      )}
                      <Badge className="border-2 border-black bg-white text-black font-black uppercase text-xs px-3 py-1">
                        {selectedJob.confidence?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-black">
                      {(selectedJob.match_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs font-black text-gray-700 uppercase">
                      MATCH
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* AI Reasoning Section */}
                {selectedJob.ai_reasoning &&
                  selectedJob.ai_reasoning.trim() && (
                    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_black]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-black text-xs">
                          AI
                        </div>
                        <h3 className="text-lg font-black text-black uppercase tracking-wide">
                          AI ANALYSIS
                        </h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm font-medium">
                        {selectedJob.ai_reasoning}
                      </p>
                    </div>
                  )}

                {/* Skill Analysis Section */}
                <div className="grid gap-4">
                  {/* Skill Coverage */}
                  {selectedJob.skill_coverage !== undefined &&
                    selectedJob.skill_coverage >= 0 && (
                      <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_black]">
                        <h3 className="text-lg font-black text-black mb-3 flex items-center gap-2 uppercase tracking-wide">
                          <div className="w-5 h-5 bg-black text-white flex items-center justify-center text-xs font-black">
                            ✓
                          </div>
                          SKILL COVERAGE
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700 uppercase">
                              MATCH RATE
                            </span>
                            <span className="text-lg font-black text-black">
                              {Math.round(selectedJob.skill_coverage * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 border-2 border-black h-6">
                            <div
                              className="bg-black h-full transition-all duration-500 ease-out"
                              style={{
                                width: `${Math.round(
                                  selectedJob.skill_coverage * 100,
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs font-bold text-gray-600 uppercase">
                            {selectedJob.matched_skills?.length || 0} OF{' '}
                            {(selectedJob.matched_skills?.length || 0) +
                              (selectedJob.missing_critical_skills?.length ||
                                0)}{' '}
                            SKILLS MATCHED
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Matched Skills */}
                  {selectedJob.matched_skills &&
                    selectedJob.matched_skills.length > 0 && (
                      <div>
                        <h3 className="text-lg font-black text-black mb-3 flex items-center gap-2 uppercase tracking-wide">
                          <div className="w-5 h-5 bg-black text-white flex items-center justify-center text-xs font-black">
                            ★
                          </div>
                          YOUR MATCHING SKILLS
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.matched_skills.map((skill, index) => (
                            <Badge
                              key={index}
                              className="bg-black text-white border-2 border-black font-bold uppercase"
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
                      <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_black]">
                        <h3 className="text-lg font-black text-black mb-3 flex items-center gap-2 uppercase tracking-wide">
                          <div className="w-5 h-5 bg-black text-white flex items-center justify-center text-xs font-black">
                            !
                          </div>
                          SKILLS TO DEVELOP
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.missing_critical_skills.map(
                            (skill, index) => (
                              <Badge
                                key={index}
                                className="border-2 border-black bg-gray-200 text-black font-bold uppercase"
                              >
                                {skill}
                              </Badge>
                            ),
                          )}
                        </div>
                        <p className="text-xs font-bold text-gray-600 mt-2 uppercase">
                          CONSIDER LEARNING THESE SKILLS TO IMPROVE YOUR MATCH
                          RATE
                        </p>
                      </div>
                    )}
                </div>
                <div className="flex gap-4 pt-4 border-t-4 border-black">
                  <Button
                    className="flex-1 bg-black text-white border-4 border-black hover:bg-violet-600 hover:text-white font-black uppercase tracking-wide py-4 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
                    onClick={() => window.open(selectedJob.job_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    VIEW JOB
                  </Button>
                  <Button
                    className="flex-1 bg-white text-black border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide py-4 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
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
                      <BookmarkCheck className="w-4 h-4 mr-2" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4 mr-2" />
                    )}
                    {savedJobIds.includes(selectedJob.job_id)
                      ? 'UNSAVE'
                      : 'SAVE'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
              <CardContent>
                <p className="text-gray-700 font-black uppercase">
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
