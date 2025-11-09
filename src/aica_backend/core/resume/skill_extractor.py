import re
import logging
from typing import List, Optional

from .models import ResumeSkills
from utils.config_loader import load_skill_extraction_config, load_skills_data
from utils.pattern_utils import match_skill_pattern
from utils.text_utils import remove_section_from_text

logger = logging.getLogger(__name__)


class SkillExtractor:

    _technical_skills: Optional[List[str]] = None
    _soft_skills: Optional[List[str]] = None
    
    @classmethod
    def _get_technical_keywords(cls) -> List[str]:
        if cls._technical_skills is None:
            cls._technical_skills, _ = load_skills_data()
        return cls._technical_skills
    
    @classmethod
    def _get_soft_keywords(cls) -> List[str]:
        if cls._soft_skills is None:
            _, cls._soft_skills = load_skills_data()
        return cls._soft_skills
    
    @classmethod
    def extract_with_fallback(cls, text: str) -> ResumeSkills:
        text_lower = text.lower()
        
        certification_free_text = cls._remove_certification_sections(text_lower)
        
        found_technical = cls._extract_technical_skills(certification_free_text)
        found_soft = cls._extract_soft_skills(certification_free_text)
        
        experience_years = cls._estimate_experience_years(text)
        education_level = cls._extract_education_level(text)
        industries = cls._extract_industries(text)
        
        return ResumeSkills(
            technical_skills=found_technical,
            soft_skills=found_soft,
            experience_years=experience_years,
            job_titles=[],
            education_level=education_level,
            industries=industries
        )
    
    @classmethod
    def _remove_certification_sections(cls, text: str) -> str:
        config = load_skill_extraction_config()
        return remove_section_from_text(
            text,
            config.get('cert_headers', []),
            config.get('other_headers', [])
        )
    
    @classmethod
    def _extract_technical_skills(cls, text_lower: str) -> List[str]:
        found_skills = []
        keywords = cls._get_technical_keywords()
        
        config = load_skill_extraction_config()
        uppercase_skills = set(config.get('uppercase_skills', []))
        
        for skill in keywords:
            if match_skill_pattern(skill, text_lower):
                if skill in uppercase_skills:
                    found_skills.append(skill.upper())
                elif '.' in skill or skill.endswith('js'):
                    found_skills.append(skill)
                else:
                    found_skills.append(skill.title())
        
        return list(dict.fromkeys(found_skills))
    
    @classmethod
    def _extract_soft_skills(cls, text_lower: str) -> List[str]:
        found_skills = []
        keywords = cls._get_soft_keywords()
        
        for skill in keywords:
            variations = [skill, skill.replace('-', ' '), skill.replace(' ', '-')]
            
            if any(variation in text_lower for variation in variations):
                found_skills.append(skill.title())
        
        return list(dict.fromkeys(found_skills))
    
    @staticmethod
    def _estimate_experience_years(text: str) -> Optional[int]:
        from utils.pattern_utils import estimate_experience_years
        return estimate_experience_years(text)
    
    @classmethod
    def _extract_education_level(cls, text: str) -> Optional[str]:
        config = load_skill_extraction_config()
        education_levels = [tuple(item) for item in config.get('education_levels', [])]
        
        text_lower = text.lower()
        for keyword, level in education_levels:
            if keyword in text_lower:
                return level
        
        return None
    
    @classmethod
    def _extract_industries(cls, text: str) -> List[str]:
        config = load_skill_extraction_config()
        industries = config.get('industries', [])
        
        found = [industry for industry in industries if industry in text.lower()]
        return list(set(found))
