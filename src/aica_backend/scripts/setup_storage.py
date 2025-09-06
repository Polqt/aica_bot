import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent.parent / ".env")

src_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(src_path))

from aica_backend.api.utils.auth import get_supabase_admin_client

def setup_storage_bucket():
    try:
        supabase = get_supabase_admin_client()
        
        bucket_name = "resumes"
        
        try:
            buckets = supabase.storage.list_buckets()
            existing_bucket_names = [bucket.name for bucket in buckets]
            
            if bucket_name in existing_bucket_names:
                return True
            else:
                print(f"Bucket '{bucket_name}' not found. Creating...")
                
        except Exception as e:
            print(f"Error listing buckets: {e}")

        try:
            result = supabase.storage.create_bucket(bucket_name)
            return True
            
        except Exception as e:
            print(f"Error creating bucket: {e}")
            
            try:
                buckets = supabase.storage.list_buckets()
                existing_bucket_names = [bucket.name for bucket in buckets]
                if bucket_name in existing_bucket_names:
                    return True
            except:
                pass
                
            return False
            
    except Exception as e:
        return False

if __name__ == "__main__":
    success = setup_storage_bucket()
    if not success:
        sys.exit(1)
