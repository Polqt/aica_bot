"""
Simple in-memory cache with TTL (Time To Live) support.
Used for caching database queries to reduce load.
"""
import time
from typing import Any, Dict
from collections import OrderedDict


class SimpleCache:
    """Simple in-memory cache with TTL support using OrderedDict for efficient LRU eviction."""
    
    def __init__(self, max_size: int = 100, ttl: int = 300):
        """
        Initialize cache.
        
        Args:
            max_size: Maximum number of items to cache
            ttl: Time to live in seconds (default: 5 minutes)
        """
        self.cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
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
        Uses OrderedDict for O(1) eviction instead of O(n).
        
        Args:
            key: Cache key
            value: Value to cache
        """
        if len(self.cache) >= self.max_size:
            # Remove oldest item in O(1) time using OrderedDict
            self.cache.popitem(last=False)
        self.cache[key] = {'value': value, 'timestamp': time.time()}
        # Move to end to maintain LRU order
        self.cache.move_to_end(key)

    def clear(self) -> None:
        """Clear all cached items."""
        self.cache.clear()
