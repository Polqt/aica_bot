"""
Script to index existing jobs in the vector store.
Run this after upgrading to the RAG system to index all existing jobs.
"""
import asyncio
import logging
import sys
from pathlib import Path

# Add parent directory (aica_backend) to path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from core.embedder import TextEmbedder, VectorJobStore
from database.job_db import JobDatabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def index_all_jobs():
    """Index all jobs from the database into the vector store."""
    try:
        # Initialize components
        logger.info("Initializing embedder and vector store...")
        embedder = TextEmbedder()
        vector_store = VectorJobStore(embedder)
        db = JobDatabase()
        
        # Get all jobs
        logger.info("Fetching all jobs from database...")
        all_jobs = db.get_all_jobs(limit=10000)  # Adjust limit as needed
        
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
        
        logger.info(f"""
        ╔═══════════════════════════════════════╗
        ║     JOB INDEXING COMPLETED           ║
        ╠═══════════════════════════════════════╣
        ║  Total Jobs: {len(all_jobs):<23} ║
        ║  Successfully Indexed: {indexed_count:<11} ║
        ║  Failed: {failed_count:<27} ║
        ╚═══════════════════════════════════════╝
        """)
        
        return indexed_count, failed_count
        
    except Exception as e:
        logger.error(f"Job indexing failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(index_all_jobs())
