from typing import Dict, Any, List, Optional
import logging

from ..embeddings.base import BaseEmbedder
from ..chunking.base import BaseChunker
from ..storage.base import BaseVectorStore

logger = logging.getLogger(__name__)


class IndexingPipeline:
    """
    High-level pipeline for indexing jobs into the vector store.
    
    This class orchestrates the complete indexing process:
    1. Chunk job documents using a chunker
    2. Generate embeddings for chunks using an embedder
    3. Store embeddings and metadata in a vector store
    
    Example:
        >>> from core.rag import HuggingFaceEmbedder, JobChunker, FAISSStore
        >>> 
        >>> embedder = HuggingFaceEmbedder()
        >>> chunker = JobChunker()
        >>> store = FAISSStore("index.faiss", embedder)
        >>> pipeline = IndexingPipeline(embedder, chunker, store)
        >>> 
        >>> job_data = {
        ...     "title": "Senior Python Developer",
        ...     "company": "Tech Corp",
        ...     "description": "...",
        ...     "requirements": "...",
        ...     "location": "Remote"
        ... }
        >>> pipeline.index_job("job_123", job_data)
    """
    
    def __init__(
        self,
        embedder: BaseEmbedder,
        chunker: BaseChunker,
        vector_store: BaseVectorStore,
    ):
        self.embedder = embedder
        self.chunker = chunker
        self.vector_store = vector_store
        
        logger.info(
            f"IndexingPipeline initialized with "
            f"embedder={type(embedder).__name__}, "
            f"chunker={type(chunker).__name__}, "
            f"vector_store={type(vector_store).__name__}"
        )
    
    def index_job(
        self,
        job_id: str,
        job_data: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Index a single job into the vector store.
        
        Args:
            job_id: Unique identifier for the job
            job_data: Job data dictionary containing title, description, etc.
            metadata: Optional additional metadata to store with the job
        
        Returns:
            bool: True if indexing successful, False otherwise
        
        Example:
            >>> job_data = {
            ...     "title": "Data Scientist",
            ...     "description": "Analyze data and build models",
            ...     "requirements": "Python, ML, Statistics"
            ... }
            >>> success = pipeline.index_job("job_456", job_data)
        """
        try:
            # Merge metadata
            combined_metadata = {
                "job_id": job_id,
                **(metadata or {}),
            }
            
            # Chunk the job document
            logger.debug(f"Chunking job {job_id}")
            chunks = self.chunker.chunk_document(job_data, combined_metadata)
            
            if not chunks:
                logger.warning(f"No chunks generated for job {job_id}")
                return False
            
            logger.debug(f"Generated {len(chunks)} chunks for job {job_id}")
            
            # Generate embeddings for chunks
            logger.debug(f"Generating embeddings for job {job_id}")
            texts = [chunk["text"] for chunk in chunks]
            embeddings = self.embedder.embed_batch(texts)
            
            # Store embeddings and metadata
            logger.debug(f"Storing embeddings for job {job_id}")
            for chunk, embedding in zip(chunks, embeddings):
                self.vector_store.add(
                    embedding=embedding,
                    metadata={
                        **chunk["metadata"],
                        "chunk_text": chunk["text"],
                    },
                )
            
            logger.info(f"Successfully indexed job {job_id} with {len(chunks)} chunks")
            return True
            
        except Exception as e:
            logger.error(f"Error indexing job {job_id}: {str(e)}", exc_info=True)
            return False
    
    def index_jobs_batch(
        self,
        jobs: List[Dict[str, Any]],
        job_id_field: str = "job_id",
    ) -> Dict[str, Any]:
        """
        Index multiple jobs in batch.
        
        Args:
            jobs: List of job dictionaries to index
            job_id_field: Field name containing the job ID in each job dict
        
        Returns:
            Dict with indexing statistics:
                - total: Total number of jobs
                - successful: Number successfully indexed
                - failed: Number of failures
                - failed_ids: List of job IDs that failed
        
        Example:
            >>> jobs = [
            ...     {"job_id": "1", "title": "Engineer", ...},
            ...     {"job_id": "2", "title": "Designer", ...},
            ... ]
            >>> stats = pipeline.index_jobs_batch(jobs)
            >>> print(f"Indexed {stats['successful']}/{stats['total']} jobs")
        """
        stats = {
            "total": len(jobs),
            "successful": 0,
            "failed": 0,
            "failed_ids": [],
        }
        
        logger.info(f"Starting batch indexing of {len(jobs)} jobs")
        
        for i, job in enumerate(jobs, 1):
            job_id = job.get(job_id_field)
            
            if not job_id:
                logger.warning(f"Job at index {i-1} missing '{job_id_field}' field, skipping")
                stats["failed"] += 1
                continue
            
            success = self.index_job(job_id, job)
            
            if success:
                stats["successful"] += 1
            else:
                stats["failed"] += 1
                stats["failed_ids"].append(job_id)
            
            # Log progress every 10 jobs
            if i % 10 == 0:
                logger.info(
                    f"Progress: {i}/{len(jobs)} jobs processed "
                    f"({stats['successful']} successful, {stats['failed']} failed)"
                )
        
        logger.info(
            f"Batch indexing complete: {stats['successful']}/{stats['total']} successful, "
            f"{stats['failed']} failed"
        )
        
        return stats
    
    def reindex_job(
        self,
        job_id: str,
        job_data: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Remove old job data and reindex with new data.
        
        This is useful when job details have been updated.
        
        Args:
            job_id: Unique identifier for the job
            job_data: Updated job data dictionary
            metadata: Optional updated metadata
        
        Returns:
            bool: True if reindexing successful, False otherwise
        
        Example:
            >>> updated_job = {
            ...     "title": "Senior Data Scientist",  # Updated title
            ...     "description": "...",
            ... }
            >>> success = pipeline.reindex_job("job_456", updated_job)
        """
        try:
            # Remove old job data
            logger.debug(f"Removing old data for job {job_id}")
            self.remove_job(job_id)
            
            # Index new data
            logger.debug(f"Reindexing job {job_id} with updated data")
            return self.index_job(job_id, job_data, metadata)
            
        except Exception as e:
            logger.error(f"Error reindexing job {job_id}: {str(e)}", exc_info=True)
            return False
    
    def remove_job(self, job_id: str) -> bool:
        """
        Remove a job from the vector store.
        
        Args:
            job_id: Unique identifier for the job to remove
        
        Returns:
            bool: True if removal successful, False otherwise
        
        Example:
            >>> pipeline.remove_job("job_456")
        """
        try:
            # Call vector store's remove method (if implemented)
            if hasattr(self.vector_store, "remove"):
                self.vector_store.remove(job_id=job_id)
                logger.info(f"Successfully removed job {job_id}")
                return True
            else:
                logger.warning(
                    f"Vector store {type(self.vector_store).__name__} "
                    f"does not support removal"
                )
                return False
                
        except Exception as e:
            logger.error(f"Error removing job {job_id}: {str(e)}", exc_info=True)
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the indexed data.
        
        Returns:
            Dict with statistics like total_jobs, total_chunks, etc.
        
        Example:
            >>> stats = pipeline.get_stats()
            >>> print(f"Total jobs indexed: {stats.get('total_jobs', 'N/A')}")
        """
        stats = {}
        
        try:
            # Get vector store stats if available
            if hasattr(self.vector_store, "get_stats"):
                stats = self.vector_store.get_stats()
            elif hasattr(self.vector_store, "index") and hasattr(self.vector_store.index, "ntotal"):
                stats["total_vectors"] = self.vector_store.index.ntotal
            
            stats["embedder"] = type(self.embedder).__name__
            stats["chunker"] = type(self.chunker).__name__
            stats["vector_store"] = type(self.vector_store).__name__
            
        except Exception as e:
            logger.error(f"Error getting stats: {str(e)}", exc_info=True)
        
        return stats


class StreamingIndexer:
    """
    Streaming indexer for real-time job indexing.
    
    This indexer is optimized for indexing jobs one at a time as they arrive,
    with automatic batching for efficiency.
    
    Example:
        >>> indexer = StreamingIndexer(embedder, chunker, store, batch_size=10)
        >>> 
        >>> # Add jobs as they arrive
        >>> for job in job_stream:
        ...     indexer.add_job(job["job_id"], job)
        >>> 
        >>> # Flush remaining jobs
        >>> indexer.flush()
    """
    
    def __init__(
        self,
        embedder: BaseEmbedder,
        chunker: BaseChunker,
        vector_store: BaseVectorStore,
        batch_size: int = 10,
    ):
        """
        Initialize the streaming indexer.
        
        Args:
            embedder: Embedder for generating text embeddings
            chunker: Chunker for splitting documents into chunks
            vector_store: Vector store for storing embeddings and metadata
            batch_size: Number of jobs to accumulate before batch processing
        """
        self.pipeline = IndexingPipeline(embedder, chunker, vector_store)
        self.batch_size = batch_size
        self.pending_jobs: List[Dict[str, Any]] = []
        
        logger.info(f"StreamingIndexer initialized with batch_size={batch_size}")
    
    def add_job(self, job_id: str, job_data: Dict[str, Any]) -> None:
        """
        Add a job to the indexing queue.
        
        Jobs are automatically batched and processed when batch_size is reached.
        
        Args:
            job_id: Unique identifier for the job
            job_data: Job data dictionary
        
        Example:
            >>> indexer.add_job("job_789", {"title": "Developer", ...})
        """
        job_with_id = {**job_data, "job_id": job_id}
        self.pending_jobs.append(job_with_id)
        
        # Process batch if full
        if len(self.pending_jobs) >= self.batch_size:
            self.flush()
    
    def flush(self) -> Dict[str, Any]:
        """
        Process all pending jobs in the queue.
        
        Returns:
            Dict with indexing statistics
        
        Example:
            >>> stats = indexer.flush()
            >>> print(f"Processed {stats['successful']} jobs")
        """
        if not self.pending_jobs:
            return {"total": 0, "successful": 0, "failed": 0, "failed_ids": []}
        
        logger.info(f"Flushing {len(self.pending_jobs)} pending jobs")
        stats = self.pipeline.index_jobs_batch(self.pending_jobs)
        self.pending_jobs.clear()
        
        return stats
    
    def get_pending_count(self) -> int:
        return len(self.pending_jobs)
