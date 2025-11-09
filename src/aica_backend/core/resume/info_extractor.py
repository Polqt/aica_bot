import re
import logging
from typing import Optional

from .models import PersonalInfo
from utils.config_loader import load_name_extraction_config
from utils.pattern_utils import extract_email, extract_phone, extract_linkedin
from utils.validation_utils import extract_name_from_text, is_likely_reference_name
from utils.text_utils import clean_extracted_name

logger = logging.getLogger(__name__)


class InfoExtractor:
    
    @classmethod
    def extract_with_fallback(cls, text: str) -> PersonalInfo:
        extracted_info = {}
        
        extracted_info['email'] = extract_email(text)
        extracted_info['phone'] = extract_phone(text)
        extracted_info['linkedin'] = extract_linkedin(text)
        
        name = cls._extract_name_from_text(text)
        
        return PersonalInfo(
            full_name=name,
            email=extracted_info['email'],
            phone=extracted_info['phone'],
            linkedin=extracted_info['linkedin']
        )
    
    @staticmethod
    def _extract_name_from_text(text: str) -> Optional[str]:
        config = load_name_extraction_config()
        return extract_name_from_text(
            text,
            config.get('reference_keywords', []),
            config.get('skip_keywords', []),
            config.get('invalid_name_words', []),
            config.get('name_prefixes_to_remove', [])
        )
    
    @staticmethod
    def clean_extracted_name(name: str) -> str:
        config = load_name_extraction_config()
        return clean_extracted_name(name, config.get('name_prefixes_to_remove', []))
    
    @staticmethod
    def is_likely_reference_name(full_text: str, extracted_name: str) -> bool:
        config = load_name_extraction_config()
        return is_likely_reference_name(
            full_text,
            extracted_name,
            config.get('reference_indicators', [])
        )
