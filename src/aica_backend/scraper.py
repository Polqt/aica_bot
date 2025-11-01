import asyncio
import logging
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))

from core.job_scraper import JobScraper
from database.job_db import JobDatabase
from core.rag import TextEmbedder, VectorJobStore, JobIndexer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    scraper = JobScraper()
    db = JobDatabase()
    
    # Initialize RAG components for auto-indexing
    try:
        embedder = TextEmbedder()
        vector_store = VectorJobStore(embedder)
        indexer = JobIndexer(vector_store)
    except Exception as e:
        vector_store = None
        indexer = None

    sources = ["wellfound", "we_work_remotely"]  
    jobs_per_source = 10  # Just 10 jobs per source for testing (20 total) 

    # Scrape jobs
    jobs = await scraper.batch_scrape_ethical_sources(sources, jobs_per_source)
    
    if not jobs:
        return
    
    saved_count = 0
    failed_saves = 0
    saved_jobs_for_indexing = []
    
    
    for i, job in enumerate(jobs, 1):
        try:
            job_id = db.save_job(job)
            
            if not job_id:
                logger.error(f"Failed to save job: {job.title}")
                failed_saves += 1
                continue
            
            saved_count += 1
            
            # Prepare for batch indexing
            if indexer:
                job_dict = {
                    "job_id": job_id,
                    "title": job.title,
                    "company": job.company,
                    "location": job.location or "Remote",
                    "description": job.description or "",
                    "skills": job.skills or [],
                    "requirements": job.requirements or [],
                    "source": job.source,
                    "url": job.url
                }
                saved_jobs_for_indexing.append(job_dict)
                
        except Exception as e:
            logger.error(f"Error saving job {job.title}: {e}")
            failed_saves += 1
    
    if indexer and saved_jobs_for_indexing:
        try:
            stats = indexer.index_scraped_jobs(saved_jobs_for_indexing)
            logger.info(f"Indexed {stats['indexed_jobs']} jobs ({stats['skipped_jobs']} skipped, {stats['failed_jobs']} failed)")
            
            # Update database to mark jobs as indexed
            if stats['indexed_jobs'] > 0:
                indexed_count = 0
                for job_dict in saved_jobs_for_indexing:
                    try:
                        db.mark_job_as_indexed(job_dict['job_id'])
                        indexed_count += 1
                    except Exception as e:
                        logger.error(f"Failed to mark job {job_dict['job_id']} as indexed: {e}")
                
                logger.info(f"Marked {indexed_count} jobs as indexed in database")
                
        except Exception as e:
            logger.error(f"Indexing failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
