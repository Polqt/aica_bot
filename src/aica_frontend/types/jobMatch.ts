export interface JobMatch {
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

export interface MatchingStats {
  total_matches: number;
  average_score: number;
  high_confidence_matches: number;
  medium_confidence_matches: number;
  low_confidence_matches: number;
  last_updated: string | null;
}

export interface SavedJob {
  job_id: string;
  saved_at: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  match_score?: number;
  confidence?: string;
  ai_reasoning?: string;
  matched_skills?: string[];
  missing_critical_skills?: string[];
  skill_coverage?: number;
  tags?: string[];
  matchScore?: number; // Keep for backward compatibility
  requirements?: string[];
  salary?: string;
  savedDate?: string;
  type?: string;
}
