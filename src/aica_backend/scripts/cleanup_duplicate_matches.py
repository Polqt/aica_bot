import sys
from pathlib import Path
from collections import defaultdict
import logging

# Add parent directory to path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env'
load_dotenv(env_path)

from database.user_db import UserDatabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def cleanup_duplicate_matches():
    """Remove duplicate job matches, keeping only the most recent one for each user+job combination"""
    try:
        db = UserDatabase()
        
        logger.info("🔍 Checking for duplicate job matches...")
        
        # Get all matches from database
        response = db.client.table("user_job_matches").select("*").execute()
        
        if not response.data:
            logger.info("✅ No matches found in database")
            return
        
        all_matches = response.data
        logger.info(f"📊 Found {len(all_matches)} total matches")
        
        # Group matches by (user_id, job_id)
        matches_by_key = defaultdict(list)
        for match in all_matches:
            key = (match['user_id'], match['job_id'])
            matches_by_key[key].append(match)
        
        # Find duplicates
        duplicates_to_delete = []
        unique_combinations = 0
        duplicate_combinations = 0
        
        for key, matches in matches_by_key.items():
            unique_combinations += 1
            if len(matches) > 1:
                duplicate_combinations += 1
                # Sort by created_at (or id as fallback), keep the most recent
                matches.sort(key=lambda m: m.get('created_at', m['id']), reverse=True)
                # Mark all but the first (most recent) for deletion
                for match in matches[1:]:
                    duplicates_to_delete.append(match['id'])
                    logger.info(f"   🗑️  Will delete duplicate: User {key[0][:8]}... Job {key[1][:8]}... (ID: {match['id']})")
        
        logger.info(f"\n📈 Statistics:")
        logger.info(f"   • Unique user+job combinations: {unique_combinations}")
        logger.info(f"   • Combinations with duplicates: {duplicate_combinations}")
        logger.info(f"   • Total duplicate records to delete: {len(duplicates_to_delete)}")
        
        if not duplicates_to_delete:
            logger.info("\n✅ No duplicates found! Database is clean.")
            return
        
        # Ask for confirmation
        print(f"\n⚠️  About to delete {len(duplicates_to_delete)} duplicate records.")
        confirm = input("Do you want to proceed? (yes/no): ").strip().lower()
        
        if confirm != 'yes':
            logger.info("❌ Cleanup cancelled by user")
            return
        
        # Delete duplicates
        logger.info(f"\n🧹 Deleting {len(duplicates_to_delete)} duplicate records...")
        deleted_count = 0
        
        for match_id in duplicates_to_delete:
            try:
                db.client.table("user_job_matches").delete().eq("id", match_id).execute()
                deleted_count += 1
                if deleted_count % 10 == 0:
                    logger.info(f"   Deleted {deleted_count}/{len(duplicates_to_delete)}...")
            except Exception as e:
                logger.error(f"   Failed to delete match {match_id}: {e}")
        
        logger.info(f"\n✅ Cleanup complete! Deleted {deleted_count} duplicate records.")
        logger.info(f"📊 Database now has {len(all_matches) - deleted_count} unique job matches")
        
    except Exception as e:
        logger.error(f"❌ Error during cleanup: {e}")
        raise


if __name__ == "__main__":
    cleanup_duplicate_matches()
