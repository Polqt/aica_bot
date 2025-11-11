from typing import List, Optional
from pydantic import BaseModel, Field
from dataclasses import dataclass


class ResumeSkills(BaseModel):
    technical_skills: List[str] = Field(
        description="Technical skills and technologies",
        default_factory=list
    )
    soft_skills: List[str] = Field(
        description="Soft skills and interpersonal abilities",
        default_factory=list
    )
    experience_years: Optional[int] = Field(
        description="Years of relevant experience",
        default=None
    )
    education_level: Optional[str] = Field(
        description="Highest education level",
        default=None
    )
    industries: List[str] = Field(
        description="Industries worked in",
        default_factory=list
    )


class PersonalInfo(BaseModel):
    full_name: Optional[str] = Field(
        description="Full name of the person",
        default=None
    )
    phone: Optional[str] = Field(
        description="Phone number",
        default=None
    )
    email: Optional[str] = Field(
        description="Email address",
        default=None
    )
    location: Optional[str] = Field(
        description="Location",
        default=None
    )
    linkedin: Optional[str] = Field(
        description="LinkedIn profile URL",
        default=None
    )


@dataclass
class ParsedResume:
    raw_text: str
    skills: ResumeSkills
    personal_info: PersonalInfo
    cleaned_text: str
