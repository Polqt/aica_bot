import os
import json
import logging

from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from datetime import datetime

from .models.user_models import (
    User, UserProfile, UserSkill, UserSkillCreate,
    UserJobMatch, SkillsResponse, UserSavedJob
)

logger = logging.getLogger(__name__)

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
            raise ValueError(error_msg)
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
                raise ValueError("No user data returned after creation")
                
            return User(**response.data[0])
        except Exception as e:
            raise ValueError(f"Failed to create user: {str(e)}")

    def get_user_by_email(self, email: str) -> Optional[User]:
        try:
            response = self.client.table("users").select("*").eq("email", email.lower().strip()).execute()
            self._handle_db_response(response, "get user by email")
            
            if response.data:
                return User(**response.data[0])
            return None
        except Exception as e:
            return None

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        try:
            response = self.client.table("users").select("*").eq("id", user_id).execute()
            self._handle_db_response(response, "get user by id")
            
            if response.data:
                return User(**response.data[0])
            return None
        except Exception as e:
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
                "processing_step": None,
                "processing_error": None,
                "matches_generated": False,
            }
            
            response = self.client.table("user_profiles").insert(data).execute()
            self._handle_db_response(response, "create user profile")
            
            if not response.data:
                raise ValueError("No profile data returned after creation")
                
            return UserProfile(**response.data[0])
        except Exception as e:
            raise ValueError(f"Failed to create user profile: {str(e)}")
    
    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        try:
            response = self.client.table("user_profiles").select("*").eq("user_id", user_id).execute()
            self._handle_db_response(response, "get user profile")
            
            if response.data:
                return UserProfile(**response.data[0])
            return None
        except Exception as e:
            return None

    def update_user_profile(self, user_id: str, update_data: dict) -> Optional[UserProfile]:
        try:
            # Check if profile exists
            existing_profile = self.get_user_profile(user_id)

            if not existing_profile:
                # Create profile if it doesn't exist
                create_data = {
                    "user_id": user_id,
                    "resume_uploaded": False,
                    "resume_processed": False,
                    "profile_completed": False,
                    "processing_step": None,
                    "processing_error": None,
                    "matches_generated": False,
                }
                # Merge with update data
                create_data.update(update_data)
                create_data["created_at"] = datetime.now().isoformat()
                create_data["updated_at"] = datetime.now().isoformat()

                response = self.client.table("user_profiles").insert(create_data).execute()
                self._handle_db_response(response, "create user profile")

                if response.data:
                    return UserProfile(**response.data[0])
                return None
            else:
                # Update existing profile
                update_data["updated_at"] = datetime.now().isoformat()
                response = self.client.table("user_profiles").update(update_data).eq("user_id", user_id).execute()
                self._handle_db_response(response, "update user profile")

                if response.data:
                    return UserProfile(**response.data[0])
                return None
        except Exception as e:
            raise ValueError(f"Failed to update user profile: {str(e)}")

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
                raise ValueError("No skill data returned after creation")
                
            return UserSkill(**response.data[0])
        except Exception as e:
            raise ValueError(f"Failed to add user skill: {str(e)}")

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
            raise ValueError(f"Failed to add user skills batch: {str(e)}")
    
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
            return []

    def clear_user_skills(self, user_id: str) -> bool:
        """Delete all skills for a user (used during resume re-upload with replace mode)"""
        try:
            response = self.client.table("user_skills").delete().eq("user_id", user_id).execute()
            logger.info(f"Cleared all skills for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to clear skills for user {user_id}: {e}")
            return False
    
    def clear_user_education(self, user_id: str) -> bool:
        """Delete all education entries for a user (used during resume re-upload with replace mode)"""
        try:
            response = self.client.table("user_education").delete().eq("user_id", user_id).execute()
            logger.info(f"Cleared all education for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to clear education for user {user_id}: {e}")
            return False
    
    def clear_user_experience(self, user_id: str) -> bool:
        """Delete all experience entries for a user (used during resume re-upload with replace mode)"""
        try:
            response = self.client.table("user_experience").delete().eq("user_id", user_id).execute()
            logger.info(f"Cleared all experience for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to clear experience for user {user_id}: {e}")
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
            return None
    
    def save_job_match(self, user_id: str, job_id: str, match_score: float, matched_skills: List[str],
                       missing_critical_skills: List[str] = None, skill_coverage: float = 0.0,
                       confidence: str = "medium", ai_reasoning: str = "") -> UserJobMatch:
        try:
            data = {
                "user_id": user_id,
                "job_id": job_id,
                "match_score": match_score,
                "matched_skills": json.dumps(matched_skills),
                "missing_critical_skills": json.dumps(missing_critical_skills or []),
                "skill_coverage": skill_coverage,
                "confidence": confidence,
                "ai_reasoning": ai_reasoning
            }
            response = self.client.table("user_job_matches").insert(data).execute()
            self._handle_db_response(response, "save job match")

            if not response.data:
                raise ValueError("No job match data returned after creation")

            match_data = response.data[0]
            # Parse JSON fields
            match_data["matched_skills"] = json.loads(match_data.get("matched_skills", "[]"))
            match_data["missing_critical_skills"] = json.loads(match_data.get("missing_critical_skills", "[]"))
            return UserJobMatch(**match_data)
        except Exception as e:
            raise ValueError(f"Failed to save job match: {str(e)}")

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
                    # Parse JSON fields
                    match_data["matched_skills"] = json.loads(match_data.get("matched_skills", "[]"))
                    match_data["missing_critical_skills"] = json.loads(match_data.get("missing_critical_skills", "[]"))
                    matches.append(UserJobMatch(**match_data))
                except (json.JSONDecodeError, TypeError):
                    # Fallback for malformed JSON
                    match_data["matched_skills"] = []
                    match_data["missing_critical_skills"] = []
                    matches.append(UserJobMatch(**match_data))

            logger.info(f"Successfully fetched {len(matches)} job matches for user {user_id}")
            return matches
        except Exception as e:
            logger.error(f"Error fetching job matches for user {user_id}: {str(e)}")
            return []
    
    def clear_job_matches(self, user_id: str) -> bool:
        try:
            response = self.client.table("user_job_matches").delete().eq("user_id", user_id).execute()
            logger.info(f"✅ Cleared all job matches for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to clear job matches for user {user_id}: {e}")
            return False

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
            
    def save_user_job(self, user_id: str, job_id: str) -> 'UserSavedJob':
        try:
            data = {
                "user_id": user_id,
                "job_id": job_id
            }
            response = self.client.table("user_saved_jobs").insert(data).execute()
            self._handle_db_response(response, "save user job")
            if not response.data:
                raise ValueError("No saved job data returned after creation")
            saved_job = UserSavedJob(**response.data[0])

            # Ensure match data exists for this job
            self.ensure_job_match_exists(user_id, job_id)

            return saved_job
        except Exception as e:
            raise ValueError(f"Failed to save user job: {str(e)}")

    def ensure_job_match_exists(self, user_id: str, job_id: str) -> bool:
        """Ensure a job has match data, create basic match if none exists"""
        try:
            # Check if match data exists
            response = (self.client.table("user_job_matches")
                        .select("id")
                        .eq("user_id", user_id)
                        .eq("job_id", job_id)
                        .execute())

            if response.data and len(response.data) > 0:
                return True  # Match data already exists

            # Create basic match data if none exists
            match_data = {
                "user_id": user_id,
                "job_id": job_id,
                "match_score": 0.5,  # Default medium match
                "matched_skills": [],
                "missing_critical_skills": [],
                "skill_coverage": 0.0,
                "confidence": "medium",
                "ai_reasoning": "Job saved before detailed matching was performed"
            }

            response = self.client.table("user_job_matches").insert(match_data).execute()
            self._handle_db_response(response, "create basic job match")
            return True

        except Exception as e:
            logger.warning(f"Could not ensure job match exists for user {user_id}, job {job_id}: {str(e)}")
            return False

    def remove_user_saved_job(self, user_id: str, job_id: str) -> bool:
        try:
            response = self.client.table("user_saved_jobs").delete().eq("user_id", user_id).eq("job_id", job_id).execute()
            self._handle_db_response(response, "remove user saved job")
            return True
        except Exception as e:
            return False

    def get_user_saved_jobs(self, user_id: str, limit: int = 50) -> List['UserSavedJob']:
        try:
            response = (self.client.table("user_saved_jobs")
                        .select("*")
                        .eq("user_id", user_id)
                        .order("saved_at", desc=True)
                        .limit(limit)
                        .execute())
            self._handle_db_response(response, "get user saved jobs")
            return [UserSavedJob(**item) for item in response.data] if response.data else []
        except Exception as e:
            return []

    def get_user_saved_job_with_match_data(self, user_id: str, job_id: str) -> Optional[Dict[str, Any]]:
        """Get saved job with its match data"""
        try:
            # First get the saved job
            saved_response = (self.client.table("user_saved_jobs")
                            .select("*")
                            .eq("user_id", user_id)
                            .eq("job_id", job_id)
                            .execute())

            if not saved_response.data or len(saved_response.data) == 0:
                return None

            saved_data = saved_response.data[0]

            # Then get the match data separately
            match_response = (self.client.table("user_job_matches")
                            .select("*")
                            .eq("user_id", user_id)
                            .eq("job_id", job_id)
                            .execute())

            # Merge the data
            if match_response.data and len(match_response.data) > 0:
                match_data = match_response.data[0]

                # Parse JSON fields
                if isinstance(match_data.get("matched_skills"), str):
                    match_data["matched_skills"] = json.loads(match_data["matched_skills"])
                if isinstance(match_data.get("missing_critical_skills"), str):
                    match_data["missing_critical_skills"] = json.loads(match_data["missing_critical_skills"])

                # Merge match data into saved data
                saved_data.update(match_data)

            return saved_data
        except Exception as e:
            logger.warning(f"Could not get saved job with match data for user {user_id}, job {job_id}: {str(e)}")
            return None
        