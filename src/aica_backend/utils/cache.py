"""
Simple in-memory cache with TTL (Time To Live) support.
Used for caching database queries to reduce load.
"""
import time
from typing import Any, Dict


class SimpleCache:
    """Simple in-memory cache with TTL support."""
    
    def __init__(self, max_size: int = 100, ttl: int = 300):
        """
        Initialize cache.
        
        Args:
            max_size: Maximum number of items to cache
            ttl: Time to live in seconds (default: 5 minutes)
        """
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.max_size = max_size
        self.ttl = ttl

    def get(self, key: str) -> Any:
        """
        Get value from cache if exists and not expired.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found/expired
        """
        if key in self.cache:
            item = self.cache[key]
            if time.time() - item['timestamp'] < self.ttl:
                return item['value']
            else:
                del self.cache[key]
        return None

    def set(self, key: str, value: Any) -> None:
        """
        Set value in cache, removing oldest item if at capacity.
        
        Args:
            key: Cache key
            value: Value to cache
        """
        if len(self.cache) >= self.max_size:
            # Remove oldest item
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k]['timestamp'])
            del self.cache[oldest_key]
        self.cache[key] = {'value': value, 'timestamp': time.time()}

    def clear(self) -> None:
        """Clear all cached items."""
        self.cache.clear()
