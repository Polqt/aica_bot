import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import BytesIO

from api.dependencies import get_current_user
from core.resume_builder import ResumeBuilder
from core.resume.pdf_generator import generate_resume_pdf
from database.models.user_models import (
    User, UserEducation, UserEducationCreate,
    UserExperience, UserExperienceCreate,
    UserSkill, UserSkillCreate,
    UserProfile
)

logger = logging.getLogger(__name__)

router = APIRouter()


# Background task for regenerating job matches
async def regenerate_job_matches_background(user_id: str):
    """Regenerate job matches for a user after skill changes"""
    try:
        from services.job_matching import JobMatchingService
        logger.info(f"🔄 Background task: Regenerating job matches for user {user_id}")
        matching_service = JobMatchingService()
        # Clear old matches
        matching_service.user_db.clear_job_matches(user_id)
        logger.info(f"🗑️ Cleared old matches for user {user_id}")
        # Generate new matches
        result = await matching_service.update_matches_for_user(user_id)
        logger.info(f"✅ Regenerated {result.get('matches_saved', 0)} new matches for user {user_id}")
    except Exception as e:
        logger.error(f"❌ Failed to regenerate matches for user {user_id}: {e}")


@router.post("/education", response_model=UserEducation)
async def add_education(
    education: UserEducationCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        builder = ResumeBuilder()
        return builder.add_education(current_user.id, education)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add education")


@router.get("/education", response_model=List[UserEducation])
async def get_user_education(current_user: User = Depends(get_current_user)):
    try:
        builder = ResumeBuilder()
        return builder.get_user_education(current_user.id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve education")


@router.put("/education/{education_id}", response_model=UserEducation)
async def update_education(
    education_id: str,
    education: UserEducationCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        builder = ResumeBuilder()
        result = builder.update_education(education_id, current_user.id, education)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education entry not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update education")


@router.delete("/education/{education_id}")
async def delete_education(
    education_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        builder = ResumeBuilder()
        success = builder.delete_education(education_id, current_user.id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education entry not found")
        return {"message": "Education entry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete education")

@router.post("/experience", response_model=UserExperience)
async def add_experience(
    experience: UserExperienceCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        builder = ResumeBuilder()
        return builder.add_experience(current_user.id, experience)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add experience")


@router.get("/experience", response_model=List[UserExperience])
async def get_user_experience(current_user: User = Depends(get_current_user)):
    try:
        builder = ResumeBuilder()
        return builder.get_user_experience(current_user.id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve experience")


@router.put("/experience/{experience_id}", response_model=UserExperience)
async def update_experience(
    experience_id: str,
    experience: UserExperienceCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        builder = ResumeBuilder()
        result = builder.update_experience(experience_id, current_user.id, experience)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience entry not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update experience")

@router.delete("/experience/{experience_id}")
async def delete_experience(
    experience_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        builder = ResumeBuilder()
        success = builder.delete_experience(experience_id, current_user.id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience entry not found")
        return {"message": "Experience entry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete experience")

@router.post("/skills", response_model=UserSkill)
async def add_skill(
    skill: UserSkillCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    try:
        builder = ResumeBuilder()
        result = builder.add_skill(current_user.id, skill)
        
        # Trigger job match regeneration in background after adding skill
        logger.info(f"Scheduling job match regeneration for user {current_user.id} after adding skill")
        background_tasks.add_task(regenerate_job_matches_background, current_user.id)
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add skill")


@router.get("/skills", response_model=List[UserSkill])
async def get_user_skills(current_user: User = Depends(get_current_user)):
    try:
        builder = ResumeBuilder()
        return builder.get_user_skills(current_user.id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve skills")

@router.put("/skills/{skill_id}", response_model=UserSkill)
async def update_skill(
    skill_id: str,
    skill: UserSkillCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        builder = ResumeBuilder()
        result = builder.update_skill(skill_id, current_user.id, skill)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill entry not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update skill")


@router.delete("/skills/{skill_id}")
async def delete_skill(
    skill_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    try:
        builder = ResumeBuilder()
        success = builder.delete_skill(skill_id, current_user.id)
        if not success:
            logger.warning(f"Skill {skill_id} not found for user {current_user.id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill entry not found")
        logger.info(f"Successfully deleted skill {skill_id} for user {current_user.id}")
        
        # Trigger job match regeneration in background after deleting skill
        logger.info(f"Scheduling job match regeneration for user {current_user.id} after deleting skill")
        background_tasks.add_task(regenerate_job_matches_background, current_user.id)
        
        return {"message": "Skill entry deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting skill {skill_id} for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to delete skill: {str(e)}"
        )


class SkillBulkUpdateRequest(BaseModel):
    skills_to_add: List[UserSkillCreate] = []
    skill_ids_to_delete: List[str] = []


@router.post("/skills/bulk-update")
async def bulk_update_skills(
    request: SkillBulkUpdateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Bulk update skills - add and delete multiple skills in a single request.
    This is more efficient than processing skills one by one.
    """
    try:
        builder = ResumeBuilder()
        
        deleted_count = 0
        added_skills = []
        
        # Delete skills in batch if any
        if request.skill_ids_to_delete:
            logger.info(f"Deleting {len(request.skill_ids_to_delete)} skills for user {current_user.id}")
            deleted_count = builder.delete_skills_batch(request.skill_ids_to_delete, current_user.id)
            logger.info(f"Successfully deleted {deleted_count} skills")
        
        # Add skills in batch if any
        if request.skills_to_add:
            logger.info(f"Adding {len(request.skills_to_add)} skills for user {current_user.id}")
            added_skills = builder.add_skills_batch(current_user.id, request.skills_to_add)
            logger.info(f"Successfully added {len(added_skills)} skills")
        
        # Trigger job match regeneration once after all changes
        if deleted_count > 0 or len(added_skills) > 0:
            logger.info(f"Scheduling job match regeneration for user {current_user.id} after bulk skill update")
            background_tasks.add_task(regenerate_job_matches_background, current_user.id)
        
        return {
            "message": "Skills updated successfully",
            "deleted_count": deleted_count,
            "added_count": len(added_skills),
            "added_skills": added_skills
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error in bulk skills update for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to update skills: {str(e)}"
        )


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    experience_years: Optional[int] = None
    education_level: Optional[str] = None
    profile_completed: Optional[bool] = None

@router.put("/profile", response_model=UserProfile)
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        logger.info(f"Updating profile for user {current_user.id} with data: {profile_data.model_dump()}")
        builder = ResumeBuilder()
        result = builder.update_profile(current_user.id, profile_data.model_dump(exclude_unset=True))
        if not result:
            logger.error(f"Profile update returned None for user {current_user.id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        logger.info(f"Profile updated successfully for user {current_user.id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Exception updating profile for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update profile")


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    try:
        builder = ResumeBuilder()
        profile = builder.get_profile(current_user.id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        return profile
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve profile")

@router.get("/summary")
async def get_resume_summary(current_user: User = Depends(get_current_user)):
    try:
        builder = ResumeBuilder()
        return builder.get_resume_summary(current_user.id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve resume summary")


@router.delete("/reset")
async def reset_resume_data(current_user: User = Depends(get_current_user)):
    try:
        builder = ResumeBuilder()
        success = builder.clear_user_data(current_user.id)
        if not success:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to reset resume data")
        return {"message": "Resume data reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to reset resume data")


@router.get("/export/pdf")
async def export_resume_pdf(current_user: User = Depends(get_current_user)):
    """
    Export user's resume data as a professionally formatted PDF
    
    This endpoint generates a PDF resume from the user's profile data including:
    - Personal information and contact details
    - Skills grouped by category
    - Work experience with descriptions
    - Education history
    
    Returns:
        StreamingResponse: PDF file download
    """
    try:
        builder = ResumeBuilder()
        
        # Fetch all user data
        profile = builder.get_profile(current_user.id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Profile not found. Please complete your profile first."
            )
        
        education = builder.get_user_education(current_user.id)
        experience = builder.get_user_experience(current_user.id)
        skills = builder.get_user_skills(current_user.id)
        
        # Check if user has any data to export
        if not any([education, experience, skills]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No resume data available to export. Please add your experience, education, or skills first."
            )
        
        # Generate PDF with user's email from current_user
        pdf_buffer = generate_resume_pdf(
            profile, 
            education, 
            experience, 
            skills, 
            user_email=current_user.email
        )
        
        # Generate filename
        name_part = profile.full_name.replace(" ", "_") if profile.full_name else "Resume"
        filename = f"{name_part}_Resume.pdf"
        
        logger.info(f"Successfully generated PDF resume for user {current_user.id}")
        
        # Return as downloadable file
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to export resume PDF for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF resume: {str(e)}"
        )
    