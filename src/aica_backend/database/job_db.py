import os
import json

from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from datetime import datetime

from .models.job_models import JobSource, Job, JobListings, JobSearchFilters


class JobDatabase:

    def __init__(self, client: Client = None):
        if client is None:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_KEY")
            
            if not url or not key:
                raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")
                
            self.client = create_client(url, key)
        else:
            self.client = client

    def save_job_source(self, url: str) -> None:
        self.client.table("job_sources").upsert(
            {"url": url, "last_checked": None}
        ).execute()

    def delete_job_source(self, url: str) -> None:
        self.client.table("job_sources").delete().eq("url", url).execute()

    def get_job_sources(self) -> List[JobSource]:
        response = self.client.table("job_sources").select("*").execute()
        return [JobSource(**source) for source in response.data]

    def update_job_source_stats(self, url: str, job_count: int, error_occurred: bool = False) -> None:
        update_data = {
            "last_checked": datetime.now().isoformat(),
            "last_job_count": job_count,
            "scrape_count": self.client.table("job_sources").select("scrape_count").eq("url", url).execute().data[0]["scrape_count"] + 1
        }
        
        if error_occurred:
            current_errors = self.client.table("job_sources").select("error_count").eq("url", url).execute().data[0]["error_count"]
            update_data["error_count"] = current_errors + 1
        else:
            update_data["error_count"] = 0
            
        self.client.table("job_sources").update(update_data).eq("url", url).execute()
        
    def save_job(self, job: Job) -> str:
        job_data = job.dict(exclude={'id'})
        
        if job_data.get('requirements'):
            job_data['requirements'] = json.dumps(job_data['requirements'])
        if job_data.get('skills'):
            job_data['skills'] = json.dumps(job_data['skills'])
        if job_data.get('content_embedding'):
            job_data['content_embedding'] = json.dumps(job_data['content_embedding'])
        if job_data.get('skills_embedding'):
            job_data['skills_embedding'] = json.dumps(job_data['skills_embedding'])
            
        response = self.client.table("jobs").upsert(job_data).execute()
        return response.data[0]['id']

    def get_job(self, job_id: str) -> Optional[Job]:
        response = self.client.table("jobs").select("*").eq("id", job_id).execute()
        
        if not response.data:
            return None
            
        job_data = response.data[0]
        return self._deserialize_job(job_data)

    def get_job_by_url(self, url: str) -> Optional[Job]:
        response = self.client.table("jobs").select("*").eq("url", url).execute()
        
        if not response.data:
            return None
            
        job_data = response.data[0]
        return self._deserialize_job(job_data)
    
    def get_jobs_for_indexing(self, limit: int = 100) -> List[Job]:
        response = self.client.table("jobs").select("*").eq("is_indexed", False).limit(limit).execute()
        return [self._deserialize_job(job_data) for job_data in response.data]
        
    def mark_job_as_indexed(self, job_id: str, content_embedding: List[float] = None, skills_embedding: List[float] = None) -> None:
        update_data = {"is_indexed": True}
        
        if content_embedding:
            update_data["content_embedding"] = json.dumps(content_embedding)
        if skills_embedding:
            update_data["skills_embedding"] = json.dumps(skills_embedding)
            
        self.client.table("jobs").update(update_data).eq("id", job_id).execute()
     
    def search_jobs(self, filters: JobSearchFilters, page: int = 1, page_size: int = 20) -> JobListings:
        query = self.client.table("jobs").select("*")
        
        if filters.keywords:
            for keyword in filters.keywords:
                query = query.ilike("title", f"%{keyword}%")
                
        if filters.location:
            query = query.ilike("location", f"%{filters.location}%")
            
        if filters.company:
            query = query.ilike("company", f"%{filters.company}%")

        # Get total count
        count_response = query.execute()
        total_count = len(count_response.data)
        
        # Apply pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        
        response = query.execute()
        jobs = [self._deserialize_job(job_data) for job_data in response.data]
        
        return JobListings(
            jobs=jobs,
            total_count=total_count,
            page=page,
            page_size=page_size
        )
        
    def get_job_content(self, job_id: str) -> Optional[str]:
        job = self.get_job(job_id)
        if not job:
            return None
            
        # Combine all relevant text fields
        content_parts = [
            job.title,
            job.company,
            job.description or "",
            job.location or "",
            " ".join(job.requirements),
            " ".join(job.skills),
        ]
        
        return " ".join(filter(None, content_parts))
        
    def get_job_statistics(self) -> Dict[str, Any]:
        # Total jobs
        jobs_response = self.client.table("jobs").select("id", count="exact").execute()
        total_jobs = jobs_response.count
        
        # Indexed jobs
        indexed_response = self.client.table("jobs").select("id", count="exact").eq("is_indexed", True).execute()
        indexed_jobs = indexed_response.count
        
        # Jobs by source
        sources_response = self.client.table("job_sources").select("*").execute()
        
        return {
            "total_jobs": total_jobs,
            "indexed_jobs": indexed_jobs,
            "unindexed_jobs": total_jobs - indexed_jobs,
            "active_sources": len([s for s in sources_response.data if s["is_active"]]),
            "total_sources": len(sources_response.data)
        }
        
    def _deserialize_job(self, job_data: Dict) -> Job:
        if job_data.get('requirements') and isinstance(job_data['requirements'], str):
            job_data['requirements'] = json.loads(job_data['requirements'])
            
        if job_data.get('skills') and isinstance(job_data['skills'], str):
            job_data['skills'] = json.loads(job_data['skills'])
            
        if job_data.get('content_embedding') and isinstance(job_data['content_embedding'], str):
            job_data['content_embedding'] = json.loads(job_data['content_embedding'])
            
        if job_data.get('skills_embedding') and isinstance(job_data['skills_embedding'], str):
            job_data['skills_embedding'] = json.loads(job_data['skills_embedding'])
            
        return Job(**job_data)