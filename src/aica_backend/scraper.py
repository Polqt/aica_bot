import asyncio
import logging
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))

from aica_backend.core.job_scraper import JobScraper
from aica_backend.database.job_db import JobDatabase

logging.basicConfig(level=logging.INFO)

async def main():
    scraper = JobScraper()
    db = JobDatabase()

    sources = ["angel_list", "we_work_remotely"]  
    jobs_per_source = 100

    # Scrape
    jobs = await scraper.batch_scrape_ethical_sources(sources, jobs_per_source)
    print(f"Scraped {len(jobs)} jobs")

    jobs_json = [job.dict() for job in jobs]
    print(jobs_json)

    # Save to Supabase
    for job in jobs:
        job_id = db.save_job(job)
        print(f"Saved job {job.title} -> ID {job_id}")

if __name__ == "__main__":
    asyncio.run(main())
