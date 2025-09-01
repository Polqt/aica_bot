import os
from typing import Optional
from supabase import create_client, Client
from .models.user_models import User

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