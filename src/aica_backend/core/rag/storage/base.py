from abc import ABC, abstractmethod
from typing import List, Dict


class BaseVectorStore(ABC):
    """
    Abstract base class for vector storage and similarity search.
    
    This interface defines the contract that all vector store implementations must follow.
    Concrete implementations can use different backends (FAISS, Pinecone, Weaviate, etc.)
    while maintaining a consistent interface.
    
    The base class intentionally uses abstract methods with 'pass' - this is correct design.
    It defines WHAT methods must exist, not HOW they should be implemented.
    """
    
    @abstractmethod
    def add_documents(self, documents: List[dict], embeddings: List[List[float]] = None) -> None:
        """
        Add documents and their embeddings to the vector store.
        
        Documents can be added with pre-computed embeddings or let the store
        compute them internally if embeddings=None.
        
        Args:
            documents: List of document dictionaries with content and metadata.
                      Each dict should have: {'content': str, 'metadata': dict}
            embeddings: Optional list of embedding vectors corresponding to documents.
                       If None, the store should compute embeddings internally.
                       
        Example:
            >>> store = FAISSStore(embedder)
            >>> docs = [
            ...     {'content': 'Python developer', 'metadata': {'id': '1'}},
            ...     {'content': 'Java engineer', 'metadata': {'id': '2'}}
            ... ]
            >>> store.add_documents(docs)
        """
        pass
    
    @abstractmethod
    def search(self, query_embedding: List[float], k: int = 10, score_threshold: float = 0.0) -> List[Dict]:
        """
        Search for similar documents given a query embedding.
        
        Returns the k most similar documents with similarity scores above the threshold.
        
        Args:
            query_embedding: Query vector to search for (pre-computed embedding)
            k: Number of results to return (top-k)
            score_threshold: Minimum similarity score threshold (0.0 to 1.0)
            
        Returns:
            List of search results, each containing:
            - document: The matched document dict
            - score: Similarity score (higher is better)
            - metadata: Document metadata
            
        Example:
            >>> store = FAISSStore(embedder)
            >>> query_vec = embedder.embed_single_text("Python developer")
            >>> results = store.search(query_vec, k=5, score_threshold=0.7)
            >>> for result in results:
            ...     print(f"{result['metadata']['title']}: {result['score']:.2f}")
        """
        pass
    
    @abstractmethod
    def save(self) -> None:
        """
        Save the vector store to persistent storage.
        
        Persists the index and metadata to disk so it can be reloaded later.
        The storage location is typically set during initialization.
        
        Example:
            >>> store = FAISSStore(embedder, persist_path="index.faiss")
            >>> store.add_documents(docs)
            >>> store.save()  # Saves to index.faiss
        """
        pass
    
    @abstractmethod
    def load(self) -> None:
        """
        Load the vector store from persistent storage.
        
        Restores the index and metadata from disk.
        Should handle cases where no persisted data exists gracefully.
        
        Example:
            >>> store = FAISSStore(embedder, persist_path="index.faiss")
            >>> store.load()  # Loads from index.faiss if it exists
        """
        pass
    
    @abstractmethod
    def clear(self) -> None:
        """
        Clear all data from the vector store.
        
        Removes all documents and embeddings, resetting to empty state.
        This operation cannot be undone unless save() was called before.
        
        Example:
            >>> store = FAISSStore(embedder)
            >>> store.add_documents(docs)
            >>> print(store.get_document_count())  # 100
            >>> store.clear()
            >>> print(store.get_document_count())  # 0
        """
        pass
    
    @abstractmethod
    def get_document_count(self) -> int:
        """
        Get the number of documents in the store.
        
        Returns:
            Number of documents currently stored
            
        Example:
            >>> store = FAISSStore(embedder)
            >>> store.add_documents(docs)
            >>> count = store.get_document_count()
            >>> print(f"Store contains {count} documents")
        """
        pass
