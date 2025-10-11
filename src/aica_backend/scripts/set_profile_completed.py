import sys
import os
from pathlib import Path

script_dir = Path(__file__).resolve().parent
backend_dir = script_dir.parent
sys.path.insert(0, str(backend_dir))

from database.user_db import UserDatabase

def main():
    db = UserDatabase()

    try:
        response = db.client.table("users").select("id, email").execute()
        users = response.data if response.data else []

        for user in users:
            user_id = user["id"]
            email = user["email"]

            # Check if user has skills (indicates resume builder completion)
            skills = db.get_user_skills(user_id)
            profile = db.get_user_profile(user_id)

            has_skills = len(skills) > 0
            profile_completed = profile.profile_completed if profile else False

            if has_skills and not profile_completed:
                print(f"Updating user {email} (ID: {user_id}) - has {len(skills)} skills but profile_completed is {profile_completed}")
                db.update_user_profile(user_id, {"profile_completed": True})
                print("✓ Updated")
            elif has_skills and profile_completed:
                print(f"User {email} already has profile_completed = true")
            elif not has_skills:
                print(f"User {email} has no skills data")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()