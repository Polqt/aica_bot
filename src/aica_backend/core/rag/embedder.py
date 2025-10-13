import logging
import numpy as np
from typing import List

from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)


class TextEmbedder:
    DEFAULT_MODEL = "all-MiniLM-L6-v2"
    CHUNK_SIZE = 400
    CHUNK_OVERLAP = 50
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        try:
            self.embeddings = HuggingFaceEmbeddings(
                model_name=f"sentence-transformers/{model_name}",
                model_kwargs={'device': 'cpu'},  # Use CPU for consistency
                encode_kwargs={'normalize_embeddings': True}  # Normalize for better cosine similarity
            )
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.CHUNK_SIZE,
                chunk_overlap=self.CHUNK_OVERLAP,
                length_function=len,
                separators=["\n\n", "\n", ". ", "! ", "? ", ", ", " ", ""]
            )
            logger.info(f"✅ TextEmbedder initialized successfully with model: {model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize TextEmbedder: {e}")
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
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
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
