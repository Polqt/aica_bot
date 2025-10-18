"""
Storage module for RAG system.

This module provides vector storage backends for efficient similarity search.
Currently supports FAISS with support for other backends in the future.
"""

from .base import BaseVectorStore
from .metadata_manager import MetadataManager
from .faiss_store import FAISSStore, VectorJobStore

__all__ = [
    'BaseVectorStore',
    'MetadataManager',
    'FAISSStore',
    'VectorJobStore',  # Backward compatibility alias
]
