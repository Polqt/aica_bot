import asyncio
import os
import logging
import streamlit as st
import random
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv

from firecrawl import Firecrawl
from langchain_anthropic import ChatAnthropic
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

from ..database.models.job_models import Job

logger = logging.getLogger(__name__)

class ExtractedJobData(BaseModel):
    title: str = Field(description="Job title")
    company: str = Field(description="Company name")
    location: Optional[str] = Field(description="Job location")
    description: str = Field(description="Full job description")
    requirements: List[str] = Field(description="Job requirements and qualifications")
    skills: List[str] = Field(description="Required and preferred skills")

class JobScraper:
    ETHICAL_JOB_SOURCES = {
        "we_work_remotely": [
            "https://weworkremotely.com/remote-jobs/search?utf8=%E2%9C%93&term=software+engineer",
            "https://weworkremotely.com/remote-jobs/search?utf8=%E2%9C%93&term=product+manager",
            "https://weworkremotely.com/remote-jobs/search?utf8=%E2%9C%93&term=data+scientist",
            "https://weworkremotely.com/remote-jobs/search?utf8=%E2%9C%93&term=marketing",
            "https://weworkremotely.com/remote-jobs/search?utf8=%E2%9C%93&term=designer",
        ],
        "angel_list": [
            "https://angel.co/jobs?keywords=software%20engineer",
            "https://angel.co/jobs?keywords=product%20manager", 
            "https://angel.co/jobs?keywords=data%20scientist",
            "https://angel.co/jobs?keywords=marketing%20manager",
            "https://angel.co/jobs?keywords=full%20stack%20developer",
        ],
    }
    
    def __init__(self, firecrawl_api_key: Optional[str] = None):
        load_dotenv()
        firecrawl_api_key = firecrawl_api_key or os.getenv("FIRECRAWL_API_KEY")
        model_name = os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")
          
        self.app = Firecrawl(api_key=firecrawl_api_key)
        self.llm = ChatAnthropic(model=model_name, temperature=0)
        self.parser = PydanticOutputParser(pydantic_object=ExtractedJobData)
        
        self.extraction_prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                """
                You are an expert job posting analyzer. Extract structured information 
                from job postings with high accuracy. Focus on identifying all relevant 
                skills, requirements, and qualifications that would be important for 
                job matching algorithms.

                CRITICAL: You must provide valid, complete JSON output. Do not repeat 
                the same text multiple times. If you encounter parsing issues, provide
                a minimal valid response rather than malformed output.

                For the title field, extract ONLY the actual job title, not repeated text.
                """
            ),
            (
                "human",
                """
                Extract structured information from this job posting:
                {job_content}

                {format_instructions}

                Remember: Provide clean, non-repetitive output. If the content is unclear,
                make reasonable assumptions but keep the response well-structured.
                """
            )
        ])

    @st.cache_data(show_spinner=False)
    def _cached_parse_resume(pdf_link: str) -> str:
        app = Firecrawl()
        try:
            response = app.scrape(url=pdf_link)
            if hasattr(response, "markdown") and response.markdown:
                return response.markdown
            elif hasattr(response, "content") and response.content:
                return response.content
            return ""
        except Exception as e:
            logger.error(f"Error parsing resume from {pdf_link}: {e}")
            raise

    async def parse_resume(self, pdf_link: str) -> str:
        return self._cached_parse_resume(pdf_link)

    async def scrape_job_posting(self, job_url: str) -> str:
        try:
            response = self.app.scrape(
                url=job_url,
                formats=["markdown"],
                only_main_content=True,
            )
            if hasattr(response, "markdown") and response.markdown:
                return response.markdown
            elif hasattr(response, "content") and response.content:
                return response.content
            return ""
        except Exception as e:
            logger.error(f"Error scraping job posting {job_url}: {e}")
            return ""

    async def extract_job_data(self, raw_content: str, job_url: str) -> Optional[ExtractedJobData]:
        if not raw_content.strip():
            return None
            
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Truncate content if too long to avoid token limits
                if len(raw_content) > 8000:
                    raw_content = raw_content[:8000] + "..."
                
                prompt = self.extraction_prompt.format_prompt(
                    job_content=raw_content,
                    format_instructions=self.parser.get_format_instructions()
                )
                
                response = await self.llm.ainvoke(prompt)
                
                # Check for malformed responses
                if "Head of Head of Head of" in response.content:
                    logger.warning(f"Malformed response detected, retrying... (attempt {attempt + 1})")
                    await asyncio.sleep(2)  # Wait before retry
                    continue
                
                extracted_data = self.parser.parse(response.content)
                
                # Validate the extracted data
                if self._is_valid_extraction(extracted_data):
                    return extracted_data
                else:
                    logger.warning(f"Invalid extraction detected, retrying... (attempt {attempt + 1})")
                    continue
                    
            except Exception as e:
                logger.error(f"Error extracting job data from {job_url} (attempt {attempt + 1}): {e}")
                if attempt == max_retries - 1:
                    return None
                await asyncio.sleep(2)
                
        return None

    def _is_valid_extraction(self, data: ExtractedJobData) -> bool:
        if not data.title or not data.company:
            return False
            
        # Check for repeated text patterns
        if len(data.title) > 200 or "Head of Head of" in data.title:
            return False
            
        # Check for reasonable content length
        if len(data.description) > 10000:
            return False
            
        return True

    async def scrape_and_extract_job(self, job_url: str) -> Optional[Job]:
        try:
            # Scrape raw content
            raw_content = await self.scrape_job_posting(job_url)
            if not raw_content:
                return None
                
            # Extract structured data
            extracted_data = await self.extract_job_data(raw_content, job_url)
            if not extracted_data:
                return None
                
            # Convert to Job model
            return Job(
                title=extracted_data.title,
                url=job_url,
                company=extracted_data.company,
                description=extracted_data.description,
                location=extracted_data.location,
                created_at=datetime.now(),
                requirements=extracted_data.requirements,
                skills=extracted_data.skills,
            )
            
        except Exception as e:
            logger.error(f"Error processing job {job_url}: {e}")
            return None

    async def scrape_job_board_search(self, search_url: str, max_jobs: int = 50) -> List[Job]:
        try:
            search_response = self.app.extract(
                urls=[search_url],
                schema={
                    "type": "object",
                    "properties": {
                        "job_urls": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of individual job posting URLs"
                        }
                    }
                },
                prompt=f"Extract up to {max_jobs} individual job posting URLs from this job search results page. Only include direct links to job postings, not search result pages.",
            )
            
            job_urls = search_response.data.get("job_urls", [])
            if not job_urls:
                logger.warning(f"No job URLs found for {search_url}")
                return []
            
            job_urls = job_urls[:max_jobs]
            logger.info(f"Found {len(job_urls)} job URLs from {search_url}")
            
            jobs = []
            for i, job_url in enumerate(job_urls):
                try:
                    logger.info(f"Processing job {i+1}/{len(job_urls)}: {job_url}")
                    job = await self.scrape_and_extract_job(job_url)
                    if job:
                        jobs.append(job)
                        logger.info(f"Successfully scraped: {job.title} at {job.company}")
                    else:
                        logger.warning(f"Failed to extract job data from {job_url}")
                        
                except Exception as e:
                    logger.error(f"Error processing job URL {job_url}: {e}")
                    
                # Add delay to be respectful to the server
                await asyncio.sleep(random.uniform(1, 3))
                
            return jobs
            
        except Exception as e:
            logger.error(f"Error scraping job board {search_url}: {e}")
            return []

    def get_ethical_job_sources(self) -> Dict[str, List[str]]:
        return self.ETHICAL_JOB_SOURCES.copy()

    async def batch_scrape_ethical_sources(self, 
                                         sources: List[str], 
                                         jobs_per_source: int = 20) -> List[Job]:

        all_jobs = []
        
        for source_name in sources:
            if source_name not in self.ETHICAL_JOB_SOURCES:
                logger.warning(f"Unknown source: {source_name}")
                continue
            
            # Get all available URLs for this source
            source_urls = self.ETHICAL_JOB_SOURCES[source_name]
            
            # Randomly shuffle URLs to get different results each time
            shuffled_urls = source_urls.copy()
            random.shuffle(shuffled_urls)
            
            source_jobs = []
            jobs_needed = jobs_per_source
            
            for source_url in shuffled_urls:
                if jobs_needed <= 0:
                    break
                    
                logger.info(f"Scraping {source_name} from {source_url}")
                
                try:
                    jobs = await self.scrape_job_board_search(source_url, min(jobs_needed, 20))
                    source_jobs.extend(jobs)
                    jobs_needed -= len(jobs)
                    logger.info(f"Scraped {len(jobs)} jobs from {source_url}")
                    
                except Exception as e:
                    logger.error(f"Error scraping {source_url}: {e}")

                # Add delay between different URLs
                await asyncio.sleep(random.uniform(2, 4))
            
            all_jobs.extend(source_jobs)
            logger.info(f"Total scraped from {source_name}: {len(source_jobs)} jobs")
            
        return all_jobs
    