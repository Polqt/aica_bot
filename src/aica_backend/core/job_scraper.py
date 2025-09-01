import asyncio
import logging
from typing import List, Dict, Optional
from datetime import datetime

import streamlit as st
from firecrawl import FirecrawlApp
from langchain_anthropic import ChatAnthropic
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

from ..database.models.job_models import Job, JobListings

logger = logging.getLogger(__name__)

class ExtractedJobData(BaseModel):
    """Structured job data extracted from raw content"""
    title: str = Field(description="Job title")
    company: str = Field(description="Company name")
    location: Optional[str] = Field(description="Job location")
    description: str = Field(description="Full job description")
    requirements: List[str] = Field(description="Job requirements and qualifications")
    skills: List[str] = Field(description="Required and preferred skills")
    experience_level: Optional[str] = Field(description="Required experience level")
    employment_type: Optional[str] = Field(description="Full-time, part-time, contract, etc.")
    salary_range: Optional[str] = Field(description="Salary information if available")

class JobScraper:
    ETHICAL_JOB_SOURCES = {
        "we_work_remotely": "https://weworkremotely.com/",
        "angel_list": "https://angel.co/jobs",
        "authentic_jobs": "https://authenticjobs.com/",
    }
    
    def __init__(self, firecrawl_api_key: Optional[str] = None):
        self.app = FirecrawlApp(api_key=firecrawl_api_key)
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0)
        self.parser = PydanticOutputParser(pydantic_object=ExtractedJobData)
        
        self.extraction_prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                """
                    You are an expert job posting analyzer. Extract structured information 
                    from job postings with high accuracy. Focus on identifying all relevant 
                    skills, requirements, and qualifications that would be important for 
                    job matching algorithms.
                """
            ),
            (
                "human",
                """
                    Extract structured information from this job posting:
                    {job_content}
                    {format_instructions}
                """
            )
        ])

    @st.cache_data(show_spinner=False)
    def _cached_parse_resume(pdf_link: str) -> str:
        app = FirecrawlApp()
        try:
            response = app.scrape_url(url=pdf_link)
            return response.get("markdown", response.get("content", ""))
        except Exception as e:
            logger.error(f"Error parsing resume from {pdf_link}: {e}")
            raise

    async def parse_resume(self, pdf_link: str) -> str:
        return self._cached_parse_resume(pdf_link)

    async def scrape_job_posting(self, job_url: str) -> str:
        try:
            response = self.app.scrape_url(
                url=job_url,
                params={
                    "formats": ["markdown"],
                    "onlyMainContent": True,
                    "removeTags": ["nav", "footer", "header", "ads"]
                }
            )
            return response.get("markdown", response.get("content", ""))
        except Exception as e:
            logger.error(f"Error scraping job posting {job_url}: {e}")
            return ""

    async def extract_job_data(self, raw_content: str, job_url: str) -> Optional[ExtractedJobData]:
        if not raw_content.strip():
            return None
            
        try:
            prompt = self.extraction_prompt.format_prompt(
                job_content=raw_content,
                format_instructions=self.parser.get_format_instructions()
            )
            
            response = await self.llm.ainvoke(prompt)
            extracted_data = self.parser.parse(response.content)
            return extracted_data
            
        except Exception as e:
            logger.error(f"Error extracting job data from {job_url}: {e}")
            return None

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
            search_response = self.app.scrape_url(
                url=search_url,
                params={
                    "formats": ["extract"],
                    "extract": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "job_urls": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "List of individual job posting URLs"
                                }
                            }
                        },
                        "prompt": f"Extract up to {max_jobs} individual job posting URLs from this job search results page."
                    }
                }
            )
            
            job_urls = search_response.get("extract", {}).get("job_urls", [])
            if not job_urls:
                logger.warning(f"No job URLs found in search results: {search_url}")
                return []
            
            job_urls = job_urls[:max_jobs]
            
            jobs = []
            for job_url in job_urls:
                job = await self.scrape_and_extract_job(job_url)
                if job:
                    jobs.append(job)
                    
                await asyncio.sleep(1)
                
            return jobs
            
        except Exception as e:
            logger.error(f"Error scraping job board {search_url}: {e}")
            return []

    def get_ethical_job_sources(self) -> Dict[str, str]:
        return self.ETHICAL_JOB_SOURCES.copy()

    async def batch_scrape_ethical_sources(self, 
                                         sources: List[str], 
                                         jobs_per_source: int = 20) -> List[Job]:

        all_jobs = []
        
        for source_name in sources:
            if source_name not in self.ETHICAL_JOB_SOURCES:
                logger.warning(f"Unknown source: {source_name}")
                continue
                
            source_url = self.ETHICAL_JOB_SOURCES[source_name]
            logger.info(f"Scraping {source_name} from {source_url}")
            
            try:
                jobs = await self.scrape_job_board_search(source_url, jobs_per_source)
                all_jobs.extend(jobs)
                logger.info(f"Scraped {len(jobs)} jobs from {source_name}")
                
            except Exception as e:
                logger.error(f"Error scraping {source_name}: {e}")

            await asyncio.sleep(2)
            
        return all_jobs