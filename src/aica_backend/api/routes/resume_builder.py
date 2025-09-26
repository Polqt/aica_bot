import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from api.dependencies import get_current_user
from core.resume_builder import ResumeBuilder
from database.models.user_models import (
    User, UserEducation, UserEducationCreate,
    UserExperience, UserExperienceCreate,
    UserSkill, UserSkillCreate,
    UserProfile
)

logger = logging.getLogger(__name__)

router = APIRouter()


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
    current_user: User = Depends(get_current_user)
):
    try:
        builder = ResumeBuilder()
        return builder.add_skill(current_user.id, skill)
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
    current_user: User = Depends(get_current_user)
):
    try:
        builder = ResumeBuilder()
        success = builder.delete_skill(skill_id, current_user.id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill entry not found")
        return {"message": "Skill entry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete skill")


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    experience_years: Optional[int] = None
    education_level: Optional[str] = None

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
    