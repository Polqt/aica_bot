import os
from typing import List
from supabase import create_client, Client
from .models.job_models import JobSource


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

    def update_last_checked(self, url: str) -> None:
        self.client.table("job_sources").update({"last_checked": "now()"}).eq(
            "url", url
        ).execute()