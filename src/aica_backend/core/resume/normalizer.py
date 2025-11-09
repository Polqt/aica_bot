import re
from typing import List

from .models import ResumeSkills
from utils.config_loader import load_skill_normalizations
from utils.text_utils import apply_smart_casing, normalize_skill_capitalization
from utils.validation_utils import is_likely_person_name, is_valid_skill


class SkillNormalizer:
    
    @classmethod
    def normalize_skills(cls, skills: ResumeSkills) -> ResumeSkills:
        skills.technical_skills = cls._normalize_skill_list(skills.technical_skills)
        skills.soft_skills = cls._normalize_skill_list(skills.soft_skills)
        skills.industries = cls._normalize_skill_list(skills.industries)
        
        return skills
    
    @classmethod
    def _normalize_skill_list(cls, skill_list: List[str]) -> List[str]:
        SKILL_NORMALIZATIONS = load_skill_normalizations()
        normalized = []
        seen_normalized = set()
        
        for skill in skill_list:
            if not skill or not skill.strip():
                continue
                
            skill_cleaned = skill.strip()
            skill_lower = skill_cleaned.lower()
            
            skill_normalized_format = skill_lower.replace('_', ' ').replace('-', ' ')
            skill_normalized_format = ' '.join(skill_normalized_format.split())
            
            if skill_lower in SKILL_NORMALIZATIONS:
                normalized_skill = SKILL_NORMALIZATIONS[skill_lower]
            elif skill_normalized_format in SKILL_NORMALIZATIONS:
                normalized_skill = SKILL_NORMALIZATIONS[skill_normalized_format]
            elif skill_lower.replace('.', '').replace('/', '') in SKILL_NORMALIZATIONS:
                normalized_skill = SKILL_NORMALIZATIONS[skill_lower.replace('.', '').replace('/', '')]
            else:
                normalized_skill = apply_smart_casing(skill_cleaned)
            
            if normalized_skill.lower() not in seen_normalized:
                normalized.append(normalized_skill)
                seen_normalized.add(normalized_skill.lower())
        
        return normalized
    
    @staticmethod
    def validate_skills(skills: ResumeSkills) -> ResumeSkills:
        
        valid_short_skills = {'r', 'c', 'go', 'c#', 'c++', 'ui', 'ux', 'ml'}
        ai_variations = {'ai', 'AI', 'Ai', 'a.i.', 'A.I.'}
        
        skills.technical_skills = list(set(
            normalize_skill_capitalization(skill, ai_variations)
            for skill in [s.strip() for s in skills.technical_skills] 
            if is_valid_skill(skill, valid_short_skills, ai_variations)
        ))
        skills.soft_skills = list(set(
            normalize_skill_capitalization(skill, ai_variations)
            for skill in [s.strip() for s in skills.soft_skills] 
            if is_valid_skill(skill, valid_short_skills, ai_variations)
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
