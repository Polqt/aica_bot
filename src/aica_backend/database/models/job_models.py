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


class JobSource(BaseModel):
    id: Optional[str] = Field(description="Job source ID")
    url: str = Field(description="URL of the job board")
    name: Optional[str] = Field(description="Name of the job board")
    last_checked: Optional[datetime] = Field(description="Last check timestamp")
    is_active: bool = Field(default=True, description="Whether the source is active")


class JobListings(BaseModel):
    jobs: List[Job] = Field(description="List of job postings")
    total_count: int = Field(description="Total number of jobs")
    page: int = Field(default=1, description="Current page number")
    page_size: int = Field(default=20, description="Number of jobs per page")
