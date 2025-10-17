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
        
        # Keywords that indicate we're in a section that contains OTHER people's names
        reference_keywords = [
            'reference:', 'references:', 'character reference:', 'character references:',
            'professional reference:', 'personal reference:', 'contact person:',
            'recommended by:', 'referral:', 'referee:', 'provided by:',
            'reference contact:', 'reference name:', 'for reference:'
        ]
        
        # Check first few lines for name
        for i, line in enumerate(lines[:10]):  # Increased to 10 lines to cover more resume styles
            line_lower = line.lower()
            
            # Skip lines that indicate reference sections
            if any(keyword in line_lower for keyword in reference_keywords):
                continue
            
            # Skip obvious non-name lines
            skip_keywords = [
                'resume', 'cv', 'curriculum', 'vitae', 'phone', 'email', 'address',
                'objective', 'summary', 'profile', 'experience', 'education',
                'skills', 'contact', 'www', 'http', '.com', '@', 'linkedin',
                'portfolio', 'github', 'website', 'mobile:', 'tel:', 'location:'
            ]
            
            if any(keyword in line_lower for keyword in skip_keywords):
                continue
            
            # Check if line looks like a name (2-4 words, proper capitalization)
            words = line.split()
            if 2 <= len(words) <= 4:
                # Validate word patterns (proper names)
                # Allow hyphens and apostrophes in names
                valid_words = []
                for word in words:
                    # Remove common punctuation and check if it's alphabetic
                    clean_word = word.replace('-', '').replace("'", '').replace('.', '')
                    if clean_word and clean_word.isalpha() and word[0].isupper():
                        valid_words.append(word)
                
                # If we have 2-4 valid name words, this is likely the candidate's name
                if 2 <= len(valid_words) <= 4:
                    # Extra validation: make sure this isn't part of a reference section
                    # by checking the previous line
                    if i > 0:
                        prev_line_lower = lines[i-1].lower()
                        if any(keyword in prev_line_lower for keyword in reference_keywords):
                            continue
                    
                    return InfoExtractor.clean_extracted_name(' '.join(valid_words))
        
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
    
    @staticmethod
    def is_likely_reference_name(full_text: str, extracted_name: str) -> bool:
        """
        Check if the extracted name is likely from a reference section rather than the applicant.
        """
        if not extracted_name:
            return False
        
        # Find where the name appears in the text
        name_positions = []
        text_lower = full_text.lower()
        name_lower = extracted_name.lower()
        
        start = 0
        while True:
            pos = text_lower.find(name_lower, start)
            if pos == -1:
                break
            name_positions.append(pos)
            start = pos + 1
        
        if not name_positions:
            return False
        
        # Check if the first occurrence is near reference keywords
        first_pos = name_positions[0]
        
        # Get context around the first occurrence (500 chars before and after)
        context_start = max(0, first_pos - 500)
        context_end = min(len(full_text), first_pos + 500)
        context = full_text[context_start:context_end].lower()
        
        # Reference section indicators
        reference_indicators = [
            'reference:', 'references:', 'character reference:', 
            'professional reference:', 'personal reference:',
            'contact person:', 'recommended by:', 'referral:', 
            'referee:', 'character referee:'
        ]
        
        # If the name appears near reference keywords, it's likely a reference
        for indicator in reference_indicators:
            if indicator in context:
                # Check if the indicator is within 200 chars of the name
                indicator_pos = context.find(indicator)
                name_pos_in_context = first_pos - context_start
                if abs(indicator_pos - name_pos_in_context) < 200:
                    return True
        
        # If the first occurrence is in the top 500 chars, likely the applicant
        if first_pos < 500:
            return False
        
        # If the first occurrence is far down the document, possibly a reference
        if first_pos > 2000:
            return True
        
        return False
