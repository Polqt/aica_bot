import streamlit as st

from firecrawl import Firecrawl
from ..database.models import Job, JobListings

@st.cache_data(show_spinner=False)
def _cached_parse_resume(pdf_link: str) -> str:
    app = Firecrawl()
    response = app.scrape_url(url=pdf_link)
    return response["markdown"]

class JobScraper:
    def __init__(self):
        self.app = Firecrawl()
        
    async def parse_resume(self, pdf_link: str) -> str:
        return _cached_parse_resume(pdf_link)
    
    async def scrape_job_postings(self, source_urls: list[str]) -> list[Job]:
        response = self.app.batch_scrape_urls(
            urls=source_urls,
            params={
                "formats": ["extract"],
                "extract": {
                    "schema": JobListings.model_json_schema(),
                    "prompt": "Extract job postings from the provided URLs."
                }
            },
        )
        
        jobs = []
        for job in response["data"]:
            jobs.extend(job["extract"]["jobs"])
        
        return [Job(**job) for job in jobs]
    
    async def scrape_job_posting(self, job_url: str) -> str:
        response = self.app.scrape_url(url=job_url)
        return response["markdown"]
    