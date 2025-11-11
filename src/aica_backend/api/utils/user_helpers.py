import logging
from database.user_db import UserDatabase

logger = logging.getLogger(__name__)


def ensure_user_exists(user_id: str, email: str, db: UserDatabase) -> bool:
    try:
        user = db.get_user_by_id(user_id)
        if user:
            return True
            
        try:
            db.create_user(email=email, password_hash="", user_id=user_id)
            return True
        except Exception as create_error:
            if "duplicate key" in str(create_error).lower() and "email" in str(create_error).lower():
                logger.info(f"User already exists with email {email}, attempting to fetch")
                user = db.get_user_by_email(email)
                return user is not None
            logger.error(f"Failed to create user {user_id}: {create_error}")
            return False
    except Exception as e:
        return False
