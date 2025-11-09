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
        index_path = f"{self.persist_path}{FAISS_INDEX_EXTENSION}"
        
        if os.path.exists(index_path):
            try:
                self.vector_store = FAISS.load_local(
                    self.persist_path,
                    self.embedder.embeddings,
                    allow_dangerous_deserialization=True
                )
            except Exception as e:
                self._create_empty_store()
        else:
            self._create_empty_store()
    
    def _create_empty_store(self) -> None:
        dummy_doc = Document(
            page_content=DUMMY_DOC_CONTENT,
            metadata=DUMMY_DOC_METADATA.copy()
        )
        self.vector_store = FAISS.from_documents(
            [dummy_doc],
            self.embedder.embeddings
        )
    
    def add_documents(self, documents: List[dict], embeddings: List[List[float]] = None) -> None:
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
    
    def save(self) -> None:
        try:
            if self.vector_store:
                self.vector_store.save_local(self.persist_path)
                logger.debug(f"Saved FAISS index to {self.persist_path}")
        except Exception as e:
            logger.error(f"Error saving FAISS index: {e}")
    
    def load(self) -> None:
        self._load_or_create_store()
    
    def clear(self) -> None:
        try:
            self.metadata_manager.clear()
            self._create_empty_store()
            self.save()
            logger.info("Cleared FAISS index")
        except Exception as e:
            logger.error(f"Error clearing FAISS index: {e}")
    
    def get_document_count(self) -> int:
        return self.metadata_manager.get_job_count()
    
    def get_stats(self) -> Dict:

        return {
            "total_jobs": self.metadata_manager.get_job_count(),
            "persist_path": self.persist_path,
            "is_initialized": self.vector_store is not None
        }
    
    def add_job(self, job_id: str, job_content: str, metadata: dict = None) -> None:
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
            
            logger.debug(f"Added job {job_id} with {len(documents)} chunks to vector store")
            self.save()
            
        except Exception as e:
            logger.error(f"Error adding job {job_id} to vector store: {e}")
    
    def search(self, query_embedding: List[float], k: int = 10, score_threshold: float = 0.0) -> List[Dict]:

        if self.vector_store is None:
            logger.warning("Vector store not initialized")
            return []
        
        try:
            # FAISS similarity search with scores using the embedding directly
            results = self.vector_store.similarity_search_by_vector(
                query_embedding,
                k=k
            )
            
            # Format results to match expected output
            formatted_results = []
            for doc in results:
                # Skip dummy documents
                if doc.metadata.get("is_dummy") or doc.metadata.get("job_id") == "dummy":
                    continue
                
                formatted_results.append({
                    "document": {
                        "content": doc.page_content,
                        "metadata": doc.metadata
                    },
                    "score": 1.0,  # FAISS similarity_search_by_vector doesn't return scores by default
                    "metadata": doc.metadata
                })
            
            # Filter by threshold if needed
            if score_threshold > 0.0:
                formatted_results = [r for r in formatted_results if r["score"] >= score_threshold]
            
            return formatted_results[:k]
            
        except Exception as e:
            logger.error(f"Error in search: {e}")
            return []
    
    def search_similar_jobs(
        self,
        query_text: str,
        k: int = 10,
        score_threshold: float = 0.3
    ) -> List[dict]:
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
                f"Found {len(filtered_matches)} jobs matching query "
                f"(from {len(results)} chunks, threshold: {score_threshold})"
            )
            
            return filtered_matches[:k]
            
        except Exception as e:
            logger.error(f"Error searching similar jobs: {e}")
            return []
    
    def get_job_count(self) -> int:
        return self.metadata_manager.get_job_count()

VectorJobStore = FAISSStore
