from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class User(BaseModel):
    id: Optional[str] = None
    email: str
    password_hash: str
    created_at: Optional[datetime] = None

class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
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
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class UserSkill(BaseModel):
    id: Optional[str] = None
    user_id: str
    skill_name: str
    skill_category: str  
    confidence_score: Optional[float] = None
    source: str = "resume"
    created_at: Optional[datetime] = None
    
class UserSkillCreate(BaseModel):
    skill_name: str
    skill_category: str
    confidence_score: Optional[float] = None
    source: str = "resume"

class UserJobMatch(BaseModel):
    id: Optional[str] = None
    user_id: str
    job_id: str
    match_score: float
    matched_skills: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    
class ResumeUploadResponse(BaseModel):
    message: str
    file_path: str
    processing_status: str


class SkillsResponse(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    experience_years: Optional[int] = None
    job_titles: List[str] = Field(default_factory=list)
    education_level: Optional[str] = None
    industries: List[str] = Field(default_factory=list)