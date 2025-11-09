import logging
from typing import List

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .base import BaseEmbedder
from ..config import (
    DEFAULT_EMBEDDING_MODEL,
    EMBEDDING_DEVICE,
    NORMALIZE_EMBEDDINGS,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    TEXT_SEPARATORS
)

logger = logging.getLogger(__name__)


class HuggingFaceEmbedder(BaseEmbedder):
    
    def __init__(self, model_name: str = DEFAULT_EMBEDDING_MODEL):
        try:
            self.embeddings = HuggingFaceEmbeddings(
                model_name=f"sentence-transformers/{model_name}",
                model_kwargs={'device': EMBEDDING_DEVICE},
                encode_kwargs={'normalize_embeddings': NORMALIZE_EMBEDDINGS}
            )
            
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=CHUNK_SIZE,
                chunk_overlap=CHUNK_OVERLAP,
                length_function=len,
                separators=TEXT_SEPARATORS
            )
            
            logger.info(f"✅ HuggingFaceEmbedder initialized successfully with model: {model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize HuggingFaceEmbedder: {e}")
            raise
    
    def create_embeddings(self, texts: List[str], metadatas: List[dict] = None) -> List[List[float]]:
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
        try:
            if not text or not text.strip():
                return []
            
            return self.embeddings.embed_query(text)
        except Exception as e:
            logger.error(f"Error embedding single text: {e}")
            return []
    
    def split_text(self, text: str) -> List[str]:
        try:
            if not text:
                return []
            
            return self.text_splitter.split_text(text)
        except Exception as e:
            logger.error(f"Error splitting text: {e}")
            return [text]  # Return original text if splitting fails

TextEmbedder = HuggingFaceEmbedder
