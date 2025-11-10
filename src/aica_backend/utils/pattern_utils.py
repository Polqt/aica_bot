import re
from typing import Optional, List
import datetime


EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
PHONE_PATTERN = r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'
LINKEDIN_PATTERN = r'(?:linkedin\.com/in/|linkedin\.com/pub/)[\w-]+'


EXPERIENCE_YEAR_PATTERNS = [
    # Explicit experience statements
    r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:professional\s*)?experience',
    r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:work\s*)?experience',
    r'(\d+)\+?\s*years?\s*in\s*(?:software|tech|it|development|engineering|programming)',
    r'experience:\s*(\d+)\+?\s*years?',
    r'over\s*(\d+)\s*years?(?:\s*of\s*experience)?',
    
    # Work history patterns - extract from date ranges
    r'20(\d{2})\s*[-–]\s*(?:present|current|now)',  # e.g., "2020 - Present"
    r'(\d{4})\s*[-–]\s*(?:present|current|now)',    # e.g., "2020 - Present"
    
    # Summary/Profile patterns
    r'with\s*(\d+)\+?\s*years?',
    r'(\d+)\+?\s*years?\s*(?:professional|working)',
]


def extract_email(text: str) -> Optional[str]:
    match = re.search(EMAIL_PATTERN, text, re.IGNORECASE)
    if match:
        email = match.group()
        # Remove any trailing characters that might have been captured
        # E.g., "email@example.com|University" -> "email@example.com"
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
    current_year = datetime.datetime.now().year
    
    # Try explicit experience patterns first
    for pattern in EXPERIENCE_YEAR_PATTERNS[:8]:  # First 8 are explicit statements
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            try:
                for match in matches:
                    # Handle different match formats
                    if isinstance(match, tuple):
                        match = match[0] if match[0] else match[1] if len(match) > 1 else None
                    
                    if not match:
                        continue
                    
                    # Convert to int
                    years = int(match) if len(str(match)) <= 2 else int(match)
                    
                    # Sanity checks
                    if years > 70:  # Too many years
                        continue
                    if years == 0:  # Zero years is not useful
                        continue
                        
                    return years
            except ValueError:
                continue
    
    # If no explicit statement, try to calculate from work history dates
    # Look for "YYYY - Present" patterns in EXPERIENCE or WORK sections only
    # First, try to identify if we're in the experience/work section
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
        
        # Now look for "YYYY - Present" patterns in this section
        present_patterns = [
            r'(20\d{2})\s*[-–]\s*(?:present|current|now)',
            r'(19\d{2})\s*[-–]\s*(?:present|current|now)',
        ]
        
        earliest_year = None
        for pattern in present_patterns:
            matches = re.findall(pattern, experience_section, re.IGNORECASE)
            for match in matches:
                try:
                    year = int(match)
                    if 1980 <= year <= current_year:
                        if earliest_year is None or year < earliest_year:
                            earliest_year = year
                except ValueError:
                    continue
        
        if earliest_year:
            calculated_years = current_year - earliest_year
            if 0 < calculated_years <= 70:  # Must be > 0 and reasonable
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
