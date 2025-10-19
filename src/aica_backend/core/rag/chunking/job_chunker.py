import logging
from typing import List, Dict, Optional

from .base import BaseChunker
from ..config import CHUNK_SIZE, CHUNK_OVERLAP

logger = logging.getLogger(__name__)


class JobChunker(BaseChunker):
    """
    Chunking strategy optimized for job postings.
    
    This chunker creates an initial summary chunk with key job information
    (title, company, location) to ensure critical data is always retrieved,
    then chunks the full job description while maintaining context.
    
    Attributes:
        embedder: Text embedder with split_text capability
        chunk_size: Maximum chunk size in characters
        chunk_overlap: Overlap between consecutive chunks
    """
    
    def __init__(self, embedder, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
        self.embedder = embedder
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def chunk_document(self, document: Dict, metadata: Dict = None) -> List[Dict]:
        """
        Chunk a job document into multiple text chunks with metadata.
        
        This method implements the abstract method from BaseChunker.
        It processes a structured job document and returns chunks with metadata.
        
        Args:
            document: Job document dictionary (e.g., title, description, requirements)
            metadata: Optional additional metadata to include with each chunk
            
        Returns:
            List of chunk dictionaries with 'text' and 'metadata' keys
        """
        if metadata is None:
            metadata = {}
        
        # Combine all document fields into full text
        text_parts = []
        for key, value in document.items():
            if isinstance(value, str) and value.strip():
                text_parts.append(value)
        
        full_text = " ".join(text_parts)
        
        # Use chunk_text to get text chunks
        text_chunks = self.chunk_text(full_text, metadata)
        
        # Convert text chunks to document chunks with metadata
        chunk_documents = []
        for chunk_text in text_chunks:
            chunk_documents.append({
                'text': chunk_text,
                'metadata': metadata.copy()
            })
        
        return chunk_documents
    
    def chunk_text(self, text: str, metadata: Dict = None) -> List[str]:
        """
        Create optimized chunks for a job posting.
        
        Strategy:
        1. Create a summary chunk with title, company, location
        2. Split the full content using semantic text splitting
        3. Enrich each chunk with job title for context
        
        Args:
            text: Job posting content
            metadata: Job metadata containing title, company, location
            
        Returns:
            List of text chunks optimized for job matching
        """
        if metadata is None:
            metadata = {}
        
        chunks = []
        
        # Create summary chunk with critical information
        summary_chunk = self._create_summary_chunk(metadata)
        if summary_chunk:
            chunks.append(summary_chunk)
        
        # Split full content into semantic chunks
        content_chunks = self.embedder.split_text(text)
        
        # Enrich chunks with job title context
        job_title = metadata.get("title", "")
        for chunk in content_chunks:
            enriched_chunk = self._enrich_chunk_with_context(chunk, job_title)
            chunks.append(enriched_chunk)
        
        logger.debug(f"Created {len(chunks)} chunks for job {metadata.get('job_id', 'unknown')}")
        return chunks
    
    def _create_summary_chunk(self, metadata: Dict) -> Optional[str]:
        """
        Create a summary chunk with key job information.
        
        This ensures that title, company, and location are always retrievable
        even if they don't appear in the full job description chunks.
        
        Args:
            metadata: Job metadata dictionary
            
        Returns:
            Summary string or None if no metadata available
        """
        summary_parts = []
        
        if metadata.get("title"):
            summary_parts.append(f"Job Title: {metadata['title']}")
        
        if metadata.get("company"):
            summary_parts.append(f"Company: {metadata['company']}")
        
        if metadata.get("location"):
            summary_parts.append(f"Location: {metadata['location']}")
        
        if summary_parts:
            return " | ".join(summary_parts)
        
        return None
    
    def _enrich_chunk_with_context(self, chunk: str, job_title: str) -> str:
        """
        Add job title context to a chunk if not already present.
        
        This helps with retrieval by ensuring each chunk contains context
        about which job it belongs to.
        
        Args:
            chunk: Text chunk to enrich
            job_title: Job title to add as context
            
        Returns:
            Enriched chunk with job title prepended if appropriate
        """
        if job_title and job_title.lower() not in chunk.lower():
            return f"[{job_title}] {chunk}"
        return chunk
    
    def get_chunk_size(self) -> int:
        """Get the configured chunk size."""
        return self.chunk_size
    
    def get_chunk_overlap(self) -> int:
        """Get the configured chunk overlap."""
        return self.chunk_overlap
