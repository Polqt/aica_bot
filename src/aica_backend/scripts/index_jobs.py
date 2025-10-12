import asyncio
import logging
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env'
load_dotenv(env_path)

# Setup logging after dotenv
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info(f"Loading .env from: {env_path}")
logger.info(f".env exists: {env_path.exists()}")

# Now import project modules
from core.embedder import TextEmbedder, VectorJobStore
from database.job_db import JobDatabase


async def index_all_jobs():
    try:
        # Initialize components
        logger.info("Initializing embedder and vector store...")
        embedder = TextEmbedder()
        vector_store = VectorJobStore(embedder)
        db = JobDatabase()
        
        # Get all jobs for indexing (in batches)
        logger.info("Fetching jobs from database...")
        batch_size = 1000
        offset = 0
        all_jobs = []
        
        while True:
            batch = db.get_jobs_for_indexing(limit=batch_size)
            if not batch:
                break
            all_jobs.extend(batch)
            offset += batch_size
            logger.info(f"Fetched {len(all_jobs)} jobs so far...")
            if len(batch) < batch_size:
                break  # Last batch
        
        if not all_jobs:
            logger.warning("No jobs found in database")
            return
        
        logger.info(f"Found {len(all_jobs)} jobs to index")
        
        # Index each job
        indexed_count = 0
        failed_count = 0
        
        for i, job in enumerate(all_jobs, 1):
            try:
                # Create job content for indexing
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
                
                # Add to vector store
                vector_store.add_job(job.id, job_content, metadata)
                indexed_count += 1
                
                if i % 50 == 0:
                    logger.info(f"Progress: {i}/{len(all_jobs)} jobs indexed")
                    
            except Exception as e:
                logger.error(f"Failed to index job {job.id} ({job.title}): {e}")
                failed_count += 1
        
        # Save the vector store
        logger.info("Saving vector store to disk...")
        vector_store.save()
        
        return indexed_count, failed_count
        
    except Exception as e:
        logger.error(f"Job indexing failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(index_all_jobs())
