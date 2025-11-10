import re
from typing import List

from .models import ResumeSkills
from utils.config_loader import load_skill_normalizations
from utils.text_utils import apply_smart_casing, normalize_skill_capitalization
from utils.validation_utils import is_valid_skill


class SkillNormalizer:
    """Utilities for normalizing and validating extracted skills."""
    
    @classmethod
    def normalize_skills(cls, skills: ResumeSkills) -> ResumeSkills:
        skills.technical_skills = cls._normalize_skill_list(skills.technical_skills)
        skills.soft_skills = cls._normalize_skill_list(skills.soft_skills)
        skills.industries = cls._normalize_skill_list(skills.industries)
        
        return skills
    
    @classmethod
    def _normalize_skill_list(cls, skill_list: List[str]) -> List[str]:
        SKILL_NORMALIZATIONS = load_skill_normalizations()
        normalized = []
        seen_normalized = set()
        
        for skill in skill_list:
            if not skill or not skill.strip():
                continue
                
            skill_cleaned = skill.strip()
            skill_lower = skill_cleaned.lower()
            
            skill_normalized_format = skill_lower.replace('_', ' ').replace('-', ' ')
            skill_normalized_format = ' '.join(skill_normalized_format.split())
            
            if skill_lower in SKILL_NORMALIZATIONS:
                normalized_skill = SKILL_NORMALIZATIONS[skill_lower]
            elif skill_normalized_format in SKILL_NORMALIZATIONS:
                normalized_skill = SKILL_NORMALIZATIONS[skill_normalized_format]
            elif skill_lower.replace('.', '').replace('/', '') in SKILL_NORMALIZATIONS:
                normalized_skill = SKILL_NORMALIZATIONS[skill_lower.replace('.', '').replace('/', '')]
            else:
                normalized_skill = apply_smart_casing(skill_cleaned)
            
            if normalized_skill.lower() not in seen_normalized:
                normalized.append(normalized_skill)
                seen_normalized.add(normalized_skill.lower())
        
        return normalized
    
    @staticmethod
    def validate_skills(skills: ResumeSkills) -> ResumeSkills:
        
        valid_short_skills = {'r', 'c', 'go', 'c#', 'c++', 'ui', 'ux', 'ml'}
        ai_variations = {'ai', 'AI', 'Ai', 'a.i.', 'A.I.'}
        
        skills.technical_skills = list(set(
            normalize_skill_capitalization(skill, ai_variations)
            for skill in [s.strip() for s in skills.technical_skills] 
            if is_valid_skill(skill, valid_short_skills, ai_variations)
        ))
        skills.soft_skills = list(set(
            normalize_skill_capitalization(skill, ai_variations)
            for skill in [s.strip() for s in skills.soft_skills] 
            if is_valid_skill(skill, valid_short_skills, ai_variations)
        ))
        skills.job_titles = list(set(filter(bool, [title.strip() for title in skills.job_titles])))
        skills.industries = list(set(filter(bool, [industry.strip() for industry in skills.industries])))
        
        # Validate experience years
        if skills.experience_years is not None:
            skills.experience_years = max(0, min(70, skills.experience_years))
        
        return skills
