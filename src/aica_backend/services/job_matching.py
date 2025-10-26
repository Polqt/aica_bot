import logging
import asyncio
import traceback
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
    ai_reasoning: str  
    skill_gap_analysis: Dict[str, str]  


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
            self.matcher = JobMatcher()  
        except Exception as e:
            raise  

        # Initial keyword matching uses a much lower threshold to not filter out potential matches
        self.MINIMUM_MATCH_SCORE = 0.3  # Lowered from 0.4 to capture more relevant matches
        self.INITIAL_RANKING_THRESHOLD = 0.01  # Very low threshold for initial ranking - let AI decide
        self.HIGH_CONFIDENCE_THRESHOLD = 0.75
        self.MEDIUM_CONFIDENCE_THRESHOLD = 0.55

    def get_combined_user_skills(self, user_id: str) -> List[UserSkill]:
        # Get all skills from database (includes both resume-uploaded and manually entered)
        all_skills = self.user_db.get_user_skills(user_id)

        # Group by skill name to avoid duplicates, keeping the one with higher confidence
        skill_map = {}
        for skill in all_skills:
            key = skill.skill_name.lower().strip()
            # Handle None confidence_score values properly
            current_confidence = skill.confidence_score if skill.confidence_score is not None else 0.0
            existing_confidence = skill_map[key].confidence_score if key in skill_map and skill_map[key].confidence_score is not None else 0.0
            
            if key not in skill_map or current_confidence > existing_confidence:
                skill_map[key] = skill

        return list(skill_map.values())

    async def find_job_matches(self, user_id: str, limit: int = 20) -> List[JobMatchResult]:
        try:
            # Get combined user skills (resume + manual entry)
            user_skills = self.get_combined_user_skills(user_id)
            if not user_skills:
                return []

            # Get ALL jobs available for matching (now scans up to 10,000 instead of 100)
            jobs = self.job_db.get_jobs_for_matching(limit=1000)
            if not jobs:
                return []

            # Fast exact + keyword matching to rank ALL jobs efficiently
            print(f"📊 Step 1: Screening all {len(jobs)} jobs for potential matches...")
            ranked_jobs = await self._rank_all_jobs_by_relevance(user_skills, jobs)
            
            print(f"📊 Found {len(ranked_jobs)} relevant jobs (score >= {self.MINIMUM_MATCH_SCORE})")
            
            # STEP 2: AI analysis for top candidates only (to save API costs)
            # But now we're analyzing from a much larger pool of properly ranked jobs
            top_candidates = ranked_jobs[:min(limit * 3, len(ranked_jobs))]
            print(f"🤖 Step 2: AI analysis of top {len(top_candidates)} candidates...")

            # Prepare user context once for all AI calls
            user_context = self._prepare_user_skill_context(user_skills)
            ai_matches = []

            # Limit AI calls to 15 for cost control
            max_ai_calls = min(len(top_candidates), 15)
            logger.info(f"📈 Running AI analysis on {max_ai_calls} top candidates")

            for i, job in enumerate(top_candidates[:max_ai_calls]):
                try:
                    print(f"   🤖 AI analyzing job {i+1}/{max_ai_calls}: {job.title} at {job.company}")
                    match_result = await self._ai_calculate_job_match_fast(user_context, user_skills, job)

                    # Safe comparison with None check
                    match_score = match_result.match_score if match_result.match_score is not None else 0.0
                    if match_score >= self.MINIMUM_MATCH_SCORE:
                        ai_matches.append(match_result)

                except Exception as e:
                    logger.error(f"Error in AI analysis for job {job.id}: {e}")
                    continue

            logger.info(f"✅ Found {len(ai_matches)} matches from AI analysis")
            
            # STEP 3: Final ranking and selection
            final_matches = self._rank_final_matches(ai_matches)
            
            logger.info(f"🏆 Returning {len(final_matches)} final matches after ranking")
            for i, match in enumerate(final_matches[:5]):
                logger.info(f"   Match {i+1}: {match.job.title} - Score: {match.match_score}, Confidence: {match.confidence}")
            
            return final_matches[:limit]

        except Exception as e:
            logger.error(f"Error in comprehensive AI job matching for user {user_id}: {str(e)}")
            traceback.print_exc()
            return []

    async def _rank_all_jobs_by_relevance(self, user_skills: List[UserSkill], jobs: List[Job]) -> List[Job]:
        try:
            user_skill_names = [skill.skill_name.lower() for skill in user_skills]
            technical_skills = [skill.skill_name.lower() for skill in user_skills 
                              if skill.skill_category == "technical"]
            
            job_scores = []
            
            for job in jobs:
                if not job.skills or len(job.skills) == 0:
                    continue
                    
                job_skills = [skill.lower().strip() for skill in job.skills if skill.strip()]
                
                # Fast exact + keyword matching (no semantic to save time)
                exact_matches = self._find_exact_matches(user_skill_names, job_skills)
                
                all_matched = exact_matches
                
                # Calculate comprehensive score
                skill_coverage = len(all_matched) / len(job_skills) if job_skills else 0
                technical_bonus = len([s for s in all_matched if s in technical_skills]) * 0.1
                
                quick_score = skill_coverage + technical_bonus
                
                # Include even low-scoring jobs for review
                job_scores.append((job, quick_score))
            
            # Sort by score (descending) and filter by minimum threshold
            job_scores.sort(key=lambda x: x[1], reverse=True)
            # Use lower threshold for initial ranking to pass more jobs to AI analyzer
            # The AI will do the final filtering with the higher MINIMUM_MATCH_SCORE
            filtered_jobs = [
                job for job, score in job_scores 
                if score >= self.INITIAL_RANKING_THRESHOLD
            ]
            
            logger.info(f"✅ Ranked {len(jobs)} jobs: {len(filtered_jobs)} meet initial threshold ({self.INITIAL_RANKING_THRESHOLD}) for AI analysis")
            return filtered_jobs
            
        except Exception as e:
            logger.error(f"Error in job ranking: {e}")
            traceback.print_exc()
            return jobs[:100]  # Fallback

    def _rank_final_matches(self, matches: List[JobMatchResult]) -> List[JobMatchResult]:

        def ranking_key(match):
        # Get confidence score with fallback
            confidence_score = {"high": 3, "medium": 2, "low": 1}.get(match.confidence, 1)
            
            # Handle None values by defaulting to 0.0 for all numeric fields
            match_score = float(match.match_score) if match.match_score is not None else 0.0
            skill_coverage = float(match.skill_coverage) if match.skill_coverage is not None else 0.0
            
            # Return tuple for sorting (all values guaranteed to be comparable)
            return (match_score, confidence_score, skill_coverage)
        
        try:
            matches.sort(key=ranking_key, reverse=True)
        except Exception as e:
            logger.error(f"Error sorting matches: {e}. Returning unsorted matches.")
        
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

    def _prepare_job_context(self, job: Job) -> Dict[str, any]:
        """Prepare job context for AI matching analysis"""
        # Extract required skills from job
        required_skills = []
        if job.skills:
            required_skills.extend(job.skills)
        if job.requirements:
            # Extract skills from requirements if not already in skills
            for req in job.requirements:
                if req not in required_skills:
                    required_skills.append(req)

        return {
            'required_skills': required_skills,
            'job_title': job.title,
            'company': job.company,
            'description': job.description or '',
            'location': job.location or '',
            'job_id': job.id
        }

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

    def _generate_skill_profile_summary(self, skills_by_category: Dict[str, List[Dict]]) -> str:
        summary_parts = []

        # Technical skills
        technical = skills_by_category.get('technical', [])
        if technical:
            tech_names = [s['name'] for s in technical]
            summary_parts.append(f"Technical skills: {', '.join(tech_names[:5])}{'...' if len(tech_names) > 5 else ''}")

        # Soft skills
        soft = skills_by_category.get('soft', [])
        if soft:
            soft_names = [s['name'] for s in soft]
            summary_parts.append(f"Soft skills: {', '.join(soft_names[:3])}{'...' if len(soft_names) > 3 else ''}")

        # Industries
        industries = skills_by_category.get('industry', [])
        if industries:
            industry_names = [s['name'] for s in industries]
            summary_parts.append(f"Industry experience: {', '.join(industry_names)}")

        return '. '.join(summary_parts) if summary_parts else "No skills information available"

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
            logger.error(f"⏰ AI ANALYSIS TIMEOUT for job {job.id} ({job.title})")
            # Return a basic match result instead of fallback
            return JobMatchResult(
                job=job,
                match_score=0.0,
                matched_skills=[],
                missing_critical_skills=[],
                skill_coverage=0.0,
                confidence="low",
                ai_reasoning="AI analysis timed out",
                skill_gap_analysis={}
            )
        except Exception as e:
            logger.error(f"❌ Traceback: {traceback.format_exc()}")
            # Return a basic match result instead of fallback
            return JobMatchResult(
                job=job,
                match_score=0.0,
                matched_skills=[],
                missing_critical_skills=[],
                skill_coverage=0.0,
                confidence="low",
                ai_reasoning="AI analysis failed",
                skill_gap_analysis={}
            )

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
            logger.info(f"📋 Calling find_job_matches for user {user_id}")
            matches = await self.find_job_matches(user_id, limit=50)  # Find up to 50 potential matches
            logger.info(f"📦 find_job_matches returned {len(matches)} matches for user {user_id}")
            
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
