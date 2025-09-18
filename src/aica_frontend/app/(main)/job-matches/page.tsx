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
  const { savedJobIds, savingJobId, saveJob, refreshSavedJobs } =
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
    if (
      !isCheckingStatus &&
      (processingStatus === 'completed' ||
        processingStatus === 'not_processing')
    ) {
      loadJobMatches();
      loadStats();
      refreshSavedJobs();
    }
  }, [
    isCheckingStatus,
    processingStatus,
    loadJobMatches,
    loadStats,
    refreshSavedJobs,
  ]);

  const refreshMatches = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await apiClient.post('/jobs/find-matches');
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
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Finding Your Perfect Matches
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Our AI is analyzing thousands of opportunities just for you...
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
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-violet-600" />
            AI Job Matches
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Discover opportunities tailored to your unique skills and
            aspirations
          </p>
        </div>
        <Button
          onClick={refreshMatches}
          disabled={refreshing}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
        >
          {refreshing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          {refreshing ? 'Finding Matches...' : 'Refresh Matches'}
        </Button>
      </motion.div>

      {isCheckingStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-700/50">
            <CardContent className="flex items-center justify-center py-6">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600 mr-3" />
              <span className="text-blue-700 dark:text-blue-300">
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
          <Card className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-700/50">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-amber-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-amber-700 dark:text-amber-300">
                      {processingStatus === 'parsing' &&
                        'Analyzing Your Resume...'}
                      {processingStatus === 'matching' &&
                        'Finding Perfect Matches...'}
                      {processingStatus === 'finalizing' &&
                        'Finalizing Results...'}
                      {processingStatus === 'processing' &&
                        'Processing Your Profile...'}
                    </h3>
                    <p className="text-amber-600 dark:text-amber-400 text-sm">
                      Our AI is working hard to find the best opportunities for
                      you. This usually takes 1-2 minutes.
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search job matches..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
        >
          <option value="all">All Confidence Levels</option>
          <option value="high">High Confidence</option>
          <option value="medium">Medium Confidence</option>
          <option value="low">Low Confidence</option>
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-400px)]"
      >
        <div className="lg:col-span-2 space-y-4 overflow-y-auto">
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.job_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg ${
                  selectedJob?.job_id === match.job_id
                    ? 'ring-2 ring-violet-500 shadow-lg shadow-violet-500/10'
                    : ''
                }`}
                onClick={() => setSelectedJob(match)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
                        {match.job_title}
                      </h3>
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <Building className="w-4 h-4 mr-1" />
                        {match.company}
                      </div>
                    </div>
                    <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                      <span
                        className={`border ${getConfidenceColor(
                          match.confidence,
                        )} flex items-center gap-1 px-2 py-1 rounded-md`}
                      >
                        {getConfidenceIcon(match.confidence)}
                        <span className="font-medium ml-1">
                          {match.confidence?.charAt(0).toUpperCase() +
                            match.confidence?.slice(1) || 'Unknown'}
                        </span>
                      </span>
                      <span
                        className={`ml-2 font-bold ${getMatchScoreColor(
                          match.match_score,
                        )}`}
                      >
                        {(match.match_score * 100).toFixed(0)}% match
                      </span>
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {match.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        {match.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {match.matched_skills.slice(0, 2).map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {match.matched_skills.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{match.matched_skills.length - 2}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-3">
          {selectedJob ? (
            <Card className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
              <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-slate-900 dark:text-white mb-2">
                      {selectedJob.job_title}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
                      <span className="flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        {selectedJob.company}
                      </span>
                      {selectedJob.location && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {selectedJob.location}
                        </span>
                      )}
                      <Badge
                        className={`border ${getConfidenceColor(
                          selectedJob.confidence,
                        )} flex items-center gap-1 px-2 py-1 rounded-md`}
                      >
                        {getConfidenceIcon(selectedJob.confidence)}
                        <span className="font-medium ml-1">
                          {selectedJob.confidence?.charAt(0).toUpperCase() +
                            selectedJob.confidence?.slice(1) || 'Unknown'}
                        </span>
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${getMatchScoreColor(
                          selectedJob.match_score,
                        )}`}
                      >
                        {(selectedJob.match_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        match
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 overflow-y-auto">
                {selectedJob.ai_reasoning && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                      AI Reasoning
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedJob.ai_reasoning}
                    </p>
                  </div>
                )}
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
                <div className="flex gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <Button
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                    onClick={() => window.open(selectedJob.job_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Job
                  </Button>
                  <Button
                    variant={
                      savedJobIds.includes(selectedJob.job_id)
                        ? 'reverse'
                        : 'neutral'
                    }
                    className={
                      savedJobIds.includes(selectedJob.job_id)
                        ? 'flex-1 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white'
                        : 'bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700'
                    }
                    disabled={savingJobId === selectedJob.job_id}
                    onClick={() => saveJob(selectedJob.job_id)}
                  >
                    {savedJobIds.includes(selectedJob.job_id) ? (
                      <BookmarkCheck className="w-4 h-4 mr-2" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4 mr-2" />
                    )}
                    {savedJobIds.includes(selectedJob.job_id)
                      ? 'Saved'
                      : 'Save'}
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
