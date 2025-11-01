from typing import Dict, Any, List
import logging

from ..storage.base import BaseVectorStore
from ..retrieval.query_builder import QueryBuilder, UserContext

logger = logging.getLogger(__name__)


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
