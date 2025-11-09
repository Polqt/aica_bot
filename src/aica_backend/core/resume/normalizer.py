import re
import json
import os
from typing import List, Dict

from .models import ResumeSkills


class SkillNormalizer:
    _NORMALIZATIONS_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'data',
        'skill_normalizations.json'
    )
    
    with open(_NORMALIZATIONS_PATH, 'r', encoding='utf-8') as f:
        _normalizations_data = json.load(f)
        SKILL_NORMALIZATIONS: Dict[str, str] = _normalizations_data['normalizations']
    
    @classmethod
    def normalize_skills(cls, skills: ResumeSkills) -> ResumeSkills:
        skills.technical_skills = cls._normalize_skill_list(skills.technical_skills)
        skills.soft_skills = cls._normalize_skill_list(skills.soft_skills)
        skills.industries = cls._normalize_skill_list(skills.industries)
        
        return skills
    
    @classmethod
    def _normalize_skill_list(cls, skill_list: List[str]) -> List[str]:
        normalized = []
        seen_normalized = set()  # Track normalized forms to prevent duplicates
        
        for skill in skill_list:
            if not skill or not skill.strip():
                continue
                
            # Clean and prepare skill for normalization
            skill_cleaned = skill.strip()
            skill_lower = skill_cleaned.lower()
            
            # Remove special characters variations for better matching
            skill_normalized_format = skill_lower.replace('_', ' ').replace('-', ' ')
            skill_normalized_format = ' '.join(skill_normalized_format.split())  # Normalize whitespace
            
            # Try exact match first
            if skill_lower in cls.SKILL_NORMALIZATIONS:
                normalized_skill = cls.SKILL_NORMALIZATIONS[skill_lower]
            # Try normalized format (handles underscores, hyphens, extra spaces)
            elif skill_normalized_format in cls.SKILL_NORMALIZATIONS:
                normalized_skill = cls.SKILL_NORMALIZATIONS[skill_normalized_format]
            # Try without special characters
            elif skill_lower.replace('.', '').replace('/', '') in cls.SKILL_NORMALIZATIONS:
                normalized_skill = cls.SKILL_NORMALIZATIONS[skill_lower.replace('.', '').replace('/', '')]
            else:
                # No mapping found - apply consistent title casing
                normalized_skill = cls._apply_smart_casing(skill_cleaned)
            
            # Add only if not already present (case-insensitive duplicate check)
            if normalized_skill.lower() not in seen_normalized:
                normalized.append(normalized_skill)
                seen_normalized.add(normalized_skill.lower())
        
        return normalized
    
    @staticmethod
    def _apply_smart_casing(skill: str) -> str:
        # Common acronyms that should stay uppercase
        acronyms = {'api', 'ui', 'ux', 'cli', 'sdk', 'ide', 'orm', 'mvc', 'mvvm', 
                   'crud', 'jwt', 'oauth', 'ssl', 'tls', 'http', 'https', 'ftp',
                   'ssh', 'tcp', 'udp', 'ip', 'dns', 'cdn', 'seo', 'cms'}
        
        # Split on spaces, slashes, and dots
        parts = skill.replace('/', ' / ').replace('.', ' . ').split()
        processed_parts = []
        
        for part in parts:
            part_lower = part.lower()
            if part_lower in acronyms:
                processed_parts.append(part_lower.upper())
            elif part in ['/', '.', '-']:
                processed_parts.append(part)
            else:
                # Standard title case
                processed_parts.append(part.capitalize())
        
        result = ' '.join(processed_parts)
        # Clean up spacing around special characters
        result = result.replace(' / ', '/').replace(' . ', '.')
        
        return result
    
    @staticmethod
    def _is_likely_person_name(skill: str) -> bool:
        if not skill or len(skill.strip()) < 3:
            return False
            
        # Clean the skill
        skill_clean = skill.strip()
        words = skill_clean.split()
        
        # Names are typically 2-4 words
        if len(words) < 2 or len(words) > 4:
            return False
        
        # Check if all words are capitalized (typical of names)
        # But also check if it's not an acronym or known skill
        all_capitalized = all(word[0].isupper() for word in words if word)
        
        if not all_capitalized:
            return False
        
        # Common name titles/prefixes that indicate it's a person
        name_prefixes = ['dr.', 'dr', 'prof.', 'prof', 'mr.', 'mr', 'mrs.', 'mrs', 
                        'ms.', 'ms', 'atty.', 'atty', 'engr.', 'engr', 'sir', 'madam']
        
        first_word_lower = words[0].lower().rstrip('.')
        if first_word_lower in name_prefixes:
            return True
        
        # If it's 2-3 capitalized words with no special characters and all words are >2 chars
        # and they're all alphabetic, it's likely a name
        if 2 <= len(words) <= 3:
            all_alphabetic = all(word.replace('.', '').replace(',', '').isalpha() for word in words)
            all_reasonable_length = all(len(word.replace('.', '').replace(',', '')) >= 2 for word in words)
            
            # Additional check: avoid common skill patterns
            skill_lower = skill_clean.lower()
            common_skill_words = ['development', 'design', 'management', 'engineering', 
                                 'programming', 'analysis', 'testing', 'data', 'web',
                                 'mobile', 'cloud', 'software', 'quality', 'project',
                                 'api', 'database', 'security', 'network']
            
            has_skill_indicator = any(word in skill_lower for word in common_skill_words)
            
            if all_alphabetic and all_reasonable_length and not has_skill_indicator:
                # Very likely a person's name
                return True
        
        return False
    
    @staticmethod
    def validate_skills(skills: ResumeSkills) -> ResumeSkills:
        
        # List of valid single-letter or two-letter skills (very rare but valid)
        valid_short_skills = {'r', 'c', 'go', 'c#', 'c++', 'ui', 'ux', 'ml'}
        
        # AI is handled separately for proper capitalization
        ai_variations = {'ai', 'AI', 'Ai', 'a.i.', 'A.I.'}
        
        # Filter function that removes empty strings, person names, and invalid short skills
        def filter_valid_skill(skill: str) -> bool:
            if not skill or not skill.strip():
                return False
            
            skill_clean = skill.strip()
            skill_lower = skill_clean.lower()
            
            # Special handling for AI variations
            if skill_lower in ai_variations or skill_clean in ai_variations:
                return True
            
            # Filter out very short skills (1-2 characters) unless they're valid
            if len(skill_clean) <= 2:
                if skill_lower not in valid_short_skills:
                    return False
            
            # Filter out person names
            if SkillNormalizer._is_likely_person_name(skill_clean):
                return False
            
            # Filter out common non-skill words
            non_skill_words = {'and', 'or', 'the', 'with', 'for', 'from', 'to', 'in', 'at', 'by', 'on'}
            if skill_lower in non_skill_words:
                return False
            
            return True
        
        # Function to normalize skill capitalization (especially for AI)
        def normalize_skill_capitalization(skill: str) -> str:
            skill_clean = skill.strip()
            skill_lower = skill_clean.lower()
            
            # Special handling for AI variations - always capitalize to "AI"
            if skill_lower in ai_variations or skill_clean in ai_variations:
                return 'AI'
            
            return skill_clean
        
        # Remove duplicates, empty strings, person names, and invalid skills
        skills.technical_skills = list(set(
            normalize_skill_capitalization(skill) 
            for skill in [s.strip() for s in skills.technical_skills] 
            if filter_valid_skill(skill)
        ))
        skills.soft_skills = list(set(
            normalize_skill_capitalization(skill)
            for skill in [s.strip() for s in skills.soft_skills] 
            if filter_valid_skill(skill)
        ))
        skills.job_titles = list(set(filter(bool, [title.strip() for title in skills.job_titles])))
        skills.industries = list(set(filter(bool, [industry.strip() for industry in skills.industries])))
        
        # Validate experience years
        if skills.experience_years is not None:
            skills.experience_years = max(0, min(70, skills.experience_years))
        
        return skills
    
    @classmethod
    def get_skill_variants(cls, skill: str) -> List[str]:
        skill_lower = skill.lower().strip()
        variants = [skill_lower]
        
        # Find the normalized form
        normalized_skill = cls.SKILL_NORMALIZATIONS.get(skill_lower, skill)
        
        # Find all variants that map to the same normalized form
        for variant, normalized in cls.SKILL_NORMALIZATIONS.items():
            if normalized == normalized_skill and variant != skill_lower:
                variants.append(variant)
        
        return variants
    
    @classmethod
    def are_skills_equivalent(cls, skill1: str, skill2: str) -> bool:
        skill1_lower = skill1.lower().strip()
        skill2_lower = skill2.lower().strip()
        
        # Direct match
        if skill1_lower == skill2_lower:
            return True
        
        # Normalize both and compare
        normalized1 = cls.SKILL_NORMALIZATIONS.get(skill1_lower, skill1)
        normalized2 = cls.SKILL_NORMALIZATIONS.get(skill2_lower, skill2)
        
        return normalized1.lower() == normalized2.lower()
    
    @classmethod
    def get_normalization_stats(cls) -> dict:
        # Count skill families by grouping normalized values
        normalized_values = set(cls.SKILL_NORMALIZATIONS.values())
        
        # Count mappings per normalized skill
        mappings_per_skill = {}
        for variant, normalized in cls.SKILL_NORMALIZATIONS.items():
            if normalized not in mappings_per_skill:
                mappings_per_skill[normalized] = []
            mappings_per_skill[normalized].append(variant)
        
        return {
            "total_mappings": len(cls.SKILL_NORMALIZATIONS),
            "unique_normalized_skills": len(normalized_values),
            "skill_families": 25,  # Documented in the dictionary
            "average_variants_per_skill": len(cls.SKILL_NORMALIZATIONS) / len(normalized_values),
            "top_skills_by_variants": sorted(
                [(skill, len(variants)) for skill, variants in mappings_per_skill.items()],
                key=lambda x: x[1],
                reverse=True
            )[:10]
        }


class TextCleaner:
    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove common resume artifacts
        artifacts_to_remove = [
            r'Page \d+ of \d+',
            r'^\s*[\r\n]',
            r'\x00',  # null characters
            r'[^\x00-\x7F]+',  # non-ASCII characters that might cause issues
        ]
        
        for pattern in artifacts_to_remove:
            text = re.sub(pattern, '', text, flags=re.MULTILINE)
        
        return text.strip()
