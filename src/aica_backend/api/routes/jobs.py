import logging
import asyncio
import os
from datetime import datetime

from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Header, BackgroundTasks
from typing import List, Dict, Any, Optional

from api.dependencies import get_current_user
from database.models.user_models import User
from database.job_db import JobDatabase
from services.job_matching import JobMatchingService

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
    logger.info(f"Starting get_job_matches for user {current_user.id} with limit {limit}")
    try:
        async def fetch_matches():
            matching_service = JobMatchingService()
            logger.debug(f"JobMatchingService initialized for user {current_user.id}")

            # Get matches from database
            logger.debug(f"Calling get_user_job_matches for user {current_user.id}")
            saved_matches = matching_service.user_db.get_user_job_matches(current_user.id, limit=limit)
            logger.info(f"Retrieved {len(saved_matches) if saved_matches else 0} job matches for user {current_user.id}")

            if not saved_matches:
                logger.info(f"No job matches found for user {current_user.id}")
                return []

            # Convert to response format
            responses = []
            for match in saved_matches:
                try:
                    logger.debug(f"Processing match {match.id} for job {match.job_id}")
                    # Get job details
                    job = matching_service.job_db.get_job_by_id(match.job_id)
                    if not job:
                        logger.warning(f"Job {match.job_id} not found in database for user {current_user.id}")
                        continue

                    response = JobMatchResponse(
                        job_id=match.job_id,
                        job_title=job.title,
                        company=job.company,
                        location=job.location or "Not specified",
                        match_score=match.match_score,
                        matched_skills=match.matched_skills,
                        missing_critical_skills=match.missing_critical_skills,
                        skill_coverage=match.skill_coverage,
                        confidence=match.confidence,
                        job_url=job.url,
                        ai_reasoning=match.ai_reasoning
                    )
                    responses.append(response)

                except Exception as e:
                    logger.error(f"Error processing match {match.id}: {str(e)}", exc_info=True)
                    continue

            logger.info(f"Successfully processed {len(responses)} job matches for user {current_user.id}")
            return responses
        
        # Timeout after 30 seconds
        try:
            return await asyncio.wait_for(fetch_matches(), timeout=30.0)
        except asyncio.TimeoutError:
            logger.error(f"Timeout fetching job matches for user {current_user.id}")
            return []

    except Exception as e:
        logger.error(f"Error getting job matches for user {current_user.id}: {str(e)}", exc_info=True)
        # Return empty list instead of raising 500 error
        return []


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
    logger.info(f"Starting get_matching_stats for user {current_user.id}")
    try:
        async def fetch_stats():
            matching_service = JobMatchingService()
            logger.debug(f"JobMatchingService initialized for user {current_user.id}")

            # Get user matches
            logger.debug(f"Calling get_user_job_matches for user {current_user.id}")
            matches = matching_service.user_db.get_user_job_matches(current_user.id, limit=100)
            logger.info(f"Retrieved {len(matches) if matches else 0} matches for stats calculation for user {current_user.id}")

            if not matches:
                logger.info(f"No matches found for stats for user {current_user.id}")
                return {
                    "total_matches": 0,
                    "average_score": 0.0,
                    "high_confidence_matches": 0,
                    "medium_confidence_matches": 0,
                    "low_confidence_matches": 0,
                    "last_updated": None
                }

            # Calculate stats
            logger.debug(f"Calculating stats for {len(matches)} matches")
            total_matches = len(matches)
            average_score = sum(m.match_score for m in matches) / total_matches

            high_confidence = len([m for m in matches if m.match_score >= 0.8])
            medium_confidence = len([m for m in matches if 0.6 <= m.match_score < 0.8])
            low_confidence = len([m for m in matches if m.match_score < 0.6])

            last_updated = max(m.created_at for m in matches) if matches else None

            result = {
                "total_matches": total_matches,
                "average_score": round(average_score, 3),
                "high_confidence_matches": high_confidence,
                "medium_confidence_matches": medium_confidence,
                "low_confidence_matches": low_confidence,
                "last_updated": last_updated
            }
            logger.info(f"Successfully calculated stats for user {current_user.id}: {result}")
            return result
        
        # Timeout after 20 seconds
        try:
            return await asyncio.wait_for(fetch_stats(), timeout=20.0)
        except asyncio.TimeoutError:
            logger.error(f"Timeout calculating stats for user {current_user.id}")
            return {
                "total_matches": 0,
                "average_score": 0.0,
                "high_confidence_matches": 0,
                "medium_confidence_matches": 0,
                "low_confidence_matches": 0,
                "last_updated": None
            }

    except Exception as e:
        logger.error(f"Error retrieving matching stats for user {current_user.id}: {str(e)}", exc_info=True)
        # Return safe fallback instead of raising 500
        return {
            "total_matches": 0,
            "average_score": 0.0,
            "high_confidence_matches": 0,
            "medium_confidence_matches": 0,
            "low_confidence_matches": 0,
            "last_updated": None
        }

class SavedJobResponse(BaseModel):
    job_id: str
    saved_at: str = ""
    title: str = ""
    company: str = ""
    location: str = ""
    url: str = ""
    description: str = ""
    match_score: Optional[float] = None
    confidence: str = ""
    ai_reasoning: str = ""
    matched_skills: List[str] = []
    missing_critical_skills: List[str] = []
    skill_coverage: float = 0.0
@router.get("/recommendations", response_model=List[JobMatchResponse])
async def get_job_recommendations(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
) -> List[JobMatchResponse]:
    """Get job recommendations when no matches are found - shows recent/popular jobs"""
    logger.info(f"Getting job recommendations for user {current_user.id} with limit {limit}")
    try:
        matching_service = JobMatchingService()
        
        # Get recent jobs from the database
        jobs = matching_service.job_db.get_jobs_for_matching(limit=limit)
        
        if not jobs:
            logger.info(f"No jobs available for recommendations for user {current_user.id}")
            return []
        
        # Convert to response format with neutral/informational data
        responses = []
        for job in jobs:
            try:
                response = JobMatchResponse(
                    job_id=job.id,
                    job_title=job.title,
                    company=job.company,
                    location=job.location or "Not specified",
                    match_score=0.0,  # No match score for recommendations
                    matched_skills=[],  # No matched skills for recommendations
                    missing_critical_skills=[],
                    skill_coverage=0.0,
                    confidence="recommendation",  # Special indicator
                    job_url=job.url,
                    ai_reasoning="<strong class='text-gray-900 font-bold'>RECOMMENDED JOB</strong><br/><br/>This is a recommended job posting based on recent job listings. To get personalized matches tailored to your skills, please update your profile with your skills or upload your resume. Our AI will then analyze your qualifications and find the best matching opportunities for you!",
                    skill_gap_analysis={}
                )
                responses.append(response)
            except Exception as e:
                logger.error(f"Error processing recommendation {job.id}: {str(e)}", exc_info=True)
                continue
        
        logger.info(f"Successfully processed {len(responses)} job recommendations for user {current_user.id}")
        return responses
        
    except Exception as e:
        logger.error(f"Error getting job recommendations for user {current_user.id}: {str(e)}", exc_info=True)
        return []


@router.delete("/matches")
async def clear_job_matches(
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """Clear all job matches for user - fresh start"""
    try:
        matching_service = JobMatchingService()
        
        # Delete all matches for the user
        success = matching_service.user_db.clear_job_matches(current_user.id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to clear job matches"
            )
        
        logger.info(f"Cleared all job matches for user {current_user.id}")
        
        return {"message": "All job matches cleared successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing job matches for user {current_user.id}: {str(e)}", exc_info=True)
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

        # Try to get match data using the new method
        match_data = matching_service.user_db.get_user_saved_job_with_match_data(current_user.id, job_id)

        if match_data:
            # Use data from the joined query
            match_score = match_data.get("match_score")
            matched_skills = match_data.get("matched_skills", [])
            missing_critical_skills = match_data.get("missing_critical_skills", [])
            skill_coverage = match_data.get("skill_coverage", 0.0)
            ai_reasoning = match_data.get("ai_reasoning", "")
            confidence = match_data.get("confidence") or "medium"
        else:
            # Fallback: try separate query if join didn't work
            match_score = None
            matched_skills = []
            missing_critical_skills = []
            skill_coverage = 0.0
            ai_reasoning = ""
            confidence = "medium"

            try:
                match = matching_service.user_db.client.table("user_job_matches").select("*").eq("user_id", current_user.id).eq("job_id", job_id).execute()
                if match.data and len(match.data) > 0:
                    match_data = match.data[0]
                    match_score = match_data.get("match_score")
                    matched_skills = match_data.get("matched_skills", [])
                    missing_critical_skills = match_data.get("missing_critical_skills", [])
                    skill_coverage = match_data.get("skill_coverage", 0.0)
                    ai_reasoning = match_data.get("ai_reasoning", "")

                    # Get confidence from database or calculate if not provided
                    confidence = match_data.get("confidence") or "medium"
                    if not confidence and match_score is not None:
                        if match_score >= 0.8:
                            confidence = "high"
                        elif match_score >= 0.6:
                            confidence = "medium"
                        else:
                            confidence = "low"
            except Exception as e:
                logger.warning(f"Could not get match data for job {job_id}: {str(e)}")

        return SavedJobResponse(
            job_id=job_id,
            saved_at=saved.saved_at.isoformat() if saved.saved_at else "",
            title=job.title,
            company=job.company,
            location=job.location or "",
            url=job.url,
            description=job.description or "",
            match_score=match_score,
            confidence=confidence or "medium",
            ai_reasoning=ai_reasoning or "",
            matched_skills=matched_skills or [],
            missing_critical_skills=missing_critical_skills or [],
            skill_coverage=skill_coverage or 0.0
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
        async def fetch_saved_jobs():
            matching_service = JobMatchingService()
            # Get basic saved jobs first
            saved_jobs = matching_service.user_db.get_user_saved_jobs(current_user.id, limit)

            if not saved_jobs:
                return []

            responses = []
            for saved in saved_jobs:
                job = matching_service.job_db.get_job_by_id(saved.job_id)
                if job:
                    # Try to get match data using the new method
                    match_data = matching_service.user_db.get_user_saved_job_with_match_data(current_user.id, saved.job_id)

                    if match_data:
                        # Use data from the joined query
                        match_score = match_data.get("match_score")
                        matched_skills = match_data.get("matched_skills", [])
                        missing_critical_skills = match_data.get("missing_critical_skills", [])
                        skill_coverage = match_data.get("skill_coverage", 0.0)
                        ai_reasoning = match_data.get("ai_reasoning", "")
                        confidence = match_data.get("confidence") or "medium"
                    else:
                        # Fallback: try separate query if join didn't work
                        match_score = None
                        matched_skills = []
                        missing_critical_skills = []
                        skill_coverage = 0.0
                        ai_reasoning = ""
                        confidence = "medium"

                        try:
                            match = matching_service.user_db.client.table("user_job_matches").select("*").eq("user_id", current_user.id).eq("job_id", saved.job_id).execute()
                            if match.data and len(match.data) > 0:
                                match_data = match.data[0]
                                match_score = match_data.get("match_score")
                                matched_skills = match_data.get("matched_skills", [])
                                missing_critical_skills = match_data.get("missing_critical_skills", [])
                                skill_coverage = match_data.get("skill_coverage", 0.0)
                                ai_reasoning = match_data.get("ai_reasoning", "")

                                # Get confidence from database or calculate if not provided
                                confidence = match_data.get("confidence") or "medium"
                                if not confidence and match_score is not None:
                                    if match_score >= 0.8:
                                        confidence = "high"
                                    elif match_score >= 0.6:
                                        confidence = "medium"
                                    else:
                                        confidence = "low"
                        except Exception as e:
                            logger.warning(f"Could not get match data for job {saved.job_id}: {str(e)}")

                    responses.append(SavedJobResponse(
                        job_id=saved.job_id,
                        saved_at=saved.saved_at.isoformat() if saved.saved_at else "",
                        title=job.title,
                        company=job.company,
                        location=job.location or "",
                        url=job.url,
                        description=job.description or "",
                        match_score=match_score,
                        confidence=confidence or "medium",
                        ai_reasoning=ai_reasoning or "",
                        matched_skills=matched_skills or [],
                        missing_critical_skills=missing_critical_skills or [],
                        skill_coverage=skill_coverage or 0.0
                    ))

            return responses

        try:
            return await asyncio.wait_for(fetch_saved_jobs(), timeout=30.0)
        except asyncio.TimeoutError:
            logger.error(f"Timeout fetching saved jobs for user {current_user.id}")
            return []
            
    except Exception as e:
        logger.error(f"Error getting saved jobs for user {current_user.id}: {str(e)}", exc_info=True)
        return []


# ============================================================================
# AUTOMATED JOB SCRAPING & VERIFICATION ENDPOINTS
# ============================================================================

class ScrapingJobResponse(BaseModel):
    message: str
    timestamp: str
    status: str


@router.post("/admin/trigger-scraping", response_model=ScrapingJobResponse)
async def trigger_scraping_job(
    background_tasks: BackgroundTasks,
    api_key: str = Header(None, alias="X-API-Key")
):
    """
    Trigger automated job scraping and verification.
    Called by Google Cloud Scheduler weekly.
    
    Headers:
        X-API-Key: Secret key for authentication
    """
    # Verify API key
    expected_key = os.getenv("SCRAPING_API_KEY", "your-secret-key-here")
    if api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Invalid API key"
        )
    
    # Schedule the background task
    background_tasks.add_task(scrape_and_cleanup_jobs)
    
    return ScrapingJobResponse(
        message="Job scraping and cleanup scheduled successfully",
        timestamp=datetime.utcnow().isoformat(),
        status="scheduled"
    )


async def scrape_and_cleanup_jobs():
    """
    Background task: Scrape new jobs + verify/cleanup old ones.
    
    Process:
    1. Scrape ~500 new jobs from ethical sources
    2. Save and index new jobs in database
    3. Verify URLs of existing jobs (check if still active)
    4. Mark expired jobs as inactive
    """
    from core.job_scraper import JobScraper
    from database.job_db import JobDatabase
    from core.rag import VectorJobStore, TextEmbedder
    
    try:
        logger.info("🚀 Starting automated job scraping and cleanup...")
        
        # Initialize services
        scraper = JobScraper()
        db = JobDatabase()
        embedder = TextEmbedder()
        vector_store = None
        
        try:
            vector_store = VectorJobStore(embedder)
        except Exception as e:
            logger.warning(f"Vector store not available: {str(e)}")
        
        # Step 1: Scrape new jobs from multiple sources
        sources = ["wellfound", "we_work_remotely"]
        jobs_per_source = 250  # 500 total jobs
        
        logger.info(f"📥 Scraping {jobs_per_source} jobs per source from: {sources}")
        new_jobs = []
        
        for source in sources:
            try:
                source_jobs = await scraper.scrape_jobs_from_source(source, limit=jobs_per_source)
                new_jobs.extend(source_jobs)
                logger.info(f"✅ Scraped {len(source_jobs)} jobs from {source}")
            except Exception as e:
                logger.error(f"❌ Failed to scrape {source}: {str(e)}")
        
        # Step 2: Save and index new jobs
        saved_count = 0
        for job in new_jobs:
            try:
                job_id = db.save_job(job)
                if job_id and vector_store:
                    # Create job content for embedding
                    job_content = f"""
                    Title: {job.title}
                    Company: {job.company}
                    Location: {job.location or 'Remote'}
                    Description: {job.description or ''}
                    Skills: {', '.join(job.skills) if job.skills else ''}
                    Requirements: {', '.join(job.requirements) if job.requirements else ''}
                    """
                    
                    metadata = {
                        "title": job.title,
                        "company": job.company,
                        "location": job.location or "",
                        "source": job.source
                    }
                    
                    vector_store.add_job(job_id, job_content, metadata)
                    saved_count += 1
            except Exception as e:
                logger.error(f"Failed to save job {job.title}: {str(e)}")
        
        logger.info(f"💾 Saved and indexed {saved_count}/{len(new_jobs)} new jobs")
        
        # Step 3: Cleanup - Verify old job URLs
        await cleanup_expired_jobs(db)
        
        logger.info("✅ Automated job scraping and cleanup completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Scraping job failed: {str(e)}", exc_info=True)


async def cleanup_expired_jobs(db: JobDatabase):
    """
    Verify job URLs and remove expired ones.
    
    Checks jobs older than 7 days to see if URLs still exist.
    Marks as inactive if:
    - HTTP 404 (Not Found)
    - HTTP 500+ (Server Error)
    - Timeout or connection error
    """
    import aiohttp
    from aiohttp import ClientSession, ClientTimeout
    
    logger.info("🔍 Starting job URL verification...")
    
    # Get jobs that need verification (older than 7 days)
    jobs_to_verify = db.get_jobs_for_verification(days_old=7, limit=200)
    
    if not jobs_to_verify:
        logger.info("No jobs to verify")
        return
    
    logger.info(f"📋 Verifying {len(jobs_to_verify)} job URLs...")
    
    expired_count = 0
    verified_count = 0
    
    # Use aiohttp for async HTTP requests
    timeout = ClientTimeout(total=10)
    
    async with ClientSession(timeout=timeout) as session:
        for job in jobs_to_verify:
            try:
                # Use HEAD request to check if URL exists (faster than GET)
                async with session.head(job.url, allow_redirects=True) as response:
                    if response.status == 404 or response.status >= 500:
                        # Job posting no longer exists
                        db.mark_job_as_expired(job.id)
                        expired_count += 1
                        logger.info(f"🗑️ Expired: {job.title} at {job.company} (Status: {response.status})")
                    else:
                        # Job still active, update verification timestamp
                        db.update_job_verification(job.id)
                        verified_count += 1
                        
            except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                # Connection error or timeout - likely expired
                logger.warning(f"⚠️ Could not verify {job.title}: {str(e)}")
                # Optionally mark as expired after multiple failed attempts
                # For now, just log the error
                
            # Rate limiting - be respectful to job sites
            await asyncio.sleep(1)
    
    logger.info(f"✅ Verification complete: {verified_count} active, {expired_count} expired")

