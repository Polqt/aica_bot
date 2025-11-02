import logging
from typing import List, Dict
from dataclasses import dataclass

from ..config import (
    TOP_CHUNK_WEIGHT,
    SECOND_CHUNK_WEIGHT,
    REMAINING_CHUNKS_WEIGHT,
    COVERAGE_BONUS_WEIGHT,
    COVERAGE_BONUS_DIVISOR,
    MAX_COVERAGE_BONUS
)

logger = logging.getLogger(__name__)


@dataclass
class ChunkMatch:
    content: str
    score: float
    metadata: Dict


@dataclass
class AggregatedMatch:
    job_id: str
    weighted_score: float
    best_score: float
    num_matches: int
    coverage: int
    metadata: Dict
    matched_chunks: List[str]


class ScoreAggregator:
    
    @staticmethod
    def aggregate_chunk_scores(scores: List[float]) -> float:
        """
        Aggregate multiple chunk scores into a single weighted score.
        
        Strategy:
        1. Top chunk gets 50% weight
        2. Second-best chunk gets 25% weight
        3. Remaining chunks averaged get 15% weight
        4. Coverage bonus up to 10% weight
        """
        if not scores:
            return 0.0
        
        # Sort scores in descending order
        sorted_scores = sorted(scores, reverse=True)
        
        # Single match - return the score as-is
        if len(sorted_scores) == 1:
            return sorted_scores[0]
        
        # Multiple matches - use weighted aggregation
        top_score = sorted_scores[0] * TOP_CHUNK_WEIGHT
        second_score = sorted_scores[1] * SECOND_CHUNK_WEIGHT
        
        # Average remaining scores
        remaining_avg = 0.0
        if len(sorted_scores) > 2:
            remaining_avg = sum(sorted_scores[2:]) / len(sorted_scores[2:])
        remaining_score = remaining_avg * REMAINING_CHUNKS_WEIGHT
        
        # Coverage bonus - more matched chunks = higher confidence
        coverage_bonus = min(
            len(scores) / COVERAGE_BONUS_DIVISOR,
            MAX_COVERAGE_BONUS
        ) * COVERAGE_BONUS_WEIGHT
        
        weighted_score = top_score + second_score + remaining_score + coverage_bonus
        
        return weighted_score
    
    @staticmethod
    def aggregate_job_matches(
        job_chunks: Dict[str, List[ChunkMatch]]
    ) -> List[AggregatedMatch]:
        aggregated_matches = []
        
        for job_id, chunks in job_chunks.items():
            if not chunks:
                continue
            
            # Extract scores and content
            scores = [chunk.score for chunk in chunks]
            contents = [chunk.content for chunk in chunks]
            
            # Get metadata from first chunk (all should be same)
            metadata = chunks[0].metadata
            
            # Calculate aggregated score
            weighted_score = ScoreAggregator.aggregate_chunk_scores(scores)
            best_score = max(scores)
            
            aggregated_matches.append(AggregatedMatch(
                job_id=job_id,
                weighted_score=weighted_score,
                best_score=best_score,
                num_matches=len(chunks),
                coverage=len(chunks),
                metadata=metadata,
                matched_chunks=contents
            ))
        
        return aggregated_matches


class ResultRanker:

    @staticmethod
    def rank_by_weighted_score(
        matches: List[AggregatedMatch],
        reverse: bool = True
    ) -> List[AggregatedMatch]:
        return sorted(matches, key=lambda x: x.weighted_score, reverse=reverse)
    
    @staticmethod
    def rank_by_best_match(
        matches: List[AggregatedMatch],
        reverse: bool = True
    ) -> List[AggregatedMatch]:
        return sorted(matches, key=lambda x: x.best_score, reverse=reverse)
    
    @staticmethod
    def rank_by_coverage(
        matches: List[AggregatedMatch],
        reverse: bool = True
    ) -> List[AggregatedMatch]:
        return sorted(matches, key=lambda x: x.coverage, reverse=reverse)
    
    @staticmethod
    def rank_hybrid(
        matches: List[AggregatedMatch],
        weight_score: float = 0.7,
        weight_coverage: float = 0.3
    ) -> List[AggregatedMatch]:
        # Normalize coverage to 0-1 scale
        max_coverage = max([m.coverage for m in matches]) if matches else 1
        
        def hybrid_score(match: AggregatedMatch) -> float:
            normalized_coverage = match.coverage / max_coverage
            return (match.weighted_score * weight_score + 
                    normalized_coverage * weight_coverage)
        
        return sorted(matches, key=hybrid_score, reverse=True)
    
    @staticmethod
    def rank(
        matches: List[AggregatedMatch],
        strategy: str = "weighted",
        **kwargs
    ) -> List[AggregatedMatch]:
        if strategy == "weighted":
            return ResultRanker.rank_by_weighted_score(matches)
        elif strategy == "best_match":
            return ResultRanker.rank_by_best_match(matches)
        elif strategy == "coverage":
            return ResultRanker.rank_by_coverage(matches)
        elif strategy == "hybrid":
            return ResultRanker.rank_hybrid(matches, **kwargs)
        else:
            logger.warning(f"Unknown ranking strategy: {strategy}, using weighted")
            return ResultRanker.rank_by_weighted_score(matches)


class ResultFilter:
    
    @staticmethod
    def filter_by_threshold(
        matches: List[AggregatedMatch],
        min_score: float
    ) -> List[AggregatedMatch]:
        return [m for m in matches if m.weighted_score >= min_score]
    
    @staticmethod
    def filter_by_coverage(
        matches: List[AggregatedMatch],
        min_coverage: int
    ) -> List[AggregatedMatch]:
        return [m for m in matches if m.coverage >= min_coverage]
    
    @staticmethod
    def filter_by_metadata(
        matches: List[AggregatedMatch],
        metadata_filters: Dict[str, any]
    ) -> List[AggregatedMatch]:
        def matches_filters(match: AggregatedMatch) -> bool:
            for key, value in metadata_filters.items():
                if match.metadata.get(key) != value:
                    return False
            return True
        
        return [m for m in matches if matches_filters(m)]
    
    @staticmethod
    def deduplicate(
        matches: List[AggregatedMatch]
    ) -> List[AggregatedMatch]:
        seen = {}
        for match in matches:
            if match.job_id not in seen or match.weighted_score > seen[match.job_id].weighted_score:
                seen[match.job_id] = match
        
        return list(seen.values())
