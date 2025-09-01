from fastapi import APIRouter, HTTPException, Depends
from aica_backend.api.utils.auth import get_supabase_client, get_current_user
from aica_backend.database.models.user_models import UserCreate, UserLogin, TokenResponse, UserResponse
from aica_backend.database.user_db import UserDatabase

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

@router.get("/profile", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    try:
        db = UserDatabase()
        user = db.get_user_by_id(current_user["id"])
        if user:
            return UserResponse(
                id=user.id,
                email=user.email,
                created_at=user.created_at
            )
        else:
            return UserResponse(
                id=current_user["id"],
                email=current_user["email"],
                created_at=None
            )
    except Exception as e:
        return UserResponse(
            id=current_user["id"],
            email=current_user["email"],
            created_at=None
        )

@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}