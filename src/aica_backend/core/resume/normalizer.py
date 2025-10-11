import re
from typing import List, Dict

from .models import ResumeSkills


class SkillNormalizer:

    # Skill normalization mappings for common typos and variations
    SKILL_NORMALIZATIONS: Dict[str, str] = {
        "tailwind css": "Tailwind CSS",
        "tailwindcss": "Tailwind CSS",
        "tailwind-css": "Tailwind CSS",
        "react.js": "React",
        "reactjs": "React",
        "node.js": "Node.js",
        "nodejs": "Node.js",
        "vue.js": "Vue.js",
        "vuejs": "Vue.js",
        "angular.js": "Angular",
        "angularjs": "Angular",
        "express.js": "Express.js",
        "expressjs": "Express.js",
        "next.js": "Next.js",
        "nextjs": "Next.js",
        "c++": "C++",
        "c#": "C#",
        "asp.net": "ASP.NET",
        "asp.net core": "ASP.NET Core",
        "google cloud": "Google Cloud Platform",
        "gcp": "Google Cloud Platform",
        "aws": "Amazon Web Services",
        "azure": "Microsoft Azure",
        "postgresql": "PostgreSQL",
        "mongodb": "MongoDB",
        "mysql": "MySQL",
        "html5": "HTML",
        "css3": "CSS",
        "javascript es6": "JavaScript",
        "typescript": "TypeScript",
        "scss": "SCSS",
        "sass": "Sass"
    }
    
    @classmethod
    def normalize_skills(cls, skills: ResumeSkills) -> ResumeSkills:
        skills.technical_skills = cls._normalize_skill_list(skills.technical_skills)
        skills.soft_skills = cls._normalize_skill_list(skills.soft_skills)
        skills.industries = cls._normalize_skill_list(skills.industries)
        
        return skills
    
    @classmethod
    def _normalize_skill_list(cls, skill_list: List[str]) -> List[str]:
        normalized = []
        for skill in skill_list:
            skill_lower = skill.lower().strip()
            # Check if we have a normalization mapping
            if skill_lower in cls.SKILL_NORMALIZATIONS:
                normalized.append(cls.SKILL_NORMALIZATIONS[skill_lower])
            else:
                # Title case for consistency
                normalized.append(skill.strip().title())
        
        # Remove duplicates while preserving order
        return list(dict.fromkeys(normalized))
    
    @staticmethod
    def validate_skills(skills: ResumeSkills) -> ResumeSkills:
        # Remove duplicates and empty strings
        skills.technical_skills = list(set(filter(bool, [skill.strip() for skill in skills.technical_skills])))
        skills.soft_skills = list(set(filter(bool, [skill.strip() for skill in skills.soft_skills])))
        skills.job_titles = list(set(filter(bool, [title.strip() for title in skills.job_titles])))
        skills.industries = list(set(filter(bool, [industry.strip() for industry in skills.industries])))
        
        # Validate experience years
        if skills.experience_years is not None:
            skills.experience_years = max(0, min(70, skills.experience_years))
        
        return skills


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
