export type ProcessingStatus =
  | 'not_uploaded'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'not_found';

export interface ProcessingStatusResponse {
  status: ProcessingStatus;
  message?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  resume_uploaded: boolean;
  resume_file_path?: string;
  resume_processed: boolean;
  profile_completed: boolean;
  full_name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  experience_years?: number;
  education_level?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  skill_category: 'technical' | 'soft' | 'industry' | 'job_title';
  confidence_score?: number;
  source: string;
  created_at: string;
}

export interface SkillsResponse {
  skills: UserSkill[];
  total: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UploadResponse {
  message: string;
  status: ProcessingStatus;
}
