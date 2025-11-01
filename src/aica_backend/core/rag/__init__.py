"""
RAG (Retrieval-Augmented Generation) System for AICA.

This module provides the complete RAG infrastructure for job matching,
including embedding generation, vector storage, similarity search, and
high-level pipelines for indexing and searching jobs.

The module is organized into the following submodules:
- embeddings: Text embedding generation (HuggingFace sentence-transformers)
- chunking: Document chunking strategies for optimal retrieval
- storage: Vector store implementations (FAISS)
- retrieval: Advanced retrieval, ranking, and query building
- pipeline: High-level indexing and search pipelines
- config: Centralized configuration constants

Public API (maintains backward compatibility):
- TextEmbedder: HuggingFace-based text embedder
- VectorJobStore: FAISS-based vector store for job search

New functionality:
- Retrieval: Retriever, QueryBuilder, UserContext, ResultRanker, ResultFilter
- Pipeline: JobIndexer, SearchPipeline, RealtimeSearcher, JobSearcher
"""

# Import from refactored modules
from .embeddings import TextEmbedder, HuggingFaceEmbedder
from .storage import VectorJobStore, FAISSStore
from .chunking import JobChunker
from .retrieval import (
    Retriever,
    HybridRetriever,
    QueryBuilder,
    UserContext,
    ScoreAggregator,
    ResultRanker,
    ResultFilter,
    ChunkMatch,
    AggregatedMatch,
)
from .pipeline import (
    JobIndexer,
    JobSearcher,
)
from .config import (
    DEFAULT_EMBEDDING_MODEL,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    DEFAULT_VECTOR_STORE_PATH,
    DEFAULT_SEARCH_K,
    DEFAULT_SCORE_THRESHOLD
)

# Public API exports (maintains backward compatibility with existing code)
__all__ = [
    # Primary classes (original interface - backward compatible)
    'TextEmbedder',           # Alias for HuggingFaceEmbedder
    'VectorJobStore',         # Alias for FAISSStore
    
    # Core classes
    'HuggingFaceEmbedder',
    'FAISSStore',
    'JobChunker',
    
    # Retrieval classes (new)
    'Retriever',
    'HybridRetriever',
    'QueryBuilder',
    'UserContext',
    'ScoreAggregator',
    'ResultRanker',
    'ResultFilter',
    'ChunkMatch',
    'AggregatedMatch',
    
    # Pipeline classes (new)
    'JobIndexer',
    'JobSearcher',
    
    # Configuration constants
    'DEFAULT_EMBEDDING_MODEL',
    'CHUNK_SIZE',
    'CHUNK_OVERLAP',
    'DEFAULT_VECTOR_STORE_PATH',
    'DEFAULT_SEARCH_K',
    'DEFAULT_SCORE_THRESHOLD',
]
