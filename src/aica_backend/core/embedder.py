import os
import numpy as np

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from typing import List, Optional, Dict
import logging

logger = logging.getLogger(__name__)

class TextEmbedder:

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize embedder with optimized model for semantic similarity."""
        self.embeddings = HuggingFaceEmbeddings(
            model_name=f"sentence-transformers/{model_name}",
            model_kwargs={'device': 'cpu'},  # Use CPU for consistency
            encode_kwargs={'normalize_embeddings': True}  # Normalize for better cosine similarity
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len,
            separators=["\n\n", "\n", ". ", ", ", " ", ""]
        )
    
    def create_embeddings(self, texts: List[str], metadatas: List[dict] = None) -> List[List[float]]:
        """Create embeddings for multiple texts with error handling."""
        try:
            if not texts:
                return []
            # Filter out empty strings
            valid_texts = [t for t in texts if t and t.strip()]
            if not valid_texts:
                return []
            return self.embeddings.embed_documents(valid_texts)
        except Exception as e:
            logger.error(f"Error creating embeddings: {e}")
            return []
    
    def embed_single_text(self, text: str) -> List[float]:
        """Create embedding for a single text with error handling."""
        try:
            if not text or not text.strip():
                return []
            return self.embeddings.embed_query(text)
        except Exception as e:
            logger.error(f"Error embedding single text: {e}")
            return []
    
    def split_text(self, text: str) -> List[str]:
        """Split text into chunks for better context preservation."""
        try:
            if not text:
                return []
            return self.text_splitter.split_text(text)
        except Exception as e:
            logger.error(f"Error splitting text: {e}")
            return [text]  # Return original text if splitting fails
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        try:
            if not vec1 or not vec2 or len(vec1) != len(vec2):
                return 0.0
            
            vec1_np = np.array(vec1)
            vec2_np = np.array(vec2)
            
            dot_product = np.dot(vec1_np, vec2_np)
            norm1 = np.linalg.norm(vec1_np)
            norm2 = np.linalg.norm(vec2_np)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
                
            return float(dot_product / (norm1 * norm2))
        except Exception as e:
            logger.error(f"Error calculating cosine similarity: {e}")
            return 0.0


class VectorJobStore:
    def __init__(self, embedder: TextEmbedder, persist_path: str = "./faiss_job_index"):
        self.embedder = embedder
        self.persist_path = persist_path
        self.vector_store: Optional[FAISS] = None
        self._job_metadata: Dict[str, Dict] = {}  # Store metadata separately
        self._load_or_create_store()
    
    def _load_or_create_store(self) -> None:
        """Load existing vector store or create new one."""
        if os.path.exists(f"{self.persist_path}.faiss"):
            try:
                self.vector_store = FAISS.load_local(
                    self.persist_path, 
                    self.embedder.embeddings,
                    allow_dangerous_deserialization=True
                )
                logger.info(f"Loaded existing FAISS index from {self.persist_path}")
            except Exception as e:
                logger.warning(f"Failed to load FAISS index: {e}, creating new one")
                self._create_empty_store()
        else:
            self._create_empty_store()
    
    def _create_empty_store(self) -> None:
        # FAISS requires at least one document to initialize
        dummy_doc = Document(
            page_content="Initialization document for job matching system", 
            metadata={"job_id": "dummy", "is_dummy": True}
        )
        self.vector_store = FAISS.from_documents([dummy_doc], self.embedder.embeddings)
        logger.info("Created new FAISS index")
    
    def add_job(self, job_id: str, job_content: str, metadata: dict = None) -> None:
        try:
            if metadata is None:
                metadata = {}
            
            metadata.update({"job_id": job_id, "is_dummy": False})
            
            # Store metadata separately for easy retrieval
            self._job_metadata[job_id] = metadata
            
            # Enhanced chunking: Split job content intelligently
            chunks = self._create_job_chunks(job_content, metadata)
            
            documents = [
                Document(page_content=chunk, metadata=metadata.copy()) 
                for chunk in chunks
            ]
            
            if self.vector_store is None:
                self.vector_store = FAISS.from_documents(documents, self.embedder.embeddings)
            else:
                self.vector_store.add_documents(documents)
            
            logger.debug(f"Added job {job_id} with {len(documents)} chunks")
            self.save()
        except Exception as e:
            logger.error(f"Error adding job {job_id} to vector store: {e}")
    
    def _create_job_chunks(self, job_content: str, metadata: Dict) -> List[str]:
        chunks = []
        
        # Always include a summary chunk with key information
        summary_parts = []
        if metadata.get("title"):
            summary_parts.append(f"Title: {metadata['title']}")
        if metadata.get("company"):
            summary_parts.append(f"Company: {metadata['company']}")
        if metadata.get("location"):
            summary_parts.append(f"Location: {metadata['location']}")
        
        if summary_parts:
            summary = " | ".join(summary_parts)
            chunks.append(summary)
        
        # Split full content into semantic chunks
        content_chunks = self.embedder.split_text(job_content)
        chunks.extend(content_chunks)
        
        return chunks
    
    def search_similar_jobs(self, query_text: str, k: int = 10, score_threshold: float = 0.3) -> List[dict]:
        if self.vector_store is None:
            logger.warning("Vector store not initialized")
            return []
        
        try:
            # Search for similar job chunks with relevance scores
            # Note: FAISS returns L2 distance (lower is better)
            results = self.vector_store.similarity_search_with_relevance_scores(
                query_text, 
                k=k * 3,  # Get more results to aggregate by job
                score_threshold=score_threshold
            )
            
            # Deduplicate by job_id and aggregate scores
            job_scores: Dict[str, Dict] = {}
            
            for doc, relevance_score in results:
                job_id = doc.metadata.get("job_id")
                
                # Skip dummy documents
                if job_id == "dummy" or doc.metadata.get("is_dummy"):
                    continue
                
                if job_id not in job_scores:
                    job_scores[job_id] = {
                        "job_id": job_id,
                        "metadata": doc.metadata,
                        "scores": [],
                        "chunks": []
                    }
                
                job_scores[job_id]["scores"].append(relevance_score)
                job_scores[job_id]["chunks"].append(doc.page_content)
            
            # Calculate weighted average scores
            job_matches = []
            for job_data in job_scores.values():
                scores = job_data["scores"]
                if not scores:
                    continue
                
                # Use weighted average (prioritize best matches)
                sorted_scores = sorted(scores, reverse=True)
                
                # Weight: 50% best match, 30% second best, 20% average of rest
                if len(sorted_scores) >= 2:
                    weighted_score = (
                        sorted_scores[0] * 0.5 +
                        sorted_scores[1] * 0.3 +
                        (sum(sorted_scores[2:]) / len(sorted_scores[2:]) * 0.2 if len(sorted_scores) > 2 else 0)
                    )
                else:
                    weighted_score = sorted_scores[0]
                
                job_matches.append({
                    "job_id": job_data["job_id"],
                    "similarity_score": weighted_score,
                    "metadata": job_data["metadata"],
                    "num_matches": len(scores),
                    "best_chunk_score": max(scores)
                })
            
            # Sort by weighted similarity score (higher is better)
            job_matches.sort(key=lambda x: x["similarity_score"], reverse=True)
            
            # Return top k results
            return job_matches[:k]
            
        except Exception as e:
            logger.error(f"Error searching similar jobs: {e}")
            return []
    
    def save(self) -> None:
        try:
            if self.vector_store:
                self.vector_store.save_local(self.persist_path)
                logger.debug(f"Saved FAISS index to {self.persist_path}")
        except Exception as e:
            logger.error(f"Error saving FAISS index: {e}")
    
    def clear(self) -> None:
        try:
            self._job_metadata.clear()
            self._create_empty_store()
            self.save()
            logger.info("Cleared FAISS index")
        except Exception as e:
            logger.error(f"Error clearing FAISS index: {e}")
    
    def get_job_count(self) -> int:
        return len(self._job_metadata)
        
