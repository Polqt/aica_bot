from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Job(BaseModel):
    id: Optional[str] = Field(description="Job ID")
    title: str = Field(description="Job title")
    url: str = Field(description="URL of the job posting")
    company: str = Field(description="Company name")
    description: Optional[str] = Field(description="Job description")
    location: Optional[str] = Field(description="Job location")
    created_at: Optional[datetime] = Field(description="Job creation timestamp")
    
    requirements: List[str] = Field(default=[], description="Job requirements and qualifications")
    skills: List[str] = Field(default=[], description="Required and preferred skills")
    
    content_embedding: Optional[List[float]] = Field(description="Vector embedding of job content")
    skills_embedding: Optional[List[float]] = Field(description="Vector embedding of skills")
    is_indexed: bool = Field(default=False, description="Whether job is indexed in vector store")

class JobSource(BaseModel):
    id: Optional[str] = Field(description="Job source ID")
    url: str = Field(description="URL of the job board")
    name: Optional[str] = Field(description="Name of the job board")
    last_checked: Optional[datetime] = Field(description="Last check timestamp")
    is_active: bool = Field(default=True, description="Whether the source is active")
    scrape_count: int = Field(default=0, description="Number of jobs scraped from this source")
    last_job_count: int = Field(default=0, description="Jobs found in last scrape")
    error_count: int = Field(default=0, description="Number of consecutive errors")


class JobListings(BaseModel):
    jobs: List[Job] = Field(description="List of job postings")
    total_count: int = Field(description="Total number of jobs")
    page: int = Field(default=1, description="Current page number")
    page_size: int = Field(default=20, description="Number of jobs per page")

class JobMatchRequest(BaseModel):
    resume_text: str = Field(description="Resume content to match against")
    top_k: int = Field(default=20, description="Number of top matches to return")
    min_score: float = Field(default=0.5, description="Minimum match score threshold")
    include_details: bool = Field(default=True, description="Include detailed match analysis")


class JobSearchFilters(BaseModel):
    keywords: Optional[List[str]] = Field(description="Keywords to search for")
    location: Optional[str] = Field(description="Location filter")
    company: Optional[str] = Field(description="Company filter")
    skills: Optional[List[str]] = Field(description="Required skills filter")