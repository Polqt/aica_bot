import os
import logging
from typing import List, Dict, Optional

from langchain_community.vectorstores import FAISS
from langchain.schema import Document

from .base import BaseVectorStore
from .metadata_manager import MetadataManager
from ..chunking import JobChunker
from ..config import (
    DEFAULT_VECTOR_STORE_PATH,
    FAISS_INDEX_EXTENSION,
    DUMMY_DOC_CONTENT,
    DUMMY_DOC_METADATA,
    SEARCH_EXPANSION_FACTOR,
    TOP_CHUNK_WEIGHT,
    SECOND_CHUNK_WEIGHT,
    REMAINING_CHUNKS_WEIGHT,
    COVERAGE_BONUS_WEIGHT,
    COVERAGE_BONUS_DIVISOR,
    MAX_COVERAGE_BONUS
)

logger = logging.getLogger(__name__)


class FAISSStore(BaseVectorStore):
    """
    FAISS-based vector store for job embeddings.
    
    This class manages a FAISS index for efficient similarity search over
    job posting embeddings. It handles index creation, loading, saving,
    and searching operations.
    
    Attributes:
        embedder: Text embedder for generating embeddings
        persist_path: Path where the FAISS index is persisted
        vector_store: The FAISS vector store instance
        metadata_manager: Manager for job metadata
    """
    
    def __init__(self, embedder, persist_path: str = DEFAULT_VECTOR_STORE_PATH):
        self.embedder = embedder
        self.persist_path = persist_path
        self.vector_store: Optional[FAISS] = None
        self.metadata_manager = MetadataManager()
        self.chunker = JobChunker(embedder)
        # Legacy compatibility - expose metadata manager as _job_metadata
        self._job_metadata = self.metadata_manager._metadata
        self._load_or_create_store()
    
    def _load_or_create_store(self) -> None:
        """
        Load existing FAISS index or create a new one.
        
        Attempts to load a persisted index from disk. If loading fails or
        no index exists, creates a fresh empty index.
        """
        index_path = f"{self.persist_path}{FAISS_INDEX_EXTENSION}"
        
        if os.path.exists(index_path):
            try:
                self.vector_store = FAISS.load_local(
                    self.persist_path,
                    self.embedder.embeddings,
                    allow_dangerous_deserialization=True
                )
                logger.info(f"✅ Loaded existing FAISS index from {self.persist_path}")
            except Exception as e:
                logger.warning(f"Failed to load FAISS index: {e}, creating new one")
                self._create_empty_store()
        else:
            self._create_empty_store()
    
    def _create_empty_store(self) -> None:
        """
        Create an empty FAISS index with a dummy document.
        
        FAISS requires at least one document to initialize, so we add
        a dummy document that will be filtered out during searches.
        """
        dummy_doc = Document(
            page_content=DUMMY_DOC_CONTENT,
            metadata=DUMMY_DOC_METADATA.copy()
        )
        self.vector_store = FAISS.from_documents(
            [dummy_doc],
            self.embedder.embeddings
        )
        logger.info("✅ Created new FAISS index")
    
    def add_documents(self, documents: List[dict], embeddings: List[List[float]] = None) -> None:
        """
        Add documents to the FAISS index.
        
        Args:
            documents: List of document dictionaries with 'content' and 'metadata'
            embeddings: Optional pre-computed embeddings (not used, FAISS computes them)
        """
        if not documents:
            return
        
        # Convert to LangChain Document format
        langchain_docs = [
            Document(
                page_content=doc.get("content", ""),
                metadata=doc.get("metadata", {})
            )
            for doc in documents
        ]
        
        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(
                langchain_docs,
                self.embedder.embeddings
            )
            logger.info(f"Created new vector store with {len(documents)} documents")
        else:
            self.vector_store.add_documents(langchain_docs)
            logger.debug(f"Added {len(documents)} documents to vector store")
    
    def search(
        self,
        query_embedding: List[float],
        k: int,
        score_threshold: float = 0.0
    ) -> List[Dict]:
        """
        Search for similar documents using a query embedding.
        
        Note: This method is not typically used directly. Use search_by_text instead.
        
        Args:
            query_embedding: Query vector
            k: Number of results to return
            score_threshold: Minimum similarity score
            
        Returns:
            List of search results with documents and scores
        """
        if self.vector_store is None:
            logger.warning("Vector store not initialized")
            return []
        
        try:
            # FAISS doesn't directly support embedding-based search in LangChain wrapper
            # This would need custom implementation or use search_by_text instead
            logger.warning("Direct embedding search not implemented, use search_by_text")
            return []
        except Exception as e:
            logger.error(f"Error in embedding search: {e}")
            return []
    
    def search_by_text(
        self,
        query_text: str,
        k: int,
        score_threshold: float = 0.0
    ) -> List[Dict]:
        """
        Search for similar documents using a text query.
        
        This is the primary search method, which embeds the query text
        and searches for similar documents in the FAISS index.
        
        Args:
            query_text: Text to search for
            k: Number of results to return
            score_threshold: Minimum similarity score threshold
            
        Returns:
            List of dictionaries containing documents and scores
        """
        if self.vector_store is None:
            logger.warning("Vector store not initialized")
            return []
        
        try:
            results = self.vector_store.similarity_search_with_relevance_scores(
                query_text,
                k=k,
                score_threshold=score_threshold
            )
            
            # Convert to standard format
            search_results = []
            for doc, score in results:
                # Skip dummy documents
                if doc.metadata.get("is_dummy"):
                    continue
                
                search_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "score": score
                })
            
            return search_results
        except Exception as e:
            logger.error(f"Error searching by text: {e}")
            return []
    
    def save(self) -> None:
        """Save the FAISS index to disk."""
        try:
            if self.vector_store:
                self.vector_store.save_local(self.persist_path)
                logger.debug(f"💾 Saved FAISS index to {self.persist_path}")
        except Exception as e:
            logger.error(f"❌ Error saving FAISS index: {e}")
    
    def load(self) -> None:
        """Load the FAISS index from disk."""
        self._load_or_create_store()
    
    def clear(self) -> None:
        """Clear all documents from the index."""
        try:
            self.metadata_manager.clear()
            self._create_empty_store()
            self.save()
            logger.info("🗑️  Cleared FAISS index")
        except Exception as e:
            logger.error(f"❌ Error clearing FAISS index: {e}")
    
    def get_document_count(self) -> int:
        """
        Get the number of documents in the store.
        
        Returns:
            Number of documents (excluding dummy documents)
        """
        return self.metadata_manager.get_job_count()
    
    def get_stats(self) -> Dict:
        """
        Get statistics about the vector store.
        
        Returns:
            Dictionary with store statistics
        """
        return {
            "total_jobs": self.metadata_manager.get_job_count(),
            "persist_path": self.persist_path,
            "is_initialized": self.vector_store is not None
        }
    
    # =========================================================================
    # BACKWARD COMPATIBILITY METHODS (Original VectorJobStore interface)
    # =========================================================================
    
    def add_job(self, job_id: str, job_content: str, metadata: dict = None) -> None:
        """
        Add a job to the vector store (maintains original interface).
        
        This method chunks the job content, creates document embeddings,
        and adds them to the FAISS index.
        
        Args:
            job_id: Unique identifier for the job
            job_content: Full text content of the job posting
            metadata: Optional metadata (title, company, location, etc.)
        """
        try:
            if metadata is None:
                metadata = {}
            
            # Update metadata with job_id and mark as non-dummy
            metadata.update({"job_id": job_id, "is_dummy": False})
            
            # Store metadata in metadata manager
            self.metadata_manager.add_job_metadata(job_id, metadata)
            
            # Create chunks using the job chunker
            chunks = self.chunker.chunk_text(job_content, metadata)
            
            if not chunks:
                logger.warning(f"No chunks created for job {job_id}, using raw content")
                chunks = [job_content]
            
            # Convert chunks to Document format
            documents = [
                Document(page_content=chunk, metadata=metadata.copy())
                for chunk in chunks
            ]
            
            # Add to FAISS index
            if self.vector_store is None:
                self.vector_store = FAISS.from_documents(
                    documents,
                    self.embedder.embeddings
                )
                logger.info(f"Created new vector store with job {job_id}")
            else:
                self.vector_store.add_documents(documents)
            
            logger.debug(f"✅ Added job {job_id} with {len(documents)} chunks to vector store")
            self.save()
            
        except Exception as e:
            logger.error(f"❌ Error adding job {job_id} to vector store: {e}")
            # Don't raise - allow other jobs to be indexed
    
    def search_similar_jobs(
        self,
        query_text: str,
        k: int = 10,
        score_threshold: float = 0.3
    ) -> List[dict]:
        """
        Search for similar jobs (maintains original interface).
        
        This method searches for job chunks similar to the query, then
        aggregates and ranks them by job_id with intelligent scoring.
        
        Args:
            query_text: Search query (e.g., user's skills and experience)
            k: Number of jobs to return
            score_threshold: Minimum similarity score threshold
            
        Returns:
            List of job matches with similarity scores and metadata
        """
        if self.vector_store is None:
            logger.warning("Vector store not initialized")
            return []
        
        try:
            # Search for similar job chunks with relevance scores
            results = self.vector_store.similarity_search_with_relevance_scores(
                query_text,
                k=k * SEARCH_EXPANSION_FACTOR,  # Get more results for aggregation
                score_threshold=score_threshold
            )
            
            # Deduplicate by job_id and aggregate scores
            job_scores: Dict[str, Dict] = {}
            
            for doc, relevance_score in results:
                job_id = doc.metadata.get("job_id")
                
                # Skip dummy documents
                if job_id == "dummy" or doc.metadata.get("is_dummy"):
                    continue
                
                # Initialize job score tracking
                if job_id not in job_scores:
                    job_scores[job_id] = {
                        "job_id": job_id,
                        "metadata": doc.metadata,
                        "scores": [],
                        "chunks": [],
                        "best_score": 0
                    }
                
                job_scores[job_id]["scores"].append(relevance_score)
                job_scores[job_id]["chunks"].append(doc.page_content)
                
                # Track best chunk score
                if relevance_score > job_scores[job_id]["best_score"]:
                    job_scores[job_id]["best_score"] = relevance_score
            
            # Calculate intelligent weighted scores
            job_matches = []
            for job_data in job_scores.values():
                scores = job_data["scores"]
                if not scores:
                    continue
                
                # Sort scores in descending order
                sorted_scores = sorted(scores, reverse=True)
                
                # Weighted scoring: emphasize top matches, bonus for coverage
                if len(sorted_scores) >= 2:
                    weighted_score = (
                        sorted_scores[0] * TOP_CHUNK_WEIGHT +
                        sorted_scores[1] * SECOND_CHUNK_WEIGHT +
                        (sum(sorted_scores[2:]) / max(len(sorted_scores[2:]), 1) * REMAINING_CHUNKS_WEIGHT) +
                        (min(len(scores) / COVERAGE_BONUS_DIVISOR, MAX_COVERAGE_BONUS) * COVERAGE_BONUS_WEIGHT)
                    )
                else:
                    weighted_score = sorted_scores[0]
                
                job_matches.append({
                    "job_id": job_data["job_id"],
                    "similarity_score": weighted_score,
                    "metadata": job_data["metadata"],
                    "num_matches": len(scores),
                    "best_chunk_score": job_data["best_score"],
                    "coverage": len(scores)
                })
            
            # Sort by weighted similarity score (higher is better)
            job_matches.sort(key=lambda x: x["similarity_score"], reverse=True)
            
            # Filter by threshold and return top k
            filtered_matches = [
                m for m in job_matches
                if m["similarity_score"] >= score_threshold
            ]
            
            logger.info(
                f"✅ Found {len(filtered_matches)} jobs matching query "
                f"(from {len(results)} chunks, threshold: {score_threshold})"
            )
            
            return filtered_matches[:k]
            
        except Exception as e:
            logger.error(f"❌ Error searching similar jobs: {e}")
            return []
    
    def get_job_count(self) -> int:
        """
        Get the number of jobs in the store.
        
        Returns:
            Number of jobs (maintains original interface)
        """
        return self.metadata_manager.get_job_count()


# Backward compatibility alias
VectorJobStore = FAISSStore
