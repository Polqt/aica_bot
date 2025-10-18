import logging
from typing import Dict, Optional, List

logger = logging.getLogger(__name__)


class MetadataManager:
    """
    Manager for job metadata storage and retrieval.
    
    This class maintains a separate dictionary of job metadata to enable
    fast lookups without querying the vector store. It tracks information
    like job_id, title, company, location, etc.
    
    Attributes:
        _metadata: Dictionary mapping job_id to metadata dictionary
    """
    
    def __init__(self):
        self._metadata: Dict[str, Dict] = {}
        logger.debug("MetadataManager initialized")
    
    def add_job_metadata(self, job_id: str, metadata: Dict) -> None:
        self._metadata[job_id] = metadata.copy()
        logger.debug(f"Added metadata for job {job_id}")
    
    def get_job_metadata(self, job_id: str) -> Optional[Dict]:
        return self._metadata.get(job_id)
    
    def remove_job_metadata(self, job_id: str) -> bool:
        if job_id in self._metadata:
            del self._metadata[job_id]
            logger.debug(f"Removed metadata for job {job_id}")
            return True
        return False
    
    def has_job(self, job_id: str) -> bool:
        return job_id in self._metadata
    
    def get_all_job_ids(self) -> List[str]:
        return list(self._metadata.keys())
    
    def get_job_count(self) -> int:
        return len(self._metadata)
    
    def clear(self) -> None:
        self._metadata.clear()
        logger.info("Cleared all job metadata")
    
    def get_stats(self) -> Dict:
        return {
            "total_jobs": len(self._metadata),
            "job_ids": list(self._metadata.keys())[:10]  # Sample of job IDs
        }
