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
        self.llm = ChatAnthropic(model="claude-3-haiku-20240307", temperature=0)
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
        return f"Job content for {job_id} - implement database fetch here"
    
    async def calculate_compatibility(self, user_skills: List[str], job_skills: List[str], job_title: str, company: str) -> Dict:
        try:
            # Create detailed prompts for AI analysis
            user_skills_text = ", ".join(user_skills)
            job_skills_text = ", ".join(job_skills)
            
            analysis_prompt = f"""
            As an expert career counselor and hiring manager, analyze the compatibility between a candidate's skills and job requirements.

            Candidate Skills: {user_skills_text}
            Job Requirements: {job_skills_text}
            Position: {job_title} at {company}

            Provide a comprehensive analysis including:
            1. Overall compatibility score (0-100)
            2. Matching skills and their relevance
            3. Missing critical skills and their impact
            4. Skill gaps that can be bridged with training
            5. Overall assessment reasoning

            Be precise and professional in your assessment.
            """

            # Get AI response
            response = await self.llm.ainvoke(analysis_prompt)
            ai_analysis = response.content

            # Calculate basic metrics
            matched_skills = []
            missing_skills = []
            
            for job_skill in job_skills:
                skill_matched = False
                for user_skill in user_skills:
                    if self._skills_match(user_skill.lower(), job_skill.lower()):
                        matched_skills.append(job_skill)
                        skill_matched = True
                        break
                if not skill_matched:
                    missing_skills.append(job_skill)

            # Calculate scores
            skill_coverage = len(matched_skills) / len(job_skills) if job_skills else 0
            compatibility_score = min(skill_coverage * 100, 95)  # Cap at 95% for realistic scoring
            
            # Determine confidence level
            if skill_coverage >= 0.8:
                confidence = "high"
            elif skill_coverage >= 0.5:
                confidence = "medium"
            else:
                confidence = "low"

            return {
                "compatibility_score": compatibility_score / 100,  # Normalize to 0-1
                "confidence": confidence,
                "skill_coverage": skill_coverage,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "ai_reasoning": ai_analysis,
                "skill_gap_analysis": {
                    "critical_gaps": missing_skills[:3],  # Top 3 missing skills
                    "trainable_skills": missing_skills[3:],  # Other missing skills
                    "strength_areas": matched_skills[:5]  # Top 5 matched skills
                }
            }

        except Exception as e:
            matched_count = len([skill for skill in user_skills if any(self._skills_match(skill.lower(), job_skill.lower()) for job_skill in job_skills)])
            basic_score = matched_count / len(job_skills) if job_skills else 0
            
            return {
                "compatibility_score": basic_score,
                "confidence": "low",
                "skill_coverage": basic_score,
                "matched_skills": [],
                "missing_skills": job_skills,
                "ai_reasoning": f"Basic calculation fallback due to error: {str(e)}",
                "skill_gap_analysis": {
                    "critical_gaps": job_skills,
                    "trainable_skills": [],
                    "strength_areas": []
                }
            }

    def _skills_match(self, user_skill: str, job_skill: str) -> bool:
        user_skill = user_skill.lower().strip()
        job_skill = job_skill.lower().strip()
        
        # Exact match
        if user_skill == job_skill:
            return True
        
        # Check if one skill contains the other
        if user_skill in job_skill or job_skill in user_skill:
            return True
        
        # Common skill mappings
        skill_mappings = {
            'js': 'javascript',
            'ts': 'typescript',
            'react.js': 'react',
            'node.js': 'nodejs',
            'vue.js': 'vue',
            'mongodb': 'mongo',
            'postgresql': 'postgres',
            'mysql': 'sql',
        }
        
        # Normalize using mappings
        normalized_user = skill_mappings.get(user_skill, user_skill)
        normalized_job = skill_mappings.get(job_skill, job_skill)
        
        return normalized_user == normalized_job or normalized_user in normalized_job or normalized_job in normalized_user

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
        