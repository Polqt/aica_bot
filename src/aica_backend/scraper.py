import asyncio
import logging
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))

from core.job_scraper import JobScraper
from database.job_db import JobDatabase
from core.embedder import TextEmbedder, VectorJobStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    scraper = JobScraper()
    db = JobDatabase()
    
    # Initialize vector store for automatic indexing
    try:
        embedder = TextEmbedder()
        vector_store = VectorJobStore(embedder)
        logger.info("✅ Vector store initialized for job indexing")
    except Exception as e:
        logger.error(f"❌ Failed to initialize vector store: {e}")
        vector_store = None

    sources = ["angel_list", "we_work_remotely"]  
    jobs_per_source = 100

    # Scrape jobs
    jobs = await scraper.batch_scrape_ethical_sources(sources, jobs_per_source)
    logger.info(f"Scraped {len(jobs)} jobs")

    # Save to Supabase and index in vector store
    indexed_count = 0
    for job in jobs:
        job_id = db.save_job(job)
        logger.info(f"Saved job: {job.title} -> ID: {job_id}")
        
        # Automatically index the job in vector store
        if vector_store:
            try:
                job_content = f"""
                Title: {job.title}
                Company: {job.company}
                Location: {job.location}
                Description: {job.description}
                Requirements: {job.requirements}
                Skills: {', '.join(job.skills) if job.skills else 'None'}
                """
                
                metadata = {
                    "title": job.title,
                    "company": job.company,
                    "location": job.location,
                }
                
                vector_store.add_job(job_id, job_content, metadata)
                indexed_count += 1
            except Exception as e:
                logger.error(f"Failed to index job {job_id}: {e}")
    
    if vector_store:
        logger.info(f"✅ Successfully indexed {indexed_count}/{len(jobs)} jobs in vector store")

if __name__ == "__main__":
    asyncio.run(main())
