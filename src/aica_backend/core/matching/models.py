from pydantic import BaseModel, Field
from typing import List
from dataclasses import dataclass


class MatchResult(BaseModel):

    is_match: bool = Field(
        description="Whether the candidate matches the job"
    )
    match_score: float = Field(
        description="Match score from 0-100"
    )
    matching_skills: List[str] = Field(
        description="Skills that match the job requirements"
    )
    missing_skills: List[str] = Field(
        description="Required skills the candidate lacks"
    )
    reason: str = Field(
        description="Detailed explanation of the match assessment"
    )


@dataclass
class JobMatch:
    job_id: str
    job_title: str
    company: str
    match_result: MatchResult
    similarity_score: float
