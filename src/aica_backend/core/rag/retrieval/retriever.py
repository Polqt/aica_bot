import logging
from typing import List, Dict

from .query_builder import QueryBuilder, UserContext
from .ranker import ScoreAggregator, ResultRanker, AggregatedMatch

logger = logging.getLogger(__name__)


class Retriever:
    
    def __init__(self, vector_store):
        self.vector_store = vector_store
        self.query_builder = QueryBuilder()
        self.score_aggregator = ScoreAggregator()
        self.result_ranker = ResultRanker()
    
    def retrieve(
        self,
        user_context: UserContext,
        k: int = 10,
        score_threshold: float = 0.3,
        ranking_strategy: str = "weighted"
    ) -> List[AggregatedMatch]:
        """
        Retrieve and rank relevant jobs for user context.
        
        Args:
            user_context: User context with skills and preferences
            k: Number of jobs to return
            score_threshold: Minimum similarity threshold
            ranking_strategy: Ranking strategy to use
            
        Returns:
            List of ranked job matches
        """
        try:
            # Build query from user context
            query = self.query_builder.build_comprehensive_query(user_context)
            logger.info(f"Built query: {query[:100]}...")
            
            # Search vector store
            raw_results = self.vector_store.search_similar_jobs(
                query_text=query,
                k=k * 4,  # Get more results for aggregation
                score_threshold=score_threshold
            )
            
            logger.info(f"Retrieved {len(raw_results)} raw results")
            
            # Convert to AggregatedMatch format (already done by FAISSStore)
            # The search_similar_jobs already returns aggregated results
            # Convert to our AggregatedMatch dataclass
            aggregated_matches = self._convert_to_aggregated_matches(raw_results)
            
            # Step 4: Apply ranking strategy
            ranked_matches = self.result_ranker.rank(
                aggregated_matches,
                strategy=ranking_strategy
            )
            
            # Step 5: Return top k
            return ranked_matches[:k]
            
        except Exception as e:
            logger.error(f"Error in retrieval: {e}")
            return []
    
    def retrieve_multi_query(
        self,
        user_context: UserContext,
        k: int = 10,
        score_threshold: float = 0.3
    ) -> List[AggregatedMatch]:
        """
        Retrieve using multiple query variations and merge results.
        
        Args:
            user_context: User context with skills and preferences
            k: Number of jobs to return
            score_threshold: Minimum similarity threshold
            
        Returns:
            Merged and ranked job matches
        """
        try:
            # Build multiple query variations
            queries = self.query_builder.build_multi_query(user_context)
            logger.info(f"Built {len(queries)} query variations")
            
            # Search with each query
            all_matches = {}
            for query in queries:
                results = self.vector_store.search_similar_jobs(
                    query_text=query,
                    k=k * 2,
                    score_threshold=score_threshold
                )
                
                # Merge results, keeping best score for each job
                for result in results:
                    job_id = result.get('job_id')
                    score = result.get('similarity_score', 0.0)
                    
                    if job_id not in all_matches or score > all_matches[job_id].get('similarity_score', 0.0):
                        all_matches[job_id] = result
            
            logger.info(f"Merged to {len(all_matches)} unique jobs")
            
            # Convert and rank
            aggregated = self._convert_to_aggregated_matches(list(all_matches.values()))
            ranked = self.result_ranker.rank(aggregated, strategy="weighted")
            
            return ranked[:k]
            
        except Exception as e:
            logger.error(f"Error in multi-query retrieval: {e}")
            return []
    
    def retrieve_by_skills(
        self,
        skills: List[str],
        k: int = 10,
        score_threshold: float = 0.3
    ) -> List[AggregatedMatch]:
        """
        Simple retrieval based only on skills list.
        
        Args:
            skills: List of user skills
            k: Number of jobs to return
            score_threshold: Minimum similarity threshold
            
        Returns:
            List of ranked job matches
        """
        user_context = UserContext(skills=skills)
        return self.retrieve(user_context, k, score_threshold)
    
    def _convert_to_aggregated_matches(
        self,
        raw_results: List[Dict]
    ) -> List[AggregatedMatch]:
        """
        Convert raw vector store results to AggregatedMatch objects.
        
        Args:
            raw_results: Raw results from vector store
            
        Returns:
            List of AggregatedMatch objects
        """
        aggregated = []
        
        for result in raw_results:
            match = AggregatedMatch(
                job_id=result.get('job_id'),
                weighted_score=result.get('similarity_score', 0.0),
                best_score=result.get('best_chunk_score', 0.0),
                num_matches=result.get('num_matches', 1),
                coverage=result.get('coverage', 1),
                metadata=result.get('metadata', {}),
                matched_chunks=[]  # Not included in current implementation
            )
            aggregated.append(match)
        
        return aggregated

class HybridRetriever(Retriever):
    
    def __init__(self, vector_store, keyword_index=None):
        super().__init__(vector_store)
        self.keyword_index = keyword_index
    
    def retrieve_hybrid(
        self,
        user_context: UserContext,
        k: int = 10,
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3,
        score_threshold: float = 0.3
    ) -> List[AggregatedMatch]:
        """
        Retrieve using hybrid semantic + keyword search.
        
        Args:
            user_context: User context with skills and preferences
            k: Number of jobs to return
            semantic_weight: Weight for semantic similarity (0-1)
            keyword_weight: Weight for keyword matching (0-1)
            score_threshold: Minimum similarity threshold
            
        Returns:
            List of ranked job matches
        """
        # Get semantic search results
        semantic_results = self.retrieve(user_context, k * 2, score_threshold)
        
        # If no keyword index, return semantic results only
        if not self.keyword_index:
            return semantic_results[:k]
        
        # TODO: Implement keyword matching and score fusion
        # For now, return semantic results
        logger.info("Keyword index not implemented, using semantic search only")
        return semantic_results[:k]
