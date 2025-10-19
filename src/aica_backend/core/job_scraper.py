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

from database.models.job_models import Job

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
            # Programming category pages - each has 20+ recent tech jobs
            "https://weworkremotely.com/categories/remote-full-stack-programming-jobs",
            "https://weworkremotely.com/categories/remote-front-end-programming-jobs",
            "https://weworkremotely.com/categories/remote-back-end-programming-jobs",
            "https://weworkremotely.com/categories/remote-programming-jobs",
            # Design & Product categories
            "https://weworkremotely.com/categories/remote-design-jobs",
            "https://weworkremotely.com/categories/remote-product-jobs",
            # Other tech categories
            "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs",
            "https://weworkremotely.com/categories/remote-customer-support-jobs",
            "https://weworkremotely.com/categories/remote-sales-and-marketing-jobs",
        ],
        "wellfound": [
            # Each page typically has 20-50+ job listings
            "https://wellfound.com/role/r/software-engineer",
            "https://wellfound.com/role/r/frontend-engineer",
            "https://wellfound.com/role/r/backend-engineer",
            "https://wellfound.com/role/r/full-stack-engineer",
            "https://wellfound.com/role/r/mobile-engineer",
            "https://wellfound.com/role/r/devops-engineer",
            "https://wellfound.com/role/r/data-scientist",
            "https://wellfound.com/role/r/data-engineer",
            "https://wellfound.com/role/r/machine-learning-engineer",
            "https://wellfound.com/role/r/product-manager",
            "https://wellfound.com/role/r/designer",
            "https://wellfound.com/role/r/product-designer",
            "https://wellfound.com/role/r/engineering-manager",
            "https://wellfound.com/role/r/software-architect",
            "https://wellfound.com/role/r/qa-engineer",
            "https://wellfound.com/role/r/security-engineer",
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
            logger.info(f"🔎 Extracting job URLs from page (target: {max_jobs} jobs)...")
            
            search_response = self.app.extract(
                urls=[search_url],
                schema={
                    "type": "object",
                    "properties": {
                        "job_urls": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of individual job posting URLs from this page"
                        }
                    }
                },
                prompt=f"""Extract ALL individual job posting URLs from this page (up to {max_jobs} URLs). 
                
                For We Work Remotely: Look for URLs like '/remote-jobs/...' or full URLs to job postings
                For Wellfound: Look for URLs like '/jobs/...' or '/company/.../jobs/...'
                
                Only include direct links to actual job postings, not category pages or search pages.
                Extract as many job URLs as you can find on the page.""",
            )
            
            job_urls = search_response.data.get("job_urls", [])
            if not job_urls:
                logger.warning(f"⚠️  No job URLs found for {search_url}")
                return []
            
            # Convert relative URLs to absolute URLs
            base_url = search_url.split('/categories/')[0] if 'weworkremotely' in search_url else search_url.split('/role/')[0]
            normalized_urls = []
            for url in job_urls:
                if url.startswith('http'):
                    normalized_urls.append(url)
                elif url.startswith('/'):
                    normalized_urls.append(base_url + url)
                else:
                    normalized_urls.append(url)
            
            job_urls = normalized_urls[:max_jobs]
            logger.info(f"✅ Found {len(job_urls)} job URLs to process")
            
            jobs = []
            successful = 0
            failed = 0
            
            for i, job_url in enumerate(job_urls):
                try:
                    logger.info(f"📄 [{i+1}/{len(job_urls)}] Processing: {job_url}")
                    job = await self.scrape_and_extract_job(job_url)
                    if job:
                        jobs.append(job)
                        successful += 1
                        logger.info(f"✅ Scraped: {job.title} at {job.company}")
                    else:
                        failed += 1
                        logger.warning(f"⚠️  Failed to extract job data")
                        
                except Exception as e:
                    failed += 1
                    logger.error(f"❌ Error processing job: {e}")
                    
                # Add delay to be respectful to the server
                await asyncio.sleep(random.uniform(1, 2))
            
            logger.info(f"📊 Page results: {successful} successful, {failed} failed")
            return jobs
            
        except Exception as e:
            logger.error(f"Error scraping job board {search_url}: {e}")
            return []

    def get_ethical_job_sources(self) -> Dict[str, List[str]]:
        return self.ETHICAL_JOB_SOURCES.copy()

    async def scrape_jobs_from_source(self, source_name: str, limit: int = 250) -> List[Job]:
        if source_name not in self.ETHICAL_JOB_SOURCES:
            logger.warning(f"Unknown source: {source_name}")
            return []
        
        source_urls = self.ETHICAL_JOB_SOURCES[source_name]
        logger.info(f"📊 {source_name}: Processing {len(source_urls)} category pages")
        
        all_jobs = []
        jobs_needed = limit
        
        # Calculate jobs per URL for even distribution
        jobs_per_url = max(15, limit // len(source_urls))
        
        for idx, source_url in enumerate(source_urls, 1):
            if jobs_needed <= 0:
                break
                
            logger.info(f"🔍 [{idx}/{len(source_urls)}] Scraping {source_name} from {source_url}")
            
            try:
                # Request jobs from this category page
                jobs_to_fetch = min(jobs_needed, jobs_per_url)
                jobs = await self.scrape_job_board_search(source_url, jobs_to_fetch)
                all_jobs.extend(jobs)
                jobs_needed -= len(jobs)
                logger.info(f"✅ Got {len(jobs)} jobs from this page (Total: {len(all_jobs)}/{limit})")
                
            except Exception as e:
                logger.error(f"❌ Error scraping {source_url}: {e}")

            # Add delay between different URLs
            await asyncio.sleep(random.uniform(2, 4))
        
        logger.info(f"✅ Total scraped from {source_name}: {len(all_jobs)} jobs")
        return all_jobs

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
            
            # Use ALL URLs instead of shuffling - we want max coverage
            logger.info(f"📊 {source_name}: Processing {len(source_urls)} category pages")
            
            source_jobs = []
            jobs_needed = jobs_per_source
            
            # Calculate jobs per URL for even distribution
            jobs_per_url = max(15, jobs_per_source // len(source_urls))
            
            for idx, source_url in enumerate(source_urls, 1):
                if jobs_needed <= 0:
                    break
                    
                logger.info(f"🔍 [{idx}/{len(source_urls)}] Scraping {source_name} from {source_url}")
                
                try:
                    # Request more jobs per page (30-50 jobs per category)
                    jobs_to_fetch = min(jobs_needed, jobs_per_url)
                    jobs = await self.scrape_job_board_search(source_url, jobs_to_fetch)
                    source_jobs.extend(jobs)
                    jobs_needed -= len(jobs)
                    logger.info(f"✅ Got {len(jobs)} jobs from this page (Total: {len(source_jobs)}/{jobs_per_source})")
                    
                except Exception as e:
                    logger.error(f"❌ Error scraping {source_url}: {e}")

                # Add delay between different URLs
                await asyncio.sleep(random.uniform(2, 4))
            
            all_jobs.extend(source_jobs)
            logger.info(f"Total scraped from {source_name}: {len(source_jobs)} jobs")
            
        return all_jobs
    