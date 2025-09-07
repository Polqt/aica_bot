'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Filter,
  Search,
  MapPin,
  Building,
  ExternalLink,
  RefreshCw,
  Star,
  AlertCircle,
  CheckCircle2,
  Brain,
  Target,
  Zap,
  BookmarkPlus,
  BarChart3,
  Users,
  Grid,
  List,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';

// Interface matching your actual API response
interface JobMatch {
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  match_score: number;
  matched_skills: string[];
  missing_critical_skills: string[];
  skill_coverage: number;
  confidence: string;
  job_url: string;
  ai_reasoning?: string;
}

interface MatchingStats {
  total_matches: number;
  average_score: number;
  high_confidence_matches: number;
  medium_confidence_matches: number;
  low_confidence_matches: number;
  last_updated: string | null;
}

export default function JobMatchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [stats, setStats] = useState<MatchingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load job matches
  const loadJobMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading job matches...');

      const matches = await apiClient.get<JobMatch[]>('/jobs/matches');
      console.log('Loaded matches:', matches);
      setJobMatches(matches);
    } catch (err: unknown) {
      console.error('Error loading job matches:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load job matches';
      setError(errorMessage);

      // Set mock data for testing UI
      setJobMatches([
        {
          job_id: '1',
          job_title: 'Senior Full Stack Developer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          match_score: 0.85,
          matched_skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          missing_critical_skills: ['AWS', 'Docker'],
          skill_coverage: 0.8,
          confidence: 'high',
          job_url: 'https://example.com/job/1',
          ai_reasoning:
            'Strong match based on your full-stack experience and JavaScript expertise.',
        },
        {
          job_id: '2',
          job_title: 'Frontend Developer',
          company: 'StartupXYZ',
          location: 'Remote',
          match_score: 0.72,
          matched_skills: ['React', 'TypeScript', 'CSS'],
          missing_critical_skills: ['Vue.js', 'GraphQL'],
          skill_coverage: 0.65,
          confidence: 'medium',
          job_url: 'https://example.com/job/2',
          ai_reasoning:
            'Good match for frontend skills, though missing some modern frameworks.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      console.log('Loading stats...');
      const statsData = await apiClient.get<MatchingStats>('/jobs/stats');
      console.log('Loaded stats:', statsData);
      setStats(statsData);
    } catch (err: unknown) {
      console.error('Error loading stats:', err);
      // Mock stats for testing
      setStats({
        total_matches: 12,
        average_score: 0.68,
        high_confidence_matches: 3,
        medium_confidence_matches: 6,
        low_confidence_matches: 3,
        last_updated: new Date().toISOString(),
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadJobMatches();
    loadStats();
  }, []);

  // Refresh matches
  const refreshMatches = async () => {
    try {
      setRefreshing(true);
      setError(null);

      console.log('Triggering new job matching...');
      await apiClient.post('/jobs/find-matches');

      // Reload data
      await Promise.all([loadJobMatches(), loadStats()]);
    } catch (err: unknown) {
      console.error('Error refreshing matches:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh matches';
      setError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter matches
  const filteredMatches = jobMatches.filter(match => {
    const matchesSearch =
      searchTerm === '' ||
      match.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === 'all' || match.confidence === filter;

    return matchesSearch && matchesFilter;
  });

  // Helper functions
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'medium':
        return <Star className="w-4 h-4" />;
      case 'low':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Loading state
  if (loading && jobMatches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-indigo-600" />
              <h3 className="text-xl font-semibold mb-2">
                Loading AI Job Matches
              </h3>
              <p className="text-gray-600">
                Analyzing your profile with our AI engine...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI Job Matches
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover your perfect career opportunities powered by advanced AI
            matching algorithms
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_matches}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats.average_score * 100).toFixed(0)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  High Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.high_confidence_matches}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Last Updated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {stats.last_updated
                    ? new Date(stats.last_updated).toLocaleDateString()
                    : 'Never'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs or companies..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Matches</option>
                <option value="high">High Confidence</option>
                <option value="medium">Medium Confidence</option>
                <option value="low">Low Confidence</option>
              </select>
            </div>
          </div>

          <Button
            onClick={refreshMatches}
            disabled={refreshing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {refreshing ? 'Finding Matches...' : 'Refresh AI Matches'}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Job Matches */}
        {filteredMatches.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.map(match => (
              <Card
                key={match.job_id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1 line-clamp-2">
                        {match.job_title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <Building className="w-4 h-4" />
                        {match.company}
                      </CardDescription>
                    </div>
                    <Badge
                      className={`${getConfidenceColor(
                        match.confidence,
                      )} flex items-center gap-1`}
                    >
                      {getConfidenceIcon(match.confidence)}
                      {match.confidence}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Match Score */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Match Score</span>
                      <span
                        className={`text-lg font-bold ${getMatchScoreColor(
                          match.match_score,
                        )}`}
                      >
                        {(match.match_score * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Location */}
                    {match.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {match.location}
                      </div>
                    )}

                    {/* Matched Skills */}
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Matched Skills
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {match.matched_skills
                          .slice(0, 4)
                          .map((skill, skillIndex) => (
                            <Badge
                              key={skillIndex}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        {match.matched_skills.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{match.matched_skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    {match.ai_reasoning && (
                      <div className="bg-indigo-50 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <Brain className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-800">
                            AI Insight
                          </span>
                        </div>
                        <p className="text-sm text-indigo-700 line-clamp-2">
                          {match.ai_reasoning}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(match.job_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Job
                      </Button>
                      <Button size="sm" variant="outline">
                        <BookmarkPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No matches found</h3>
            <p className="text-gray-600 mb-4">
              {jobMatches.length === 0
                ? "Click 'Refresh AI Matches' to find your perfect job opportunities"
                : 'Try adjusting your search or filter criteria'}
            </p>
            {jobMatches.length === 0 && (
              <Button onClick={refreshMatches} disabled={refreshing}>
                {refreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Find My Matches
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
