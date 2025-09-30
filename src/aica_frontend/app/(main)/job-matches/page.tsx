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
  Target,
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
              FINDING YOUR PERFECT MATCHES
            </h3>
            <p className="text-gray-700 font-black uppercase">
              OUR AI IS ANALYZING THOUSANDS OF OPPORTUNITIES...
            </p>
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
        className="relative"
      >
        <div className="absolute -left-4 top-0 w-3 h-full bg-violet-600 transform -skew-x-12" />
        <div className="pl-8">
          <h1 className="text-4xl lg:text-6xl font-black text-black uppercase tracking-wide flex items-center gap-4 mb-2">
            <div className="bg-violet-600 text-white p-3 border-4 border-black shadow-[6px_6px_0px_0px_black]">
              <Target className="w-8 h-8" />
            </div>
            AI JOB MATCHES
          </h1>
          <p className="text-gray-700 font-black text-lg uppercase tracking-wide">
            DISCOVER OPPORTUNITIES TAILORED TO YOUR SKILLS
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="flex items-center gap-4">
          {jobMatches.length > 0 && (
            <div className="bg-violet-100 border-4 border-black px-6 py-3 font-black uppercase tracking-wide shadow-[6px_6px_0px_0px_black]">
              {jobMatches.length} MATCHES FOUND
            </div>
          )}
        </div>
        <Button
          onClick={refreshMatches}
          disabled={refreshing}
          className="bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide px-6 py-4 shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200"
        >
          {refreshing ? (
            <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
          ) : (
            <Zap className="w-5 h-5 mr-3" />
          )}
          {refreshing ? 'FINDING MATCHES...' : 'REFRESH MATCHES'}
        </Button>
      </motion.div>

      {isCheckingStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-violet-50 border-4 border-black shadow-[6px_6px_0px_0px_black]">
            <CardContent className="flex items-center justify-center py-6">
              <RefreshCw className="h-6 w-6 animate-spin text-violet-600 mr-4" />
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
          <Card className="bg-violet-50 border-4 border-black shadow-[6px_6px_0px_0px_black]">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-violet-600 mr-4" />
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
                    <p className="text-gray-700 font-black text-sm uppercase tracking-wide">
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
          <input
            type="text"
            placeholder="SEARCH JOB MATCHES..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-4 border-black font-black uppercase placeholder:text-gray-500 focus:outline-none focus:border-violet-600 focus:bg-violet-50 shadow-[6px_6px_0px_0px_black] transition-all duration-200"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-6 py-4 bg-white border-4 border-black font-black uppercase focus:outline-none focus:border-violet-600 focus:bg-violet-50 shadow-[6px_6px_0px_0px_black] transition-all duration-200"
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
        className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-400px)] min-h-[500px]"
      >
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {filteredMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-full min-h-[300px]"
            >
              <div className="text-center bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_black]">
                <div className="w-16 h-16 bg-violet-600 border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-black text-black mb-2 uppercase tracking-wide">
                  {searchTerm || filter !== 'all' ? 'NO MATCHES FOUND' : 'NO JOB MATCHES YET'}
                </h3>
                <p className="text-gray-700 font-black mb-4 max-w-xs uppercase text-sm tracking-wide">
                  {searchTerm || filter !== 'all'
                    ? 'TRY ADJUSTING YOUR SEARCH OR FILTERS'
                    : 'CLICK "REFRESH MATCHES" TO FIND JOBS TAILORED TO YOUR SKILLS'
                  }
                </p>
                {(searchTerm || filter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                    className="bg-black text-white border-4 border-black hover:bg-violet-600 hover:text-white font-black uppercase text-sm shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
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
                className={`cursor-pointer transition-all duration-300 bg-white border-4 border-black hover:shadow-[8px_8px_0px_0px_black] hover:-translate-y-1 ${
                  selectedJob?.job_id === match.job_id
                    ? 'shadow-[6px_6px_0px_0px_black] bg-violet-50 border-violet-600'
                    : ''
                }`}
                onClick={() => setSelectedJob(match)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-black text-black mb-2 line-clamp-1 uppercase tracking-wide text-lg">
                        {match.job_title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-700 mb-3 font-black uppercase">
                        <Building className="w-5 h-5 mr-2 text-black" />
                        {match.company}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Badge className="bg-violet-100 border-2 border-black text-black font-black uppercase text-xs px-3 py-1">
                        {match.confidence?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                      <div className="text-center">
                        <div className="text-2xl font-black text-black bg-violet-100 px-3 py-1 border-2 border-black">
                          {(match.match_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs font-black text-gray-700 uppercase mt-1">MATCH</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700 font-black">
                    {match.location && (
                      <div className="flex items-center uppercase">
                        <MapPin className="w-5 h-5 mr-2 text-black" />
                        {match.location}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="flex flex-wrap gap-2">
                      {match.matched_skills.slice(0, 3).map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          className="text-xs bg-black text-white border-2 border-black font-bold uppercase"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {match.matched_skills.length > 3 && (
                        <Badge className="text-xs bg-violet-100 text-black border-2 border-black font-bold uppercase">
                          +{match.matched_skills.length - 3} MORE
                        </Badge>
                      )}
                    </div>

                    {match.skill_coverage !== undefined && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-black uppercase">
                          <span>SKILL COVERAGE</span>
                          <span>{Math.round(match.skill_coverage * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 border-2 border-black h-3">
                          <div
                            className="bg-violet-600 h-full transition-all duration-300"
                            style={{ width: `${Math.round(match.skill_coverage * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            ))
          )}
        </div>

        <div className="lg:col-span-3 overflow-y-auto pr-2 custom-scrollbar">
          {selectedJob ? (
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
              <CardHeader className="border-b-4 border-black bg-violet-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl text-black mb-3 font-black uppercase tracking-wide">
                      {selectedJob.job_title}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-4 text-gray-700 font-black">
                      <span className="flex items-center uppercase">
                        <Building className="w-5 h-5 mr-2 text-black" />
                        {selectedJob.company}
                      </span>
                      {selectedJob.location && (
                        <span className="flex items-center uppercase">
                          <MapPin className="w-5 h-5 mr-2 text-black" />
                          {selectedJob.location}
                        </span>
                      )}
                      <Badge className="border-2 border-black bg-white text-black font-black uppercase text-sm px-4 py-1">
                        {selectedJob.confidence?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-black bg-violet-100 px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_black]">
                      {(selectedJob.match_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm font-black text-gray-700 uppercase mt-2">
                      MATCH SCORE
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
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
                    <p className="text-gray-700 leading-relaxed text-sm font-medium">
                      {selectedJob.ai_reasoning}
                    </p>
                  </div>
                )}

                <div className="grid gap-6">
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
                          <span className="text-sm font-black text-gray-700 uppercase">MATCH RATE</span>
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

                <div className="flex gap-4 pt-6 border-t-4 border-black">
                  <Button
                    className="flex-1 bg-violet-600 text-white border-4 border-black hover:bg-black hover:text-white font-black uppercase tracking-wide py-4 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
                    onClick={() => window.open(selectedJob.job_url, '_blank')}
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    VIEW JOB
                  </Button>
                  <Button
                    className="flex-1 bg-white text-black border-4 border-black hover:bg-violet-600 hover:text-white font-black uppercase tracking-wide py-4 shadow-[6px_6px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200"
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
            <Card className="h-full flex items-center justify-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_black]">
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-violet-600 border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
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
