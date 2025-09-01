from langchain_anthropic import ChatAnthropic
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from dataclasses import dataclass

from .embedder import VectorJobStore, TextEmbedder
from .resume_parser import ResumeParser, ParsedResume


class MatchResult(BaseModel):
    is_match: bool = Field(description="Whether the candidate matches the job")
    match_score: float = Field(description="Match score from 0-100")
    matching_skills: List[str] = Field(description="Skills that match the job requirements")
    missing_skills: List[str] = Field(description="Required skills the candidate lacks")
    reason: str = Field(description="Detailed explanation of the match assessment")


@dataclass
class JobMatch:
    job_id: str
    job_title: str
    company: str
    match_result: MatchResult
    similarity_score: float


class JobMatcher:
    def __init__(self):
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0)
        self.parser = PydanticOutputParser(pydantic_object=MatchResult)

        self.embedder = TextEmbedder()
        self.vector_store = VectorJobStore(self.embedder)
        self.resume_parser = ResumeParser()
        
        self.match_prompt = ChatPromptTemplate.from_messages([
            (
                "system", 
                """
                    You are an expert job interviewer. Analyze resumes against job postings 
                    and provide detailed matching assessment. Be thorough and fair in your evaluation.
                """
            ),
            (
                "human",
                """
                    Resume Information:\n{resume_info}\n\n
                    Job Posting:\n{job_posting}\n\n
                    Provide a detailed match analysis.\n{format_instructions}
                """
            )
        ])
    
    async def add_job_to_index(self, job_id: str, job_content: str, metadata: Dict = None) -> None:
        self.vector_store.add_job(job_id, job_content, metadata)
    
    async def find_matching_jobs(self, resume_text: str, top_k: int = 20) -> List[JobMatch]:
        # Parse the resume
        parsed_resume = await self.resume_parser.parse_resume(resume_text)
        
        # Create search text optimized for job matching
        search_text = self.resume_parser.create_search_text(parsed_resume)
        
        # Find similar jobs using vector search
        similar_jobs = self.vector_store.search_similar_jobs(search_text, k=top_k)
        
        # Evaluate each job match
        job_matches = []
        for job_data in similar_jobs:
            # Get full job content (you'll need to fetch this from your database)
            job_content = await self._get_job_content(job_data["job_id"])
            if not job_content:
                continue
            
            # Evaluate the match using LLM
            match_result = await self._evaluate_detailed_match(parsed_resume, job_content)
            
            job_match = JobMatch(
                job_id=job_data["job_id"],
                job_title=job_data["metadata"].get("title", "Unknown"),
                company=job_data["metadata"].get("company", "Unknown"),
                match_result=match_result,
                similarity_score=job_data["similarity_score"]
            )
            job_matches.append(job_match)
        
        # Sort by match score
        job_matches.sort(key=lambda x: x.match_result.match_score, reverse=True)
        return job_matches
    
    async def _evaluate_detailed_match(self, parsed_resume: ParsedResume, job_posting: str) -> MatchResult:
        resume_summary = self._create_resume_summary(parsed_resume)
        
        prompt = self.match_prompt.format_prompt(
            resume_info=resume_summary,
            job_posting=job_posting,
            format_instructions=self.parser.get_format_instructions()
        )
        
        response = await self.llm.ainvoke(prompt)
        return self.parser.parse(response.content)
    
    def _create_resume_summary(self, parsed_resume: ParsedResume) -> str:
        """Create a comprehensive summary of the resume for matching."""
        skills = parsed_resume.skills
        
        summary_parts = [
            f"Technical Skills: {', '.join(skills.technical_skills)}",
            f"Soft Skills: {', '.join(skills.soft_skills)}",
            f"Experience: {skills.experience_years} years" if skills.experience_years else "Experience: Not specified",
            f"Previous Roles: {', '.join(skills.job_titles)}",
            f"Education: {skills.education_level}" if skills.education_level else "Education: Not specified",
            f"Industries: {', '.join(skills.industries)}",
        ]
        
        return "\n".join(filter(None, summary_parts))
    
    async def _get_job_content(self, job_id: str) -> Optional[str]:
        # This should be implemented to fetch job content from your Supabase database
        # For now, returning a placeholder
        return f"Job content for {job_id} - implement database fetch here"
    
    def get_match_statistics(self, job_matches: List[JobMatch]) -> Dict:
        if not job_matches:
            return {"total_jobs": 0, "matches": 0, "average_score": 0}
        
        matches = [job for job in job_matches if job.match_result.is_match]
        total_score = sum(job.match_result.match_score for job in job_matches)
        
        return {
            "total_jobs": len(job_matches),
            "matches": len(matches),
            "match_rate": len(matches) / len(job_matches) * 100,
            "average_score": total_score / len(job_matches),
            "top_score": max(job.match_result.match_score for job in job_matches),
        }
        