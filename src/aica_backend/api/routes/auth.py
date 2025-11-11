import logging
import asyncio

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from api.utils.auth import get_supabase_client, get_current_user, get_supabase_admin_client
from api.utils.user_helpers import ensure_user_exists
from api.utils.background_tasks import process_resume_background, delayed_job_matching_background
from database.models.user_models import UserCreate, UserLogin, TokenResponse, ResumeUploadResponse
from database.user_db import UserDatabase
from services.job_matching import JobMatchingService
from datetime import datetime


logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()


async def _signup(user: UserCreate):
    try:
        supabase = get_supabase_client()
        
        # Check if user already exists in our database
        db = UserDatabase()
        if db.user_exists(user.email):
            raise HTTPException(status_code=400, detail="User already exists")
        
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })

        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=response.error.message)

        if response.user is None:
            raise HTTPException(status_code=400, detail="Failed to create user")

        try:
            db.create_user(
                email=user.email,
                password_hash="",
                user_id=response.user.id
            )
            db.create_user_profile(response.user.id)
        except Exception as e:
            logger.warning(f"Error creating user profile: {e}")

        # Check if user needs email confirmation
        if response.session is None:
            return {
                "message": "User created successfully. Please check your email to confirm your account before logging in.",
                "email_confirmation_required": True
            }

        return {
            "message": "User created and logged in successfully",
            "access_token": response.session.access_token,
            "email_confirmation_required": False
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")


@router.post("/signup", response_model=dict)
@limiter.limit("5/minute")
async def signup(request: Request, user: UserCreate):
    return await _signup(user)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, user: UserLogin):
    try:
        supabase = get_supabase_client()
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })

        if response.user is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Check if email is confirmed
        if hasattr(response.user, 'email_confirmed_at') and not response.user.email_confirmed_at:
            raise HTTPException(
                status_code=401, 
                detail="Please confirm your email address before logging in. Check your email for a confirmation link."
            )

        return TokenResponse(access_token=response.session.access_token)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/profile")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    try:
        db = UserDatabase()
        user = db.get_user_by_id(current_user["id"])
        profile = db.get_user_profile(current_user["id"])

        # If user doesn't exist in our database but exists in Supabase, create them
        if not user:
            if not ensure_user_exists(current_user["id"], current_user["email"], db):
                return {
                    "id": current_user["id"],
                    "email": current_user["email"],
                    "created_at": None,
                    "resume_uploaded": False,
                    "resume_processed": False,
                    "profile_completed": False,
                    "full_name": None,
                    "phone": None,
                    "location": None,
                    "experience_years": None,
                    "education_level": None
                }
            # Fetch the newly created user
            user = db.get_user_by_id(current_user["id"])
            profile = db.get_user_profile(current_user["id"])

        user_data = {
            "id": user.id if user else current_user["id"],
            "email": user.email if user else current_user["email"],
            "created_at": user.created_at if user else None,
            "resume_uploaded": profile.resume_uploaded if profile else False,
            "resume_processed": profile.resume_processed if profile else False,
            "profile_completed": profile.profile_completed if profile else False,
            "full_name": getattr(profile, 'full_name', None) if profile else None,
            "phone": getattr(profile, 'phone', None) if profile else None,
            "location": getattr(profile, 'location', None) if profile else None,
            "experience_years": getattr(profile, 'experience_years', None) if profile else None,
            "education_level": getattr(profile, 'education_level', None) if profile else None
        }

        return user_data
    except Exception:
        return {
            "id": current_user["id"],
            "email": current_user["email"],
            "created_at": None,
            "resume_uploaded": False,
            "resume_processed": False,
            "profile_completed": False,
            "full_name": None,
            "phone": None,
            "location": None,
            "experience_years": None,
            "education_level": None
        }

@router.post("/upload-resume", response_model=ResumeUploadResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    mode: str = None  
):
    try:
        # Validate file type
        allowed_types = [
            "application/pdf", 
            "application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Only PDF, DOC, and DOCX files are allowed."
            )
        
        # Read and validate file size
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

        # Ensure user exists in our database
        db = UserDatabase()
        user_id = current_user["id"]
        
        if not ensure_user_exists(user_id, current_user["email"], db):
            raise HTTPException(status_code=500, detail="Failed to prepare user for resume upload")
        
        # Ensure profile exists
        try:
            profile = db.get_user_profile(user_id)
            if not profile:
                db.create_user_profile(user_id)
        except Exception as profile_error:
            logger.warning(f"Profile creation/check error: {str(profile_error)}")

        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "pdf"
        unique_filename = f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"

        # Upload to Supabase Storage
        supabase = get_supabase_admin_client()  # Use admin client for storage operations
        bucket_name = "resumes"

        # Upload file
        file_path = f"resumes/{unique_filename}"
        try:
            supabase.storage.from_(bucket_name).upload(
                file_path,
                content,
                {"content-type": file.content_type}
            )
        except Exception as upload_error:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to upload file to storage: {str(upload_error)}"
            )

        # Update user profile in database
        success = db.mark_resume_uploaded(user_id, file_path)

        if not success:
            try:
                supabase.storage.from_(bucket_name).remove([file_path])
            except:
                pass
            raise HTTPException(status_code=500, detail="Failed to update user profile")
        
        # Process resume in background using AI Extraction
        background_tasks.add_task(
            process_resume_background,
            user_id,
            content,
            file.content_type,
            mode  
        )

        # Add delayed job matching task to ensure matches are generated after resume processing
        background_tasks.add_task(delayed_job_matching_background, user_id)

        # Include mode in response message
        message = "Resume uploaded successfully and is being processed"
        if mode == "replace":
            message = "Resume uploaded successfully. Previous data cleared. Processing new resume..."
        elif mode == "merge":
            message = "Resume uploaded successfully. Merging with existing data..."

        return ResumeUploadResponse(
            message=message,
            file_path=file_path,
            processing_status="processing"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
   
@router.get("/processing-status")
async def get_processing_status(current_user: dict = Depends(get_current_user)):
    try:
        db = UserDatabase()
        profile = db.get_user_profile(current_user["id"])

        if not profile:
            return {"status": "not_found"}

        if not profile.resume_uploaded:
            return {
                "status": "not_uploaded",
                "message": "No resume uploaded yet"
            }

        # Get current processing step
        current_step = getattr(profile, 'processing_step', 'processing')
        
        # Check if still actively processing (before completion)
        if current_step in ["parsing", "matching", "finalizing", "clearing_old_data"]:
            step_messages = {
                "clearing_old_data": "Clearing previous data...",
                "parsing": "Analyzing your resume and extracting skills...",
                "matching": "Finding job matches based on your skills...",
                "finalizing": "Completing the matching process..."
            }
            
            message = step_messages.get(current_step, "Processing your resume and finding job matches...")

            return {
                "status": "processing",
                "message": message,
                "step": current_step
            }

        # Check if processing is complete
        if profile.resume_processed and current_step == "completed":
            # Wait briefly for database commits
            await asyncio.sleep(0.5)

            try:
                user_db = UserDatabase()
                matches = user_db.get_user_job_matches(current_user["id"])
                match_count = len(matches) if matches else 0
                
                # If matches_generated flag is True but no matches in DB yet, keep status as finalizing
                if getattr(profile, 'matches_generated', False) and match_count == 0:
                    return {
                        "status": "processing",
                        "message": "Finalizing your job matches...",
                        "step": "finalizing"
                    }
                
            except Exception as match_error:
                logger.warning(f"Error getting matches for user {current_user['id']}: {match_error}")
                match_count = 0

            return {
                "status": "completed",
                "message": f"Resume processed successfully!",
                "step": "completed",
                "matches_found": match_count
            }

        # Fallback for any other state
        return {
            "status": "processing",
            "message": "Processing your resume and finding job matches...",
            "step": current_step if current_step else "processing"
        }

    except Exception as e:
        logger.error(f"Error in processing status for user {current_user.get('id', 'unknown')}: {e}")
        return {
            "status": "error",
            "message": "Unable to retrieve processing status. Please try again.",
            "step": "error"
        }

@router.post("/generate-matches")
async def generate_job_matches(current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["id"]
        db = UserDatabase()
        job_matching_service = JobMatchingService()

        # Check if user has any resume builder data
        profile = db.get_user_profile(user_id)
        skills = db.get_user_skills(user_id)

        if not skills:
            return []

        # Update profile to indicate matching is in progress
        db.update_user_profile(user_id, {
            "processing_step": "matching",
            "matches_generated": False
        })

        # Generate matches using combined resume builder data
        summary = await job_matching_service.update_matches_for_user(user_id)

        # Update profile with completion status
        db.update_user_profile(user_id, {
            "processing_step": "completed",
            "matches_generated": True
        })

        return summary

    except Exception as e:
        # Update error status
        try:
            db = UserDatabase()
            db.update_user_profile(current_user["id"], {
                "processing_step": "error",
                "processing_error": str(e)
            })
        except:
            pass

        raise HTTPException(status_code=500, detail=f"Failed to generate matches: {str(e)}")
