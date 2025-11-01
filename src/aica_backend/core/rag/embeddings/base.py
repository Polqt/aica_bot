from abc import ABC, abstractmethod
from typing import List


class BaseEmbedder(ABC):
    
    @abstractmethod
    def create_embeddings(self, texts: List[str], metadatas: List[dict] = None) -> List[List[float]]:
        """
        Generate embeddings for multiple texts (batch operation).
        
        This method should efficiently process multiple texts at once,
        taking advantage of batch processing capabilities when available.
        
        Args:
            texts: List of text strings to embed
            metadatas: Optional list of metadata dictionaries for each text
            
        Returns:
            List of embedding vectors (each vector is a list of floats)
            
        Example:
            >>> embedder = HuggingFaceEmbedder()
            >>> texts = ["Python programming", "Java development"]
            >>> embeddings = embedder.create_embeddings(texts)
            >>> len(embeddings)
            2
        """
        pass
    
    @abstractmethod
    def embed_single_text(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        This is a convenience method for embedding individual texts.
        For multiple texts, use create_embeddings() for better performance.
        
        Args:
            text: Text string to embed
            
        Returns:
            Embedding vector as a list of floats
            
        Example:
            >>> embedder = HuggingFaceEmbedder()
            >>> embedding = embedder.embed_single_text("Python programming")
            >>> len(embedding)  # Vector dimension
            384
        """
        pass
    
    @abstractmethod
    def split_text(self, text: str) -> List[str]:
        """
        Split text into chunks appropriate for embedding.
        
        Different embedding models have different maximum token limits.
        This method splits long texts into manageable chunks.
        
        Args:
            text: Text to split into chunks
            
        Returns:
            List of text chunks
            
        Example:
            >>> embedder = HuggingFaceEmbedder()
            >>> long_text = "..." * 1000
            >>> chunks = embedder.split_text(long_text)
            >>> all(len(chunk) <= 512 for chunk in chunks)
            True
        """
        pass
