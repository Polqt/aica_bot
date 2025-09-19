
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from ..database.user_db import UserDatabase
from ..database.models.user_models import (
    UserEducation, UserEducationCreate,
    UserExperience, UserExperienceCreate,
    UserProfile, UserSkill, UserSkillCreate
)

logger = logging.getLogger(__name__)


class ResumeBuilder:
    def __init__(self):
        self.user_db = UserDatabase()

    def add_education(self, user_id: str, education_data: UserEducationCreate) -> UserEducation:
        try:
            user = self.user_db.get_user_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            # Convert to dict and add user_id
            data = education_data.model_dump()
            data['user_id'] = user_id

            # Insert into database
            response = self.user_db.client.table("user_education").insert(data).execute()
            if not response.data:
                raise ValueError("Failed to create education entry")

            return UserEducation(**response.data[0])

        except Exception as e:
            raise ValueError(f"Failed to add education: {str(e)}")

    def get_user_education(self, user_id: str) -> List[UserEducation]:
        try:
            response = (self.user_db.client.table("user_education")
                       .select("*")
                       .eq("user_id", user_id)
                       .order("start_date", desc=True)
                       .execute())

            return [UserEducation(**item) for item in response.data] if response.data else []

        except Exception as e:
            return []

    def update_education(self, education_id: str, user_id: str, education_data: UserEducationCreate) -> Optional[UserEducation]:
        try:
            # Verify ownership
            existing = self.user_db.client.table("user_education").select("*").eq("id", education_id).eq("user_id", user_id).execute()
            if not existing.data:
                return None

            # Update data
            update_data = education_data.model_dump()
            update_data['updated_at'] = datetime.now().isoformat()

            response = (self.user_db.client.table("user_education")
                       .update(update_data)
                       .eq("id", education_id)
                       .eq("user_id", user_id)
                       .execute())

            if response.data:
                return UserEducation(**response.data[0])
            return None

        except Exception as e:
            return None

    def delete_education(self, education_id: str, user_id: str) -> bool:
        try:
            response = (self.user_db.client.table("user_education")
                       .delete()
                       .eq("id", education_id)
                       .eq("user_id", user_id)
                       .execute())

            return len(response.data) > 0

        except Exception as e:
            return False
        
    def add_experience(self, user_id: str, experience_data: UserExperienceCreate) -> UserExperience:
        try:
            # Validate user exists
            user = self.user_db.get_user_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            # Convert to dict and add user_id
            data = experience_data.model_dump()
            data['user_id'] = user_id

            # Insert into database
            response = self.user_db.client.table("user_experience").insert(data).execute()
            if not response.data:
                raise ValueError("Failed to create experience entry")

            return UserExperience(**response.data[0])

        except Exception as e:
            raise ValueError(f"Failed to add experience: {str(e)}")

    def get_user_experience(self, user_id: str) -> List[UserExperience]:
        try:
            response = (self.user_db.client.table("user_experience")
                       .select("*")
                       .eq("user_id", user_id)
                       .order("start_date", desc=True)
                       .execute())

            return [UserExperience(**item) for item in response.data] if response.data else []

        except Exception as e:
            return []

    def update_experience(self, experience_id: str, user_id: str, experience_data: UserExperienceCreate) -> Optional[UserExperience]:
        try:
            # Verify ownership
            existing = self.user_db.client.table("user_experience").select("*").eq("id", experience_id).eq("user_id", user_id).execute()
            if not existing.data:
                return None

            # Update data
            update_data = experience_data.model_dump()
            update_data['updated_at'] = datetime.now().isoformat()

            response = (self.user_db.client.table("user_experience")
                       .update(update_data)
                       .eq("id", experience_id)
                       .eq("user_id", user_id)
                       .execute())

            if response.data:
                return UserExperience(**response.data[0])
            return None

        except Exception as e:
            return None

    def delete_experience(self, experience_id: str, user_id: str) -> bool:
        try:
            response = (self.user_db.client.table("user_experience")
                       .delete()
                       .eq("id", experience_id)
                       .eq("user_id", user_id)
                       .execute())

            return len(response.data) > 0

        except Exception as e:
            return False
        
    def add_skill(self, user_id: str, skill_data: UserSkillCreate) -> UserSkill:
        try:
            # Validate user exists
            user = self.user_db.get_user_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            # Convert to dict and add user_id
            data = skill_data.model_dump()
            data['user_id'] = user_id

            # Insert into database
            response = self.user_db.client.table("user_skills").insert(data).execute()
            if not response.data:
                raise ValueError("Failed to create skill entry")

            return UserSkill(**response.data[0])

        except Exception as e:
            raise ValueError(f"Failed to add skill: {str(e)}")

    def get_user_skills(self, user_id: str) -> List[UserSkill]:
        return self.user_db.get_user_skills(user_id)

    def update_skill(self, skill_id: str, user_id: str, skill_data: UserSkillCreate) -> Optional[UserSkill]:
        try:
            # Verify ownership
            existing = self.user_db.client.table("user_skills").select("*").eq("id", skill_id).eq("user_id", user_id).execute()
            if not existing.data:
                return None

            # Update data
            update_data = skill_data.model_dump()

            response = (self.user_db.client.table("user_skills")
                       .update(update_data)
                       .eq("id", skill_id)
                       .eq("user_id", user_id)
                       .execute())

            if response.data:
                return UserSkill(**response.data[0])
            return None

        except Exception as e:
            return None

    def delete_skill(self, skill_id: str, user_id: str) -> bool:
        try:
            response = (self.user_db.client.table("user_skills")
                       .delete()
                       .eq("id", skill_id)
                       .eq("user_id", user_id)
                       .execute())

            return len(response.data) > 0

        except Exception as e:
            return False

    def update_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Optional[UserProfile]:
        try:
            # Validate user exists
            user = self.user_db.get_user_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            # Update profile
            return self.user_db.update_user_profile(user_id, profile_data)

        except Exception as e:
            return None

    def get_profile(self, user_id: str) -> Optional[UserProfile]:
        return self.user_db.get_user_profile(user_id)

    def get_resume_summary(self, user_id: str) -> Dict[str, Any]:
        try:
            profile = self.get_profile(user_id)
            education = self.get_user_education(user_id)
            experience = self.get_user_experience(user_id)
            skills = self.get_user_skills(user_id)

            # Calculate experience years from work history
            total_experience_years = self._calculate_experience_years(experience)

            return {
                "profile": profile.model_dump() if profile else None,
                "education": [edu.model_dump() for edu in education],
                "experience": [exp.model_dump() for exp in experience],
                "skills": [skill.model_dump() for skill in skills],
                "summary": {
                    "total_experience_years": total_experience_years,
                    "education_count": len(education),
                    "experience_count": len(experience),
                    "skills_count": len(skills),
                    "profile_completed": self._is_profile_complete(profile, education, experience, skills)
                }
            }

        except Exception as e:
            return {
                "profile": None,
                "education": [],
                "experience": [],
                "skills": [],
                "summary": {
                    "total_experience_years": 0,
                    "education_count": 0,
                    "experience_count": 0,
                    "skills_count": 0,
                    "profile_completed": False
                }
            }

    def _calculate_experience_years(self, experiences: List[UserExperience]) -> int:
        total_months = 0

        for exp in experiences:
            if exp.start_date:
                start_date = datetime.fromisoformat(exp.start_date.replace('Z', '+00:00'))
                end_date = datetime.now()

                if exp.end_date and not exp.is_current:
                    end_date = datetime.fromisoformat(exp.end_date.replace('Z', '+00:00'))

                # Calculate months between dates
                months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
                total_months += max(0, months)

        return total_months // 12  # Convert to years

    def _is_profile_complete(self, profile: Optional[UserProfile],
                           education: List[UserEducation],
                           experience: List[UserExperience],
                           skills: List[UserSkill]) -> bool:
        if not profile:
            return False

        # Basic requirements
        has_basic_info = bool(profile.full_name and profile.location)
        has_education = len(education) > 0
        has_experience = len(experience) > 0
        has_skills = len(skills) > 0

        return has_basic_info and has_education and has_experience and has_skills

    def clear_user_data(self, user_id: str) -> bool:
        try:
            self.user_db.client.table("user_education").delete().eq("user_id", user_id).execute()
            self.user_db.client.table("user_experience").delete().eq("user_id", user_id).execute()
            self.user_db.client.table("user_skills").delete().eq("user_id", user_id).neq("source", "resume").execute()

            self.user_db.update_user_profile(user_id, {
                "profile_completed": False,
                "resume_uploaded": False,
                "resume_processed": False
            })

            return True

        except Exception as e:
            return False
        