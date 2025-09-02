from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from aica_backend.api.utils.auth import get_supabase_client, get_current_user
from aica_backend.database.models.user_models import UserCreate, UserLogin, TokenResponse, ResumeUploadResponse
from aica_backend.database.user_db import UserDatabase
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
            "profile_completed": profile.profile_completed if profile else False
        }

        return user_data
    except Exception as e:
        return {
            "id": current_user["id"],
            "email": current_user["email"],
            "created_at": None,
            "resume_uploaded": False,
            "resume_processed": False,
            "profile_completed": False
        }

@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}

@router.post("/upload-resume", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Validate file type
        allowed_types = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, DOC, and DOCX files are allowed.")

        # Validate file size (max 10MB)
        file_size = 0
        content = await file.read()
        file_size = len(content)

        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

        # Generate unique filename
        user_id = current_user["id"]
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "pdf"
        unique_filename = f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"

        # Upload to Supabase Storage
        supabase = get_supabase_client()
        bucket_name = "resumes"

        # Ensure bucket exists (you might need to create it manually in Supabase)
        try:
            supabase.storage.create_bucket(bucket_name, {"public": False})
        except:
            pass  # Bucket might already exist

        # Upload file
        file_path = f"resumes/{unique_filename}"
        supabase.storage.from_(bucket_name).upload(
            file_path,
            content,
            {"content-type": file.content_type}
        )

        # Update user profile in database
        db = UserDatabase()
        success = db.mark_resume_uploaded(user_id, file_path)

        if not success:
            # If database update fails, try to delete the uploaded file
            try:
                supabase.storage.from_(bucket_name).remove([file_path])
            except:
                pass
            raise HTTPException(status_code=500, detail="Failed to update user profile")

        return ResumeUploadResponse(
            message="Resume uploaded successfully",
            file_path=file_path,
            processing_status="uploaded"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")