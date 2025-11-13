import json
import logging
from pathlib import Path
from typing import List, Dict
from functools import lru_cache

logger = logging.getLogger(__name__)


class SkillMatcher:

    _skill_relationships: Dict[str, List[str]] = None
    _skill_variations: Dict[str, List[str]] = None
    
    @classmethod
    @lru_cache(maxsize=1)
    def _load_skill_matching_config(cls) -> dict:
        try:
            config_path = Path(__file__).parent.parent.parent / 'data' / 'skill_matching_config.json'
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading skill matching config: {e}")
            return {
                "skill_relationships": {},
                "skill_variations": {}
            }
    
    @classmethod
    def _get_skill_relationships(cls) -> Dict[str, List[str]]:
        if cls._skill_relationships is None:
            config = cls._load_skill_matching_config()
            cls._skill_relationships = config.get('skill_relationships', {})
        return cls._skill_relationships
    
    @classmethod
    def _get_skill_variations(cls) -> Dict[str, List[str]]:
        if cls._skill_variations is None:
            config = cls._load_skill_matching_config()
            cls._skill_variations = config.get('skill_variations', {})
        return cls._skill_variations
    
    @classmethod
    def find_exact_matches(cls, user_skills: List[str], job_skills: List[str]) -> List[str]:
        """Find direct skill overlaps (case-insensitive, substring matching)"""
        matched_skills = []
        user_skills_lower = {skill.lower().strip(): skill for skill in user_skills}
        
        for job_skill in job_skills:
            job_skill_lower = job_skill.lower().strip()
            
            # Check for exact or substring matches
            for user_skill_lower in user_skills_lower.keys():
                if (user_skill_lower == job_skill_lower or
                    user_skill_lower in job_skill_lower or
                    job_skill_lower in user_skill_lower):
                    matched_skills.append(job_skill)
                    break
        
        return matched_skills
    
    @classmethod
    def find_partial_matches(cls, user_skills: List[str], job_skills: List[str]) -> List[str]:
        """Find related skills using relationship mappings"""
        partial_matches = []
        user_skills_lower = [skill.lower().strip() for skill in user_skills]
        exact_matches = cls.find_exact_matches(user_skills, job_skills)
        exact_matches_lower = [skill.lower().strip() for skill in exact_matches]
        
        for job_skill in job_skills:
            job_skill_lower = job_skill.lower().strip()
            
            # Skip if already exact match
            if job_skill_lower in exact_matches_lower:
                continue
            
            # Check if any user skill is related
            for user_skill_lower in user_skills_lower:
                if cls.check_skill_relationship(user_skill_lower, job_skill_lower):
                    partial_matches.append(job_skill)
                    break
        
        return partial_matches
    
    @classmethod
    def find_missing_skills(
        cls,
        user_skills: List[str],
        job_skills: List[str]
    ) -> List[str]:
        exact_matches = cls.find_exact_matches(user_skills, job_skills)
        partial_matches = cls.find_partial_matches(user_skills, job_skills)
        all_matches = set(exact_matches + partial_matches)
        
        return [skill for skill in job_skills if skill not in all_matches]
    
    @classmethod
    def check_skill_relationship(cls, user_skill: str, job_skill: str) -> bool:
        """Check if two skills are related via relationship mapping"""
        skill_relationships = cls._get_skill_relationships()
        skill_variations = cls._get_skill_variations()
        
        # Check direct relationships
        for key, related_skills in skill_relationships.items():
            if key in user_skill and job_skill in related_skills:
                return True
            if key in job_skill and user_skill in related_skills:
                return True
            # Check if both are in the same relationship group
            if user_skill in related_skills and job_skill in related_skills:
                return True
        
        # Check variations
        for main_skill, variations in skill_variations.items():
            if (user_skill in variations or user_skill == main_skill) and \
               (job_skill in variations or job_skill == main_skill):
                return True
        
        return False
    
    @classmethod
    def skills_match_with_variations(cls, user_skill: str, job_skill: str) -> bool:
        user_skill = user_skill.lower().strip()
        job_skill = job_skill.lower().strip()
        
        # Exact match
        if user_skill == job_skill:
            return True
        
        # Normalize spacing, hyphens, underscores
        user_normalized = user_skill.replace(' ', '').replace('-', '').replace('_', '')
        job_normalized = job_skill.replace(' ', '').replace('-', '').replace('_', '')
        
        if user_normalized == job_normalized:
            return True
        
        # Check if one contains the other
        if (user_skill in job_skill or
            job_skill in user_skill or
            user_normalized in job_normalized or
            job_normalized in user_normalized):
            return True
        
        # Check skill variations
        skill_variations = cls._get_skill_variations()
        for main_skill, variations in skill_variations.items():
            if (user_skill in variations or user_skill == main_skill or
                job_skill in variations or job_skill == main_skill or
                user_normalized in variations or user_normalized == main_skill or
                job_normalized in variations or job_normalized == main_skill):
                return True
        
        # Check reverse mappings
        for main_skill, variations in skill_variations.items():
            if user_skill == main_skill and job_skill in variations:
                return True
            if job_skill == main_skill and user_skill in variations:
                return True
        
        return False
    
    @classmethod
    def calculate_skill_coverage(
        cls,
        user_skills: List[str],
        job_skills: List[str]
    ) -> float:
        if not job_skills:
            return 1.0
        
        exact_matches = cls.find_exact_matches(user_skills, job_skills)
        return len(exact_matches) / len(job_skills)
    
    @classmethod
    def calculate_weighted_match_score(
        cls,
        user_skills: List[str],
        job_skills: List[str]
    ) -> float:
        if not job_skills:
            return 0.5  # Neutral score if no requirements
        
        exact_matches = cls.find_exact_matches(user_skills, job_skills)
        partial_matches = cls.find_partial_matches(user_skills, job_skills)
        
        # Direct matches contribute 100%, partial matches contribute 50%
        weighted_matches = len(exact_matches) + (len(partial_matches) * 0.5)
        match_score = weighted_matches / len(job_skills)
        
        # Cap at 98% for realism (no perfect matches)
        return min(match_score, 0.98)
