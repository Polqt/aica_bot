import os
from supabase import create_client, Client
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")

    if not url or not key:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")

    return create_client(url, key)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        supabase = get_supabase_client()
        user = supabase.auth.get_user(credentials.credentials)
        if user.user is None:
            raise credentials_exception
        return {
            "id": user.user.id,
            "email": user.user.email,
            "user_metadata": user.user.user_metadata
        }
    except Exception:
        raise credentials_exception

def get_current_user_email(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    user = get_current_user(credentials)
    return user["email"]
