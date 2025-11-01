from typing import Dict, Any, List
import logging

from ..storage.faiss_store import FAISSStore

logger = logging.getLogger(__name__)


class JobIndexer:
    """
    This is the bridge between job scraping and the RAG retrieval system.
    After jobs are scraped and saved to the database, this class:
    1. Formats job data into searchable content
    2. Creates embeddings using the chunker
    3. Stores in FAISS vector store for fast similarity search
    
    Example:
        >>> from core.rag import VectorJobStore, TextEmbedder
        >>> embedder = TextEmbedder()
        >>> vector_store = VectorJobStore(embedder)
        >>> indexer = JobIndexer(vector_store)
        >>> 
        >>> # After scraping jobs
        >>> jobs = [
        ...     {"job_id": "1", "title": "Engineer", "company": "Corp", ...},
        ...     {"job_id": "2", "title": "Designer", "company": "Inc", ...},
        ... ]
        >>> stats = indexer.index_scraped_jobs(jobs)
        >>> print(f"Indexed {stats['indexed_jobs']} jobs")
    """
    
    def __init__(self, vector_store: FAISSStore):
        self.vector_store = vector_store
        self.chunker = vector_store.chunker
    
    def index_scraped_jobs(self, jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not jobs:
            return {"total_jobs": 0, "indexed_jobs": 0, "failed_jobs": 0, "skipped_jobs": 0}
        
        logger.info(f"Starting batch indexing of {len(jobs)} jobs")
        
        stats = {
            "total_jobs": len(jobs),
            "indexed_jobs": 0,
            "failed_jobs": 0,
            "skipped_jobs": 0
        }
        
        for job in jobs:
            try:
                job_id = job.get("job_id") or job.get("id")
                
                if not job_id:
                    logger.warning(f"Job missing ID, skipping: {job.get('title', 'Unknown')}")
                    stats["failed_jobs"] += 1
                    continue
                
                # Check if already indexed (optional optimization)
                if self._is_already_indexed(job_id):
                    logger.debug(f"Job {job_id} already indexed, skipping")
                    stats["skipped_jobs"] += 1
                    continue
                
                # Prepare job content for embedding
                content = self._prepare_job_content(job)
                
                # Extract metadata
                metadata = self._extract_metadata(job)
                
                # Add to vector store (handles chunking internally)
                self.vector_store.add_job(job_id, content, metadata)
                
                stats["indexed_jobs"] += 1
                
            except Exception as e:
                logger.error(f"Failed to index job {job.get('job_id', 'unknown')}: {str(e)}")
                stats["failed_jobs"] += 1
        
        # Save the updated vector store
        self.vector_store.save()
        
        logger.info(
            f"Indexing complete: "
            f"{stats['indexed_jobs']} indexed, "
            f"{stats['failed_jobs']} failed, "
            f"{stats['skipped_jobs']} skipped"
        )
        
        return stats
    
    def _prepare_job_content(self, job: Dict[str, Any]) -> str:
        title = job.get("title", "")
        company = job.get("company", "")
        location = job.get("location", "Remote")
        description = job.get("description", "")
        skills = job.get("skills", [])
        requirements = job.get("requirements", [])
        
        # Format skills and requirements
        skills_text = ", ".join(skills) if skills else ""
        requirements_text = "\n".join(requirements) if requirements else ""
        
        # Build structured content (weight important fields)
        content_parts = [
            f"Job Title: {title}",
            f"Company: {company}",
            f"Location: {location}",
            "",
            f"Required Skills: {skills_text}" if skills_text else "",
            "",
            f"Requirements:\n{requirements_text}" if requirements_text else "",
            "",
            f"Description:\n{description}" if description else ""
        ]
        
        # Remove empty parts
        content = "\n".join(part for part in content_parts if part)
        
        return content
    
    def _extract_metadata(self, job: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "title": job.get("title", ""),
            "company": job.get("company", ""),
            "location": job.get("location", ""),
            "source": job.get("source", ""),
            "url": job.get("url", ""),
            "skills": job.get("skills", []),
            "posted_date": job.get("posted_date", "")
        }
    
    def _is_already_indexed(self, job_id: str) -> bool:
        try:
            # Check metadata manager
            metadata = self.vector_store.metadata_manager.get_job_metadata(job_id)
            return metadata is not None
        except Exception:
            return False
    
    def remove_job(self, job_id: str) -> bool:
        try:
            # This removes from metadata only
            self.vector_store.metadata_manager.remove_job(job_id)
            logger.info(f"Removed job {job_id} from metadata")
            return True
        except Exception as e:
            logger.error(f"Failed to remove job {job_id}: {str(e)}")
            return False
    
    def get_indexing_stats(self) -> Dict[str, Any]:
        return {
            "total_jobs": self.vector_store.get_document_count(),
            "metadata_count": self.vector_store.metadata_manager.get_job_count(),
            **self.vector_store.get_stats()
        }
