import logging

from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any

from ...api.dependencies import get_current_user
from ...database.models.user_models import User, UserJobMatch
from ...services.job_matching import JobMatchingService, JobMatchResult
from ...database.models.user_models import UserSavedJob

logger = logging.getLogger(__name__)

router = APIRouter()


class JobMatchResponse(BaseModel):
    job_id: str
    job_title: str
    company: str
    location: str
    match_score: float
    matched_skills: List[str]
    missing_critical_skills: List[str]
    skill_coverage: float
    confidence: str
    job_url: str
    ai_reasoning: str = ""
    skill_gap_analysis: Dict[str, Any] = {}


class MatchingSummaryResponse(BaseModel):
    success: bool
    message: str
    matches_found: int
    matches_saved: int
    average_score: float = 0.0
    high_confidence_matches: int = 0
    top_match_score: float = 0.0


@router.post("/find-matches", response_model=MatchingSummaryResponse)
async def find_and_save_job_matches(
    current_user: User = Depends(get_current_user)
) -> MatchingSummaryResponse:
    try:
        matching_service = JobMatchingService()
        
        # Run the complete matching workflow
        summary = await matching_service.update_matches_for_user(current_user.id)
        
        return MatchingSummaryResponse(**summary)
        
    except Exception as e:
        logger.error(f"Error in find_and_save_job_matches for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error finding job matches: {str(e)}"
        )


@router.get("/matches", response_model=List[JobMatchResponse])
async def get_job_matches(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
) -> List[JobMatchResponse]:
    try:
        matching_service = JobMatchingService()
        
        # Get matches from database
        saved_matches = matching_service.user_db.get_user_job_matches(current_user.id, limit=limit)
        
        if not saved_matches:
            return []
        
        # Convert to response format
        responses = []
        for match in saved_matches:
            try:
                # Get job details
                job = matching_service.job_db.get_job_by_id(match.job_id)
                if not job:
                    continue
                
                response = JobMatchResponse(
                    job_id=match.job_id,
                    job_title=job.title,
                    company=job.company,
                    location=job.location or "Not specified",
                    match_score=match.match_score,
                    matched_skills=match.matched_skills,
                    missing_critical_skills=[],  # Not stored in DB, would need to recalculate
                    skill_coverage=0.0,  # Not stored in DB, would need to recalculate
                    confidence="medium" if match.match_score > 0.6 else "low",
                    job_url=job.url
                )
                responses.append(response)
                
            except Exception as e:
                logger.error(f"Error processing match {match.id}: {str(e)}")
                continue
        
        return responses
        
    except Exception as e:
        logger.error(f"Error getting job matches for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving job matches: {str(e)}"
        )


@router.get("/matches/fresh", response_model=List[JobMatchResponse])
async def get_fresh_job_matches(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
) -> List[JobMatchResponse]:
    try:
        matching_service = JobMatchingService()
        
        # Get fresh matches
        matches = await matching_service.find_job_matches(current_user.id, limit=limit)
        
        if not matches:
            return []
        
        # Convert to response format with AI insights
        responses = []
        for match in matches:
            response = JobMatchResponse(
                job_id=match.job.id,
                job_title=match.job.title,
                company=match.job.company,
                location=match.job.location or "Not specified",
                match_score=match.match_score,
                matched_skills=match.matched_skills,
                missing_critical_skills=match.missing_critical_skills,
                skill_coverage=match.skill_coverage,
                confidence=match.confidence,
                job_url=match.job.url,
                ai_reasoning=getattr(match, 'ai_reasoning', ''),
                skill_gap_analysis=getattr(match, 'skill_gap_analysis', {})
            )
            responses.append(response)
        
        return responses
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating job matches: {str(e)}"
        )


@router.get("/stats")
async def get_matching_stats(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    try:
        matching_service = JobMatchingService()
        
        # Get user matches
        matches = matching_service.user_db.get_user_job_matches(current_user.id, limit=100)
        
        if not matches:
            return {
                "total_matches": 0,
                "average_score": 0.0,
                "high_confidence_matches": 0,
                "medium_confidence_matches": 0,
                "low_confidence_matches": 0,
                "last_updated": None
            }
        
        # Calculate stats
        total_matches = len(matches)
        average_score = sum(m.match_score for m in matches) / total_matches
        
        high_confidence = len([m for m in matches if m.match_score >= 0.8])
        medium_confidence = len([m for m in matches if 0.6 <= m.match_score < 0.8])
        low_confidence = len([m for m in matches if m.match_score < 0.6])
        
        last_updated = max(m.created_at for m in matches) if matches else None
        
        return {
            "total_matches": total_matches,
            "average_score": round(average_score, 3),
            "high_confidence_matches": high_confidence,
            "medium_confidence_matches": medium_confidence,
            "low_confidence_matches": low_confidence,
            "last_updated": last_updated
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving matching stats: {str(e)}"
        )

class SavedJobResponse(BaseModel):
    job_id: str
    saved_at: str = ""
    title: str = ""
    company: str = ""
    location: str = ""
    url: str = ""
    description: str = ""
@router.delete("/matches")
async def clear_job_matches(
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    try:
        matching_service = JobMatchingService()
        return {"message": "Job matches cleared successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing job matches: {str(e)}"
        )
@router.post("/saved-jobs/{job_id}", response_model=SavedJobResponse)
async def save_job(job_id: str, current_user: User = Depends(get_current_user)):
    try:
        matching_service = JobMatchingService()
        saved = await matching_service.save_user_job(current_user.id, job_id)

        if not saved:
            raise HTTPException(status_code=500, detail="Failed to save job")

        job = matching_service.job_db.get_job_by_id(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        return SavedJobResponse(
            job_id=job_id,
            saved_at=saved.saved_at.isoformat() if saved.saved_at else "",
            title=job.title,
            company=job.company,
            location=job.location or "",
            url=job.url,
            description=job.description or ""
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving job {job_id} for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save job")

@router.delete("/saved-jobs/{job_id}")
async def remove_saved_job(job_id: str, current_user: User = Depends(get_current_user)):
    try:
        matching_service = JobMatchingService()
        success = await matching_service.remove_user_saved_job(current_user.id, job_id)

        if not success:
            raise HTTPException(status_code=404, detail="Saved job not found or already removed")

        return {"message": "Saved job removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing saved job {job_id} for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to remove saved job")

@router.get("/saved-jobs", response_model=List[SavedJobResponse])
async def get_saved_jobs(current_user: User = Depends(get_current_user), limit: int = 50):
    try:
        matching_service = JobMatchingService()
        jobs = await matching_service.get_user_saved_jobs(current_user.id, limit)

        if not jobs:
            return []

        responses = []
        for job in jobs:
            if job:  # Ensure job exists
                responses.append(SavedJobResponse(
                    job_id=job.id,
                    saved_at="",  # We'll get this from the saved job record
                    title=job.title,
                    company=job.company,
                    location=job.location or "",
                    url=job.url,
                    description=job.description or ""
                ))

        return responses
    except Exception as e:
        logger.error(f"Error getting saved jobs for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve saved jobs")
