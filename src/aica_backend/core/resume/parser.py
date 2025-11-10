import os
import asyncio
import logging
import json
from typing import Optional, Tuple, List, Dict

from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import PydanticOutputParser

from .models import ResumeSkills, PersonalInfo, ParsedResume
from .extractor import FileExtractor
from .skill_extractor import SkillExtractor
from .info_extractor import InfoExtractor
from .normalizer import SkillNormalizer, TextCleaner
from prompts.resume_prompts import create_comprehensive_skills_prompt, create_personal_info_prompt
from utils.text_utils import extract_json_from_text

from database.user_db import UserDatabase
from database.models.user_models import UserSkillCreate

logger = logging.getLogger(__name__)


class ResumeParser:
    def __init__(self):
        self.llm = self._create_llm_client()
        self.skills_parser = PydanticOutputParser(pydantic_object=ResumeSkills)
        self.info_parser = PydanticOutputParser(pydantic_object=PersonalInfo)
    
    def _create_llm_client(self) -> Optional[ChatAnthropic]:
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
            return None
    
    async def parse_resume_from_file(self, file_content: bytes, file_type: str) -> ParsedResume:
        try:
            # Extract and clean text
            raw_text = FileExtractor.extract_text_from_file(file_content, file_type)
            if not raw_text:
                raise ValueError("No text could be extracted from the file")
            
            cleaned_text = TextCleaner.clean_text(raw_text)
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
        except Exception:
            raise
    
    async def _extract_info_and_skills(self, text: str) -> Tuple[PersonalInfo, ResumeSkills]:
        try:
            personal_info_task = self._extract_personal_info(text)
            skills_task = self._extract_skills(text)
            
            results = await asyncio.gather(
                personal_info_task,
                skills_task,
                return_exceptions=True
            )
            
            personal_info = results[0] if not isinstance(results[0], Exception) else InfoExtractor.extract_with_fallback(text)
            skills = results[1] if not isinstance(results[1], Exception) else SkillExtractor.extract_with_fallback(text)
            
            return personal_info, skills
        except Exception:
            personal_info = InfoExtractor.extract_with_fallback(text)
            skills = SkillExtractor.extract_with_fallback(text)
            return personal_info, skills
    
    async def _extract_personal_info(self, text: str) -> PersonalInfo:
        if self.llm is None:
            logger.info("LLM not available, using fallback info extraction")
            return InfoExtractor.extract_with_fallback(text)
        
        try:
            # For name extraction, use ONLY the top portion of the resume to avoid reference confusion
            # Most resumes have the name in the first 300-1000 characters (first 3-10 lines)
            max_chars_for_name = 1000  
            truncated_for_name = text[:max_chars_for_name] if len(text) > max_chars_for_name else text
            
            max_chars = 3000
            truncated_text = text[:max_chars] if len(text) > max_chars else text
            
            prompt = create_personal_info_prompt().format_prompt(
                resume_text=truncated_for_name,  
                format_instructions=self.info_parser.get_format_instructions()
            )
            response = await self.llm.ainvoke(prompt)
            
            clean_json = extract_json_from_text(response.content)
            
            try:
                parsed_data = json.loads(clean_json)
                
                if isinstance(parsed_data.get('email'), list):
                    parsed_data['email'] = parsed_data['email'][0] if parsed_data['email'] else None
                    logger.warning(f"Fixed email format: AI returned list, using first email: {parsed_data['email']}")
                
                clean_json = json.dumps(parsed_data)
            except json.JSONDecodeError:
                pass
            
            llm_result = self.info_parser.parse(clean_json)
            
            if llm_result.full_name:
                llm_result.full_name = InfoExtractor.clean_extracted_name(llm_result.full_name)
                
                name_lower = llm_result.full_name.lower()
                top_section = text[:1000].lower()  
                
                if name_lower not in top_section:
                    logger.warning(f"Name '{llm_result.full_name}' not found in resume header, using fallback")
                    fallback_result = InfoExtractor.extract_with_fallback(truncated_for_name)
                    llm_result.full_name = fallback_result.full_name
                elif InfoExtractor.is_likely_reference_name(text, llm_result.full_name):
                    logger.warning(f"Name '{llm_result.full_name}' appears to be a reference, using fallback")
                    fallback_result = InfoExtractor.extract_with_fallback(truncated_for_name)
                    llm_result.full_name = fallback_result.full_name
            
            if not llm_result.full_name or len(llm_result.full_name.strip()) < 2:
                fallback_result = InfoExtractor.extract_with_fallback(truncated_for_name)
                if fallback_result.full_name:
                    llm_result.full_name = fallback_result.full_name
            
            return llm_result
        
        except Exception as e:
            logger.error(f"Error extracting personal info: {e}")
            max_chars_for_name = 1000  
            truncated_for_name = text[:max_chars_for_name] if len(text) > max_chars_for_name else text
            return InfoExtractor.extract_with_fallback(truncated_for_name)
    
    async def _extract_skills(self, text: str) -> ResumeSkills:
        if self.llm is None:
            logger.info("LLM not available, using fallback skills extraction")
            return SkillExtractor.extract_with_fallback(text)
        
        try:
            prompt = create_comprehensive_skills_prompt().format_prompt(
                resume_text=text,
                format_instructions=self.skills_parser.get_format_instructions()
            )
            response = await self.llm.ainvoke(prompt)
            
            clean_json = extract_json_from_text(response.content)
            parsed_skills = self.skills_parser.parse(clean_json)
            
            # Validate, clean, and normalize skills
            validated_skills = SkillNormalizer.validate_skills(parsed_skills)
            normalized_skills = SkillNormalizer.normalize_skills(validated_skills)
            
            return normalized_skills
        
        except Exception as e:
            return SkillExtractor.extract_with_fallback(text)
    
    async def process_and_store_resume(
        self,
        user_id: str,
        file_content: bytes,
        file_type: str
    ) -> ParsedResume:
        try:
            # Parse resume
            parsed_resume = await self.parse_resume_from_file(file_content, file_type)
            
            # Store in database
            await self._store_parsed_resume(user_id, parsed_resume)
            
            return parsed_resume
        
        except Exception as e:
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
                if skill_name:  
                    skills_to_store.append(UserSkillCreate(
                        user_id="",
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
