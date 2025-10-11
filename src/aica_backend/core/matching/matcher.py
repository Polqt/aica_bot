import logging
from typing import List, Dict, Optional
import os

from langchain_anthropic import ChatAnthropic
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate

from .models import MatchResult, JobMatch
from .skill_matcher import SkillMatcher
from .scorer import MatchScorer
from .ai_analyzer import AIAnalyzer

from core.embedder import VectorJobStore, TextEmbedder
from core.resume import ParsedResume

from database.user_db import UserDatabase
from database.job_db import JobDatabase

logger = logging.getLogger(__name__)


class JobMatcher:

    def __init__(self):
        try:
            # Check for API key
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                logger.error("❌ ANTHROPIC_API_KEY environment variable is not set!")
                raise ValueError("ANTHROPIC_API_KEY is required")
            
            logger.info(f"✅ ANTHROPIC_API_KEY found (starts with: {api_key[:10]}...)")
            logger.info("Initializing ChatAnthropic LLM...")
            
            self.llm = ChatAnthropic(
                model="claude-3-haiku-20240307", 
                temperature=0,
                timeout=30,  # 30 second timeout for API calls
                max_retries=2  # Retry failed requests up to 2 times
            )
            self.parser = PydanticOutputParser(pydantic_object=MatchResult)
            self.ai_analyzer = AIAnalyzer(self.llm)
            logger.info("✅ ChatAnthropic LLM initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize ChatAnthropic LLM: {str(e)}")
            raise
        
        # Initialize vector search components
        try:
            self.embedder = TextEmbedder()
            self.vector_store = VectorJobStore(self.embedder)
            self.use_vector_search = True
        except Exception as e:
            logger.warning(f"Vector search initialization failed: {str(e)}")
            self.embedder = None
            self.vector_store = None
            self.use_vector_search = False
        
        # Prompt for basic match evaluation
        self.match_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert job interviewer. Analyze resumes against job postings 
and provide detailed matching assessment. Be thorough and fair in your evaluation."""),
            ("human", """Resume Information:\n{resume_info}\n\n
Job Posting:\n{job_posting}\n\n
Provide a detailed match analysis.\n{format_instructions}""")
        ])
    
    async def add_job_to_index(
        self,
        job_id: str,
        job_content: str,
        metadata: Dict = None
    ) -> None:
        if self.vector_store:
            self.vector_store.add_job(job_id, job_content, metadata)
    
    async def find_matching_jobs(
        self,
        resume_text: str,
        top_k: int = 20
    ) -> List[JobMatch]:
        if self.use_vector_search and self.vector_store:
            return await self._find_matching_jobs_vector(resume_text, top_k)
        else:
            return await self._find_matching_jobs_direct(resume_text, top_k)
    
    async def _find_matching_jobs_vector(
        self,
        resume_text: str,
        top_k: int = 20
    ) -> List[JobMatch]:
        search_text = self._create_search_text_from_resume_text(resume_text)
        similar_jobs = self.vector_store.search_similar_jobs(search_text, k=top_k)
        
        job_matches = []
        for job_data in similar_jobs:
            job_content = await self._get_job_content(job_data["job_id"])
            if not job_content:
                continue
            
            match_result = await self._evaluate_text_based_match(resume_text, job_content)
            
            job_match = JobMatch(
                job_id=job_data["job_id"],
                job_title=job_data["metadata"].get("title", "Unknown"),
                company=job_data["metadata"].get("company", "Unknown"),
                match_result=match_result,
                similarity_score=job_data["similarity_score"]
            )
            job_matches.append(job_match)
        
        job_matches.sort(key=lambda x: x.match_result.match_score, reverse=True)
        return job_matches
    
    async def _find_matching_jobs_direct(
        self,
        resume_text: str,
        top_k: int = 20
    ) -> List[JobMatch]:
        job_db = JobDatabase()
        all_jobs = job_db.get_all_jobs(limit=top_k * 2)
        
        if not all_jobs:
            return []
        
        job_matches = []
        for job in all_jobs:
            try:
                job_content = f"""
                Title: {job.title}
                Company: {job.company}
                Location: {job.location}
                Description: {job.description}
                Requirements: {job.requirements}
                Skills: {', '.join(job.skills) if job.skills else 'None specified'}
                """
                
                match_result = await self._evaluate_text_based_match(resume_text, job_content)
                
                if match_result.match_score >= 30:
                    job_match = JobMatch(
                        job_id=job.id,
                        job_title=job.title,
                        company=job.company,
                        match_result=match_result,
                        similarity_score=1.0 - (match_result.match_score / 100)
                    )
                    job_matches.append(job_match)
            
            except Exception as e:
                logger.warning(f"Error evaluating job {job.id}: {str(e)}")
                continue
        
        job_matches.sort(key=lambda x: x.match_result.match_score, reverse=True)
        return job_matches[:top_k]
    
    async def find_matches_for_user(
        self,
        user_id: str,
        top_k: int = 20
    ) -> List[JobMatch]:
        try:
            user_db = UserDatabase()
            job_db = JobDatabase()
            
            # Get user's skills
            user_skills = user_db.get_user_skills(user_id)
            if not user_skills:
                return []
            
            # Create skills text for matching
            skills_text = self._create_skills_text(user_skills)
            
            # Find matching jobs
            job_matches = await self.find_matching_jobs(skills_text, top_k)
            
            # Store matches with detailed analysis
            for match in job_matches:
                try:
                    job = job_db.get_job_by_id(match.job_id)
                    if job:
                        user_skill_names = [skill.skill_name for skill in user_skills]
                        
                        # Calculate detailed compatibility
                        compatibility = await self.calculate_compatibility(
                            user_skill_names,
                            job.skills or [],
                            job.title,
                            job.company
                        )
                        
                        user_db.save_job_match(
                            user_id=user_id,
                            job_id=match.job_id,
                            match_score=compatibility["compatibility_score"],
                            matched_skills=compatibility["matched_skills"],
                            missing_critical_skills=compatibility["missing_skills"],
                            skill_coverage=compatibility["skill_coverage"],
                            confidence=compatibility["confidence"],
                            ai_reasoning=compatibility["ai_reasoning"]
                        )
                    else:
                        # Fallback to basic match
                        user_db.save_job_match(
                            user_id=user_id,
                            job_id=match.job_id,
                            match_score=match.match_result.match_score,
                            matched_skills=match.match_result.matching_skills
                        )
                except Exception as save_error:
                    logger.error(f"Failed to save match for user {user_id}, job {match.job_id}: {save_error}")
            
            return job_matches
        
        except Exception as e:
            logger.error(f"Error finding matches for user {user_id}: {str(e)}")
            return []
    
    async def calculate_compatibility(
        self,
        user_skills: List[str],
        job_skills: List[str],
        job_title: str,
        company: str
    ) -> Dict:
        try:
            # Find exact and partial matches
            matched_skills = SkillMatcher.find_exact_matches(user_skills, job_skills)
            partial_matches = SkillMatcher.find_partial_matches(user_skills, job_skills)
            missing_skills = SkillMatcher.find_missing_skills(user_skills, job_skills)
            
            # Calculate scores
            total_required = len(job_skills) if job_skills else 1
            skill_coverage = len(matched_skills) / total_required
            compatibility_score = SkillMatcher.calculate_weighted_match_score(user_skills, job_skills)
            
            # Determine confidence
            confidence = MatchScorer.calculate_confidence(compatibility_score, skill_coverage)
            
            # Generate comprehensive AI reasoning
            ai_reasoning = await self.ai_analyzer.generate_comprehensive_analysis(
                user_skills,
                job_skills,
                job_title,
                company,
                matched_skills,
                partial_matches,
                missing_skills,
                compatibility_score
            )
            
            # Categorize missing skills
            skill_gap_analysis = MatchScorer.categorize_missing_skills(missing_skills)
            skill_gap_analysis["strength_areas"] = matched_skills[:5]
            
            # Calculate match metrics
            match_metrics = MatchScorer.calculate_match_metrics(
                len(matched_skills),
                len(partial_matches),
                total_required,
                compatibility_score
            )
            
            return {
                "compatibility_score": compatibility_score,
                "confidence": confidence,
                "skill_coverage": skill_coverage,
                "matched_skills": matched_skills,
                "partial_matches": partial_matches,
                "missing_skills": missing_skills,
                "ai_reasoning": ai_reasoning,
                "skill_gap_analysis": skill_gap_analysis,
                "match_metrics": match_metrics
            }
        
        except Exception as e:
            logger.error(f"AI compatibility calculation failed: {str(e)}")
            # Fallback to basic calculation
            matched_count = len([
                skill for skill in user_skills 
                if any(SkillMatcher.skills_match_with_variations(skill, job_skill) 
                      for job_skill in job_skills)
            ])
            basic_score = matched_count / len(job_skills) if job_skills else 0
            
            return {
                "compatibility_score": basic_score,
                "confidence": "low",
                "skill_coverage": basic_score,
                "matched_skills": [],
                "partial_matches": [],
                "missing_skills": job_skills,
                "ai_reasoning": f"Basic calculation used due to error. Match score: {round(basic_score * 100, 1)}%. Please review job requirements and your skills carefully.",
                "skill_gap_analysis": {
                    "critical_gaps": job_skills[:3],
                    "trainable_skills": job_skills[3:6] if len(job_skills) > 3 else [],
                    "advanced_skills": [],
                    "strength_areas": [],
                    "total_gaps": len(job_skills),
                    "gap_severity": "unknown"
                },
                "match_metrics": {
                    "direct_matches": matched_count,
                    "related_matches": 0,
                    "total_required": len(job_skills),
                    "match_percentage": round(basic_score * 100, 1)
                }
            }
    
    def _create_skills_text(self, user_skills) -> str:
        skills_by_category = {}
        
        for skill in user_skills:
            category = skill.skill_category or 'general'
            if category not in skills_by_category:
                skills_by_category[category] = []
            skills_by_category[category].append(skill.skill_name)
        
        text_parts = []
        
        if 'technical' in skills_by_category:
            text_parts.append(f"Technical Skills: {', '.join(skills_by_category['technical'])}")
        
        if 'soft' in skills_by_category:
            text_parts.append(f"Soft Skills: {', '.join(skills_by_category['soft'])}")
        
        if 'industry' in skills_by_category:
            text_parts.append(f"Industry Experience: {', '.join(skills_by_category['industry'])}")
        
        if 'job_title' in skills_by_category:
            text_parts.append(f"Job Titles: {', '.join(skills_by_category['job_title'])}")
        
        return "\n".join(text_parts)
    
    def _create_search_text_from_resume_text(self, resume_text: str) -> str:
        if len(resume_text) < 500:
            return resume_text
        else:
            key_terms = []
            lines = resume_text.lower().split('\n')
            for line in lines:
                if any(keyword in line for keyword in ['skill', 'technology', 'experience', 'proficient']):
                    key_terms.append(line.strip())
            return ' '.join(key_terms[:10])
    
    async def _get_job_content(self, job_id: str) -> Optional[str]:
        try:
            job_db = JobDatabase()
            job = job_db.get_job_by_id(job_id)
            if job:
                return f"""Title: {job.title}
                            Company: {job.company}
                            Description: {job.description}
                            Requirements: {job.requirements}
                            Skills: {', '.join(job.skills) if job.skills else 'None specified'}
                        """
        except Exception as e:
            logger.error(f"Error fetching job {job_id}: {str(e)}")
        return None
    
    async def _evaluate_text_based_match(
        self,
        resume_text: str,
        job_content: str
    ) -> MatchResult:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an expert job matching system. Analyze the compatibility between 
                    a candidate's profile and a job posting. Consider skills alignment, experience relevance, 
                    and requirements fulfillment. Provide a match score (0-100), identify matching skills, 
                    missing skills, and explain your reasoning."""),
                                    ("human", """Candidate Profile:
                    {resume_text}

                    Job Posting:
                    {job_content}

                    {format_instructions}"""
                )
            ])
            
            formatted_prompt = prompt.format_messages(
                resume_text=resume_text,
                job_content=job_content,
                format_instructions=self.parser.get_format_instructions()
            )
            
            response = await self.llm.ainvoke(formatted_prompt)
            return self.parser.parse(response.content)
        
        except Exception as e:
            logger.error(f"Match evaluation failed: {str(e)}")
            return MatchResult(
                match_score=50.0,
                is_match=True,
                matching_skills=["General skills match"],
                missing_skills=["Unable to analyze specific skills"],
                reason="Fallback match due to evaluation error"
            )
