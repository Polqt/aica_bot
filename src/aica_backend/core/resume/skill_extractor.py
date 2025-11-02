import re
import json
import logging
from pathlib import Path
from typing import List, Optional
from functools import lru_cache

from .models import ResumeSkills

logger = logging.getLogger(__name__)


class SkillExtractor:

    _technical_skills: Optional[List[str]] = None
    _soft_skills: Optional[List[str]] = None
    
    @classmethod
    @lru_cache(maxsize=1)
    def _load_skills_data(cls) -> tuple:
        try:
            data_dir = Path(__file__).parent.parent.parent / 'data'
            
            # Load technical skills
            with open(data_dir / 'technical_skills.json', 'r', encoding='utf-8') as f:
                technical_data = json.load(f)
                technical_skills = []
                for category in technical_data.values():
                    technical_skills.extend(category)
            
            # Load soft skills
            with open(data_dir / 'soft_skills.json', 'r', encoding='utf-8') as f:
                soft_data = json.load(f)
                soft_skills = []
                for category in soft_data.values():
                    soft_skills.extend(category)
            
            logger.info(f"Loaded {len(technical_skills)} technical skills and {len(soft_skills)} soft skills from JSON")
            return technical_skills, soft_skills
            
        except Exception as e:
            logger.error(f"Error loading skills data: {e}")
            return [], []
    
    @classmethod
    def _get_technical_keywords(cls) -> List[str]:
        if cls._technical_skills is None:
            cls._technical_skills, _ = cls._load_skills_data()
        return cls._technical_skills
    
    @classmethod
    def _get_soft_keywords(cls) -> List[str]:
        if cls._soft_skills is None:
            _, cls._soft_skills = cls._load_skills_data()
        return cls._soft_skills
    
    @classmethod
    def extract_with_fallback(cls, text: str) -> ResumeSkills:
        text_lower = text.lower()
        
        # Remove certification sections to avoid false positives
        certification_free_text = cls._remove_certification_sections(text_lower)
        
        # Extract skills
        found_technical = cls._extract_technical_skills(certification_free_text)
        found_soft = cls._extract_soft_skills(certification_free_text)
        
        # Extract professional metadata
        experience_years = cls._estimate_experience_years(text)
        education_level = cls._extract_education_level(text)
        industries = cls._extract_industries(text)
        
        return ResumeSkills(
            technical_skills=found_technical,
            soft_skills=found_soft,
            experience_years=experience_years,
            job_titles=[],  # Not implemented - would require NER/LLM
            education_level=education_level,
            industries=industries
        )
    
    @staticmethod
    def _remove_certification_sections(text: str) -> str:
        cert_headers = [
            'certification', 'licenses', 'training', 'courses', 'coursework',
            'professional development', 'continuing education', 'seminars', 'workshops'
        ]
        
        other_headers = [
            'experience', 'projects', 'skills', 'education', 'summary',
            'achievements', 'references'
        ]
        
        lines = text.split('\n')
        filtered_lines = []
        skip_section = False
        skip_count = 0
        
        for line in lines:
            line_stripped = line.strip().lower()
            
            if not line_stripped:
                if not skip_section:
                    filtered_lines.append(line)
                continue
            
            # Check for certification section header
            is_cert_header = any(
                header in line_stripped and len(line_stripped) < 60 
                and sum(c.isdigit() for c in line_stripped) < 6
                for header in cert_headers
            )
            
            if is_cert_header:
                skip_section = True
                skip_count = 0
                continue
            
            # Check for other section headers (end of cert section)
            if skip_section:
                is_other_header = any(
                    header in line_stripped and len(line_stripped) < 60
                    and line_stripped.count(':') <= 1
                    for header in other_headers
                )
                
                if is_other_header or skip_count > 30:
                    skip_section = False
                else:
                    skip_count += 1
            
            if not skip_section:
                filtered_lines.append(line)
        
        return '\n'.join(filtered_lines)
    
    @classmethod
    def _extract_technical_skills(cls, text_lower: str) -> List[str]:
        found_skills = []
        keywords = cls._get_technical_keywords()
        
        # Uppercase acronym skills
        uppercase_skills = {
            'aws', 'gcp', 'api', 'sql', 'html', 'css', 'php', 'ios', 'iot',
            'jwt', 'rest', 'soap', 'xml', 'json', 'yaml', 'ci/cd', 'tdd',
            'bdd', 'mvc', 'mvvm', 'nlp', 'ddd', 'sso', 'iam', 'ssl', 'tls',
            'cnn', 'rnn', 'lstm', 'ux', 'ui', 'ml', 'bi', 'http', 'https'
        }
        
        for skill in keywords:
            # Flexible pattern matching
            patterns = [
                r'\b' + re.escape(skill).replace(r'\.', r'\.?') + r's?\b',
                r'\b' + re.escape(skill.replace('.', '')) + r'\b'
            ]
            
            if any(re.search(pattern, text_lower, re.IGNORECASE) for pattern in patterns):
                # Format skill name appropriately
                if skill in uppercase_skills:
                    found_skills.append(skill.upper())
                elif '.' in skill or skill.endswith('js'):
                    found_skills.append(skill)
                else:
                    found_skills.append(skill.title())
        
        return list(dict.fromkeys(found_skills))  # Remove duplicates, preserve order
    
    @classmethod
    def _extract_soft_skills(cls, text_lower: str) -> List[str]:
        found_skills = []
        keywords = cls._get_soft_keywords()
        
        for skill in keywords:
            # Check variations (with/without hyphens)
            variations = [skill, skill.replace('-', ' '), skill.replace(' ', '-')]
            
            if any(variation in text_lower for variation in variations):
                found_skills.append(skill.title())
        
        return list(dict.fromkeys(found_skills))  # Remove duplicates, preserve order
    
    @staticmethod
    def _estimate_experience_years(text: str) -> Optional[int]:
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+?\s*years?\s*in\s*(?:software|tech|it)',
            r'experience:\s*(\d+)\+?\s*years?',
            r'over\s*(\d+)\s*years?'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    years = max(int(match) for match in matches)
                    return min(years, 70)  # Cap at 70 years
                except ValueError:
                    continue
        
        return None
    
    @staticmethod
    def _extract_education_level(text: str) -> Optional[str]:
        education_levels = [
            ('phd', 'PhD'), ('doctorate', 'PhD'),
            ("master's", "Master's"), ('masters', "Master's"), ('mba', 'MBA'),
            ('ms', 'MS'), ('ma', 'MA'), ('msc', 'MSc'),
            ("bachelor's", "Bachelor's"), ('bachelors', "Bachelor's"),
            ('bs', 'BS'), ('ba', 'BA'), ('bsc', 'BSc'),
            ('associate', 'Associate'), ('diploma', 'Diploma')
        ]
        
        text_lower = text.lower()
        for keyword, level in education_levels:
            if keyword in text_lower:
                return level
        
        return None
    
    @staticmethod
    def _extract_industries(text: str) -> List[str]:
        industries = [
            'technology', 'software', 'it', 'finance', 'banking', 'healthcare',
            'retail', 'e-commerce', 'education', 'consulting', 'manufacturing',
            'telecommunications', 'energy', 'government', 'marketing', 'media',
            'hospitality', 'real estate', 'logistics', 'construction', 'pharmaceuticals'
        ]
        
        found = [industry for industry in industries if industry in text.lower()]
        return list(set(found))
