from typing import Dict, List

class MatchScorer:
    @staticmethod
    def calculate_confidence(match_score: float, skill_coverage: float) -> str:
        if match_score >= 0.8 and skill_coverage >= 0.7:
            return "high"
        elif match_score >= 0.55 and skill_coverage >= 0.4:
            return "medium"
        else:
            return "low"
    
    @staticmethod
    def categorize_missing_skills(missing_skills: List[str]) -> Dict[str, List[str]]:
        """Prioritize skill gaps: critical tapos itrain then advanced"""
        critical_missing = missing_skills[:3]
        trainable_missing = missing_skills[3:6] if len(missing_skills) > 3 else []
        advanced_missing = missing_skills[6:] if len(missing_skills) > 6 else []
        
        gap_severity = "high" if len(critical_missing) > 2 else \
                      "medium" if len(critical_missing) > 0 else "low"
        
        return {
            "critical_gaps": critical_missing, # Learn in 1-2 months
            "trainable_skills": trainable_missing, # Learn in 2-4 weeks
            "advanced_skills": advanced_missing, # Long-term goals
            "total_gaps": len(missing_skills),
            "gap_severity": gap_severity
        }
    
    @staticmethod
    def calculate_match_metrics( #Stastistics for matched jobs
        direct_matches: int,
        related_matches: int,
        total_required: int,
        compatibility_score: float
    ) -> Dict:
        return {
            "direct_matches": direct_matches,
            "related_matches": related_matches,
            "total_required": total_required,
            "match_percentage": round(compatibility_score * 100, 1),
            "exact_match_rate": round((direct_matches / total_required * 100), 1) if total_required > 0 else 0,
            "partial_match_rate": round((related_matches / total_required * 100), 1) if total_required > 0 else 0
        }
    
    @staticmethod
    def get_match_statistics(match_scores: List[float]) -> Dict:
        if not match_scores:
            return {
                "total_jobs": 0,
                "average_score": 0,
                "top_score": 0,
                "matches_above_60": 0,
                "matches_above_80": 0
            }
        
        return {
            "total_jobs": len(match_scores),
            "average_score": round(sum(match_scores) / len(match_scores), 2),
            "top_score": round(max(match_scores), 2),
            "lowest_score": round(min(match_scores), 2),
            "matches_above_60": len([s for s in match_scores if s >= 0.60]),
            "matches_above_80": len([s for s in match_scores if s >= 0.80]),
            "match_rate_above_60": round(len([s for s in match_scores if s >= 0.60]) / len(match_scores) * 100, 1)
        }
