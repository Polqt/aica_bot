from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from aica_backend.api.utils.auth import get_supabase_client, get_current_user, get_supabase_admin_client
from aica_backend.database.models.user_models import UserCreate, UserLogin, TokenResponse, ResumeUploadResponse
from aica_backend.database.user_db import UserDatabase
from aica_backend.core.resume_parser import ResumeParser
from datetime import datetime

router = APIRouter()

@router.post("/signup", response_model=dict)
async def signup(user: UserCreate):
    try:
        supabase = get_supabase_client()
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })

        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=response.error.message)

        if response.user is None:
            raise HTTPException(status_code=400, detail="Failed to create user")
        
        try:
            db = UserDatabase()
            db_user = db.create_user(
                email=user.email,
                password_hash="",
                user_id=response.user.id
            )
            db.create_user_profile(response.user.id)
            print(f"User inserted into database: {db_user.id}")
        except Exception as db_error:
            print(f"Failed to insert user into database: {str(db_error)}")

        if response.session is None:
            return {"message": "User created successfully. Please check your email to confirm your account."}

        return TokenResponse(access_token=response.session.access_token)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    try:
        supabase = get_supabase_client()
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })

        if response.user is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return TokenResponse(access_token=response.session.access_token)

    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/profile")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    try:
        db = UserDatabase()
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
    try:
        parser = ResumeParser()
        await parser.process_and_store_resume(user_id, file_content, file_type)
        print(f"Resume process succesfully for user: {user_id}")
    except Exception as e:
        db = UserDatabase()
        db.update_user_profile(user_id, {"resume_processed": False})

@router.post("/upload-resume", response_model=ResumeUploadResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
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
        
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

        # Generate unique filename
        user_id = current_user["id"]
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
        db = UserDatabase()
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
            return {"status": "not_uploaded"}
        
        if profile.resume_processed:
            return {"status": "completed"}
        
        return {"status": "processing"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve processing status: {str(e)}")


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
    