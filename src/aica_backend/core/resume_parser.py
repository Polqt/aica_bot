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

from database.user_db import UserDatabase
from database.models.user_models import UserSkillCreate

logger = logging.getLogger(__name__)

# Data Models
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
    """Advanced resume parser for RAG job matching application.

    Handles various resume formats and extracts comprehensive information
    including skills, personal info, experience, and education.
    """

    SUPPORTED_FILE_TYPES = {
        "application/pdf": "PDF",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
        "application/msword": "DOC"
    }

    # Skill normalization mappings for common typos and variations
    SKILL_NORMALIZATIONS = {
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

    def __init__(self):
        self.llm = self._create_llm_client()
        self.skills_parser = PydanticOutputParser(pydantic_object=ResumeSkills)
        self.info_parser = PydanticOutputParser(pydantic_object=PersonalInfo)

    def _create_llm_client(self) -> Optional[ChatAnthropic]:
        """Create Anthropic LLM client with error handling."""
        try:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key or api_key == "your_anthropic_api_key_here":
                logger.warning("ANTHROPIC_API_KEY not set, using fallback methods")
                return None

            return ChatAnthropic(
                model=os.getenv("ANTHROPIC_MODEL", "claude-3-haiku-20240307"),
                temperature=0,
                anthropic_api_key=api_key
            )
        except Exception as e:
            logger.warning(f"LLM client initialization failed: {str(e)}")
            return None
    
    def _create_comprehensive_prompt(self) -> ChatPromptTemplate:
        """Create comprehensive prompt for extracting ALL resume information."""
        return ChatPromptTemplate.from_messages([
            ("system", """You are an expert resume parser for a RAG job matching application. Your mission is to extract EVERY piece of relevant information from resumes to enable accurate job matching.

            CRITICAL EXTRACTION PRINCIPLES:
            1. SCAN THE ENTIRE RESUME - every section, every line, every word
            2. EXTRACT INFORMATION FROM ALL SECTIONS - summary, experience, skills, projects, education, etc.
            3. BE COMPREHENSIVE - don't miss anything that could be relevant for job matching
            4. PRESERVE ORIGINAL TEXT - copy skills and information exactly as written
            5. HANDLE DIFFERENT RESUME STYLES - formal, creative, technical, etc.

            EXTRACTION REQUIREMENTS:

            PERSONAL INFORMATION:
            - Full name (from header/top of resume)
            - Phone number (any format)
            - Email address
            - Location/City (current or general location)
            - LinkedIn profile URL

            TECHNICAL SKILLS - EXTRACT FROM EVERYWHERE:
            - Programming languages (Python, Java, JavaScript, etc.)
            - Frameworks and libraries (React, Angular, Django, etc.)
            - Databases (MySQL, PostgreSQL, MongoDB, etc.)
            - Cloud platforms (AWS, Azure, GCP, etc.)
            - Tools and technologies (Docker, Kubernetes, Git, etc.)
            - Operating systems (Linux, Windows, macOS)
            - Development tools (VS Code, IntelliJ, etc.)
            - APIs and protocols (REST, GraphQL, etc.)
            - ANY technology mentioned in experience descriptions
            - ANY technology mentioned in project descriptions
            - ANY technology mentioned in skills sections

            SOFT SKILLS - EXTRACT FROM EVERYWHERE:
            - Communication skills
            - Leadership abilities
            - Teamwork/collaboration
            - Problem-solving abilities
            - Analytical thinking
            - Time management
            - Project management
            - Customer service orientation
            - Mentoring/coaching abilities
            - Adaptability/flexibility
            - Creativity/innovation
            - ANY interpersonal or professional skill mentioned

            PROFESSIONAL INFORMATION:
            - Experience years: Calculate from work history dates and descriptions
            - Job titles: All positions held (current and past)
            - Education level: Highest degree achieved
            - Industries: Sectors/fields of experience

            EXTRACTION STRATEGY:
            1. Read the entire resume multiple times
            2. Look for skills in job descriptions under experience
            3. Check project descriptions for technologies used
            4. Scan skills sections thoroughly
            5. Look for implicit skills in achievement descriptions
            6. Extract location information from headers or contact info
            7. Calculate experience from date ranges in work history

            Return ONLY valid JSON with comprehensive information."""),
            ("human", """EXTRACT ALL INFORMATION FROM THIS RESUME FOR JOB MATCHING:

            {resume_text}

            COMPREHENSIVE EXTRACTION REQUIREMENTS:

            1. PERSONAL INFO:
               - Extract full name from resume header
               - Find phone number (any format)
               - Extract email address
               - Get location/city information
               - Find LinkedIn profile URL

            2. TECHNICAL SKILLS - SEARCH EVERYWHERE:
               - Programming languages mentioned anywhere
               - Frameworks and libraries used in projects/experience
               - Databases mentioned in work history
               - Cloud platforms and services
               - Development tools and technologies
               - Operating systems
               - APIs, protocols, and integrations
               - Extract from experience descriptions
               - Extract from project sections
               - Extract from skills sections

            3. SOFT SKILLS - SEARCH EVERYWHERE:
               - Communication and interpersonal skills
               - Leadership and management abilities
               - Teamwork and collaboration skills
               - Problem-solving capabilities
               - Analytical and critical thinking
               - Time management and organization
               - Project management skills
               - Customer service orientation
               - Mentoring and coaching abilities
               - Adaptability and flexibility
               - Creativity and innovation

            4. PROFESSIONAL INFO:
               - Calculate years of experience from work history dates
               - List all job titles/positions held
               - Extract highest education level
               - Identify industries/domains of experience

            CRITICAL: This is for a RAG job matching system. Extract EVERY technology, skill, and piece of information that could be relevant for matching candidates to jobs. Be thorough and comprehensive.

            {format_instructions}""")
        ])
        
    def _create_info_prompt(self) -> ChatPromptTemplate:
        """Create prompt for extracting personal information comprehensively."""
        return ChatPromptTemplate.from_messages([
            ("system", """You are an expert at extracting personal and contact information from resumes of all styles and formats.

            EXTRACTION PRIORITIES:
            1. Full name - usually at the very top of the resume
            2. Contact information - phone, email, location
            3. Professional profiles - LinkedIn, GitHub, etc.

            NAME EXTRACTION RULES:
            - Look at the top 3-5 lines of the resume first
            - Names are typically 2-4 words with proper capitalization
            - May include titles (Dr., Mr., Ms.) or suffixes (Jr., Sr., III)
            - Could be in different formats or split across lines
            - Choose the most complete name if multiple found

            CONTACT INFORMATION:
            - Phone numbers in any format (+1, (555), 555-1234, etc.)
            - Email addresses (any valid format)
            - Location/City (current residence or general area)
            - LinkedIn profiles (full URLs or @usernames)

            Be thorough and handle various resume formats and styles."""),
            ("human", """Extract personal and contact information from this resume:

            {resume_text}

            EXTRACTION REQUIREMENTS:
            - FULL NAME: Find the person's complete name from the resume header
            - PHONE: Extract phone number in any format
            - EMAIL: Find the email address
            - LOCATION: Extract city/location information
            - LINKEDIN: Find LinkedIn profile URL if present

            Look carefully at the beginning of the resume for the name, and scan all sections for contact information.

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
        """Extract comprehensive skills information from resume text."""
        if self.llm is None:
            logger.info("LLM not available, using fallback skills extraction")
            return self._fallback_skills_extraction(text)

        try:
            prompt = self._create_comprehensive_prompt().format_prompt(
                resume_text=text,
                format_instructions=self.skills_parser.get_format_instructions()
            )
            response = await self.llm.ainvoke(prompt)
            parsed_skills = self.skills_parser.parse(response.content)

            # Validate, clean, and normalize skills
            validated_skills = self._validate_skills(parsed_skills)
            normalized_skills = self._normalize_skills(validated_skills)

            return normalized_skills

        except Exception as e:
            logger.warning(f"LLM skills extraction failed: {str(e)}, using fallback")
            return self._fallback_skills_extraction(text)

    def _normalize_skills(self, skills: ResumeSkills) -> ResumeSkills:
        """Normalize skill names to handle common typos and variations."""
        def normalize_skill_list(skill_list: List[str]) -> List[str]:
            normalized = []
            for skill in skill_list:
                skill_lower = skill.lower().strip()
                # Check if we have a normalization mapping
                if skill_lower in self.SKILL_NORMALIZATIONS:
                    normalized.append(self.SKILL_NORMALIZATIONS[skill_lower])
                else:
                    # Title case for consistency
                    normalized.append(skill.strip().title())
            return list(set(normalized))  # Remove duplicates

        skills.technical_skills = normalize_skill_list(skills.technical_skills)
        skills.soft_skills = normalize_skill_list(skills.soft_skills)
        skills.industries = normalize_skill_list(skills.industries)

        return skills

    def _validate_skills(self, skills: ResumeSkills) -> ResumeSkills:
        """Validate and clean extracted skills."""
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
        """Fallback method for extracting personal information."""
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
        """Enhanced fallback method for skills extraction."""
        text_lower = text.lower()

        # Expanded technical skills list
        technical_keywords = [
            'python', 'java', 'javascript', 'typescript', 'react', 'node.js', 'node',
            'html', 'css', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis',
            'aws', 'azure', 'google cloud', 'docker', 'kubernetes', 'git', 'github',
            'linux', 'windows', 'macos', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin',
            'angular', 'vue', 'django', 'flask', 'spring', 'express', 'laravel',
            'tensorflow', 'pytorch', 'pandas', 'numpy', 'jupyter', 'tableau',
            'react native', 'flutter', 'ios', 'android', 'graphql', 'rest api',
            'tailwind css', 'bootstrap', 'sass', 'webpack', 'babel', 'jest'
        ]

        # Expanded soft skills list
        soft_keywords = [
            'leadership', 'communication', 'teamwork', 'collaboration', 'problem solving',
            'analytical', 'critical thinking', 'creativity', 'innovation', 'organization',
            'time management', 'project management', 'customer service', 'mentoring',
            'coaching', 'adaptability', 'flexibility', 'presentation', 'negotiation'
        ]

        found_technical = [skill for skill in technical_keywords if skill in text_lower]
        found_soft = [skill for skill in soft_keywords if skill in text_lower]

        # Extract additional info
        experience_years = self._estimate_experience_years(text)
        job_titles = self._extract_job_titles(text)
        education_level = self._extract_education_level(text)
        industries = self._extract_industries(text)

        return ResumeSkills(
            technical_skills=found_technical,
            soft_skills=found_soft,
            experience_years=experience_years,
            job_titles=job_titles,
            education_level=education_level,
            industries=industries
        )

    def _estimate_experience_years(self, text: str) -> Optional[int]:
        """Calculate years of experience from resume text."""
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+?\s*years?\s*in(?:\s+the\s+)?(?:software|tech|it)?\s*industry',
            r'experience:\s*(\d+)\+?\s*years?',
            r'over\s*(\d+)\s*years?',
            r'(\d+)\+?\s*years?\s*professional\s*experience'
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    years = max(int(match) for match in matches)
                    return min(years, 70)  # Cap at 70 years
                except ValueError:
                    continue

        return None

    def _extract_job_titles(self, text: str) -> List[str]:
        """Extract job titles from resume text."""
        # Look for common job title patterns
        title_patterns = [
            r'(?:^|\n)([A-Z][^.\n]{10,50}?)(?:\n|$)',  # Lines that look like job titles
            r'(?:position|role|title)[:\s]*([A-Z][^.\n]{5,30})',  # Explicit position mentions
            r'(?:software|web|full.?stack|backend|frontend|devops|data)\s+(?:engineer|developer|analyst|scientist|architect)',
        ]

        found_titles = []
        for pattern in title_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                title = match.strip()
                if len(title) > 3 and len(title) < 50:
                    # Filter out non-job-title content
                    if not any(word in title.lower() for word in ['email', 'phone', 'address', 'www', 'http', 'university', 'college']):
                        found_titles.append(title)

        return list(set(found_titles))[:5]  # Limit to 5 most relevant

    def _extract_education_level(self, text: str) -> Optional[str]:
        """Extract highest education level from resume."""
        text_lower = text.lower()
        education_levels = [
            ('phd', 'PhD'), ('doctorate', 'PhD'), ('doctoral', 'PhD'),
            ("master's", "Master's"), ('masters', "Master's"), ('mba', 'MBA'),
            ('ms', 'MS'), ('ma', 'MA'), ('msc', 'MSc'), ('meng', 'MEng'),
            ("bachelor's", "Bachelor's"), ('bachelors', 'Bachelor\'s'), ('bachelor', 'Bachelor\'s'),
            ('bs', 'BS'), ('ba', 'BA'), ('bsc', 'BSc'), ('beng', 'BEng'),
            ('associate', 'Associate'), ('diploma', 'Diploma'), ('certificate', 'Certificate')
        ]

        for keyword, level in education_levels:
            if keyword in text_lower:
                return level

        return None

    def _extract_industries(self, text: str) -> List[str]:
        """Extract industries/sectors from resume text."""
        industries = [
            'technology', 'software', 'it', 'finance', 'banking', 'healthcare', 'medical',
            'retail', 'e-commerce', 'education', 'consulting', 'manufacturing', 'automotive',
            'telecommunications', 'energy', 'oil', 'gas', 'government', 'non-profit',
            'marketing', 'advertising', 'media', 'entertainment', 'hospitality', 'real estate',
            'logistics', 'supply chain', 'construction', 'pharmaceuticals', 'biotechnology'
        ]

        found_industries = [industry for industry in industries if industry in text.lower()]
        return list(set(found_industries))

    def _extract_name_from_text(self, text: str) -> Optional[str]:
        """Extract full name from resume text."""
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
                    return self._clean_extracted_name(line)

        return None

    def _clean_extracted_name(self, name: str) -> str:
        """Clean and format extracted name."""
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

        # Proper title case
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
    