import logging
import json
from typing import List, Dict, Optional
from dataclasses import dataclass

from ..database.user_db import UserDatabase
from ..database.job_db import JobDatabase
from ..database.models.user_models import UserSkill, UserJobMatch
from ..database.models.job_models import Job
from ..core.embedder import TextEmbedder
from ..core.matcher import JobMatcher

logger = logging.getLogger(__name__)


@dataclass
class JobMatchResult:
    """Enhanced result of AI-powered job matching."""
    job: Job
    match_score: float
    matched_skills: List[str]
    missing_critical_skills: List[str]
    skill_coverage: float
    confidence: str
    ai_reasoning: str  # AI explanation for the match
    skill_gap_analysis: Dict[str, str]  # Detailed analysis of skill gaps


class JobMatchingService:
    """
    AI-Powered Job Matching Service using RAG and LLM for intelligent skill matching.
    
    This service uses:
    1. Vector embeddings for semantic similarity
    2. LLM-powered analysis for context understanding
    3. RAG to provide intelligent matching decisions
    """
    
    def __init__(self, user_db: UserDatabase = None, job_db: JobDatabase = None):
        self.user_db = user_db or UserDatabase()
        self.job_db = job_db or JobDatabase()
        self.embedder = TextEmbedder()
        self.matcher = JobMatcher()  # Our existing AI matcher
        
        # AI matching parameters
        self.MINIMUM_MATCH_SCORE = 0.4  # Lower threshold for AI decisions
        self.HIGH_CONFIDENCE_THRESHOLD = 0.75
        self.MEDIUM_CONFIDENCE_THRESHOLD = 0.55

    async def find_job_matches(self, user_id: str, limit: int = 20) -> List[JobMatchResult]:
        """
        Find job matches using optimized AI-powered RAG approach.
        Uses fast vector similarity first, then AI analysis for top candidates.
        
        Args:
            user_id: User ID to find matches for
            limit: Maximum number of matches to return
            
        Returns:
            List of AI-analyzed job matches
        """
        try:
            # Get user skills with context
            user_skills = self.user_db.get_user_skills(user_id)
            if not user_skills:
                logger.warning(f"No skills found for user {user_id}")
                return []

            # Get jobs available for matching
            jobs = self.job_db.get_jobs_for_matching(limit=100)  # Reduced from 500 for faster testing
            if not jobs:
                logger.warning("No jobs available for matching")
                return []

            logger.info(f"🚀 Fast AI matching {len(user_skills)} user skills against {len(jobs)} jobs")

            # STEP 1: Fast vector similarity screening (eliminates most jobs quickly)
            print(f"📊 Step 1: Fast vector similarity screening...")
            potential_matches = await self._fast_similarity_screening(user_skills, jobs, limit * 3)
            
            print(f"📊 Found {len(potential_matches)} potential matches for AI analysis")
            
            # STEP 2: AI analysis for top candidates only
            print(f"🤖 Step 2: AI analysis of top {min(len(potential_matches), limit * 2)} candidates...")
            ai_matches = await self._ai_analyze_top_candidates(user_skills, potential_matches[:limit * 2])
            
            # STEP 3: Final ranking and selection
            final_matches = self._rank_final_matches(ai_matches)
            
            return final_matches[:limit]

        except Exception as e:
            logger.error(f"Error in optimized AI job matching for user {user_id}: {str(e)}")
            return []

    async def _fast_similarity_screening(self, user_skills: List[UserSkill], jobs: List[Job], limit: int) -> List[Job]:
        """
        Fast vector similarity screening to eliminate obviously poor matches.
        """
        try:
            user_skill_names = [skill.skill_name.lower() for skill in user_skills]
            technical_skills = [skill.skill_name.lower() for skill in user_skills 
                              if skill.skill_category == "technical"]
            
            job_scores = []
            
            for job in jobs:
                if not job.skills or len(job.skills) == 0:
                    continue
                    
                job_skills = [skill.lower().strip() for skill in job.skills if skill.strip()]
                
                # Fast exact + semantic matching
                exact_matches = self._find_exact_matches(user_skill_names, job_skills)
                semantic_matches = await self._find_semantic_matches_fast(user_skill_names, job_skills)
                
                all_matched = list(set(exact_matches + semantic_matches))
                
                # Calculate quick score
                skill_coverage = len(all_matched) / len(job_skills) if job_skills else 0
                technical_bonus = len([s for s in all_matched if s in technical_skills]) * 0.1
                
                quick_score = skill_coverage + technical_bonus
                
                if quick_score >= self.MINIMUM_MATCH_SCORE:
                    job_scores.append((job, quick_score))
            
            # Sort by quick score and return top candidates
            job_scores.sort(key=lambda x: x[1], reverse=True)
            return [job for job, _ in job_scores[:limit]]
            
        except Exception as e:
            logger.error(f"Error in fast screening: {e}")
            return jobs[:limit]  # Fallback

    async def _find_semantic_matches_fast(self, user_skills: List[str], job_skills: List[str]) -> List[str]:
        """
        Fast semantic matching using keyword similarity (no embeddings to save time).
        """
        return self._keyword_similarity_matches(user_skills, job_skills)

    async def _ai_analyze_top_candidates(self, user_skills: List[UserSkill], jobs: List[Job]) -> List[JobMatchResult]:
        """
        AI analysis for top job candidates only.
        """
        user_context = self._prepare_user_skill_context(user_skills)
        matches = []
        
        # Limit AI calls to prevent timeout
        max_ai_calls = min(len(jobs), 5)  # Max 5 AI calls for speed
        
        for i, job in enumerate(jobs[:max_ai_calls]):
            try:
                print(f"   🤖 AI analyzing job {i+1}/{max_ai_calls}: {job.title} at {job.company}")
                match_result = await self._ai_calculate_job_match_fast(user_context, user_skills, job)
                
                if match_result.match_score >= self.MINIMUM_MATCH_SCORE:
                    matches.append(match_result)
                    
            except Exception as e:
                logger.error(f"Error in AI analysis for job {job.id}: {e}")
                # Fallback to simple matching
                simple_match = await self._simple_calculate_job_match(user_skills, job)
                if simple_match.match_score >= self.MINIMUM_MATCH_SCORE:
                    matches.append(simple_match)
                continue
        
        # For remaining jobs (if any), use simple matching
        if len(jobs) > max_ai_calls:
            print(f"   ⚡ Simple matching for remaining {len(jobs) - max_ai_calls} jobs...")
            for job in jobs[max_ai_calls:]:
                try:
                    simple_match = await self._simple_calculate_job_match(user_skills, job)
                    if simple_match.match_score >= self.MINIMUM_MATCH_SCORE:
                        matches.append(simple_match)
                except Exception as e:
                    logger.error(f"Error in simple matching for job {job.id}: {e}")
                    continue
        
        return matches

    def _rank_final_matches(self, matches: List[JobMatchResult]) -> List[JobMatchResult]:
        """
        Final ranking considering AI confidence, match score, and skill coverage.
        """
        def ranking_key(match):
            confidence_score = {"high": 3, "medium": 2, "low": 1}.get(match.confidence, 1)
            return (match.match_score, confidence_score, match.skill_coverage)
        
        matches.sort(key=ranking_key, reverse=True)
        return matches

    def _find_exact_matches(self, user_skills: List[str], job_skills: List[str]) -> List[str]:
        """Find exact skill matches between user skills and job requirements."""
        matches = []
        for job_skill in job_skills:
            for user_skill in user_skills:
                if user_skill == job_skill or user_skill in job_skill or job_skill in user_skill:
                    matches.append(job_skill)
                    break
        return matches

    def _keyword_similarity_matches(self, user_skills: List[str], job_skills: List[str]) -> List[str]:
        """Find skill matches using keyword similarity mapping."""
        matches = []
        
        # Define similar skill mappings
        skill_synonyms = {
            'javascript': ['js', 'node.js', 'nodejs', 'react', 'vue', 'angular'],
            'python': ['django', 'flask', 'fastapi', 'pandas', 'numpy'],
            'java': ['spring', 'hibernate', 'maven', 'gradle'],
            'sql': ['mysql', 'postgresql', 'oracle', 'database'],
            'aws': ['amazon web services', 'cloud', 'ec2', 's3', 'lambda'],
            'docker': ['containerization', 'kubernetes', 'k8s'],
            'git': ['github', 'gitlab', 'version control']
        }
        
        for job_skill in job_skills:
            for user_skill in user_skills:
                # Check if skills are related through synonyms
                for main_skill, synonyms in skill_synonyms.items():
                    if (main_skill in user_skill.lower() and job_skill.lower() in synonyms) or \
                       (main_skill in job_skill.lower() and user_skill.lower() in synonyms):
                        matches.append(job_skill)
                        break
        
        return matches

    def _determine_confidence(self, match_score: float, skill_coverage: float) -> str:
        """Determine confidence level based on match metrics."""
        if match_score >= 0.8 and skill_coverage >= 0.7:
            return "high"
        elif match_score >= 0.6 and skill_coverage >= 0.5:
            return "medium"
        else:
            return "low"

    def _prepare_user_skill_context(self, user_skills: List[UserSkill]) -> Dict[str, any]:
        """Prepare structured user skill context for AI analysis."""
        
        # Group skills by category
        skills_by_category = {
            'technical': [],
            'soft': [],
            'industry': [],
            'job_title': []
        }
        
        for skill in user_skills:
            category = skill.skill_category or 'technical'
            skills_by_category[category].append({
                'name': skill.skill_name,
                'confidence': skill.confidence_score or 1.0,
                'source': skill.source or 'resume'
            })
        
        # Calculate skill strength profile
        technical_skills = skills_by_category['technical']
        primary_technical_skills = [s['name'] for s in technical_skills if s['confidence'] >= 0.8]
        
        return {
            'skills_by_category': skills_by_category,
            'total_skills': len(user_skills),
            'technical_skills_count': len(technical_skills),
            'primary_technical_skills': primary_technical_skills,
            'skill_profile_summary': self._generate_skill_profile_summary(skills_by_category)
        }

    def _generate_skill_profile_summary(self, skills_by_category: Dict) -> str:
        """Generate a natural language summary of user's skill profile."""
        
        summary_parts = []
        
        # Technical skills
        tech_skills = [s['name'] for s in skills_by_category['technical']]
        if tech_skills:
            summary_parts.append(f"Technical skills: {', '.join(tech_skills[:8])}")
        
        # Experience level indicators
        job_titles = [s['name'] for s in skills_by_category['job_title']]
        if job_titles:
            summary_parts.append(f"Experience in roles: {', '.join(job_titles)}")
            
        # Industry knowledge
        industries = [s['name'] for s in skills_by_category['industry']]
        if industries:
            summary_parts.append(f"Industry experience: {', '.join(industries)}")
        
        # Soft skills
        soft_skills = [s['name'] for s in skills_by_category['soft']]
        if soft_skills:
            summary_parts.append(f"Soft skills: {', '.join(soft_skills[:5])}")
        
        return ". ".join(summary_parts)

    async def _ai_calculate_job_match(
        self, 
        user_context: Dict[str, any], 
        user_skills: List[UserSkill], 
        job: Job
    ) -> JobMatchResult:
        """
        Use AI/LLM to calculate job match with detailed reasoning.
        """
        
        # Prepare job context
        job_context = self._prepare_job_context(job)
        
        # Use our existing AI matcher for LLM-powered analysis
        try:
            # Extract skill names from user skills
            user_skill_names = [skill.skill_name for skill in user_skills]
            job_skills = job_context['required_skills']
            
            ai_match_result = await self.matcher.calculate_compatibility(
                user_skills=user_skill_names,
                job_skills=job_skills,
                job_title=job.title,
                company=job.company
            )
            
            # Extract AI insights
            match_score = ai_match_result.get('compatibility_score', 0.0)
            reasoning = ai_match_result.get('ai_reasoning', 'AI analysis completed')
            matched_skills = ai_match_result.get('matched_skills', [])
            missing_skills = ai_match_result.get('missing_skills', [])
            skill_gaps = ai_match_result.get('skill_gap_analysis', {})
            
            # Calculate enhanced metrics
            skill_coverage = self._calculate_skill_coverage(matched_skills, job_context['required_skills'])
            confidence = self._determine_ai_confidence(match_score, skill_coverage, len(matched_skills))
            
            return JobMatchResult(
                job=job,
                match_score=match_score,
                matched_skills=matched_skills,
                missing_critical_skills=missing_skills,
                skill_coverage=skill_coverage,
                confidence=confidence,
                ai_reasoning=reasoning,
                skill_gap_analysis=skill_gaps
            )
            
        except Exception as e:
            logger.error(f"AI matching failed for job {job.id}, falling back to vector similarity: {e}")
            # Fallback to vector-based matching if AI fails
            return await self._vector_similarity_match(user_context, user_skills, job)

    async def _ai_calculate_job_match_fast(
        self, 
        user_context: Dict[str, any], 
        user_skills: List[UserSkill], 
        job: Job
    ) -> JobMatchResult:
        """
        Fast AI/LLM job match calculation with timeout protection.
        """
        
        # Prepare job context
        job_context = self._prepare_job_context(job)
        
        # Use our existing AI matcher for LLM-powered analysis with timeout
        try:
            # Extract skill names from user skills
            user_skill_names = [skill.skill_name for skill in user_skills]
            job_skills = job_context['required_skills']
            
            # Add timeout to prevent hanging
            import asyncio
            ai_match_result = await asyncio.wait_for(
                self.matcher.calculate_compatibility(
                    user_skills=user_skill_names,
                    job_skills=job_skills,
                    job_title=job.title,
                    company=job.company
                ),
                timeout=5.0  # 5 second timeout for speed
            )
            
            # Extract AI insights
            match_score = ai_match_result.get('compatibility_score', 0.0)
            reasoning = ai_match_result.get('ai_reasoning', 'AI analysis completed')
            matched_skills = ai_match_result.get('matched_skills', [])
            missing_skills = ai_match_result.get('missing_skills', [])
            skill_gaps = ai_match_result.get('skill_gap_analysis', {})
            
            # Calculate enhanced metrics
            skill_coverage = self._calculate_skill_coverage(matched_skills, job_context['required_skills'])
            confidence = self._determine_ai_confidence(match_score, skill_coverage, len(matched_skills))
            
            return JobMatchResult(
                job=job,
                match_score=match_score,
                matched_skills=matched_skills,
                missing_critical_skills=missing_skills,
                skill_coverage=skill_coverage,
                confidence=confidence,
                ai_reasoning=reasoning,
                skill_gap_analysis=skill_gaps
            )
            
        except Exception as e:
            logger.warning(f"AI analysis failed for job {job.id}: {e}, falling back to simple matching")
            return await self._simple_calculate_job_match(user_skills, job)

    async def _simple_calculate_job_match(self, user_skills: List[UserSkill], job: Job) -> JobMatchResult:
        """
        Simple fallback matching when AI analysis fails or times out.
        """
        try:
            if not job.skills:
                return JobMatchResult(
                    job=job,
                    match_score=0.1,
                    matched_skills=[],
                    missing_critical_skills=job.skills or [],
                    skill_coverage=0.0,
                    confidence="low",
                    ai_reasoning="Simple matching (no job skills listed)",
                    skill_gap_analysis={}
                )

            # Prepare user skill data
            user_skill_names = [skill.skill_name.lower().strip() for skill in user_skills]
            technical_skills = [skill.skill_name.lower().strip() for skill in user_skills 
                               if skill.skill_category == "technical"]
            
            # Prepare job skill data
            job_skills = [skill.lower().strip() for skill in job.skills if skill.strip()]
            
            # Find matches
            exact_matches = self._find_exact_matches(user_skill_names, job_skills)
            semantic_matches = await self._find_semantic_matches_fast(user_skill_names, job_skills)
            
            # Combine all matches (avoid duplicates)
            all_matched_skills = list(set(exact_matches + semantic_matches))
            
            # Calculate scores
            skill_coverage = len(all_matched_skills) / len(job_skills) if job_skills else 0
            
            # Weight technical skills higher
            technical_matches = [skill for skill in all_matched_skills if skill in technical_skills]
            technical_weight = len(technical_matches) * 1.2
            
            # Base match score
            match_score = (skill_coverage * 0.7) + (min(technical_weight / len(job_skills), 0.3))
            match_score = min(match_score, 1.0)  # Cap at 1.0
            
            # Find missing critical skills
            missing_skills = [skill for skill in job_skills if skill not in all_matched_skills]
            
            # Determine confidence level
            confidence = self._determine_confidence(match_score, skill_coverage)
            
            return JobMatchResult(
                job=job,
                match_score=match_score,
                matched_skills=all_matched_skills,
                missing_critical_skills=missing_skills,
                skill_coverage=skill_coverage,
                confidence=confidence,
                ai_reasoning="Simple skill matching (AI analysis not available)",
                skill_gap_analysis={"note": "Basic analysis only"}
            )
            
        except Exception as e:
            logger.error(f"Simple matching failed for job {job.id}: {e}")
            return JobMatchResult(
                job=job,
                match_score=0.0,
                matched_skills=[],
                missing_critical_skills=job.skills or [],
                skill_coverage=0.0,
                confidence="low",
                ai_reasoning="Matching failed",
                skill_gap_analysis={}
            )

    def _prepare_job_context(self, job: Job) -> Dict[str, any]:
        """Prepare structured job context for AI analysis."""
        
        # Extract requirements and skills
        job_skills = job.skills or []
        job_requirements = job.requirements or []
        
        # Combine all job text for context
        job_text_parts = [job.title, job.company]
        if job.description:
            job_text_parts.append(job.description[:500])  # Limit description length
        
        return {
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'required_skills': job_skills,
            'requirements': job_requirements,
            'full_context': " ".join(job_text_parts),
            'skill_count': len(job_skills),
            'has_description': bool(job.description)
        }

    async def _vector_similarity_match(
        self,
        user_context: Dict[str, any], 
        user_skills: List[UserSkill], 
        job: Job
    ) -> JobMatchResult:
        """
        Fallback vector similarity matching when AI is unavailable.
        """
        
        # Create embeddings for comparison
        user_skill_names = [skill.skill_name for skill in user_skills]
        job_skills = job.skills or []
        
        if not job_skills:
            return JobMatchResult(
                job=job,
                match_score=0.2,
                matched_skills=[],
                missing_critical_skills=[],
                skill_coverage=0.0,
                confidence="low",
                ai_reasoning="Job has no specified skills - low relevance match",
                skill_gap_analysis={}
            )
        
        try:
            # Vector similarity using embeddings
            user_embeddings = self.embedder.create_embeddings(user_skill_names)
            job_embeddings = self.embedder.create_embeddings(job_skills)
            
            # Find best matches using cosine similarity
            matched_skills = []
            similarity_scores = []
            
            for i, job_skill in enumerate(job_skills):
                best_similarity = 0.0
                for j, user_skill in enumerate(user_skill_names):
                    if i < len(job_embeddings) and j < len(user_embeddings):
                        similarity = self._cosine_similarity(
                            user_embeddings[j], 
                            job_embeddings[i]
                        )
                        if similarity > best_similarity:
                            best_similarity = similarity
                
                if best_similarity >= 0.7:  # Semantic match threshold
                    matched_skills.append(job_skill)
                    similarity_scores.append(best_similarity)
            
            # Calculate match score
            skill_coverage = len(matched_skills) / len(job_skills)
            avg_similarity = sum(similarity_scores) / len(similarity_scores) if similarity_scores else 0
            match_score = (skill_coverage * 0.6) + (avg_similarity * 0.4)
            
            # Missing skills
            missing_skills = [skill for skill in job_skills if skill not in matched_skills]
            
            return JobMatchResult(
                job=job,
                match_score=match_score,
                matched_skills=matched_skills,
                missing_critical_skills=missing_skills,
                skill_coverage=skill_coverage,
                confidence=self._determine_ai_confidence(match_score, skill_coverage, len(matched_skills)),
                ai_reasoning=f"Vector similarity analysis: {len(matched_skills)}/{len(job_skills)} skills matched with average similarity {avg_similarity:.2f}",
                skill_gap_analysis={"missing_skills": missing_skills}
            )
            
        except Exception as e:
            logger.error(f"Vector similarity matching failed: {e}")
            # Final fallback to basic keyword matching
            return self._basic_keyword_match(user_skills, job)

    def _basic_keyword_match(self, user_skills: List[UserSkill], job: Job) -> JobMatchResult:
        """Most basic fallback matching using keyword overlap."""
        
        user_skill_names = [skill.skill_name.lower() for skill in user_skills]
        job_skills = [skill.lower() for skill in (job.skills or [])]
        
        if not job_skills:
            return JobMatchResult(
                job=job,
                match_score=0.1,
                matched_skills=[],
                missing_critical_skills=[],
                skill_coverage=0.0,
                confidence="low",
                ai_reasoning="Basic keyword matching - job has no specified skills",
                skill_gap_analysis={}
            )
        
        # Simple exact and partial matches
        matched_skills = []
        for job_skill in job_skills:
            for user_skill in user_skill_names:
                if user_skill == job_skill or user_skill in job_skill or job_skill in user_skill:
                    matched_skills.append(job_skill)
                    break
        
        skill_coverage = len(matched_skills) / len(job_skills)
        match_score = skill_coverage * 0.8  # Basic scoring
        missing_skills = [skill for skill in job_skills if skill not in matched_skills]
        
        return JobMatchResult(
            job=job,
            match_score=match_score,
            matched_skills=matched_skills,
            missing_critical_skills=missing_skills,
            skill_coverage=skill_coverage,
            confidence=self._determine_ai_confidence(match_score, skill_coverage, len(matched_skills)),
            ai_reasoning=f"Basic keyword matching: found {len(matched_skills)} exact/partial matches",
            skill_gap_analysis={"analysis": "basic", "missing_skills": missing_skills}
        )

    def _calculate_skill_coverage(self, matched_skills: List[str], required_skills: List[str]) -> float:
        """Calculate what percentage of required skills are covered."""
        if not required_skills:
            return 1.0
        return len(matched_skills) / len(required_skills)

    def _determine_ai_confidence(self, match_score: float, skill_coverage: float, matched_count: int) -> str:
        """Determine confidence level based on AI analysis metrics."""
        
        if match_score >= self.HIGH_CONFIDENCE_THRESHOLD and skill_coverage >= 0.7 and matched_count >= 3:
            return "high"
        elif match_score >= self.MEDIUM_CONFIDENCE_THRESHOLD and skill_coverage >= 0.4:
            return "medium"
        else:
            return "low"

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        try:
            if len(vec1) != len(vec2) or not vec1 or not vec2:
                return 0.0
            
            dot_product = sum(a * b for a, b in zip(vec1, vec2))
            norm_a = sum(a * a for a in vec1) ** 0.5
            norm_b = sum(b * b for b in vec2) ** 0.5
            
            if norm_a == 0 or norm_b == 0:
                return 0.0
                
            return dot_product / (norm_a * norm_b)
        except Exception:
            return 0.0

    async def save_job_matches(self, user_id: str, matches: List[JobMatchResult]) -> List[UserJobMatch]:
        """
        Save AI-analyzed job matches to the database.
        
        Args:
            user_id: The user's ID
            matches: List of AI-analyzed job match results
            
        Returns:
            List of saved UserJobMatch objects
        """
        saved_matches = []
        
        try:
            for match in matches:
                try:
                    user_job_match = self.user_db.save_job_match(
                        user_id=user_id,
                        job_id=match.job.id,
                        match_score=match.match_score,
                        matched_skills=match.matched_skills
                    )
                    saved_matches.append(user_job_match)
                except Exception as e:
                    logger.error(f"Error saving AI match for job {match.job.id}: {str(e)}")
                    continue
            
            logger.info(f"Saved {len(saved_matches)} AI-analyzed job matches for user {user_id}")
            return saved_matches
            
        except Exception as e:
            logger.error(f"Error saving AI job matches for user {user_id}: {str(e)}")
            return []

    async def update_matches_for_user(self, user_id: str) -> Dict[str, any]:
        """
        Complete AI workflow: find matches using LLM and save them to database.
        
        Args:
            user_id: The user's ID
            
        Returns:
            Summary of the AI matching process
        """
        try:
            # Find AI-powered matches
            matches = await self.find_job_matches(user_id)
            
            if not matches:
                return {
                    "success": True,
                    "message": "No AI matches found",
                    "matches_found": 0,
                    "matches_saved": 0,
                    "ai_analysis": "No suitable jobs found using AI matching criteria"
                }
            
            # Save matches
            saved_matches = await self.save_job_matches(user_id, matches)
            
            # Create detailed summary with AI insights
            high_confidence = [m for m in matches if m.confidence == "high"]
            medium_confidence = [m for m in matches if m.confidence == "medium"]
            
            summary = {
                "success": True,
                "message": f"AI found and saved {len(saved_matches)} job matches",
                "matches_found": len(matches),
                "matches_saved": len(saved_matches),
                "average_score": sum(m.match_score for m in matches) / len(matches),
                "high_confidence_matches": len(high_confidence),
                "medium_confidence_matches": len(medium_confidence),
                "top_match_score": matches[0].match_score if matches else 0,
                "ai_analysis": f"AI analyzed {len(matches)} potential matches with detailed reasoning",
                "top_match_reasoning": matches[0].ai_reasoning if matches else None
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error in AI matching workflow for user {user_id}: {str(e)}")
            return {
                "success": False,
                "message": f"Error in AI matching: {str(e)}",
                "matches_found": 0,
                "matches_saved": 0,
                "ai_analysis": "AI matching workflow failed"
            }

    async def save_job_matches(self, user_id: str, matches: List[JobMatchResult]) -> List[UserJobMatch]:
        saved_matches = []
        
        try:
            for match in matches:
                try:
                    user_job_match = self.user_db.save_job_match(
                        user_id=user_id,
                        job_id=match.job.id,
                        match_score=match.match_score,
                        matched_skills=match.matched_skills
                    )
                    saved_matches.append(user_job_match)
                except Exception as e:
                    logger.error(f"Error saving match for job {match.job.id}: {str(e)}")
                    continue
            
            logger.info(f"Saved {len(saved_matches)} job matches for user {user_id}")
            return saved_matches
            
        except Exception as e:
            logger.error(f"Error saving job matches for user {user_id}: {str(e)}")
            return []

    async def update_matches_for_user(self, user_id: str) -> Dict[str, any]:
        try:
            # Find matches
            matches = await self.find_job_matches(user_id)
            
            if not matches:
                return {
                    "success": True,
                    "message": "No matches found",
                    "matches_found": 0,
                    "matches_saved": 0
                }
            
            # Save matches
            saved_matches = await self.save_job_matches(user_id, matches)
            
            # Create summary
            summary = {
                "success": True,
                "message": f"Found and saved {len(saved_matches)} job matches",
                "matches_found": len(matches),
                "matches_saved": len(saved_matches),
                "average_score": sum(m.match_score for m in matches) / len(matches),
                "high_confidence_matches": len([m for m in matches if m.confidence == "high"]),
                "top_match_score": matches[0].match_score if matches else 0
            }
            
            return summary
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Error updating matches: {str(e)}",
                "matches_found": 0,
                "matches_saved": 0
            }
