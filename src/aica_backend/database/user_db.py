import os
import json

from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from datetime import datetime

from .models.user_models import (
    User, UserProfile, UserSkill, UserSkillCreate,
    UserJobMatch, SkillsResponse
)

class UserDatabase:
    def __init__(self, client: Client = None):
        if client is None:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
            self.client = create_client(url, key)
        else:
            self.client = client

    def create_user(self, email: str, password_hash: str, user_id: str = None) -> User:
        data = {
            "email": email,
            "password_hash": password_hash
        }
        if user_id:
            data["id"] = user_id
        response = self.client.table("users").insert(data).execute()
        return User(**response.data[0])

    def get_user_by_email(self, email: str) -> Optional[User]:
        response = self.client.table("users").select("*").eq("email", email).execute()
        if response.data:
            return User(**response.data[0])
        return None

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        response = self.client.table("users").select("*").eq("id", user_id).execute()
        if response.data:
            return User(**response.data[0])
        return None

    def user_exists(self, email: str) -> bool:
        response = self.client.table("users").select("id").eq("email", email).execute()
        return len(response.data) > 0

    def update_user(self, user_id: str, update_data: dict) -> Optional[User]:
        response = self.client.table("users").update(update_data).eq("id", user_id).execute()
        if response.data:
            return User(**response.data[0])
        return None

    def delete_user(self, user_id: str) -> bool:
        response = self.client.table("users").delete().eq("id", user_id).execute()
        return len(response.data) > 0

    def create_user_profile(self, user_id: str) -> UserProfile:
        data = {
            "user_id": user_id,
            "resume_uploaded": False,
            "resume_processed": False,
            "profile_completed": False,
        }
        
        response = self.client.table("user_profiles").insert(data).execute()
        return UserProfile(**response.data[0])
    
    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        response = self.client.table("user_profiles").select("*").eq("user_id", user_id).execute()
        if response.data:
            return UserProfile(**response.data[0])
        return None

    def update_user_profile(self, user_id: str, update_data: dict) -> Optional[UserProfile]:
        update_data["updated_at"] = datetime.now().isoformat()
        response = self.client.table("user_profiles").update(update_data).eq("user_id", user_id).execute()
        if response.data:
            return UserProfile(**response.data[0])
        return None

    def mark_resume_uploaded(self, user_id: str, file_path: str) -> bool:
        update_data = {
            "resume_uploaded": True,
            "resume_file_path": file_path,
            "updated_at": datetime.now().isoformat()
        }
        response = self.client.table("user_profiles").update(update_data).eq("user_id", user_id).execute()
        return len(response.data) > 0
    
    def mark_resume_processed(self, user_id: str) -> bool:
        update_data = {
            "resume_processed": True,
            "updated_at": datetime.now().isoformat()
        }
        response = self.client.table("user_profiles").update(update_data).eq("user_id", user_id).execute()
        return len(response.data) > 0

    def mark_profile_completed(self, user_id: str) -> bool:
        update_data = {
            "profile_completed": True,
            "updated_at": datetime.now().isoformat()
        }
        response = self.client.table("user_profiles").update(update_data).eq("user_id", user_id).execute()
        return len(response.data) > 0
    
    def add_user_skill(self, user_id: str, skill: UserSkillCreate) -> UserSkill:
        data = {
            "user_id": user_id,
            "skill_name": skill.skill_name,
            "skill_category": skill.skill_category,
            "confidence_score": skill.confidence_score,
            "source": skill.source
        }
        response = self.client.table("user_skills").insert(data).execute()
        return UserSkill(**response.data[0])

    def add_user_skills_batch(self, user_id: str, skills: List[UserSkillCreate]) -> List[UserSkill]:
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
        return [UserSkill(**item) for item in response.data]
    
    def get_user_skills(self, user_id: str) -> List[UserSkill]:
        response = self.client.table("user_skills").select("*").eq("user_id", user_id).execute()
        return [UserSkill(**item) for item in response.data]

    def get_user_skills_by_category(self, user_id: str, category: str) -> List[UserSkill]:
        response = self.client.table("user_skills").select("*").eq("user_id", user_id).eq("skill_category", category).execute()
        return [UserSkill(**skill_data) for skill_data in response.data]

    def delete_user_skill(self, skill_id: str) -> bool:
        response = self.client.table("user_skills").delete().eq("id", skill_id).execute()
        return len(response.data) > 0

    def clear_user_skills(self, user_id: str) -> bool:
        response = self.client.table("user_skills").delete().eq("user_id", user_id).execute()
        return True
    
    def update_user_skill(self, skill_id: str, update_data: dict) -> Optional[UserSkill]:
        response = self.client.table("user_skills").update(update_data).eq("id", skill_id).execute()
        if response.data:
            return UserSkill(**response.data[0])
        return None
    
    def save_job_match(self, user_id: str, job_id: str, match_score: float, matched_skills: List[str]) -> UserJobMatch:
        data = {
            "user_id": user_id,
            "job_id": job_id,
            "match_score": match_score,
            "matched_skills": json.dumps(matched_skills)
        }
        response = self.client.table("user_job_matches").insert(data).execute()
        match_data = response.data[0]
        match_data["matched_skills"] = json.loads(match_data["matched_skills"])
        return UserJobMatch(**match_data)

    def get_user_job_matches(self, user_id: str, limit: int = 50) -> List[UserJobMatch]:
        response = self.client.table("user_job_matches").select("*").eq("user_id", user_id).order("match_score", desc=True).limit(limit).execute()
        matches = []
        for match_data in response.data:
            match_data["matched_skills"] = json.loads(match_data["matched_skills"]) if match_data["matched_skills"] else []
            matches.append(UserJobMatch(**match_data))
        return matches

    def get_user_match_history(self, user_id: str) -> List[Dict[str, Any]]:
        query = """
        SELECT 
            ujm.*,
            j.title,
            j.company,
            j.location,
            j.url
        FROM user_job_matches ujm
        JOIN jobs j ON ujm.job_id = j.id
        WHERE ujm.user_id = %s
        ORDER BY ujm.match_score DESC
        """
        response = self.client.rpc("execute_sql", {"query": query, "params": [user_id]}).execute()
        return response.data if response.data else []

    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
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

    def get_skills_summary(self, user_id: str) -> SkillsResponse:
        skills = self.get_user_skills(user_id)
        
        technical = [s.skill_name for s in skills if s.skill_category == "technical"]
        soft = [s.skill_name for s in skills if s.skill_category == "soft"]
        
        return SkillsResponse(
            technical_skills=technical,
            soft_skills=soft,
            job_titles=[],
            industries=[]
        )