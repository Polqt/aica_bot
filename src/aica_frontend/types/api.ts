export interface UploadResponse {
  message: string;
  user_id: string;
  filename: string;
}

export interface ProcessingStatusResponse {
  status: string;
  message?: string;
  step?: string;
  matches_found?: number;
}

export interface SkillsResponse {
  technical_skills: string[];
  soft_skills: string[];
  total_count: number;
}
