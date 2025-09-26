from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import UserDatabase
from api.utils.auth import get_current_user as auth_get_current_user
from database.models.user_models import User

security = HTTPBearer()

def get_database() -> UserDatabase:
    return UserDatabase()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current user from JWT token and return as User model"""
    try:
        user_data = auth_get_current_user(credentials)
        # Convert the dict to User model
        return User(
            id=user_data.get("id"),
            email=user_data.get("email", ""),
            password_hash="",  # Don't expose password hash
            created_at=None  # Could parse if needed
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
