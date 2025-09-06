from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = None
    email: str
    password_hash: str
    created_at: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
class UserProfile(BaseModel):
    id: Optional[str] = None
    user_id: str
    resume_uploaded: bool = False
    resume_file_path: Optional[str] = None
    resume_processed: bool = False
    profile_completed: bool = False
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    experience_years: Optional[int] = None
    education_level: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    @validator('experience_years')
    def validate_experience_years(cls, v):
        if v is not None and (v < 0 or v > 70):
            raise ValueError('Experience years must be between 0 and 70')
        return v

class UserSkill(BaseModel):
    id: Optional[str] = None
    user_id: str
    skill_name: str
    skill_category: str  
    confidence_score: Optional[float] = None
    source: str = "resume"
    created_at: Optional[datetime] = None
    
    @validator('skill_category')
    def validate_skill_category(cls, v):
        allowed_categories = ['technical', 'soft', 'industry', 'job_title']
        if v not in allowed_categories:
            raise ValueError(f'Skill category must be one of: {", ".join(allowed_categories)}')
        return v
    
    @validator('confidence_score')
    def validate_confidence_score(cls, v):
        if v is not None and (v < 0.0 or v > 1.0):
            raise ValueError('Confidence score must be between 0.0 and 1.0')
        return v
    
class UserSkillCreate(BaseModel):
    user_id: str = ""  # Will be set by the calling code
    skill_name: str
    skill_category: str 
    confidence_score: Optional[float] = None
    source: str = "resume"
    
    @validator('skill_name')
    def validate_skill_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Skill name cannot be empty')
        return v.strip()
    
    @validator('skill_category')
    def validate_skill_category(cls, v):
        allowed_categories = ['technical', 'soft', 'industry', 'job_title']
        if v not in allowed_categories:
            raise ValueError(f'Skill category must be one of: {", ".join(allowed_categories)}')
        return v

class UserJobMatch(BaseModel):
    id: Optional[str] = None
    user_id: str
    job_id: str
    match_score: float
    matched_skills: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    
    @validator('match_score')
    def validate_match_score(cls, v):
        if v < 0.0 or v > 1.0:
            raise ValueError('Match score must be between 0.0 and 1.0')
        return v
    
class ResumeUploadResponse(BaseModel):
    message: str
    file_path: str
    processing_status: str

class SkillsResponse(BaseModel):
    technical_skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    experience_years: Optional[int] = None
    job_titles: List[str] = Field(default_factory=list)
    education_level: Optional[str] = None
    industries: List[str] = Field(default_factory=list)
    
class ProfileSummary(BaseModel):
    user_info: dict
    skills: SkillsResponse
    stats: dict

class ProcessingStatusResponse(BaseModel):
    status: str
    message: Optional[str] = None
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['not_uploaded', 'processing', 'completed', 'failed', 'not_found']
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v
    