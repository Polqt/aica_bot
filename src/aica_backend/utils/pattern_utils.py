import re
import json
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
import datetime

logger = logging.getLogger(__name__)

EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
PHONE_PATTERN = r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'
LINKEDIN_PATTERN = r'(?:linkedin\.com/in/|linkedin\.com/pub/)[\w-]+'

_experience_config: Optional[Dict[str, Any]] = None


def _load_experience_config() -> Dict[str, Any]:
    global _experience_config
    
    if _experience_config is None:
        current_file = Path(__file__)
        data_dir = current_file.parent.parent / "data"
        pattern_file = data_dir / "experience_patterns.json"
        
        try:
            with open(pattern_file, 'r', encoding='utf-8') as f:
                _experience_config = json.load(f)
                logger.info(f"Loaded experience patterns from {pattern_file}")
        except Exception as e:
            logger.error(f"Failed to load experience patterns: {e}")
            _experience_config = {
                "explicit_patterns": [],
                "date_range_patterns": [],
                "validation": {
                    "min_year": 1980,
                    "max_year": 2029,
                    "max_experience_years": 50,
                    "min_experience_years": 0
                }
            }
    
    return _experience_config


def extract_email(text: str) -> Optional[str]:
    match = re.search(EMAIL_PATTERN, text, re.IGNORECASE)
    if match:
        email = match.group()
        # Remove any trailing characters that might have been captured
        email = email.split('|')[0].split()[0]
        return email
    return None


def extract_phone(text: str) -> Optional[str]:
    match = re.search(PHONE_PATTERN, text, re.IGNORECASE)
    return match.group() if match else None


def extract_linkedin(text: str) -> Optional[str]:
    match = re.search(LINKEDIN_PATTERN, text, re.IGNORECASE)
    return match.group() if match else None


def estimate_experience_years(text: str) -> Optional[int]:
    """Estimate years of experience from resume text using JSON patterns"""
    current_year = datetime.datetime.now().year
    
    # Load patterns and validation config from JSON
    config = _load_experience_config()
    explicit_patterns = config.get('explicit_patterns', [])
    date_range_patterns = config.get('date_range_patterns', [])
    validation = config.get('validation', {})
    
    min_year = validation.get('min_year', 1980)
    max_year = validation.get('max_year', 2029)
    max_experience = validation.get('max_experience_years', 50)
    min_experience = validation.get('min_experience_years', 0)
    
    # Try explicit experience statements first - these are most reliable
    for pattern_config in explicit_patterns:
        pattern = pattern_config.get('pattern', '')
        if not pattern:
            continue
            
        try:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                for match in matches:
                    # Handle different match formats
                    if isinstance(match, tuple):
                        match = match[0] if match[0] else match[1] if len(match) > 1 else None
                    
                    if not match:
                        continue
                    
                    # Convert to int
                    years = int(match)
                    
                    # Validate
                    if years > max_experience:  # Too many years - likely a date
                        continue
                    if years <= min_experience:  # Zero or negative years not useful
                        continue
                        
                    return years
        except (ValueError, re.error) as e:
            logger.warning(f"Error processing pattern '{pattern}': {e}")
            continue
    
    # If no explicit statement, try to calculate from work history dates
    text_lower = text.lower()
    
    # Find experience/work sections
    exp_section_start = None
    for keyword in ['experience', 'work history', 'employment history', 'professional experience']:
        pos = text_lower.find(keyword)
        if pos != -1:
            exp_section_start = pos
            break
    
    if exp_section_start is not None:
        # Only look at text after the experience section starts
        # and before education/skills sections
        end_keywords = ['education', 'skills', 'certifications', 'projects', 'awards']
        exp_section_end = len(text)
        
        for keyword in end_keywords:
            pos = text_lower.find(keyword, exp_section_start)
            if pos != -1 and pos < exp_section_end:
                exp_section_end = pos
        
        experience_section = text[exp_section_start:exp_section_end]
        
        # Use date range patterns from JSON
        earliest_year = None
        for pattern_config in date_range_patterns:
            pattern = pattern_config.get('pattern', '')
            if not pattern:
                continue
            
            try:
                matches = re.findall(pattern, experience_section, re.IGNORECASE)
                for match in matches:
                    # Extract year from match (could be tuple with multiple groups)
                    year_str = match if isinstance(match, str) else match[0] if match else None
                    if not year_str:
                        continue
                    
                    # Handle month names - extract just the year
                    if not year_str.isdigit():
                        year_match = re.search(r'(\d{4})', str(match))
                        if year_match:
                            year_str = year_match.group(1)
                        else:
                            continue
                    
                    try:
                        year = int(year_str)
                        # Validate year is reasonable
                        if min_year <= year <= max(current_year, max_year):
                            if earliest_year is None or year < earliest_year:
                                earliest_year = year
                    except ValueError:
                        continue
            except re.error as e:
                logger.warning(f"Error processing date pattern '{pattern}': {e}")
                continue
        
        if earliest_year:
            calculated_years = current_year - earliest_year
            if min_experience < calculated_years <= max_experience:
                return calculated_years
    
    return None


def build_skill_patterns(skill: str) -> List[str]:
    return [
        r'\b' + re.escape(skill).replace(r'\.', r'\.?') + r's?\b',
        r'\b' + re.escape(skill.replace('.', '')) + r'\b'
    ]


def match_skill_pattern(skill: str, text_lower: str) -> bool:
    patterns = build_skill_patterns(skill)
    return any(re.search(pattern, text_lower, re.IGNORECASE) for pattern in patterns)
