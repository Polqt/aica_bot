import asyncio
import json
import logging
import os
from pathlib import Path
from typing import List, Dict, Tuple
from dataclasses import dataclass
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from services.job_matching import JobMatchingService
from database.user_db import UserDatabase
from database.job_db import JobDatabase
from database.models.user_models import UserSkill

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class TestCase:
    """A single test case for match validation"""
    test_id: str
    user_skills: List[str]
    job_id: str
    expected_match: bool
    expected_score_range: Tuple[float, float]
    rationale: str
    job_category: str 


GROUND_TRUTH_DATASET = [
    # HIGH MATCH CASES (0.7-1.0)
    TestCase(
        test_id="high_match_01",
        user_skills=["Python", "FastAPI", "PostgreSQL", "Docker", "REST API", "Git"],
        job_id="PLACEHOLDER_BACKEND_JOB_1",  # Replace with actual job IDs from your database
        expected_match=True,
        expected_score_range=(0.7, 0.95),
        rationale="Perfect skill alignment for backend role with Python/FastAPI",
        job_category="backend"
    ),
    TestCase(
        test_id="high_match_02",
        user_skills=["React", "TypeScript", "Next.js", "TailwindCSS", "JavaScript", "HTML/CSS"],
        job_id="PLACEHOLDER_FRONTEND_JOB_1",
        expected_match=True,
        expected_score_range=(0.75, 0.95),
        rationale="Modern frontend stack matches requirements perfectly",
        job_category="frontend"
    ),
    TestCase(
        test_id="high_match_03",
        user_skills=["Python", "Django", "PostgreSQL", "Docker", "AWS", "Redis"],
        job_id="PLACEHOLDER_BACKEND_JOB_2",
        expected_match=True,
        expected_score_range=(0.7, 0.9),
        rationale="Django backend developer with DevOps skills",
        job_category="backend"
    ),
    
    # MEDIUM MATCH CASES (0.5-0.7)
    TestCase(
        test_id="medium_match_01",
        user_skills=["Python", "Django", "REST API", "MySQL"],
        job_id="PLACEHOLDER_BACKEND_JOB_1",  # FastAPI job
        expected_match=True,
        expected_score_range=(0.5, 0.7),
        rationale="Similar framework (Django vs FastAPI) but good skill overlap",
        job_category="backend"
    ),
    TestCase(
        test_id="medium_match_02",
        user_skills=["React", "JavaScript", "CSS", "HTML"],
        job_id="PLACEHOLDER_FRONTEND_JOB_2",  # Modern Next.js/TypeScript job
        expected_match=True,
        expected_score_range=(0.5, 0.7),
        rationale="Basic frontend skills but missing TypeScript and modern frameworks",
        job_category="frontend"
    ),
    TestCase(
        test_id="medium_match_03",
        user_skills=["Python", "Flask", "MongoDB", "Docker"],
        job_id="PLACEHOLDER_BACKEND_JOB_1",
        expected_match=True,
        expected_score_range=(0.4, 0.65),
        rationale="Different framework and database but Python experience",
        job_category="backend"
    ),
    
    # WEAK/NO MATCH CASES (0.0-0.4)
    TestCase(
        test_id="low_match_01",
        user_skills=["React", "TypeScript", "CSS", "Figma"],
        job_id="PLACEHOLDER_BACKEND_JOB_1",
        expected_match=False,
        expected_score_range=(0.1, 0.35),
        rationale="Frontend skills don't match backend role requirements",
        job_category="mismatch"
    ),
    TestCase(
        test_id="low_match_02",
        user_skills=["Python", "FastAPI", "PostgreSQL"],
        job_id="PLACEHOLDER_FRONTEND_JOB_1",
        expected_match=False,
        expected_score_range=(0.1, 0.35),
        rationale="Backend skills don't match frontend role",
        job_category="mismatch"
    ),
    TestCase(
        test_id="low_match_03",
        user_skills=["Java", "Spring Boot", "MySQL", "Maven"],
        job_id="PLACEHOLDER_BACKEND_JOB_1",  # Python job
        expected_match=False,
        expected_score_range=(0.2, 0.4),
        rationale="Backend role but completely different tech stack",
        job_category="mismatch"
    ),
    TestCase(
        test_id="low_match_04",
        user_skills=["Photoshop", "Illustrator", "UI Design"],
        job_id="PLACEHOLDER_BACKEND_JOB_1",
        expected_match=False,
        expected_score_range=(0.0, 0.2),
        rationale="Designer skills for developer role - no overlap",
        job_category="mismatch"
    ),
]


class MatchingValidator:
    """Validates matching thresholds against ground truth data"""
    
    def __init__(self):
        self.service = JobMatchingService()
        self.job_db = JobDatabase()
        self.results = {
            "test_date": datetime.utcnow().isoformat(),
            "total_tests": 0,
            "correct_predictions": 0,
            "false_positives": 0,
            "false_negatives": 0,
            "threshold_analysis": {},
            "detailed_results": []
        }
    
    def _create_mock_user_skills(self, skill_names: List[str]) -> List[UserSkill]:
        """Convert skill names to UserSkill objects"""
        return [
            UserSkill(
                id=f"skill_{i}",
                user_id="test_user",
                skill_name=skill,
                skill_category="technical",
                proficiency_level="intermediate",
                years_of_experience=2,
                confidence_score=0.9
            )
            for i, skill in enumerate(skill_names)
        ]
    
    async def run_single_test(self, test_case: TestCase, threshold: float = 0.4) -> Dict:
        """Run a single test case and return results"""
        try:
            # Get the job from database
            job = self.job_db.get_job_by_id(test_case.job_id)
            if not job:
                logger.error(f"Job {test_case.job_id} not found in database")
                return None
            
            # Create mock user profile with test skills
            user_skills = self._create_mock_user_skills(test_case.user_skills)
            mock_user_profile = {"skills": user_skills}
            
            # Calculate match using the actual matching service
            match_result = await self.service._ai_calculate_job_match_fast(
                mock_user_profile,
                user_skills,
                job
            )
            
            # Determine if prediction matches expectation
            predicted_match = match_result.match_score >= threshold
            actual_match = test_case.expected_match
            is_correct = (predicted_match == actual_match)
            
            # Check if score is within expected range
            in_expected_range = (
                test_case.expected_score_range[0] <= match_result.match_score <= test_case.expected_score_range[1]
            )
            
            result = {
                "test_id": test_case.test_id,
                "job_title": job.title,
                "job_category": test_case.job_category,
                "user_skills": test_case.user_skills,
                "expected_match": actual_match,
                "predicted_match": predicted_match,
                "actual_score": round(match_result.match_score, 3),
                "expected_range": test_case.expected_score_range,
                "in_expected_range": in_expected_range,
                "is_correct": is_correct,
                "rationale": test_case.rationale,
                "ai_reasoning": match_result.ai_reasoning,
                "matched_skills": match_result.matched_skills,
                "confidence": match_result.confidence
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error running test {test_case.test_id}: {str(e)}")
            return None
    
    async def validate_threshold(self, threshold: float = 0.4) -> Dict:
        """Test matching accuracy at a specific threshold"""
        logger.info(f"\n{'='*60}")
        logger.info(f"Testing threshold: {threshold}")
        logger.info(f"{'='*60}\n")
        
        correct = 0
        total = 0
        false_positives = 0
        false_negatives = 0
        detailed_results = []
        
        for test_case in GROUND_TRUTH_DATASET:
            result = await self.run_single_test(test_case, threshold)
            if result:
                detailed_results.append(result)
                total += 1
                
                if result["is_correct"]:
                    correct += 1
                elif result["predicted_match"] and not result["expected_match"]:
                    false_positives += 1
                elif not result["predicted_match"] and result["expected_match"]:
                    false_negatives += 1
        
        # Calculate metrics
        accuracy = (correct / total * 100) if total > 0 else 0
        precision = (correct - false_negatives) / (correct - false_negatives + false_positives) if (correct - false_negatives + false_positives) > 0 else 0
        recall = (correct - false_negatives) / (correct - false_negatives + false_negatives) if (correct - false_negatives + false_negatives) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        return {
            "threshold": threshold,
            "accuracy": round(accuracy, 2),
            "precision": round(precision, 3),
            "recall": round(recall, 3),
            "f1_score": round(f1_score, 3),
            "correct": correct,
            "total": total,
            "false_positives": false_positives,
            "false_negatives": false_negatives,
            "detailed_results": detailed_results
        }
    
    async def run_full_validation(self):
        """Run validation across multiple thresholds"""
        logger.info("🎯 Starting Matching Threshold Validation")
        logger.info(f"📊 Test cases: {len(GROUND_TRUTH_DATASET)}\n")
        
        # Test multiple thresholds
        thresholds_to_test = [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6]
        threshold_results = []
        
        for threshold in thresholds_to_test:
            result = await self.validate_threshold(threshold)
            threshold_results.append(result)
            
            # Print summary for this threshold
            logger.info(f"\nThreshold {threshold}:")
            logger.info(f"  Accuracy: {result['accuracy']}%")
            logger.info(f"  Precision: {result['precision']:.3f}")
            logger.info(f"  Recall: {result['recall']:.3f}")
            logger.info(f"  F1-Score: {result['f1_score']:.3f}")
            logger.info(f"  False Positives: {result['false_positives']}")
            logger.info(f"  False Negatives: {result['false_negatives']}")
        
        # Find best threshold
        best_threshold = max(threshold_results, key=lambda x: x['f1_score'])
        
        # Compile final results
        final_results = {
            "validation_date": datetime.utcnow().isoformat(),
            "total_test_cases": len(GROUND_TRUTH_DATASET),
            "thresholds_tested": thresholds_to_test,
            "threshold_results": threshold_results,
            "best_threshold": best_threshold,
            "recommendation": self._generate_recommendation(threshold_results)
        }
        
        # Save results
        output_file = Path("validation_results.json")
        output_file.write_text(json.dumps(final_results, indent=2))
        logger.info(f"\n✅ Validation complete! Results saved to {output_file}")
        
        # Print summary table
        self._print_summary_table(threshold_results)
        
        return final_results
    
    def _print_summary_table(self, results: List[Dict]):
        """Print a formatted summary table"""
        logger.info("\n" + "="*80)
        logger.info("THRESHOLD VALIDATION SUMMARY")
        logger.info("="*80)
        logger.info(f"{'Threshold':<12} {'Accuracy':<12} {'Precision':<12} {'Recall':<12} {'F1-Score':<12}")
        logger.info("-"*80)
        
        for r in results:
            logger.info(
                f"{r['threshold']:<12} "
                f"{r['accuracy']:<12.1f} "
                f"{r['precision']:<12.3f} "
                f"{r['recall']:<12.3f} "
                f"{r['f1_score']:<12.3f}"
            )
        
        logger.info("="*80 + "\n")
    
    def _generate_recommendation(self, results: List[Dict]) -> str:
        """Generate recommendation based on validation results"""
        best = max(results, key=lambda x: x['f1_score'])
        
        recommendation = f"""
        Based on empirical validation with {len(GROUND_TRUTH_DATASET)} test cases:
        
        RECOMMENDED THRESHOLD: {best['threshold']}
        
        This threshold achieved:
        - Accuracy: {best['accuracy']}%
        - F1-Score: {best['f1_score']:.3f}
        - Precision: {best['precision']:.3f} (low false positive rate)
        - Recall: {best['recall']:.3f} (catches most true matches)
        
        This provides the best balance between precision and recall,
        minimizing both false positives (irrelevant matches) and
        false negatives (missed relevant matches).
        """
        
        return recommendation.strip()


async def main():
    """Main entry point"""
    validator = MatchingValidator()
    
    # Check if we have job IDs set up
    if "PLACEHOLDER" in GROUND_TRUTH_DATASET[0].job_id:
        logger.warning("\n⚠️  WARNING: Ground truth dataset uses placeholder job IDs!")
        logger.warning("Please update GROUND_TRUTH_DATASET with actual job IDs from your database.")
        logger.warning("You can get job IDs by querying your jobs table.\n")
        
        # Provide instructions
        logger.info("To set up the validation dataset:")
        logger.info("1. Query your database for real job IDs:")
        logger.info("   SELECT id, title, company FROM jobs LIMIT 10;")
        logger.info("2. Replace PLACEHOLDER_* values in GROUND_TRUTH_DATASET with actual IDs")
        logger.info("3. Ensure you have a mix of backend, frontend, and full-stack jobs")
        logger.info("4. Re-run this script\n")
        
        return
    
    # Run validation
    results = await validator.run_full_validation()
    
    # Print recommendation
    logger.info("\n" + "="*80)
    logger.info("RECOMMENDATION FOR THESIS")
    logger.info("="*80)
    logger.info(results["recommendation"])
    logger.info("="*80 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
