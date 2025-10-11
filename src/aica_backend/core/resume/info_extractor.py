import re
import logging
from typing import Optional

from .models import PersonalInfo

logger = logging.getLogger(__name__)


class InfoExtractor:
    # Regex patterns for contact information
    EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    PHONE_PATTERN = r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'
    LINKEDIN_PATTERN = r'(?:linkedin\.com/in/|linkedin\.com/pub/)[\w-]+'
    
    @classmethod
    def extract_with_fallback(cls, text: str) -> PersonalInfo:
        extracted_info = {}
        
        # Extract email
        email_match = re.search(cls.EMAIL_PATTERN, text, re.IGNORECASE)
        extracted_info['email'] = email_match.group() if email_match else None
        
        # Extract phone
        phone_match = re.search(cls.PHONE_PATTERN, text, re.IGNORECASE)
        extracted_info['phone'] = phone_match.group() if phone_match else None
        
        # Extract LinkedIn
        linkedin_match = re.search(cls.LINKEDIN_PATTERN, text, re.IGNORECASE)
        extracted_info['linkedin'] = linkedin_match.group() if linkedin_match else None
        
        # Extract name
        name = cls._extract_name_from_text(text)
        
        return PersonalInfo(
            full_name=name,
            email=extracted_info['email'],
            phone=extracted_info['phone'],
            linkedin=extracted_info['linkedin']
        )
    
    @staticmethod
    def _extract_name_from_text(text: str) -> Optional[str]:
        lines = text.split('\n')
        lines = [line.strip() for line in lines if line.strip()]
        
        if not lines:
            return None
        
        # Check first few lines for name
        for line in lines[:5]:
            line = line.strip()
            
            # Skip obvious non-name lines
            skip_keywords = [
                'resume', 'cv', 'curriculum', 'vitae', 'phone', 'email', 'address',
                'objective', 'summary', 'profile', 'experience', 'education',
                'skills', 'contact', 'www', 'http', '.com', '@', 'linkedin'
            ]
            
            if any(keyword in line.lower() for keyword in skip_keywords):
                continue
            
            # Check if line looks like a name (2-4 words, proper capitalization)
            words = line.split()
            if 2 <= len(words) <= 4:
                # Validate word patterns (proper names)
                if all(word[0].isupper() and word.replace('-', '').replace("'", '').isalpha()
                      for word in words if word):
                    return InfoExtractor.clean_extracted_name(line)
        
        return None
    
    @staticmethod
    def clean_extracted_name(name: str) -> str:
        if not name:
            return name
        
        # Remove common prefixes
        prefixes_to_remove = ['resume of ', 'cv of ', 'name:', 'full name:']
        name_lower = name.lower().strip()
        
        for prefix in prefixes_to_remove:
            if name_lower.startswith(prefix):
                name = name[len(prefix):].strip()
                break
        
        # Clean up and format
        name = ' '.join(name.split())
        
        # Proper title case if all uppercase or all lowercase
        if name.isupper() or name.islower():
            name = name.title()
        
        return name
