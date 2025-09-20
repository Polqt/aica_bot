export interface UserProfile {
  id: string
  email: string
  created_at: string | null
  resume_uploaded?: boolean
  profile_completed?: boolean
  full_name?: string
  phone?: string
  location?: string
  linkedin_url?: string
  experience_years?: number
  education_level?: string
  skills?: string[]
  experience?: string
  company?: string
}

export interface UserEducation {
  id: string
  user_id: string
  institution_name: string
  degree_type: string
  field_of_study: string
  start_date: string
  end_date?: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface UserEducationCreate {
  institution_name: string
  degree_type: string
  field_of_study: string
  start_date: string
  end_date?: string
  is_current: boolean
}

export interface UserExperience {
  id: string
  user_id: string
  company_name: string
  job_title: string
  employment_type: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface UserExperienceCreate {
  company_name: string
  job_title: string
  employment_type: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
}

export interface UserSkill {
  id: string
  user_id: string
  skill_name: string
  proficiency_level?: string
  created_at: string
  updated_at: string
}

export interface UserSkillCreate {
  skill_name: string
  proficiency_level?: string
}

export interface ResumeSummary {
  profile: UserProfile
  education: UserEducation[]
  experience: UserExperience[]
  skills: UserSkill[]
  completion_percentage: number
  total_experience_years: number
}