import asyncio
import logging
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))

from core.job_scraper import JobScraper
from database.job_db import JobDatabase
from core.rag import TextEmbedder, VectorJobStore  

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    scraper = JobScraper()
    db = JobDatabase()
    
    try:
        embedder = TextEmbedder()
        vector_store = VectorJobStore(embedder)
        logger.info("✅ Vector store initialized for job indexing")
    except Exception as e:
        logger.error(f"❌ Failed to initialize vector store: {e}")
        vector_store = None

    sources = ["wellfound", "we_work_remotely"]  
    jobs_per_source = 250  # Target ~500 jobs total (250 per source)

    logger.info("=" * 60)
    logger.info(f"🚀 Starting job scraping process")
    logger.info(f"📊 Target: {jobs_per_source} jobs per source")
    logger.info(f"🌐 Sources: {', '.join(sources)}")
    logger.info("=" * 60)

    # Scrape jobs
    jobs = await scraper.batch_scrape_ethical_sources(sources, jobs_per_source)
    
    if not jobs:
        logger.warning("⚠️  No jobs were scraped. Exiting...")
        return
    
    logger.info(f"✅ Successfully scraped {len(jobs)} jobs")
    logger.info("=" * 60)

    # Save to Supabase and index in vector store
    saved_count = 0
    indexed_count = 0
    failed_saves = 0
    failed_indexes = 0
    
    logger.info("💾 Starting to save and index jobs...")
    
    for i, job in enumerate(jobs, 1):
        try:
            # Save to database first
            job_id = db.save_job(job)
            
            if not job_id:
                logger.error(f"❌ Failed to save job: {job.title} (no job_id returned)")
                failed_saves += 1
                continue
            
            saved_count += 1
            logger.info(f"✅ [{i}/{len(jobs)}] Saved: {job.title} at {job.company} -> ID: {job_id}")
            
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
                    
                    if i % 10 == 0:
                        logger.info(f"📊 Progress: {i}/{len(jobs)} jobs processed, {saved_count} saved, {indexed_count} indexed")
                        
                except Exception as e:
                    logger.error(f"❌ Failed to index job {job_id} ({job.title}): {e}")
                    failed_indexes += 1
            else:
                logger.warning("⚠️  Vector store not initialized, skipping indexing")
                
        except Exception as e:
            logger.error(f"❌ Error processing job {job.title}: {e}")
            failed_saves += 1
    
    # Final summary
    logger.info("=" * 60)
    logger.info("📈 SCRAPING & INDEXING SUMMARY")
    logger.info("=" * 60)
    logger.info(f"✅ Jobs scraped: {len(jobs)}")
    logger.info(f"✅ Jobs saved to database: {saved_count}")
    logger.info(f"❌ Failed saves: {failed_saves}")
    
    if vector_store:
        logger.info(f"✅ Jobs indexed in vector store: {indexed_count}")
        logger.info(f"❌ Failed indexes: {failed_indexes}")
        logger.info(f"📊 Vector store stats: {vector_store.get_stats()}")
    
    logger.info("=" * 60)
    logger.info("✅ Job scraping and indexing completed!")
    logger.info("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
