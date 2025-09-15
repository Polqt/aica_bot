import re
import os
import PyPDF2
import mammoth
import docx
import asyncio
import logging

from io import BytesIO
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel, Field
from dataclasses import dataclass

from langchain_anthropic import ChatAnthropic
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser

from ..database.user_db import UserDatabase
from ..database.models.user_models import UserSkillCreate

logger = logging.getLogger(__name__)

class ResumeSkills(BaseModel):
    technical_skills: List[str] = Field(description="Technical skills and technologies", default_factory=list)
    soft_skills: List[str] = Field(description="Soft skills and interpersonal abilities", default_factory=list)
    experience_years: Optional[int] = Field(description="Years of relevant experience", default=None)
    job_titles: List[str] = Field(description="Previous job titles", default_factory=list)
    education_level: Optional[str] = Field(description="Highest education level", default=None)
    industries: List[str] = Field(description="Industries worked in", default_factory=list)

class PersonalInfo(BaseModel):
    full_name: Optional[str] = Field(description="Full name of the person", default=None)
    phone: Optional[str] = Field(description="Phone number", default=None)
    email: Optional[str] = Field(description="Email address", default=None)
    location: Optional[str] = Field(description="Location", default=None)
    linkedin: Optional[str] = Field(description="LinkedIn profile URL", default=None)

@dataclass
class ParsedResume:
    raw_text: str
    skills: ResumeSkills
    personal_info: PersonalInfo
    cleaned_text: str

class ResumeParser:
    SUPPORTED_FILE_TYPES = {
        "application/pdf": "PDF",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
        "application/msword": "DOC"
    }
    
    def __init__(self):
        self.llm = None
        try:
            self.llm = self._create_llm_client()
        except Exception as e:
            logger.warning(f"LLM client initialization failed: {str(e)}. Will use fallback extraction methods.")
        
        self.skills_parser = PydanticOutputParser(pydantic_object=ResumeSkills)
        self.info_parser = PydanticOutputParser(pydantic_object=PersonalInfo)
        
    def _create_llm_client(self) -> ChatAnthropic:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key or api_key == "your_anthropic_api_key_here":
            raise ValueError("ANTHROPIC_API_KEY environment variable not set or contains placeholder value")
        
        return ChatAnthropic(
            model=os.getenv("ANTHROPIC_MODEL", "claude-3-haiku-20240307"),
            temperature=0,
            anthropic_api_key=api_key
        )
    
    def _create_extraction_prompt(self) -> ChatPromptTemplate:
        return ChatPromptTemplate.from_messages([
            ("system", """You are an expert resume parser. Extract comprehensive information from resumes 
            for job matching. Be thorough in identifying both explicit and implicit skills, 
            and accurately estimate experience levels based on career progression.
            
            Focus on:
            - All technical skills (programming languages, tools, frameworks, databases, cloud platforms)
            - Soft skills (communication, leadership, problem-solving, teamwork)  
            - Calculate realistic years of professional experience
            - Extract actual job titles held
            - Identify education level and industries worked in.
            
            Return ONLY valid JSON that matches the required format."""),
            ("human", """Parse this resume and extract the key information for job matching:
            
            {resume_text}
            
            Instructions:
            - Extract ALL technical skills (programming languages, tools, frameworks, technologies)
            - Identify soft skills and interpersonal abilities
            - Calculate years of relevant professional experience (not just total years)
            - List all previous job titles/roles
            - Determine highest education level achieved  
            - Identify industries or domains of experience
            - Be comprehensive but accurate
            
            {format_instructions}""")
        ])
        
    def _create_info_prompt(self) -> ChatPromptTemplate:
        return ChatPromptTemplate.from_messages([
            ("system", """You are an expert at extracting personal contact information from resumes. 
            Pay special attention to finding the person's full name, which might appear in various formats:
            - At the top of the resume as a header
            - In various fonts or formatting styles
            - Sometimes split across lines
            - May include titles (Dr., Mr., Ms.) or suffixes (Jr., Sr., III)
            - Could be in all caps, title case, or other formatting
            
            Return only valid JSON with the extracted information."""),
            ("human", """Extract contact information from this resume. Pay special attention to finding the full name:

            {resume_text}

            Guidelines:
            - Look for the full name throughout the document, especially at the beginning
            - Include middle names/initials if present
            - Don't include titles like "Resume of" or "CV of" 
            - If you find multiple name-like entries, choose the most complete one
            - Clean up any formatting artifacts but preserve the actual name
            - For phone numbers, extract the most complete format available
            - For LinkedIn, include the full profile URL if available

            {format_instructions}""")
        ])

    def extract_text_from_file(self, file_content: bytes, file_type: str) -> str:
        if file_type not in self.SUPPORTED_FILE_TYPES:
            supported_types = ", ".join(self.SUPPORTED_FILE_TYPES.values())
            raise ValueError(f"Unsupported file type. Supported types: {supported_types}")
        
        extractors = {
            "application/pdf": self._extract_from_pdf,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": self._extract_from_docx,
            "application/msword": self._extract_from_doc
        }
        
        try:
            text = extractors[file_type](file_content)
            if not text or not text.strip():
                raise ValueError("No readable text found in the file")
            return text
        except Exception as e:
            file_type_name = self.SUPPORTED_FILE_TYPES[file_type]
            logger.error(f"Failed to extract text from {file_type_name}: {str(e)}")
            raise RuntimeError(f"Failed to extract text from {file_type_name}: {str(e)}")

    def _extract_from_pdf(self, file_content: bytes) -> str:
        try:
            pdf_file = BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            if len(pdf_reader.pages) == 0:
                raise ValueError("PDF file has no pages")
            
            text_parts = []
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text_parts.append(page_text)
            
            return "\n".join(text_parts).strip()
        except Exception as e:
            raise RuntimeError(f"PDF extraction failed: {str(e)}")

    def _extract_from_docx(self, file_content: bytes) -> str:
        try:
            doc = docx.Document(BytesIO(file_content))
            text_parts = [paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()]
            return "\n".join(text_parts).strip()
        except Exception as e:
            raise RuntimeError(f"DOCX extraction failed: {str(e)}")

    def _extract_from_doc(self, file_content: bytes) -> str:
        try:
            result = mammoth.extract_raw_text(BytesIO(file_content))
            return result.value.strip()
        except Exception as e:
            raise RuntimeError(f"DOC extraction failed: {str(e)}")

    def clean_text(self, text: str) -> str:
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

    async def extract_personal_info(self, text: str) -> PersonalInfo:
        if self.llm is None:
            logger.info("LLM not available, using fallback info extraction")
            return self._fallback_info_extraction(text)
        
        try:
            max_chars = 3000
            truncated_text = text[:max_chars] if len(text) > max_chars else text
            
            prompt = self._create_info_prompt().format_prompt(
                resume_text=truncated_text,
                format_instructions=self.info_parser.get_format_instructions()
            )
            response = await self.llm.ainvoke(prompt)
            llm_result = self.info_parser.parse(response.content)
            
            # If LLM didn't extract a name, try fallback
            if not llm_result.full_name or len(llm_result.full_name.strip()) < 2:
                fallback_result = self._fallback_info_extraction(text)
                if fallback_result.full_name:
                    llm_result.full_name = fallback_result.full_name
            
            # Clean up the name if extracted
            if llm_result.full_name:
                llm_result.full_name = self._clean_extracted_name(llm_result.full_name)
            
            return llm_result
            
        except Exception as e:
            logger.warning(f"LLM info extraction failed: {str(e)}, using fallback")
            return self._fallback_info_extraction(text)

    async def extract_skills(self, text: str) -> ResumeSkills:
        # If LLM is not available, use fallback directly
        if self.llm is None:
            logger.info("LLM not available, using fallback skills extraction")
            return self._fallback_skills_extraction(text)
        
        try:
            prompt = self._create_extraction_prompt().format_prompt(
                resume_text=text,
                format_instructions=self.skills_parser.get_format_instructions()
            )
            response = await self.llm.ainvoke(prompt)
            parsed_skills = self.skills_parser.parse(response.content)
            
            # Validate and clean skills
            return self._validate_skills(parsed_skills)
            
        except Exception as e:
            logger.warning(f"LLM skills extraction failed: {str(e)}, using fallback")
            return self._fallback_skills_extraction(text)

    def _validate_skills(self, skills: ResumeSkills) -> ResumeSkills:
        # Remove duplicates and empty strings
        skills.technical_skills = list(set(filter(bool, [skill.strip() for skill in skills.technical_skills])))
        skills.soft_skills = list(set(filter(bool, [skill.strip() for skill in skills.soft_skills])))
        skills.job_titles = list(set(filter(bool, [title.strip() for title in skills.job_titles])))
        skills.industries = list(set(filter(bool, [industry.strip() for industry in skills.industries])))
        
        # Validate experience years
        if skills.experience_years is not None:
            skills.experience_years = max(0, min(70, skills.experience_years))
            
        return skills

    def _fallback_info_extraction(self, text: str) -> PersonalInfo:
        patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b',
            'linkedin': r'(?:linkedin\.com/in/|linkedin\.com/pub/)[\w-]+'
        }
        
        extracted_info = {}
        for field, pattern in patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            extracted_info[field] = match.group() if match else None
        
        name = self._extract_name_from_text(text)
        
        return PersonalInfo(
            full_name=name,
            email=extracted_info['email'],
            phone=extracted_info['phone'],
            linkedin=extracted_info['linkedin']
        )

    def _fallback_skills_extraction(self, text: str) -> ResumeSkills:
        text_lower = text.lower()
        
        # Common technical skills
        technical_keywords = [
            'python', 'java', 'javascript', 'react', 'node', 'sql', 'aws', 'azure',
            'docker', 'kubernetes', 'git', 'html', 'css', 'mongodb', 'postgresql',
            'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'typescript', 'angular',
            'vue', 'django', 'flask', 'spring', 'express', 'laravel'
        ]
        
        # Common soft skills
        soft_keywords = [
            'leadership', 'communication', 'teamwork', 'problem solving',
            'analytical', 'creative', 'organizational', 'time management',
            'project management', 'critical thinking', 'collaboration'
        ]
        
        found_technical = [skill for skill in technical_keywords if skill in text_lower]
        found_soft = [skill for skill in soft_keywords if skill in text_lower]
        
        # Try to estimate experience years
        experience_years = self._estimate_experience_years(text)
        
        return ResumeSkills(
            technical_skills=found_technical,
            soft_skills=found_soft,
            experience_years=experience_years
        )

    def _estimate_experience_years(self, text: str) -> Optional[int]:
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+?\s*years?\s*in',
            r'over\s*(\d+)\s*years?',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text.lower())
            if matches:
                try:
                    years = max(int(match) for match in matches)
                    return min(years, 70)  # Cap at 70 years
                except ValueError:
                    continue
        
        return None

    def _extract_name_from_text(self, text: str) -> Optional[str]:
        lines = text.split('\n')
        lines = [line.strip() for line in lines if line.strip()]
        
        if not lines:
            return None
        
        # Try first few lines for name
        for i, line in enumerate(lines[:5]):  # Check first 5 lines
            line = line.strip()
            
            skip_keywords = [
                'resume', 'cv', 'curriculum', 'vitae', 'phone', 'email', 'address',
                'objective', 'summary', 'profile', 'experience', 'education',
                'skills', 'contact', 'www', 'http', '.com', '@'
            ]
            
            if any(keyword in line.lower() for keyword in skip_keywords):
                continue
            
            # Check if line looks like a name (2-4 words, proper capitalization)
            words = line.split()
            if 2 <= len(words) <= 4:
                # Check if words start with capital letters and contain only letters
                if all(word[0].isupper() and word.replace('-', '').replace("'", '').isalpha() 
                      for word in words if word):
                    return line
        
        return None

    def _clean_extracted_name(self, name: str) -> str:
        if not name:
            return name
            
        # Remove common prefixes
        prefixes_to_remove = ['resume of ', 'cv of ', 'name:', 'full name:']
        name_lower = name.lower().strip()
        
        for prefix in prefixes_to_remove:
            if name_lower.startswith(prefix):
                name = name[len(prefix):].strip()
                break
        
        # Remove extra whitespace and clean up
        name = ' '.join(name.split())
        
        # Capitalize properly if it's all caps or all lowercase
        if name.isupper() or name.islower():
            name = name.title()
        
        return name

    async def parse_resume_from_file(self, file_content: bytes, file_type: str) -> ParsedResume:
        try:
            # Extract and clean text
            raw_text = self.extract_text_from_file(file_content, file_type)
            if not raw_text:
                raise ValueError("No text could be extracted from the file")
                
            cleaned_text = self.clean_text(raw_text)
            if not cleaned_text:
                raise ValueError("File contains no readable text after cleaning")
            
            # Extract information concurrently
            personal_info, skills = await self._extract_info_and_skills(cleaned_text)
            
            return ParsedResume(
                raw_text=raw_text,
                personal_info=personal_info,
                skills=skills,
                cleaned_text=cleaned_text
            )
        except Exception as e:
            logger.error(f"Resume parsing failed: {str(e)}")
            raise

    async def _extract_info_and_skills(self, text: str) -> Tuple[PersonalInfo, ResumeSkills]:
        try:
            personal_info_task = self.extract_personal_info(text)
            skills_task = self.extract_skills(text)
            
            results = await asyncio.gather(
                personal_info_task, 
                skills_task, 
                return_exceptions=True
            )
            
            personal_info = results[0] if not isinstance(results[0], Exception) else self._fallback_info_extraction(text)
            skills = results[1] if not isinstance(results[1], Exception) else self._fallback_skills_extraction(text)
                
            return personal_info, skills
        except Exception as e:
            logger.error(f"Concurrent extraction failed: {str(e)}")
            # Fallback to sequential processing
            personal_info = self._fallback_info_extraction(text)
            skills = self._fallback_skills_extraction(text)
            return personal_info, skills

    async def process_and_store_resume(self, user_id: str, file_content: bytes, file_type: str) -> ParsedResume:
        try:
            # Parse resume
            parsed_resume = await self.parse_resume_from_file(file_content, file_type)
            
            # Store in database
            await self._store_parsed_resume(user_id, parsed_resume)
            
            return parsed_resume
            
        except Exception as e:
            logger.error(f"Failed to process resume for user {user_id}: {str(e)}")
            raise Exception(f"Failed to process resume: {str(e)}")

    async def _store_parsed_resume(self, user_id: str, parsed_resume: ParsedResume) -> None:
        try:
            db = UserDatabase()
            
            # Clear existing skills
            db.clear_user_skills(user_id)
            
            # Prepare skills for storage
            skills_to_store = self._prepare_skills_for_storage(parsed_resume.skills)
            
            # Store skills in batch
            if skills_to_store:
                db.add_user_skills_batch(user_id, skills_to_store)
            
            # Update profile
            profile_updates = self._prepare_profile_updates(parsed_resume)
            db.update_user_profile(user_id, profile_updates)
            
            logger.info(f"Successfully stored resume data for user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to store resume data for user {user_id}: {str(e)}")
            raise Exception(f"Failed to store resume data: {str(e)}")

    def _prepare_skills_for_storage(self, skills: ResumeSkills) -> List[UserSkillCreate]:
        skills_to_store = []
        
        skill_mappings = [
            (skills.technical_skills, "technical"),
            (skills.soft_skills, "soft"),
            (skills.industries, "industry"),
            (skills.job_titles, "job_title")
        ]
        
        for skill_list, category in skill_mappings:
            for skill in skill_list:
                skill_name = skill.strip()
                if skill_name:  # Only add non-empty skills
                    skills_to_store.append(UserSkillCreate(
                        user_id="",  # Will be set by database layer
                        skill_name=skill_name,
                        skill_category=category,
                        source="resume"
                    ))
        
        return skills_to_store

    def _prepare_profile_updates(self, parsed_resume: ParsedResume) -> Dict[str, any]:
        profile_updates = {"resume_processed": True}
        
        info = parsed_resume.personal_info
        skills = parsed_resume.skills
        
        # Map fields that have values
        field_mappings = [
            (info.full_name, "full_name"),
            (info.phone, "phone"),
            (info.location, "location"),
            (info.linkedin, "linkedin_url"),
            (skills.experience_years, "experience_years"),
            (skills.education_level, "education_level")
        ]
        
        for value, field_name in field_mappings:
            if value and str(value).strip():
                profile_updates[field_name] = value
        
        return profile_updates
    