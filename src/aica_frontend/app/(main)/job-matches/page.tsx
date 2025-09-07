'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
import { Separator } from '@/components/ui/separator';
import {
  Filter,
  Search,
  TrendingUp,
  MapPin,
  Building,
  ExternalLink,
  RefreshCw,
  Star,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';

interface JobMatch {
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  match_score: number;
  matched_skills: string[];
  missing_critical_skills: string[];
  skill_coverage: number;
  confidence: 'high' | 'medium' | 'low';
  job_url: string;
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

  // Load initial data
  useEffect(() => {
    loadJobMatches();
    loadStats();
  }, []);

  const loadJobMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const matches = await apiClient.get<JobMatch[]>('/jobs/matches');
      setJobMatches(matches);
    } catch (err: unknown) {
      console.error('Error loading job matches:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load job matches';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await apiClient.get<MatchingStats>('/jobs/stats');
      setStats(statsData);
    } catch (err: unknown) {
      console.error('Error loading stats:', err);
    }
  };

  const refreshMatches = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Trigger fresh matching
      await apiClient.post('/jobs/find-matches');

      // Reload matches and stats
      await Promise.all([loadJobMatches(), loadStats()]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh matches';
      setError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter matches based on search and filter
  const filteredMatches = jobMatches.filter(match => {
    const matchesSearch =
      searchTerm === '' ||
      match.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === 'all' || match.confidence === filter;

    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="min-h-screen p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold gradient-text">
            Job Matches
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered job matches based on your skills and experience
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="btn-modern"
            onClick={() => setFilter(filter === 'all' ? 'high' : 'all')}
          >
            <Filter className="w-4 h-4 mr-2" />
            {filter === 'all' ? 'Show All' : 'High Confidence'}
          </Button>
          <Button
            className="btn-modern bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={refreshMatches}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            {refreshing ? 'Refreshing...' : 'Refresh Matches'}
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_matches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.average_score * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
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
        </motion.div>
      )}

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by job title or company..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All ({jobMatches.length})
          </Button>
          <Button
            variant={filter === 'high' ? 'default' : 'outline'}
            onClick={() => setFilter('high')}
            size="sm"
          >
            High ({jobMatches.filter(m => m.confidence === 'high').length})
          </Button>
          <Button
            variant={filter === 'medium' ? 'default' : 'outline'}
            onClick={() => setFilter('medium')}
            size="sm"
          >
            Medium ({jobMatches.filter(m => m.confidence === 'medium').length})
          </Button>
        </div>
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-12"
        >
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading job matches...
          </span>
        </motion.div>
      )}

      {/* Job Matches List */}
      {!loading && filteredMatches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          {filteredMatches.map(match => (
            <Card
              key={match.job_id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{match.job_title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-base">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {match.company}
                      </div>
                      {match.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {match.location}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getConfidenceColor(match.confidence)}>
                      {getConfidenceIcon(match.confidence)}
                      <span className="ml-1 capitalize">
                        {match.confidence}
                      </span>
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {(match.match_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Match</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Skill Coverage: {(match.skill_coverage * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Matched Skills */}
                {match.matched_skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">
                      Matched Skills ({match.matched_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {match.matched_skills
                        .slice(0, 8)
                        .map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            {skill}
                          </Badge>
                        ))}
                      {match.matched_skills.length > 8 && (
                        <Badge variant="secondary" className="text-xs">
                          +{match.matched_skills.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {match.missing_critical_skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-orange-700 mb-2">
                      Skills to Develop ({match.missing_critical_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {match.missing_critical_skills
                        .slice(0, 5)
                        .map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            variant="outline"
                            className="text-xs border-orange-300 text-orange-700"
                          >
                            {skill}
                          </Badge>
                        ))}
                      {match.missing_critical_skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{match.missing_critical_skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" className="gap-1">
                    View Details
                  </Button>
                  <Button size="sm" className="gap-1" asChild>
                    <a
                      href={match.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Apply Now
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredMatches.length === 0 && jobMatches.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No job matches yet</h3>
          <p className="text-muted-foreground mb-4">
            We haven&apos;t found any job matches for your profile yet. Try
            refreshing to find new matches.
          </p>
          <Button onClick={refreshMatches} disabled={refreshing}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Find Matches
          </Button>
        </motion.div>
      )}

      {/* No Results for Search */}
      {!loading && filteredMatches.length === 0 && jobMatches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No matches found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </motion.div>
      )}
    </div>
  );
}
