import logging
import numpy as np
from typing import List

logger = logging.getLogger(__name__)


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors.
    
    Cosine similarity measures the cosine of the angle between two vectors,
    returning a value between -1 and 1 (though normalized embeddings typically
    return values between 0 and 1).
    
    Args:
        vec1: First embedding vector
        vec2: Second embedding vector
        
    Returns:
        Cosine similarity score (0.0 if calculation fails or vectors are invalid)
        
    Examples:
        >>> v1 = [1.0, 2.0, 3.0]
        >>> v2 = [2.0, 4.0, 6.0]
        >>> cosine_similarity(v1, v2)
        1.0  # Vectors point in same direction
    """
    try:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            logger.warning("Invalid vectors for cosine similarity: empty or mismatched lengths")
            return 0.0
        
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)
        
        if norm1 == 0 or norm2 == 0:
            logger.warning("Zero-norm vector encountered in cosine similarity")
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
    except Exception as e:
        logger.error(f"Error calculating cosine similarity: {e}")
        return 0.0


def euclidean_distance(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate Euclidean distance between two vectors.
    
    Euclidean distance is the straight-line distance between two points
    in n-dimensional space. Lower values indicate more similar vectors.
    
    Args:
        vec1: First embedding vector
        vec2: Second embedding vector
        
    Returns:
        Euclidean distance (float('inf') if calculation fails)
    """
    try:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return float('inf')
        
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        return float(np.linalg.norm(vec1_np - vec2_np))
    except Exception as e:
        logger.error(f"Error calculating Euclidean distance: {e}")
        return float('inf')


def dot_product(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate dot product between two vectors.
    
    For normalized vectors, dot product is equivalent to cosine similarity.
    
    Args:
        vec1: First embedding vector
        vec2: Second embedding vector
        
    Returns:
        Dot product (0.0 if calculation fails)
    """
    try:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        return float(np.dot(vec1_np, vec2_np))
    except Exception as e:
        logger.error(f"Error calculating dot product: {e}")
        return 0.0
