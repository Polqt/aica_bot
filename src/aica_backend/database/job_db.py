import os
import json
import uuid
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from datetime import datetime, timedelta
import functools
import time

from .models.job_models import JobSource, Job, JobListings, JobSearchFilters

# Simple LRU cache implementation
class SimpleCache:
    def __init__(self, max_size: int = 100, ttl: int = 300):  # 5 minutes TTL
        self.cache = {}
        self.max_size = max_size
        self.ttl = ttl

    def get(self, key: str) -> Any:
        if key in self.cache:
            item = self.cache[key]
            if time.time() - item['timestamp'] < self.ttl:
                return item['value']
            else:
                del self.cache[key]
        return None

    def set(self, key: str, value: Any) -> None:
        if len(self.cache) >= self.max_size:
            # Remove oldest item
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k]['timestamp'])
            del self.cache[oldest_key]
        self.cache[key] = {'value': value, 'timestamp': time.time()}

    def clear(self) -> None:
        self.cache.clear()


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

        # Initialize cache
        self.cache = SimpleCache(max_size=50, ttl=300)  # 5 minutes TTL

    def save_job_source(self, url: str) -> None:
        try:
            self.client.table("job_sources").upsert(
                {"url": url, "last_checked": None}
            ).execute()
        except Exception as e:
            raise

    def delete_job_source(self, url: str) -> None:
        self.client.table("job_sources").delete().eq("url", url).execute()

    def get_job_sources(self) -> List[JobSource]:
        try:
            response = self.client.table("job_sources").select("*").execute()
            return [JobSource(**source) for source in response.data]
        except Exception as e:
            return []

    def update_job_source_stats(self, url: str, job_count: int, error_occurred: bool = False) -> None:
        try:
            # Get current stats
            current_response = self.client.table("job_sources").select("scrape_count, error_count").eq("url", url).execute()
            
            if current_response.data:
                current_scrape_count = current_response.data[0].get("scrape_count", 0)
                current_error_count = current_response.data[0].get("error_count", 0)
            else:
                current_scrape_count = 0
                current_error_count = 0

            update_data = {
                "last_checked": datetime.now().isoformat(),
                "last_job_count": job_count,
                "scrape_count": current_scrape_count + 1
            }
            
            if error_occurred:
                update_data["error_count"] = current_error_count + 1
            else:
                update_data["error_count"] = 0
                
            self.client.table("job_sources").update(update_data).eq("url", url).execute()
        except Exception as e:
            print(f"Error updating job source stats: {e}")
        
    def save_job(self, job: Job) -> str:
        try:
            # Generate UUID if not provided
            job_id = job.id or str(uuid.uuid4())
            
            # Prepare job data
            job_data = job.model_dump(mode="json", exclude={'id'})
            job_data['id'] = job_id
            
            # Convert datetime to string if needed
            if isinstance(job_data.get('created_at'), datetime):
                job_data['created_at'] = job_data['created_at'].isoformat()
            
            # Ensure arrays are properly formatted
            if job_data.get('requirements') and isinstance(job_data['requirements'], list):
                job_data['requirements'] = job_data['requirements']
            if job_data.get('skills') and isinstance(job_data['skills'], list):
                job_data['skills'] = job_data['skills']
            
            # Handle embeddings
            if job_data.get('content_embedding'):
                job_data['content_embedding'] = job_data['content_embedding']
            if job_data.get('skills_embedding'):
                job_data['skills_embedding'] = job_data['skills_embedding']
            
            # Check if job already exists by URL
            existing_response = self.client.table("jobs").select("id").eq("url", job_data['url']).execute()
            
            if existing_response.data:
                # Update existing job
                response = self.client.table("jobs").update(job_data).eq("url", job_data['url']).execute()
                # Clear statistics cache since job count might change
                self.cache.clear()
                return existing_response.data[0]['id']
            else:
                # Insert new job
                response = self.client.table("jobs").insert(job_data).execute()
                if response.data:
                    # Clear statistics cache since job count changed
                    self.cache.clear()
                    return response.data[0]['id']
                else:
                    raise Exception("No data returned from insert operation")
                    
        except Exception as e:
            return str(uuid.uuid4())

    def get_job(self, job_id: str) -> Optional[Job]:
        try:
            response = self.client.table("jobs").select("*").eq("id", job_id).execute()
            
            if not response.data:
                return None
                
            job_data = response.data[0]
            return self._deserialize_job(job_data)
        except Exception as e:
            return None

    def get_job_by_url(self, url: str) -> Optional[Job]:
        try:
            response = self.client.table("jobs").select("*").eq("url", url).execute()
            
            if not response.data:
                return None
                
            job_data = response.data[0]
            return self._deserialize_job(job_data)
        except Exception as e:
            return None
    
    def get_jobs_for_indexing(self, limit: int = 100) -> List[Job]:
        try:
            response = self.client.table("jobs").select("*").eq("is_indexed", False).limit(limit).execute()
            return [self._deserialize_job(job_data) for job_data in response.data]
        except Exception as e:
            return []
        
    def mark_job_as_indexed(self, job_id: str, content_embedding: List[float] = None, skills_embedding: List[float] = None) -> None:
        try:
            update_data = {"is_indexed": True}
            
            if content_embedding:
                update_data["content_embedding"] = content_embedding
            if skills_embedding:
                update_data["skills_embedding"] = skills_embedding
                
            self.client.table("jobs").update(update_data).eq("id", job_id).execute()
        except Exception as e:
            print(f"Error marking job as indexed: {e}")
     
    def search_jobs(self, filters: JobSearchFilters, page: int = 1, page_size: int = 20) -> JobListings:
        try:
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
            total_count = len(count_response.data) if count_response.data else 0
            
            # Apply pagination
            offset = (page - 1) * page_size
            query = query.range(offset, offset + page_size - 1)
            
            response = query.execute()
            jobs = [self._deserialize_job(job_data) for job_data in response.data] if response.data else []
            
            return JobListings(
                jobs=jobs,
                total_count=total_count,
                page=page,
                page_size=page_size
            )
        except Exception as e:
            return JobListings(jobs=[], total_count=0, page=page, page_size=page_size)
        
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
            " ".join(job.requirements) if job.requirements else "",
            " ".join(job.skills) if job.skills else "",
        ]
        
        return " ".join(filter(None, content_parts))
        
    def get_job_statistics(self) -> Dict[str, Any]:
        cache_key = "job_statistics"
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return cached_result

        try:
            # Total jobs
            jobs_response = self.client.table("jobs").select("id", count="exact").execute()
            total_jobs = jobs_response.count or 0

            # Indexed jobs
            indexed_response = self.client.table("jobs").select("id", count="exact").eq("is_indexed", True).execute()
            indexed_jobs = indexed_response.count or 0

            # Jobs by source
            sources_response = self.client.table("job_sources").select("*").execute()
            sources_data = sources_response.data or []

            result = {
                "total_jobs": total_jobs,
                "indexed_jobs": indexed_jobs,
                "unindexed_jobs": total_jobs - indexed_jobs,
                "active_sources": len([s for s in sources_data if s.get("is_active", True)]),
                "total_sources": len(sources_data)
            }

            # Cache the result
            self.cache.set(cache_key, result)
            return result
        except Exception as e:
            return {
                "total_jobs": 0,
                "indexed_jobs": 0,
                "unindexed_jobs": 0,
                "active_sources": 0,
                "total_sources": 0
            }
        
    def _deserialize_job(self, job_data: Dict) -> Job:
        try:
            # Handle requirements
            if job_data.get('requirements'):
                if isinstance(job_data['requirements'], str):
                    try:
                        job_data['requirements'] = json.loads(job_data['requirements'])
                    except:
                        job_data['requirements'] = []
                elif not isinstance(job_data['requirements'], list):
                    job_data['requirements'] = []
                    
            # Handle skills
            if job_data.get('skills'):
                if isinstance(job_data['skills'], str):
                    try:
                        job_data['skills'] = json.loads(job_data['skills'])
                    except:
                        job_data['skills'] = []
                elif not isinstance(job_data['skills'], list):
                    job_data['skills'] = []
                    
            # Handle embeddings
            if job_data.get('content_embedding') and isinstance(job_data['content_embedding'], str):
                try:
                    job_data['content_embedding'] = json.loads(job_data['content_embedding'])
                except:
                    job_data['content_embedding'] = None
                    
            if job_data.get('skills_embedding') and isinstance(job_data['skills_embedding'], str):
                try:
                    job_data['skills_embedding'] = json.loads(job_data['skills_embedding'])
                except:
                    job_data['skills_embedding'] = None
                    
            return Job(**job_data)
        except Exception as e:
            return Job(
                id=job_data.get('id'),
                title=job_data.get('title', 'Unknown'),
                url=job_data.get('url', ''),
                company=job_data.get('company', 'Unknown'),
                description=job_data.get('description'),
                location=job_data.get('location'),
                requirements=[],
                skills=[]
            )

    def get_jobs_for_matching(self, limit: int = 100, min_skills: int = 1) -> List[Job]:
        try:
            # Query jobs that have skills and are suitable for matching
            response = (self.client.table("jobs")
                       .select("*")
                       .not_.is_("skills", "null")
                       .order("created_at", desc=True)
                       .limit(limit)
                       .execute())
            
            if not response.data:
                return []
            
            jobs = []
            for job_data in response.data:
                try:
                    job = self._deserialize_job(job_data)
                    # Only include jobs with sufficient skills
                    if job.skills and len(job.skills) >= min_skills:
                        jobs.append(job)
                except Exception as e:
                    continue
            
            return jobs
            
        except Exception as e:
            return []

    def get_job_by_id(self, job_id: str) -> Optional[Job]:
        try:
            response = self.client.table("jobs").select("*").eq("id", job_id).execute()
            
            if not response.data:
                return None
            
            return self._deserialize_job(response.data[0])
            
        except Exception as e:
            return None

    def save_user_job_match(self, user_id: str, job_id: str, match_score: float, **kwargs) -> bool:
        try:
            match_data = {
                "user_id": user_id,
                "job_id": job_id,
                "match_score": match_score,
                "matched_skills": kwargs.get('matching_skills', []),  # Map matching_skills to matched_skills
                "created_at": datetime.utcnow().isoformat()
            }
            
            response = self.client.table("user_job_matches").insert(match_data).execute()
            return len(response.data) > 0
            
        except Exception as e:
            return False

    def get_user_matches(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            response = self.client.table("user_job_matches").select(
                "*, jobs(title, company, location, url)"
            ).eq("user_id", user_id).order("match_score", desc=True).execute()
            
            return response.data or []
            
        except Exception as e:
            return []
        