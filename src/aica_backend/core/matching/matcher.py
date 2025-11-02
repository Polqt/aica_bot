import logging
from typing import List, Dict
import os

from langchain_anthropic import ChatAnthropic

from .skill_matcher import SkillMatcher
from .scorer import MatchScorer
from .ai_analyzer import AIAnalyzer

logger = logging.getLogger(__name__)


class JobMatcher:

    def __init__(self):
        try:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY is required")
            
            self.llm = ChatAnthropic(
                model="claude-3-haiku-20240307", 
                temperature=0,
                timeout=30,
                max_retries=2
            )
            self.ai_analyzer = AIAnalyzer(self.llm)
        except Exception:
            raise
    
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
