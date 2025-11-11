import os
import logging
import httpx

from supabase import create_client, Client
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from functools import lru_cache
from typing import Dict, Optional

logger = logging.getLogger(__name__)

security = HTTPBearer()

class SupabaseConfig:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        self.service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.url or not self.key:
            raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")

@lru_cache()
def get_supabase_config() -> SupabaseConfig:
    return SupabaseConfig()

def get_supabase_client() -> Client:
    try:
        config = get_supabase_config()
        return create_client(config.url, config.key)
    except Exception as e:
        raise ValueError("Authentication service unavailable")

def get_supabase_admin_client() -> Client:
    try:
        config = get_supabase_config()
        if not config.service_role_key:
            return create_client(config.url, config.key)
        return create_client(config.url, config.service_role_key)
    except Exception as e:
        raise ValueError("Admin service unavailable")

def validate_token(token: str) -> Optional[Dict]:
    if not token:
        return None
        
    try:
        supabase = get_supabase_client()
        try:
            user_response = supabase.auth.get_user(token)
        except (httpx.TimeoutException, httpx.ConnectTimeout, httpx.ReadTimeout) as timeout_error:
            logger.warning(f"Token validation timeout: {str(timeout_error)}")
            return None
        
        if not user_response.user:
            logger.warning("Token validation failed: No user in response")
            return None
        
        if hasattr(user_response.user, 'email_confirmed_at') and not user_response.user.email_confirmed_at:
            return None
            
        return {
            "id": user_response.user.id,
            "email": user_response.user.email,
            "user_metadata": user_response.user.user_metadata or {}
        }
    except Exception as e:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = validate_token(credentials.credentials)
    if not user:
        try:
            supabase = get_supabase_client()
            user_response = supabase.auth.get_user(credentials.credentials)
            if user_response.user and hasattr(user_response.user, 'email_confirmed_at') and not user_response.user.email_confirmed_at:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Please confirm your email address before accessing this resource",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except:
            pass
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

def get_current_user_email(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    user = get_current_user(credentials)
    
    if not user.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User email not available"
        )
    
    return user["email"]

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    user = get_current_user(credentials)
    
    if not user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID not available"
        )
    
    return user["id"]
