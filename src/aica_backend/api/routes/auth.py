import traceback
import asyncio

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from api.utils.auth import get_supabase_client, get_current_user, get_supabase_admin_client
from database.models.user_models import UserCreate, UserLogin, TokenResponse, ResumeUploadResponse
from database.user_db import UserDatabase
from core.resume import ResumeParser
from database.job_db import JobDatabase
from services.job_matching import JobMatchingService
from datetime import datetime


limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

@router.post("/signup", response_model=dict)
@limiter.limit("5/minute")
async def signup(request: Request, user: UserCreate):
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
        
        # Always try to create user in our database, even if email needs confirmation
        try:
            db_user = db.create_user(
                email=user.email,
                password_hash="",
                user_id=response.user.id
            )
            db.create_user_profile(response.user.id)
            traceback.print_exc()
        except Exception:
            traceback.print_exc()

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

@router.post("/resend-confirmation")
async def resend_confirmation(email: dict):
    try:
        supabase = get_supabase_client()
        response = supabase.auth.resend({
            "type": "signup",
            "email": email.get("email")
        })
        
        return {"message": "Confirmation email sent. Please check your inbox."}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to send confirmation email")

@router.get("/profile")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    try:
        db = UserDatabase()
        user = db.get_user_by_id(current_user["id"])
        profile = db.get_user_profile(current_user["id"])

        # If user doesn't exist in our database but exists in Supabase, create them
        if not user:
            try:
                user = db.create_user(
                    email=current_user["email"],
                    password_hash="",
                    user_id=current_user["id"]
                )
                profile = db.create_user_profile(current_user["id"])
            except Exception as create_error:
                # Check if user already exists by email
                if "duplicate key" in str(create_error) and "email" in str(create_error):
                    try:
                        user = db.get_user_by_email(current_user["email"])
                        if user:
                            profile = db.get_user_profile(user.id)
                    except Exception:
                        traceback.print_exc()
                else:
                    traceback.print_exc()
                
                if not user:
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
    except Exception as e:
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

@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}

async def process_resume_background(user_id: str, file_content: bytes, file_type: str):
    db = UserDatabase()
    
    try:
        user = db.get_user_by_id(user_id)
        if not user:
            return
    
        db.update_user_profile(user_id, {"processing_step": "parsing"})
        await asyncio.sleep(2)
        
        parser = ResumeParser()
        await parser.process_and_store_resume(user_id, file_content, file_type)
        
        # Use skill-based job matching
        db.update_user_profile(user_id, {"processing_step": "matching"})
        
        # Small delay to show matching step
        await asyncio.sleep(2)
        try:
            # Get user skills
            user_skills = db.get_user_skills(user_id)
            if not user_skills:
                matches = []
            else:
                
                # Get available jobs
                job_db = JobDatabase()
                jobs = job_db.get_jobs_for_matching(limit=100)
                
                if not jobs:
                    matches = []
                else:
                    # Use simple skill-based matching
                    job_matching_service = JobMatchingService()
                    
                    # Get potential matches using fast screening
                    potential_matches = await job_matching_service._fast_similarity_screening(user_skills, jobs, 20)
                    
                    # Convert to JobMatchResult using simple calculation
                    matches = []
                    for job in potential_matches[:10]:  # Top 10 matches
                        try:
                            simple_match = await job_matching_service._simple_calculate_job_match(user_skills, job)
                            matches.append(simple_match)
                        except Exception as match_error:
                            continue
                    
                    # Save matches to database
                    if matches:
                        try:
                            await job_matching_service.save_job_matches(user_id, matches)
                        except Exception:
                            traceback.print_exc()
                    else:
                        print("No valid matches generated")
                        
        except Exception:
            traceback.print_exc()
            matches = []
        
        db.update_user_profile(user_id, {"processing_step": "finalizing"})
        
        # Small delay to show finalizing step
        await asyncio.sleep(2)
        
        db.update_user_profile(user_id, {
            "resume_processed": True,
            "profile_completed": True,
            "processing_step": "completed",
            "matches_generated": True
        })
        
    except Exception as e:
        traceback.print_exc()
        
        try:
            db.update_user_profile(user_id, {
                "resume_processed": False,
                "processing_step": "error",
                "processing_error": str(e)
            })
        except Exception as update_error:
            print(f"Failed to update error status for user {user_id}: {str(update_error)}")
        

@router.post("/upload-resume", response_model=ResumeUploadResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
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
        user = db.get_user_by_id(user_id)
        
        if not user:
            try:
                user = db.create_user(
                    email=current_user["email"],
                    password_hash="",
                    user_id=user_id
                )
            except Exception as user_create_error:
                if "duplicate key" in str(user_create_error) and "email" in str(user_create_error):
                    print(f"User already exists with email {current_user['email']}, trying to get existing user")
                    try:
                        user = db.get_user_by_email(current_user["email"])
                        if user:
                            print(f"Found existing user: {user.id}")
                        else:
                            raise HTTPException(status_code=500, detail="User exists but cannot be retrieved")
                    except Exception as get_error:
                        raise HTTPException(status_code=500, detail="Failed to prepare user for resume upload")
                else:
                    raise HTTPException(status_code=500, detail="Failed to prepare user for resume upload")
        
        try:
            profile = db.get_user_profile(user_id)
            if not profile:
                db.create_user_profile(user_id)
        except Exception as profile_error:
            print(f"Profile creation/check error: {str(profile_error)}")

        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "pdf"
        unique_filename = f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"

        # Upload to Supabase Storage
        supabase = get_supabase_admin_client()  # Use admin client for storage operations
        bucket_name = "resumes"

        # Ensure bucket exists 
        try:
            supabase.storage.create_bucket(bucket_name)
        except Exception as bucket_error:
            # Check if bucket actually exists
            try:
                buckets = supabase.storage.list_buckets()
                bucket_exists = any(bucket.name == bucket_name for bucket in buckets)
                if not bucket_exists:
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Storage bucket '{bucket_name}' does not exist and could not be created. Please check your Supabase configuration."
                    )
            except Exception as list_error:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Storage service unavailable. Please check your Supabase configuration: {str(list_error)}"
                )

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
        
        background_tasks.add_task(
            process_resume_background,
            user_id,
            content,
            file.content_type
        )

        return ResumeUploadResponse(
            message="Resume uploaded successfully and is being processed",
            file_path=file_path,
            processing_status="processing"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    
@router.get("/skills")
async def get_user_skills(current_user: dict = Depends(get_current_user)):
    try:
        db = UserDatabase()
        skills = db.get_user_skills(current_user["id"])
        
        skills_by_category = {}
        for skill in skills:
            if skill.skill_category not in skills_by_category:
                skills_by_category[skill.skill_category] = []
            skills_by_category[skill.skill_category].append(skill.skill_name)
            
        return {
            "technical_skills": skills_by_category.get("technical", []),
            "soft_skills": skills_by_category.get("soft", []),
            "industries": skills_by_category.get("industry", []),
            "job_titles": skills_by_category.get("job_title", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve skills: {str(e)}")
    
    
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

        # Check if processing is complete
        if profile.resume_processed:
            try:
                job_db = JobDatabase()
                matches = job_db.get_user_matches(current_user["id"])
                match_count = len(matches) if matches else 0
            except Exception as match_error:
                match_count = 0

            return {
                "status": "completed",
                "message": f"Resume processed successfully! Found {match_count} job matches.",
                "step": "completed",
                "matches_found": match_count
            }

        # Check for error state
        if hasattr(profile, 'processing_step') and profile.processing_step == "error":
            error_message = getattr(profile, 'processing_error', 'An error occurred during processing')
            return {
                "status": "error",
                "message": f"Processing failed: {error_message}",
                "step": "error"
            }

        # Get current processing step
        current_step = getattr(profile, 'processing_step', 'processing')

        step_messages = {
            "parsing": "Analyzing your resume and extracting skills...",
            "matching": "Finding job matches based on your skills...",
            "finalizing": "Completing the matching process...",
            "processing": "Processing your resume and finding job matches..."
        }

        message = step_messages.get(current_step, "Processing your resume and finding job matches...")

        return {
            "status": "processing",
            "message": message,
            "step": current_step
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve processing status: {str(e)}")


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
            return {
                "success": False,
                "message": "No skills found. Please complete your profile and add skills first.",
                "matches_found": 0
            }

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


@router.get("/storage/status")
async def get_storage_status(current_user: dict = Depends(get_current_user)):
    try:
        supabase = get_supabase_admin_client()
        bucket_name = "resumes"

        buckets = supabase.storage.list_buckets()
        bucket_names = [bucket.name for bucket in buckets]

        bucket_exists = bucket_name in bucket_names

        return {
            "storage_available": True,
            "bucket_exists": bucket_exists,
            "bucket_name": bucket_name,
            "all_buckets": bucket_names
        }
    except Exception as e:
        return {
            "storage_available": False,
            "error": str(e),
            "bucket_exists": False
        }
    