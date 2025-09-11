import asyncio
import os
import sys
from pathlib import Path

# Load environment variables
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"Loaded environment variables from {env_path}")
    else:
        print("No .env file found. Make sure to set environment variables manually.")
        print("Required variables: SUPABASE_URL, SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY)")
except ImportError:
    print("python-dotenv not installed. Install with: pip install python-dotenv")
    print("Or set environment variables manually.")

# Add the src directory to the Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from aica_backend.services.job_matching import JobMatchingService
from aica_backend.database.user_db import UserDatabase  
from aica_backend.database.job_db import JobDatabase

async def test_fast_job_matching():
    """Test fast job matching functionality (no AI calls)"""
    
    # Check environment variables first
    required_vars = ["SUPABASE_URL", "SUPABASE_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var) and not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
            missing_vars.append(var)
    
    # Get user input
    user_id = input("Enter user ID to test job matching for: ").strip()
    if not user_id:
        return
    
    # Initialize services
    job_matching_service = JobMatchingService()
    user_db = UserDatabase()
    job_db = JobDatabase()
    
    # Get user skills first
    user_skills = user_db.get_user_skills(user_id)
    if not user_skills:
        print(f"No skills found for user {user_id}")
        return
    
    print(f"User has {len(user_skills)} skills:")
    for i, skill in enumerate(user_skills[:10]):  # Show first 10
        print(f"  - {skill.skill_name} ({skill.skill_category})")
    if len(user_skills) > 10:
        print(f"  ... and {len(user_skills) - 10} more")
    
    print("="*50)
    
    # Find job matches using the fast screening only
    try:
        # Get jobs
        jobs = job_db.get_jobs_for_matching(limit=100)
        if not jobs:
            print("No jobs available in the database for matching.")
            return
        
        # Use fast screening
        potential_matches = await job_matching_service._fast_similarity_screening(user_skills, jobs, 20)
        
        if not potential_matches:
            print("No matches found.")
        else:
            print(f"Found {len(potential_matches)} potential matches!")
            
            # Convert to JobMatchResult using simple matching
            matches = []
            for job in potential_matches[:10]:  # Top 10
                simple_match = await job_matching_service._simple_calculate_job_match(user_skills, job)
                matches.append(simple_match)
            
            saved_matches = await job_matching_service.save_job_matches(user_id, matches)
            
            # Show top matches
            for i, match in enumerate(matches[:5], 1):
                if match.matched_skills:
                    print(f"   Matched Skills: {', '.join(match.matched_skills[:5])}...")
                if match.missing_critical_skills:
                    print(f"   Missing Skills: {', '.join(match.missing_critical_skills[:3])}...")
                print(f"   Skill Coverage: {match.skill_coverage:.2f}")
                if hasattr(match.job, 'location') and match.job.location:
                    print(f"   Location: {match.job.location}")
                if match.ai_reasoning:
                    print(f"   Analysis: {match.ai_reasoning[:80]}...")
        
        print("\n" + "="*50)
        print("Fast job matching test completed!")
        
    except Exception as e:
        print(f"Error during job matching: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_fast_job_matching())
