import logging
import asyncio
from typing import List, Dict
from dataclasses import dataclass

from database.user_db import UserDatabase
from database.job_db import JobDatabase
from database.models.user_models import UserSkill, UserJobMatch
from database.models.job_models import Job
from core.rag import TextEmbedder 
from core.matching import JobMatcher

logger = logging.getLogger(__name__)

@dataclass
class JobMatchResult:
    job: Job
    match_score: float
    matched_skills: List[str]
    missing_critical_skills: List[str]
    skill_coverage: float
    confidence: str
    ai_reasoning: str  # AI explanation for the match
    skill_gap_analysis: Dict[str, str]  # Detailed analysis of skill gaps


class JobMatchingService:
    async def save_user_job(self, user_id: str, job_id: str):
        return self.user_db.save_user_job(user_id, job_id)

    async def remove_user_saved_job(self, user_id: str, job_id: str):
        return self.user_db.remove_user_saved_job(user_id, job_id)

    async def get_user_saved_jobs(self, user_id: str, limit: int = 50):
        saved_jobs = self.user_db.get_user_saved_jobs(user_id, limit)
        jobs = []
        for saved in saved_jobs:
            job = self.job_db.get_job_by_id(saved.job_id)
            if job:
                jobs.append(job)
        return jobs
    def __init__(self, user_db: UserDatabase = None, job_db: JobDatabase = None):
        self.user_db = user_db or UserDatabase()
        self.job_db = job_db or JobDatabase()
        self.embedder = TextEmbedder()
        
        # Initialize AI matcher
        try:
            logger.info("🚀 Initializing JobMatcher with AI capabilities...")
            self.matcher = JobMatcher()  # Our existing AI matcher
            logger.info("✅ JobMatcher initialized successfully with AI")
        except Exception as e:
            logger.error(f"❌ CRITICAL: Failed to initialize JobMatcher: {str(e)}")
            logger.error(f"❌ Error type: {type(e).__name__}")
            import traceback
            logger.error(f"❌ Traceback: {traceback.format_exc()}")
            raise  # Re-raise to prevent service from working without AI

        # AI matching parameters
        self.MINIMUM_MATCH_SCORE = 0.4  # Lower threshold for AI decisions
        self.HIGH_CONFIDENCE_THRESHOLD = 0.75
        self.MEDIUM_CONFIDENCE_THRESHOLD = 0.55

    def get_combined_user_skills(self, user_id: str) -> List[UserSkill]:
        """
        Get all user skills from both resume parsing AND manual resume builder entry.
        Combines skills from both sources, avoiding duplicates.
        """
        # Get all skills from database (includes both resume-uploaded and manually entered)
        all_skills = self.user_db.get_user_skills(user_id)

        # Group by skill name to avoid duplicates, keeping the one with higher confidence
        skill_map = {}
        for skill in all_skills:
            key = skill.skill_name.lower().strip()
            if key not in skill_map or skill.confidence_score > skill_map[key].confidence_score:
                skill_map[key] = skill

        return list(skill_map.values())

    async def find_job_matches(self, user_id: str, limit: int = 20) -> List[JobMatchResult]:
        try:
            # Get combined user skills (resume + manual entry)
            user_skills = self.get_combined_user_skills(user_id)
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
        # Disabled semantic matching to ensure only user's actual skills are considered
        return []

    async def _ai_analyze_top_candidates(self, user_skills: List[UserSkill], jobs: List[Job]) -> List[JobMatchResult]:
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
        def ranking_key(match):
            confidence_score = {"high": 3, "medium": 2, "low": 1}.get(match.confidence, 1)
            return (match.match_score, confidence_score, match.skill_coverage)
        
        matches.sort(key=ranking_key, reverse=True)
        return matches

    def _find_exact_matches(self, user_skills: List[str], job_skills: List[str]) -> List[str]:
        matches = []
        user_skills_lower = [skill.lower().strip() for skill in user_skills]

        for job_skill in job_skills:
            job_skill_lower = job_skill.lower().strip()
            for user_skill_lower in user_skills_lower:
                # Strict matching: only if user skill is directly related to job skill
                if (user_skill_lower == job_skill_lower or
                    user_skill_lower in job_skill_lower or
                    job_skill_lower in user_skill_lower):
                    matches.append(job_skill)  # Keep original job skill name
                    break
        return matches

    def _keyword_similarity_matches(self, user_skills: List[str], job_skills: List[str]) -> List[str]:
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
        if match_score >= 0.8 and skill_coverage >= 0.7:
            return "high"
        elif match_score >= 0.6 and skill_coverage >= 0.5:
            return "medium"
        else:
            return "low"

    def _prepare_user_skill_context(self, user_skills: List[UserSkill]) -> Dict[str, any]:
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
        # Prepare job context
        job_context = self._prepare_job_context(job)
        
        # Use our enhanced AI matcher for comprehensive analysis
        try:
            logger.info(f"🔍 Starting AI match for job: {job.title} at {job.company}")
            
            # Extract skill names from user skills
            user_skill_names = [skill.skill_name for skill in user_skills]
            job_skills = job_context['required_skills']
            
            logger.info(f"📊 User has {len(user_skill_names)} skills, job requires {len(job_skills)} skills")
            logger.info(f"🤖 Calling AI matcher.calculate_compatibility()...")
            
            ai_match_result = await asyncio.wait_for(
                self.matcher.calculate_compatibility(
                    user_skills=user_skill_names,
                    job_skills=job_skills,
                    job_title=job.title,
                    company=job.company
                ),
                timeout=70.0  # 70 second timeout (20 jobs × 3.3s = ~66s)
            )
            
            logger.info(f"✅ AI matcher returned result for {job.title}")
            
            # Extract comprehensive AI insights
            match_score = ai_match_result.get('compatibility_score', 0.0)
            reasoning = ai_match_result.get('ai_reasoning', 'AI analysis completed')
            matched_skills = ai_match_result.get('matched_skills', [])
            partial_matches = ai_match_result.get('partial_matches', [])
            missing_skills = ai_match_result.get('missing_skills', [])
            skill_gaps = ai_match_result.get('skill_gap_analysis', {})
            
            # Calculate enhanced metrics
            skill_coverage = ai_match_result.get('skill_coverage', 0.0)
            confidence = ai_match_result.get('confidence', 'low')
            
            # Combine matched and partial matches for display
            all_matched = matched_skills + [f"{skill} (related)" for skill in partial_matches]
            
            return JobMatchResult(
                job=job,
                match_score=match_score,
                matched_skills=all_matched,
                missing_critical_skills=missing_skills,
                skill_coverage=skill_coverage,
                confidence=confidence,
                ai_reasoning=reasoning,  # Full comprehensive AI analysis
                skill_gap_analysis=skill_gaps
            )
            
        except asyncio.TimeoutError:
            logger.error(f"⏰ AI ANALYSIS TIMEOUT for job {job.id} ({job.title}), using fallback")
            return await self._simple_calculate_job_match(user_skills, job)
        except Exception as e:
            logger.error(f"❌ AI ANALYSIS FAILED for job {job.id} ({job.title})")
            logger.error(f"❌ Error type: {type(e).__name__}")
            logger.error(f"❌ Error message: {str(e)}")
            logger.error(f"❌ Full error: {repr(e)}")
            import traceback
            logger.error(f"❌ Traceback: {traceback.format_exc()}")
            return await self._simple_calculate_job_match(user_skills, job)

    async def _simple_calculate_job_match(self, user_skills: List[UserSkill], job: Job) -> JobMatchResult:
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
            
            # Find matches - only exact matches, no semantic guessing
            exact_matches = self._find_exact_matches(user_skill_names, job_skills)

            # Combine matches (avoid duplicates)
            all_matched_skills = list(set(exact_matches))
            
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
            
            # Fallback when AI analysis is not available
            num_matches = len(all_matched_skills)
            num_missing = len(missing_skills)
            return JobMatchResult(
                job=job,
                match_score=match_score,
                matched_skills=all_matched_skills,
                missing_critical_skills=missing_skills,
                skill_coverage=skill_coverage,
                confidence=confidence,
                ai_reasoning=f"**Match Analysis:** Based on keyword matching, you have {num_matches} matching skills out of {len(job_skills)} required ({round(skill_coverage * 100, 1)}% coverage). This is a {confidence} confidence match. {'Strong match - consider applying!' if match_score >= 0.6 else 'Moderate match - review the requirements carefully.' if match_score >= 0.4 else 'Lower match - you may need to develop key skills first.'}",
                skill_gap_analysis={"note": "Basic keyword analysis", "missing_count": num_missing}
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
        if not required_skills:
            return 1.0
        return len(matched_skills) / len(required_skills)

    def _determine_ai_confidence(self, match_score: float, skill_coverage: float, matched_count: int) -> str:
        if match_score >= self.HIGH_CONFIDENCE_THRESHOLD and skill_coverage >= 0.7 and matched_count >= 3:
            return "high"
        elif match_score >= self.MEDIUM_CONFIDENCE_THRESHOLD and skill_coverage >= 0.4:
            return "medium"
        else:
            return "low"

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
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
        saved_matches = []

        try:
            for match in matches:
                try:
                    user_job_match = self.user_db.save_job_match(
                        user_id=user_id,
                        job_id=match.job.id,
                        match_score=match.match_score,
                        matched_skills=match.matched_skills,
                        missing_critical_skills=match.missing_critical_skills,
                        skill_coverage=match.skill_coverage,
                        confidence=match.confidence,
                        ai_reasoning=match.ai_reasoning
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
        try:
            # Get existing matches to avoid duplicates (keep previous matches!)
            existing_matches = self.user_db.get_user_job_matches(user_id, limit=1000)  # Get all existing
            existing_job_ids = {m.job_id for m in existing_matches} if existing_matches else set()
            
            logger.info(f"User {user_id} has {len(existing_job_ids)} existing matches")
            
            # Find AI-powered matches
            matches = await self.find_job_matches(user_id, limit=50)  # Find up to 50 potential matches
            
            if not matches:
                return {
                    "success": True,
                    "message": "No new matches found",
                    "matches_found": 0,
                    "matches_saved": 0,
                    "existing_matches": len(existing_job_ids),
                    "new_matches": 0,
                    "duplicates_skipped": 0,
                    "total_matches_now": len(existing_job_ids),
                    "ai_analysis": "No new suitable jobs found using AI matching criteria"
                }
            
            # Separate new matches from existing ones
            new_matches = []
            duplicate_matches = []
            
            for match in matches:
                if match.job.id in existing_job_ids:
                    duplicate_matches.append(match)
                else:
                    new_matches.append(match)
            
            duplicate_count = len(duplicate_matches)
            
            logger.info(f"Found {len(matches)} total matches: {len(new_matches)} new, {duplicate_count} duplicates")
            
            # Save only new matches (this will preserve old ones)
            saved_matches = []
            if new_matches:
                saved_matches = await self.save_job_matches(user_id, new_matches)
                logger.info(f"Successfully saved {len(saved_matches)} new matches")
            
            # Create detailed summary with AI insights
            high_confidence = [m for m in new_matches if m.confidence == "high"]
            medium_confidence = [m for m in new_matches if m.confidence == "medium"]
            
            summary = {
                "success": True,
                "message": f"Added {len(saved_matches)} new job matches" + (f" ({duplicate_count} already existed)" if duplicate_count > 0 else ""),
                "matches_found": len(matches),
                "matches_saved": len(saved_matches),
                "existing_matches": len(existing_job_ids),
                "new_matches": len(saved_matches),
                "duplicates_skipped": duplicate_count,
                "total_matches_now": len(existing_job_ids) + len(saved_matches),
                "average_score": sum(m.match_score for m in new_matches) / len(new_matches) if new_matches else 0,
                "high_confidence_matches": len(high_confidence),
                "medium_confidence_matches": len(medium_confidence),
                "top_match_score": new_matches[0].match_score if new_matches else 0,
                "ai_analysis": f"AI analyzed {len(matches)} potential matches, added {len(saved_matches)} new ones",
                "top_match_reasoning": new_matches[0].ai_reasoning if new_matches else None
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error in update_matches_for_user: {str(e)}")
            return {
                "success": False,
                "message": f"Error in AI matching: {str(e)}",
                "matches_found": 0,
                "matches_saved": 0,
                "new_matches": 0,
                "duplicates_skipped": 0,
                "total_matches_now": 0,
                "ai_analysis": "AI matching workflow failed"
            }

