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
          <Card className="bg-blue-50 border border-blue-200 shadow-sm">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-blue-900">
                      {processingStatus === 'parsing' &&
                        'Analyzing your resume...'}
                      {processingStatus === 'matching' &&
                        'Finding perfect matches...'}
                      {processingStatus === 'finalizing' &&
                        'Finalizing results...'}
                      {processingStatus === 'processing' &&
                        'Processing your profile...'}
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Our AI is working hard to find the best opportunities.
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-full min-h-[300px]"
            >
              <div className="text-center bg-white rounded-lg p-6 max-w-sm">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  {searchTerm || filter !== 'all'
                    ? 'No matches found'
                    : 'No job matches yet'}
                </h3>
                <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Click "Refresh matches" to find jobs tailored to your skills'}
                </p>
                {(searchTerm || filter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                    className="bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-medium px-4 py-2 rounded-md text-sm shadow-sm hover:shadow-md transition-all duration-150"
                  >
                    Clear filters
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
                          <span className="text-xs font-medium text-gray-600 min-w-[2.5rem]">
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
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-gray-900 mb-2 font-semibold">
                      {selectedJob.job_title}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-3 text-gray-500 text-sm">
                      <span className="flex items-center">
                        <Building className="w-4 h-4 mr-1.5" />
                        {selectedJob.company}
                      </span>
                      {selectedJob.location && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5" />
                          {selectedJob.location}
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
                        {selectedJob.confidence?.charAt(0).toUpperCase() +
                          selectedJob.confidence?.slice(1) || 'Unknown'}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-center ml-4">
                    <div className="text-2xl font-semibold text-gray-900">
                      {(selectedJob.match_score * 100).toFixed(0)}%
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

                <div className="grid gap-4">
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
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150"
                    onClick={() => window.open(selectedJob.job_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View job
                  </Button>
                  <Button
                    className="flex-1 bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 font-medium py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150"
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
                      ? 'Unsave'
                      : 'Save'}
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
