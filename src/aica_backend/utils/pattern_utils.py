import re
from typing import Optional, List


EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
PHONE_PATTERN = r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'
LINKEDIN_PATTERN = r'(?:linkedin\.com/in/|linkedin\.com/pub/)[\w-]+'


EXPERIENCE_YEAR_PATTERNS = [
    r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
    r'(\d+)\+?\s*years?\s*in\s*(?:software|tech|it)',
    r'experience:\s*(\d+)\+?\s*years?',
    r'over\s*(\d+)\s*years?'
]


def extract_email(text: str) -> Optional[str]:
    match = re.search(EMAIL_PATTERN, text, re.IGNORECASE)
    return match.group() if match else None


def extract_phone(text: str) -> Optional[str]:
    match = re.search(PHONE_PATTERN, text, re.IGNORECASE)
    return match.group() if match else None


def extract_linkedin(text: str) -> Optional[str]:
    match = re.search(LINKEDIN_PATTERN, text, re.IGNORECASE)
    return match.group() if match else None


def estimate_experience_years(text: str) -> Optional[int]:
    for pattern in EXPERIENCE_YEAR_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            try:
                years = max(int(match) for match in matches)
                return min(years, 70)
            except ValueError:
                continue
    return None


def build_skill_patterns(skill: str) -> List[str]:
    return [
        r'\b' + re.escape(skill).replace(r'\.', r'\.?') + r's?\b',
        r'\b' + re.escape(skill.replace('.', '')) + r'\b'
    ]


def match_skill_pattern(skill: str, text_lower: str) -> bool:
    patterns = build_skill_patterns(skill)
    return any(re.search(pattern, text_lower, re.IGNORECASE) for pattern in patterns)
