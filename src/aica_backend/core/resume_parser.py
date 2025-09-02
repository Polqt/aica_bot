import re
import os

from typing import Dict, List, Optional
from langchain_anthropic import ChatAnthropic
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from dataclasses import dataclass

from ..database.user_db import UserDatabase
from ..database.models.user_models import UserSkillCreate

class ResumeSkills(BaseModel):
    technical_skills: List[str] = Field(description="Technical skills and technologies")
    soft_skills: List[str] = Field(description="Soft skills and interpersonal abilities")
    experience_years: Optional[int] = Field(description="Years of relevant experience")
    job_titles: List[str] = Field(description="Previous job titles")
    education_level: Optional[str] = Field(description="Highest education level")
    industries: List[str] = Field(description="Industries worked in")

@dataclass
class ParsedResume:
    raw_text: str
    skills: ResumeSkills
    cleaned_text: str
    
class ResumeParser:
    def __init__(self):
        self.llm = ChatAnthropic(
            model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-haikyu-20241022"), 
            temperature=0
        )
        self.parser = PydanticOutputParser(pydantic_object=ResumeSkills)
        
        self.extraction_prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                """
                    You are an expert resume parser and career analyst. Extract comprehensive 
                    information from resumes to enable accurate job matching. Be thorough in 
                    identifying both explicit and implicit skills, and accurately estimate 
                    experience levels based on career progression.
                    
                    Focus on:
                    - All technical skills (programming languages, tools, frameworks, databases, cloud platforms)
                    - Soft skills (communication, leadership, problem-solving, teamwork)
                    - Calculate realistic years of professional experience
                    - Extract actual job titles held
                    - Identify education level and industries worked in.
                """
            ),
            (
                "human,"
                """
                    Parse this resume and extract the key information for job matching:
                    
                    {resume_text}
                    
                    Instructions:
                    - Extract ALL technical skills (programming languages, tools, frameworks, technologies)
                    - Identify soft skills and interpersonal abilities
                    - Calculate years of relevant professional experience (not just total years)
                    - List all previous job titles/roles
                    - Determine highest education level achieved
                    - Identify industries or domains of experience
                    - Be comprehensive but accurate
                    
                    {format_instructions}
                """
            )
        ])
    
    def clean_text(self, text: str) -> str:
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove common resume artifacts
        text = re.sub(r'Page \d+ of \d+', '', text)
        text = re.sub(r'^\s*[\r\n]', '', text, flags=re.MULTILINE)
        
        # Normalize common sections
        text = re.sub(r'EXPERIENCE|Experience|WORK EXPERIENCE', 'Experience', text)
        text = re.sub(r'EDUCATION|Education', 'Education', text)
        text = re.sub(r'SKILLS|Skills|TECHNICAL SKILLS', 'Skills', text)
        
        return text.strip()
    
    def extract_contact_info(self, text: str) -> Dict[str, Optional[str]]:
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'
        
        email_match = re.search(email_pattern, text)
        phone_match = re.search(phone_pattern, text)
        
        return {
            "email": email_match.group() if email_match else None,
            "phone": phone_match.group() if phone_match else None
        }
        
    async def parse_resume(self, resume_text: str) -> ParsedResume:
        cleaned_text = self.clean_text(resume_text)
        contact_info = self.extract_contact_info(cleaned_text)
        
        try:
            prompt = self.extraction_prompt.format_prompt(
                resume_text=cleaned_text,
                format_instructions=self.parser.get_format_instructions()
            )
            
            response = await self.llm.ainvoke(prompt)
            extracted_skills = self.parser.parse(response.content)
        except Exception as e:
            extracted_skills = self._fallback_extraction(cleaned_text)

        return ParsedResume(
            raw_text=resume_text,
            skills=extracted_skills,
            cleaned_text=cleaned_text,
            contact_info=contact_info
        )
        
    def _fallback_extraction(self, text: str) -> ResumeSkills:
        
        technical_skills = []
        
    def create_search_text(self, parsed_resume: ParsedResume) -> str:
        skills = parsed_resume.skills
        
        search_components = [
            " ".join(skills.technical_skills) or "", 
            " ".join(skills.soft_skills) or "",
            " ".join(skills.job_titles) or "",
            " ".join(skills.industries) or "",
            skills.education_level or "",
            f"Experience: {skills.experience_years} years" if skills.experience_years else ""
        ]
        
        return " ".join(filter(None, search_components)) 
    
    async def process_and_store_resume(self, user_id: str, resume_text: str) -> ParsedResume:
        parsed_resume = await self.parse_resume(resume_text)
        
        db = UserDatabase()
        
        db.clear_user_skills(user_id)
        
        skills_to_store = []
        
        for skill in parsed_resume.skills.technical_skills:
            skills_to_store.append(UserSkillCreate(
                skill_name=skill,
                skill_category="technical",
                source="resume"
            ))
            
        for skill in parsed_resume.skills.soft_skills:
            skills_to_store.append(UserSkillCreate(
                skill_name=skill,
                skill_category="soft",
                source="resume"
            ))
            
        for industry in parsed_resume.skills.industries:
            skills_to_store.append(UserSkillCreate(
                skill_name=industry,
                skill_category="industry",
                source="resume"
            ))
        
        if skills_to_store:
            db.add_user_skills_batch(user_id, skills_to_store)
        
        db.mark_resume_processed(user_id)
        
        return parsed_resume
        