import re

from typing import Dict, List, Optional
from langchain_anthropic import ChatAnthropic
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from dataclasses import dataclass

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
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0)
        self.parser = PydanticOutputParser(pydantic_object=ResumeSkills)
        
        self.extraction_prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                """
                    You are an expert resume parser and career analyst. Extract comprehensive 
                    information from resumes to enable accurate job matching. Be thorough in 
                    identifying both explicit and implicit skills, and accurately estimate 
                    experience levels based on career progression.
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