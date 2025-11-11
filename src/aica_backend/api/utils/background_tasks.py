import logging
import asyncio
from database.user_db import UserDatabase
from database.job_db import JobDatabase
from services.job_matching import JobMatchingService
from core.resume import ResumeParser

logger = logging.getLogger(__name__)


async def regenerate_job_matches_background(user_id: str):

    try:
        matching_service = JobMatchingService()
   
        matching_service.user_db.clear_job_matches(user_id)

        result = await matching_service.update_matches_for_user(user_id)
        return result
    except Exception as e:
        logger.error(f"Failed to regenerate matches for user {user_id}: {e}")


async def delayed_job_matching_background(user_id: str):
    await asyncio.sleep(3)  
    
    db = UserDatabase()
    
    try:
        db.update_user_profile(user_id, {"processing_step": "matching"})

        user_skills = db.get_user_skills(user_id)
        if not user_skills:
            db.update_user_profile(user_id, {
                "processing_step": "completed",
                "matches_generated": False
            })
            return
        
        # Get available jobs
        job_db = JobDatabase()
        jobs = job_db.get_jobs_for_matching(limit=500)
        
        if not jobs:
            db.update_user_profile(user_id, {
                "processing_step": "completed",
                "matches_generated": False
            })
            return
        
        matching_service = JobMatchingService()
        
        result = await matching_service.update_matches_for_user(user_id)
        
        matches_saved = result.get('matches_saved', 0)
        
        # Update profile to indicate matches are ready
        db.update_user_profile(user_id, {
            "processing_step": "completed",
            "matches_generated": matches_saved > 0
        })
        
    except Exception as e:
        try:
            db.update_user_profile(user_id, {
                "processing_step": "error",
                "processing_error": f"Job matching failed: {str(e)}"
            })
        except Exception as update_error:
            logger.error(f"Failed to update error status: {update_error}")


async def process_resume_background(user_id: str, file_content: bytes, file_type: str, mode: str = None):
    db = UserDatabase()
    
    try:
        user = db.get_user_by_id(user_id)
        if not user:
            return

        if mode == "replace" or mode is None:
            db.update_user_profile(user_id, {"processing_step": "clearing_old_data"})
            try:
                db.clear_user_skills(user_id)
                db.clear_user_education(user_id)
                db.clear_user_experience(user_id)
                db.clear_job_matches(user_id)
                logger.info(f"Successfully cleared all old data for user {user_id}")
            except Exception as clear_error:
                logger.error(f"Error clearing old data for user {user_id}: {clear_error}")

        # Parse resume
        db.update_user_profile(user_id, {"processing_step": "parsing"})
        
        parser = ResumeParser()
        await parser.process_and_store_resume(user_id, file_content, file_type)
        
        db.update_user_profile(user_id, {
            "resume_processed": True,
            "profile_completed": True,
            "processing_step": "completed",
            "matches_generated": False 
        })
    
    except Exception as e:
        try:
            db.update_user_profile(user_id, {
                "resume_processed": False,
                "processing_step": "error",
                "processing_error": str(e)
            })
        except Exception as update_error:
            logger.error(f"Failed to update error status for user {user_id}: {str(update_error)}")
