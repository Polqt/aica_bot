from abc import ABC, abstractmethod
from typing import List, Dict


class BaseChunker(ABC):
    """
    Abstract base class for text chunking strategies.
    
    This interface defines the contract that all chunker implementations must follow.
    Concrete implementations can use different chunking strategies (fixed-size,
    semantic, recursive, job-specific, etc.) while maintaining a consistent interface.
    
    The base class intentionally uses abstract methods with 'pass' - this is correct design.
    It defines WHAT methods must exist, not HOW they should be implemented.
    
    All chunking implementations should inherit from this class to ensure
    consistent interface across different chunking strategies.
    """
    
    @abstractmethod
    def chunk_document(self, document: Dict, metadata: Dict = None) -> List[Dict]:
        """
        Chunk a document into multiple text chunks with metadata.
        
        This is the primary method for chunking. It takes a document dictionary
        and returns a list of chunk dictionaries, each containing text and metadata.
        
        Args:
            document: Document dictionary with content fields (e.g., title, description)
            metadata: Optional additional metadata to include with each chunk
            
        Returns:
            List of chunk dictionaries, each with:
            - 'text': The chunk text content
            - 'metadata': Metadata for the chunk (includes original metadata)
            
        Example:
            >>> chunker = JobChunker()
            >>> doc = {
            ...     'title': 'Python Developer',
            ...     'description': 'Build scalable systems...',
            ...     'requirements': 'Python, FastAPI, PostgreSQL'
            ... }
            >>> chunks = chunker.chunk_document(doc, metadata={'job_id': '123'})
            >>> for chunk in chunks:
            ...     print(f"Text: {chunk['text'][:50]}...")
            ...     print(f"Metadata: {chunk['metadata']}")
        """
        pass
    
    @abstractmethod
    def chunk_text(self, text: str, metadata: Dict = None) -> List[str]:
        """
        Split raw text into chunks according to the chunking strategy.
        
        This is a simpler method for chunking raw text strings without
        document structure. For structured documents, use chunk_document().
        
        Args:
            text: Text to be chunked
            metadata: Optional metadata about the text (e.g., title, source)
            
        Returns:
            List of text chunks
            
        Example:
            >>> chunker = JobChunker()
            >>> long_text = "..." * 1000
            >>> chunks = chunker.chunk_text(long_text)
            >>> all(len(chunk) <= 512 for chunk in chunks)
            True
        """
        pass
    
    @abstractmethod
    def get_chunk_size(self) -> int:
        """
        Get the configured chunk size for this chunker.
        
        Returns:
            Maximum chunk size in characters
            
        Example:
            >>> chunker = JobChunker()
            >>> size = chunker.get_chunk_size()
            >>> print(f"Chunk size: {size} characters")
        """
        pass
    
    @abstractmethod
    def get_chunk_overlap(self) -> int:
        """
        Get the configured overlap between chunks.
        
        Overlap helps maintain context between adjacent chunks.
        
        Returns:
            Overlap size in characters
            
        Example:
            >>> chunker = JobChunker()
            >>> overlap = chunker.get_chunk_overlap()
            >>> print(f"Chunk overlap: {overlap} characters")
        """
        pass
