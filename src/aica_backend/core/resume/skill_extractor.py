import re
import json
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any

from .models import ResumeSkills
from utils.config_loader import load_skill_extraction_config, load_skills_data
from utils.pattern_utils import match_skill_pattern
from utils.text_utils import remove_section_from_text
from utils.pattern_utils import estimate_experience_years

logger = logging.getLogger(__name__)


class SkillExtractor:
    _technical_skills: Optional[List[str]] = None
    _soft_skills: Optional[List[str]] = None
    _education_patterns: Optional[List[Dict[str, Any]]] = None
    
    @classmethod
    def _load_education_patterns(cls) -> List[Dict[str, Any]]:
        if cls._education_patterns is None:
            data_dir = Path(__file__).parent.parent.parent / "data"
            pattern_file = data_dir / "education_patterns.json"
            
            try:
                with open(pattern_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    cls._education_patterns = data.get('patterns', [])
                    logger.info(f"Loaded {len(cls._education_patterns)} education patterns")
            except Exception as e:
                logger.error(f"Failed to load education patterns: {e}")
                cls._education_patterns = []
        
        return cls._education_patterns
    
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
        
        # Remove certification sections to avoid false positives
        certification_free_text = cls._remove_certification_sections(text_lower)
        
        found_technical = cls._extract_technical_skills(certification_free_text)
        found_soft = cls._extract_soft_skills(certification_free_text)
        
        experience_years = cls._estimate_experience_years(text)
        education_level = cls._extract_education_level(text)
        industries = cls._extract_industries(text)
        
        return ResumeSkills(
            technical_skills=found_technical, # ["Python", "Docker", "AWS"]
            soft_skills=found_soft, # ["Leadership", "Communication", "Problem Solving"]
            experience_years=experience_years, # 5
            education_level=education_level, # "Bachelor of Science in Computer Science"
            industries=industries # ["Information Technology", "Software Development"]
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
        return estimate_experience_years(text)
    
    @classmethod
    def _extract_education_level(cls, text: str) -> Optional[str]:
        text_lower = text.lower()
        
        # Load patterns from JSON
        patterns_data = cls._load_education_patterns()
        if not patterns_data:
            return None
        
        # Load skip config
        data_dir = Path(__file__).parent.parent.parent / "data"
        pattern_file = data_dir / "education_patterns.json"
        skip_chars = 500  
        
        try:
            with open(pattern_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
                skip_chars = config.get('skip_header_chars', 500)
        except Exception:
            pass
        
        # Skip header section to avoid reference names
        if len(text) > skip_chars:
            text_to_analyze = text[skip_chars:]
            text_lower = text_to_analyze.lower()
        else:
            text_to_analyze = text
        
        # Sort patterns by priority (already sorted in JSON, but ensure)
        sorted_patterns = sorted(patterns_data, key=lambda x: x.get('priority', 999))
        
        # Find first matching pattern
        for pattern_config in sorted_patterns:
            pattern = pattern_config['pattern']
            level_name = pattern_config['level']
            captures_field = pattern_config.get('captures_field', False)
            
            try:
                match = re.search(pattern, text_lower)
                if match:
                    # If pattern captures a field name, include it
                    if captures_field and match.groups() and match.group(1):
                        field = match.group(1).strip().title()
                        
                        # Format based on degree type
                        if level_name == 'Bachelor of Science':
                            return f'Bachelor of Science in {field}'
                        elif level_name == 'Bachelor of Arts':
                            return f'Bachelor of Arts in {field}'
                        elif level_name == 'PhD':
                            return f'PhD in {field}'
                        elif level_name == 'Associate Degree':
                            return f'Associate Degree in {field}'
                    
                    # Return the level name as-is
                    return level_name
            except re.error as e:
                logger.warning(f"Invalid regex pattern '{pattern}': {e}")
                continue
        
        # No matches found
        return None
    
    @classmethod
    def _extract_industries(cls, text: str) -> List[str]:
        config = load_skill_extraction_config()
        industries = config.get('industries', [])
        
        found = [industry for industry in industries if industry in text.lower()]
        return list(set(found))
