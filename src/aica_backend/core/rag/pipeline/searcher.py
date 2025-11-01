from typing import Dict, Any, List, Optional
import logging

from ..embeddings.base import BaseEmbedder
from ..storage.base import BaseVectorStore
from ..retrieval.query_builder import QueryBuilder, UserContext
from ..retrieval.retriever import Retriever, HybridRetriever
from ..retrieval.ranker import ResultRanker, ResultFilter, AggregatedMatch

logger = logging.getLogger(__name__)


class SearchPipeline:
    def __init__(
        self,
        embedder: BaseEmbedder,
        vector_store: BaseVectorStore,
        use_hybrid: bool = False,
    ):
        self.embedder = embedder
        self.vector_store = vector_store
        self.query_builder = QueryBuilder()
        
        # Initialize retriever
        if use_hybrid:
            self.retriever = HybridRetriever(vector_store, embedder)
            logger.info("SearchPipeline initialized with HybridRetriever")
        else:
            self.retriever = Retriever(vector_store, embedder)
            logger.info("SearchPipeline initialized with standard Retriever")
        
        self.ranker = ResultRanker()
        self.filter = ResultFilter()
    
    def search(
        self,
        user_context: UserContext,
        top_k: int = 10,
        min_score: float = 0.0,
        query_strategy: str = "comprehensive",
    ) -> List[AggregatedMatch]:
        """
        Search for jobs matching the user context.
        
        Args:
            user_context: User's skills, experience, and preferences
            top_k: Maximum number of results to return
            min_score: Minimum score threshold for results
            query_strategy: Query building strategy ("skills", "comprehensive", "semantic")
        
        Returns:
            List of AggregatedMatch objects sorted by relevance score
        
        Example:
            >>> context = UserContext(
            ...     skills=["Python", "Machine Learning"],
            ...     experience_years=5
            ... )
            >>> results = pipeline.search(context, top_k=5, min_score=0.7)
            >>> for match in results:
            ...     print(f"{match.job_id}: {match.final_score:.2f}")
        """
        try:
            # Build query
            logger.debug(f"Building query with strategy: {query_strategy}")
            if query_strategy == "skills":
                query = self.query_builder.build_skills_query(user_context)
            elif query_strategy == "comprehensive":
                query = self.query_builder.build_comprehensive_query(user_context)
            elif query_strategy == "semantic":
                query = self.query_builder.build_semantic_query(user_context)
            else:
                logger.warning(f"Unknown query strategy '{query_strategy}', using comprehensive")
                query = self.query_builder.build_comprehensive_query(user_context)
            
            logger.debug(f"Generated query: {query[:100]}...")
            
            # Retrieve matches
            logger.debug(f"Retrieving top {top_k} matches")
            matches = self.retriever.retrieve(
                query=query,
                top_k=top_k * 2,  # Retrieve more initially for better filtering
            )
            
            logger.debug(f"Retrieved {len(matches)} initial matches")
            
            # Filter by minimum score
            if min_score > 0:
                matches = self.filter.filter_by_threshold(matches, min_score)
                logger.debug(f"Filtered to {len(matches)} matches above threshold {min_score}")
            
            # Apply metadata filters based on user context
            metadata_filters = {}
            if user_context.preferred_locations:
                metadata_filters["location"] = user_context.preferred_locations
            if user_context.preferred_industries:
                metadata_filters["industry"] = user_context.preferred_industries
            
            if metadata_filters:
                matches = self.filter.filter_by_metadata(matches, metadata_filters)
                logger.debug(f"Filtered to {len(matches)} matches after metadata filtering")
            
            # Rank results
            logger.debug("Ranking results")
            matches = self.ranker.rank_hybrid(matches)
            
            # Return top k
            results = matches[:top_k]
            
            logger.info(
                f"Search complete: returned {len(results)} results "
                f"(strategy={query_strategy}, top_k={top_k}, min_score={min_score})"
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Error during search: {str(e)}", exc_info=True)
            return []
    
    def search_by_skills(
        self,
        skills: List[str],
        top_k: int = 10,
        min_coverage: float = 0.0,
    ) -> List[AggregatedMatch]:
        """
        Search for jobs by skills only (simplified interface).
        
        Args:
            skills: List of skill names to search for
            top_k: Maximum number of results to return
            min_coverage: Minimum skill coverage ratio (0.0 to 1.0)
        
        Returns:
            List of AggregatedMatch objects sorted by skill match
        
        Example:
            >>> results = pipeline.search_by_skills(
            ...     skills=["Python", "Docker", "Kubernetes"],
            ...     top_k=5,
            ...     min_coverage=0.5
            ... )
        """
        try:
            logger.debug(f"Searching by skills: {skills}")
            
            # Retrieve matches
            matches = self.retriever.retrieve_by_skills(skills, top_k=top_k * 2)
            
            # Filter by coverage
            if min_coverage > 0:
                matches = self.filter.filter_by_coverage(matches, min_coverage)
                logger.debug(f"Filtered to {len(matches)} matches with coverage >= {min_coverage}")
            
            # Rank by coverage
            matches = self.ranker.rank_by_coverage(matches)
            
            results = matches[:top_k]
            
            logger.info(
                f"Skills search complete: returned {len(results)} results "
                f"(skills={len(skills)}, top_k={top_k}, min_coverage={min_coverage})"
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Error during skills search: {str(e)}", exc_info=True)
            return []
    
    def search_multi_query(
        self,
        user_context: UserContext,
        top_k: int = 10,
        min_score: float = 0.0,
    ) -> List[AggregatedMatch]:
        """
        Search using multiple query variations for better recall.
        
        This method generates multiple query variations and combines results.
        Useful when you want to cast a wider net.
        
        Args:
            user_context: User's skills, experience, and preferences
            top_k: Maximum number of results to return
            min_score: Minimum score threshold for results
        
        Returns:
            List of AggregatedMatch objects with deduplicated and ranked results
        
        Example:
            >>> context = UserContext(
            ...     skills=["Python", "AWS"],
            ...     job_titles=["DevOps Engineer"]
            ... )
            >>> results = pipeline.search_multi_query(context, top_k=10)
        """
        try:
            # Build multiple queries
            logger.debug("Building multiple query variations")
            queries = self.query_builder.build_multi_query(user_context)
            
            logger.debug(f"Generated {len(queries)} query variations")
            
            # Retrieve with multi-query
            matches = self.retriever.retrieve_multi_query(
                queries=queries,
                top_k=top_k * 2,
            )
            
            # Filter and rank
            if min_score > 0:
                matches = self.filter.filter_by_threshold(matches, min_score)
            
            # Deduplicate
            matches = self.filter.deduplicate(matches)
            
            # Rank
            matches = self.ranker.rank_hybrid(matches)
            
            results = matches[:top_k]
            
            logger.info(
                f"Multi-query search complete: returned {len(results)} results "
                f"from {len(queries)} queries (top_k={top_k}, min_score={min_score})"
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Error during multi-query search: {str(e)}", exc_info=True)
            return []
    
    def search_similar_to_job(
        self,
        job_id: str,
        top_k: int = 10,
        exclude_same_company: bool = True,
    ) -> List[AggregatedMatch]:
        """
        Find jobs similar to a given job.
        
        Useful for "more like this" functionality.
        
        Args:
            job_id: ID of the reference job
            top_k: Maximum number of similar jobs to return
            exclude_same_company: Whether to exclude jobs from the same company
        
        Returns:
            List of similar AggregatedMatch objects
        
        Example:
            >>> # Find jobs similar to a specific job
            >>> similar_jobs = pipeline.search_similar_to_job("job_123", top_k=5)
        """
        try:
            logger.debug(f"Searching for jobs similar to {job_id}")
            
            # Get the reference job from vector store
            # This is a simplified implementation - actual implementation
            # would need vector store to support retrieval by job_id
            
            # For now, we'll use a placeholder approach
            logger.warning(
                "search_similar_to_job requires vector store support for "
                "retrieval by job_id - returning empty results"
            )
            
            return []
            
        except Exception as e:
            logger.error(f"Error during similar job search: {str(e)}", exc_info=True)
            return []
    
    def get_search_suggestions(
        self,
        partial_query: str,
        max_suggestions: int = 5,
    ) -> List[str]:
        """
        Get search suggestions based on partial query.
        
        This can be used for autocomplete functionality.
        
        Args:
            partial_query: Partial search query from user
            max_suggestions: Maximum number of suggestions to return
        
        Returns:
            List of suggested query completions
        
        Example:
            >>> suggestions = pipeline.get_search_suggestions("python dev")
            >>> # Returns: ["python developer", "python devops", ...]
        """
        try:
            logger.debug(f"Getting suggestions for: '{partial_query}'")
            
            # This is a placeholder - actual implementation would need
            # a proper suggestion index or query history
            suggestions = [
                f"{partial_query} engineer",
                f"{partial_query} developer",
                f"{partial_query} specialist",
                f"senior {partial_query}",
                f"junior {partial_query}",
            ]
            
            return suggestions[:max_suggestions]
            
        except Exception as e:
            logger.error(f"Error getting suggestions: {str(e)}", exc_info=True)
            return []


class RealtimeSearcher:
    """
    Real-time searcher with caching and query optimization.
    
    This searcher is optimized for interactive search experiences with
    automatic query caching and result prefetching.
    
    Example:
        >>> searcher = RealtimeSearcher(embedder, store, cache_size=100)
        >>> 
        >>> # First search - retrieves from store
        >>> results1 = searcher.search(context)
        >>> 
        >>> # Second search with same context - uses cache
        >>> results2 = searcher.search(context)
    """
    
    def __init__(
        self,
        embedder: BaseEmbedder,
        vector_store: BaseVectorStore,
        cache_size: int = 100,
    ):
        """
        Initialize the real-time searcher.
        
        Args:
            embedder: Embedder for generating query embeddings
            vector_store: Vector store containing indexed jobs
            cache_size: Maximum number of queries to cache
        """
        self.pipeline = SearchPipeline(embedder, vector_store)
        self.cache: Dict[str, List[AggregatedMatch]] = {}
        self.cache_size = cache_size
        
        logger.info(f"RealtimeSearcher initialized with cache_size={cache_size}")
    
    def search(
        self,
        user_context: UserContext,
        top_k: int = 10,
        use_cache: bool = True,
    ) -> List[AggregatedMatch]:
        """
        Search with automatic caching.
        
        Args:
            user_context: User's search context
            top_k: Maximum number of results
            use_cache: Whether to use cached results
        
        Returns:
            List of AggregatedMatch objects
        """
        # Generate cache key
        cache_key = self._generate_cache_key(user_context, top_k)
        
        # Check cache
        if use_cache and cache_key in self.cache:
            logger.debug(f"Cache hit for query: {cache_key}")
            return self.cache[cache_key]
        
        # Perform search
        results = self.pipeline.search(user_context, top_k=top_k)
        
        # Update cache
        if use_cache:
            self._update_cache(cache_key, results)
        
        return results
    
    def _generate_cache_key(self, context: UserContext, top_k: int) -> str:
        """Generate a cache key from user context."""
        # Simple hash-based key generation
        key_parts = [
            ",".join(sorted(context.skills)),
            str(context.experience_years),
            ",".join(sorted(context.preferred_locations or [])),
            ",".join(sorted(context.preferred_industries or [])),
            str(top_k),
        ]
        return "|".join(key_parts)
    
    def _update_cache(self, key: str, results: List[AggregatedMatch]) -> None:
        """Update the cache with new results."""
        if len(self.cache) >= self.cache_size:
            # Remove oldest entry (FIFO)
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
            logger.debug(f"Cache full, removed oldest entry: {oldest_key}")
        
        self.cache[key] = results
        logger.debug(f"Cached results for key: {key}")
    
    def clear_cache(self) -> None:
        """Clear the entire cache."""
        self.cache.clear()
        logger.info("Cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "size": len(self.cache),
            "capacity": self.cache_size,
            "utilization": len(self.cache) / self.cache_size if self.cache_size > 0 else 0,
        }


class JobSearcher:
    
    def __init__(self, vector_store):

        self.vector_store = vector_store
        self.query_builder = QueryBuilder()
    
    def search_jobs(
        self,
        context: UserContext,
        top_k: int = 10,
        use_multi_query: bool = True,
        score_threshold: float = 0.3
    ) -> List[Dict[str, Any]]:
        try:

            if use_multi_query:
                # Use multiple query strategies and aggregate results
                queries = self.query_builder.build_multi_query(context)
                logger.debug(f"Built {len(queries)} query variations")
                
                all_results = []
                seen_job_ids = set()
                
                for i, query in enumerate(queries[:3], 1):  # Limit to 3 queries
                    logger.debug(f"Query {i}: {query[:100]}...")
                    
                    results = self.vector_store.search_similar_jobs(
                        query_text=query,
                        k=top_k * 2,
                        score_threshold=score_threshold
                    )
                    
                    # Deduplicate by job_id
                    for result in results:
                        job_id = result.get("job_id")
                        if job_id and job_id not in seen_job_ids:
                            seen_job_ids.add(job_id)
                            all_results.append(result)
                
                # Sort by score and take top_k
                all_results.sort(key=lambda x: x.get("match_score", 0), reverse=True)
                matches = all_results[:top_k]
                
            else:
                # Single comprehensive query
                query = self.query_builder.build_comprehensive_query(context)
                logger.debug(f"Query: {query[:100]}...")
                
                matches = self.vector_store.search_similar_jobs(
                    query_text=query,
                    k=top_k,
                    score_threshold=score_threshold
                )
            
            return matches
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}", exc_info=True)
            return []
    
    def search_by_skills(
        self,
        skills: List[str],
        top_k: int = 10,
        score_threshold: float = 0.3
    ) -> List[Dict[str, Any]]:
        context = UserContext(skills=skills)
        return self.search_jobs(context, top_k, use_multi_query=False, score_threshold=score_threshold)
