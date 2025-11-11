import logging
from typing import List, Dict, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class UserContext:
    skills: List[str]
    experience_years: Optional[int] = None
    preferred_locations: List[str] = None
    preferred_industries: List[str] = None
    
    def __post_init__(self):
        if self.preferred_locations is None:
            self.preferred_locations = []
        if self.preferred_industries is None:
            self.preferred_industries = []


class QueryBuilder:
    
    @staticmethod
    def build_skills_query(skills: List[str], top_n: int = 20) -> str:
        if not skills:
            return ""
        
        # Limit to top N skills to avoid too long queries
        selected_skills = skills[:top_n]
        
        # Create natural language query
        query = f"Job requirements: {', '.join(selected_skills)}"
        
        return query
    
    @staticmethod
    def build_comprehensive_query(context: UserContext) -> str:
        query_parts = []
        
        # Add skills (most important)
        if context.skills:
            skills_str = ", ".join(context.skills[:15])  # Top 15 skills
            query_parts.append(f"Skills: {skills_str}")
        
        # Add experience level
        if context.experience_years is not None:
            if context.experience_years < 2:
                level = "Entry level"
            elif context.experience_years < 5:
                level = "Mid level"
            else:
                level = "Senior level"
            query_parts.append(f"Experience: {level}")
        
        # Add locations
        if context.preferred_locations:
            locations_str = ", ".join(context.preferred_locations[:3])
            query_parts.append(f"Location: {locations_str}")
        
        # Add industries
        if context.preferred_industries:
            industries_str = ", ".join(context.preferred_industries[:3])
            query_parts.append(f"Industry: {industries_str}")
        
        # Combine all parts
        query = " | ".join(query_parts)
        
        return query
    
    @staticmethod
    def build_focused_query(
        skills: List[str],
        job_title: Optional[str] = None,
        max_skills: int = 10
    ) -> str:
        query_parts = []
        
        if job_title:
            query_parts.append(f"Position: {job_title}")
        
        if skills:
            skills_str = ", ".join(skills[:max_skills])
            query_parts.append(f"Required skills: {skills_str}")
        
        query = ". ".join(query_parts)
        
        return query
    
    @staticmethod
    def build_semantic_query(context: UserContext) -> str:
        if not context.skills:
            return "Looking for relevant job opportunities"
        
        # Build natural language description
        skills_str = ", ".join(context.skills[:10])
        
        query = f"I am a professional with expertise in {skills_str}"
        
        if context.experience_years is not None:
            query += f" and {context.experience_years} years of experience"
        
        if context.preferred_locations:
            locations = " or ".join(context.preferred_locations[:2])
            query += f" in {locations}"
        
        query += ". What jobs match my profile?"
        
        return query
    
    @staticmethod
    def build_multi_query(context: UserContext) -> List[str]:
        queries = []
        
        # Skills-focused query
        if context.skills:
            queries.append(QueryBuilder.build_skills_query(context.skills))
        
        # Comprehensive structured query
        queries.append(QueryBuilder.build_comprehensive_query(context))
        
        # Natural language query
        queries.append(QueryBuilder.build_semantic_query(context))
        
        return queries
    
    @staticmethod
    def expand_query_with_synonyms(
        query: str,
        skill_synonyms: Dict[str, List[str]]
    ) -> str:
        expanded_parts = [query]
        
        # Add synonyms for skills found in query
        for skill, synonyms in skill_synonyms.items():
            if skill.lower() in query.lower():
                synonym_str = ", ".join(synonyms[:3])  # Top 3 synonyms
                expanded_parts.append(f"Also: {synonym_str}")
        
        return ". ".join(expanded_parts)
    
    @staticmethod
    def build_from_resume_text(resume_text: str, max_length: int = 500) -> str:
        # Truncate if too long
        if len(resume_text) > max_length:
            # Try to truncate at sentence boundary
            truncated = resume_text[:max_length]
            last_period = truncated.rfind('.')
            if last_period > max_length * 0.7:  # If we found a good breaking point
                truncated = truncated[:last_period + 1]
            return truncated
        
        return resume_text
