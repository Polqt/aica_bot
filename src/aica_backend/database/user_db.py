import os
import json
import logging

from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from datetime import datetime

from .models.user_models import (
    User, UserProfile, UserSkill, UserSkillCreate,
    UserJobMatch, SkillsResponse
)

logger = logging.getLogger(__name__)

class DatabaseError(Exception):
    """Custom database error"""
    pass

class UserDatabase:
    def __init__(self, client: Client = None):
        if client is None:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
            
            if not url or not key:
                raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")
                
            self.client = create_client(url, key)
        else:
            self.client = client

    def _handle_db_response(self, response, operation: str):
        if hasattr(response, 'error') and response.error:
            error_msg = f"Database {operation} failed: {response.error}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
        return response

    def create_user(self, email: str, password_hash: str, user_id: str = None) -> User:
        try:
            data = {
                "email": email.lower().strip(),
                "password_hash": password_hash
            }
            if user_id:
                data["id"] = user_id
                
            response = self.client.table("users").insert(data).execute()
            self._handle_db_response(response, "user creation")
            
            if not response.data:
                raise DatabaseError("No user data returned after creation")
                
            return User(**response.data[0])
        except Exception as e:
            logger.error(f"Failed to create user: {str(e)}")
            raise DatabaseError(f"Failed to create user: {str(e)}")

    def get_user_by_email(self, email: str) -> Optional[User]:
        try:
            response = self.client.table("users").select("*").eq("email", email.lower().strip()).execute()
            self._handle_db_response(response, "get user by email")
            
            if response.data:
                return User(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Failed to get user by email: {str(e)}")
            return None

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        try:
            response = self.client.table("users").select("*").eq("id", user_id).execute()
            self._handle_db_response(response, "get user by id")
            
            if response.data:
                return User(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Failed to get user by id: {str(e)}")
            return None

    def user_exists(self, email: str) -> bool:
        """Check if user exists"""
        try:
            response = self.client.table("users").select("id").eq("email", email.lower().strip()).execute()
            self._handle_db_response(response, "check user exists")
            return len(response.data) > 0
        except Exception:
            return False

    def create_user_profile(self, user_id: str) -> UserProfile:
        try:
            data = {
                "user_id": user_id,
                "resume_uploaded": False,
                "resume_processed": False,
                "profile_completed": False,
            }
            
            response = self.client.table("user_profiles").insert(data).execute()
            self._handle_db_response(response, "create user profile")
            
            if not response.data:
                raise DatabaseError("No profile data returned after creation")
                
            return UserProfile(**response.data[0])
        except Exception as e:
            logger.error(f"Failed to create user profile: {str(e)}")
            raise DatabaseError(f"Failed to create user profile: {str(e)}")
    
    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        try:
            response = self.client.table("user_profiles").select("*").eq("user_id", user_id).execute()
            self._handle_db_response(response, "get user profile")
            
            if response.data:
                return UserProfile(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Failed to get user profile: {str(e)}")
            return None

    def update_user_profile(self, user_id: str, update_data: dict) -> Optional[UserProfile]:
        try:
            update_data["updated_at"] = datetime.now().isoformat()
            response = self.client.table("user_profiles").update(update_data).eq("user_id", user_id).execute()
            self._handle_db_response(response, "update user profile")
            
            if response.data:
                return UserProfile(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Failed to update user profile: {str(e)}")
            raise DatabaseError(f"Failed to update user profile: {str(e)}")

    def mark_resume_uploaded(self, user_id: str, file_path: str) -> bool:
        try:
            update_data = {
                "resume_uploaded": True,
                "resume_file_path": file_path,
                "updated_at": datetime.now().isoformat()
            }
            response = self.client.table("user_profiles").update(update_data).eq("user_id", user_id).execute()
            self._handle_db_response(response, "mark resume uploaded")
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Failed to mark resume uploaded: {str(e)}")
            return False
    
    def mark_resume_processed(self, user_id: str) -> bool:
        try:
            update_data = {
                "resume_processed": True,
                "updated_at": datetime.now().isoformat()
            }
            response = self.client.table("user_profiles").update(update_data).eq("user_id", user_id).execute()
            self._handle_db_response(response, "mark resume processed")
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Failed to mark resume processed: {str(e)}")
            return False

    def add_user_skill(self, user_id: str, skill: UserSkillCreate) -> UserSkill:
        try:
            data = {
                "user_id": user_id,
                "skill_name": skill.skill_name,
                "skill_category": skill.skill_category,
                "confidence_score": skill.confidence_score,
                "source": skill.source
            }
            response = self.client.table("user_skills").insert(data).execute()
            self._handle_db_response(response, "add user skill")
            
            if not response.data:
                raise DatabaseError("No skill data returned after creation")
                
            return UserSkill(**response.data[0])
        except Exception as e:
            raise DatabaseError(f"Failed to add user skill: {str(e)}")

    def add_user_skills_batch(self, user_id: str, skills: List[UserSkillCreate]) -> List[UserSkill]:
        if not skills:
            return []
            
        try:
            data = []
            for skill in skills:
                data.append({
                    "user_id": user_id,
                    "skill_name": skill.skill_name,
                    "skill_category": skill.skill_category,
                    "confidence_score": skill.confidence_score,
                    "source": skill.source
                })
            
            response = self.client.table("user_skills").insert(data).execute()
            self._handle_db_response(response, "add user skills batch")
            
            return [UserSkill(**item) for item in response.data] if response.data else []
        except Exception as e:
            raise DatabaseError(f"Failed to add user skills batch: {str(e)}")
    
    def get_user_skills(self, user_id: str) -> List[UserSkill]:
        try:
            response = self.client.table("user_skills").select("*").eq("user_id", user_id).execute()
            self._handle_db_response(response, "get user skills")
            
            return [UserSkill(**item) for item in response.data] if response.data else []
        except Exception as e:
            return []

    def get_user_skills_by_category(self, user_id: str, category: str) -> List[UserSkill]:
        try:
            response = (self.client.table("user_skills")
                       .select("*")
                       .eq("user_id", user_id)
                       .eq("skill_category", category)
                       .execute())
            self._handle_db_response(response, "get user skills by category")
            
            return [UserSkill(**skill_data) for skill_data in response.data] if response.data else []
        except Exception as e:
            logger.error(f"Failed to get user skills by category: {str(e)}")
            return []

    def clear_user_skills(self, user_id: str) -> bool:
        try:
            response = self.client.table("user_skills").delete().eq("user_id", user_id).execute()
            # Note: Supabase delete doesn't return error for non-existent records
            return True
        except Exception as e:
            return False
    
    def delete_user_skill(self, skill_id: str) -> bool:
        try:
            response = self.client.table("user_skills").delete().eq("id", skill_id).execute()
            self._handle_db_response(response, "delete user skill")
            
            return len(response.data) > 0
        except Exception as e:
            return False

    def update_user_skill(self, skill_id: str, update_data: dict) -> Optional[UserSkill]:
        try:
            response = self.client.table("user_skills").update(update_data).eq("id", skill_id).execute()
            self._handle_db_response(response, "update user skill")
            
            if response.data:
                return UserSkill(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Failed to update user skill: {str(e)}")
            return None
    
    def save_job_match(self, user_id: str, job_id: str, match_score: float, matched_skills: List[str]) -> UserJobMatch:
        try:
            data = {
                "user_id": user_id,
                "job_id": job_id,
                "match_score": match_score,
                "matched_skills": json.dumps(matched_skills)
            }
            response = self.client.table("user_job_matches").insert(data).execute()
            self._handle_db_response(response, "save job match")
            
            if not response.data:
                raise DatabaseError("No job match data returned after creation")
                
            match_data = response.data[0]
            match_data["matched_skills"] = json.loads(match_data["matched_skills"])
            return UserJobMatch(**match_data)
        except Exception as e:
            raise DatabaseError(f"Failed to save job match: {str(e)}")

    def get_user_job_matches(self, user_id: str, limit: int = 50) -> List[UserJobMatch]:
        try:
            response = (self.client.table("user_job_matches")
                       .select("*")
                       .eq("user_id", user_id)
                       .order("match_score", desc=True)
                       .limit(limit)
                       .execute())
            self._handle_db_response(response, "get user job matches")
            
            matches = []
            for match_data in response.data if response.data else []:
                try:
                    match_data["matched_skills"] = json.loads(match_data.get("matched_skills", "[]"))
                    matches.append(UserJobMatch(**match_data))
                except (json.JSONDecodeError, TypeError):
                    match_data["matched_skills"] = []
                    matches.append(UserJobMatch(**match_data))
            
            return matches
        except Exception as e:
            return []

    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        try:
            profile = self.get_user_profile(user_id)
            skills = self.get_user_skills(user_id)
            matches = self.get_user_job_matches(user_id, limit=1)
            
            technical_skills = len([s for s in skills if s.skill_category == "technical"])
            soft_skills = len([s for s in skills if s.skill_category == "soft"])
            
            return {
                "profile_completed": profile.profile_completed if profile else False,
                "resume_uploaded": profile.resume_uploaded if profile else False,
                "resume_processed": profile.resume_processed if profile else False,
                "total_skills": len(skills),
                "technical_skills_count": technical_skills,
                "soft_skills_count": soft_skills,
                "has_job_matches": len(matches) > 0,
                "best_match_score": matches[0].match_score if matches else 0.0
            }
        except Exception as e:
            logger.error(f"Failed to get user stats: {str(e)}")
            return {
                "profile_completed": False,
                "resume_uploaded": False,
                "resume_processed": False,
                "total_skills": 0,
                "technical_skills_count": 0,
                "soft_skills_count": 0,
                "has_job_matches": False,
                "best_match_score": 0.0
            }

    def get_skills_summary(self, user_id: str) -> SkillsResponse:
        try:
            skills = self.get_user_skills(user_id)
            
            technical = [s.skill_name for s in skills if s.skill_category == "technical"]
            soft = [s.skill_name for s in skills if s.skill_category == "soft"]
            industries = [s.skill_name for s in skills if s.skill_category == "industry"]
            job_titles = [s.skill_name for s in skills if s.skill_category == "job_title"]
            
            return SkillsResponse(
                technical_skills=technical,
                soft_skills=soft,
                job_titles=job_titles,
                industries=industries
            )
        except Exception as e:
            return SkillsResponse(
                technical_skills=[],
                soft_skills=[],
                job_titles=[],
                industries=[]
            )
            