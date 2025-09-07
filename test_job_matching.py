import asyncio
import os
import sys
from pathlib import Path

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

async def test_job_matching():
    """Test job matching functionality"""
    
    # Check environment variables first
    required_vars = ["SUPABASE_URL", "SUPABASE_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var) and not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
            missing_vars.append(var)
    
    if missing_vars and not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\nPlease set these environment variables or create a .env file with:")
        print("SUPABASE_URL=your_supabase_project_url")
        print("SUPABASE_KEY=your_supabase_anon_key")
        print("SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key")
        print("\nYou can copy .env.example to .env and fill in your values.")
        return
    
    # Get user input
    user_id = input("Enter user ID to test job matching for: ").strip()
    if not user_id:
        print("No user ID provided. Exiting.")
        return
    
    print(f"Starting job matching test for user: {user_id}")
    
    # Initialize services
    print("Initializing AI-powered job matching service...")
    job_matching_service = JobMatchingService()
    user_db = UserDatabase()
    job_db = JobDatabase()
    
    # Test job matching
    print(f"Testing AI job matching for user: {user_id}")
    print("Using RAG, LLM analysis, and vector embeddings for intelligent matching...")
    
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
    
    # Find job matches
    print("🤖 AI is analyzing job matches using RAG and LLM reasoning...")
    print("⏱️  This will do fast screening first, then AI analysis of top 5 candidates (~15-30 seconds)...")
    try:
        matches = await job_matching_service.find_job_matches(user_id)
        
        if not matches:
            print("No AI-powered job matches found.")
            
            # Check if there are jobs available
            jobs = job_db.get_jobs_for_matching(limit=10)
            if not jobs:
                print("No jobs available in the database for matching.")
            else:
                print(f"Found {len(jobs)} jobs in database, but AI determined no suitable matches for this user.")
                # Show first job for debugging
                job = jobs[0]
                print(f"Sample job: {job.title} at {job.company}")
                print(f"Job skills: {job.skills[:5] if job.skills else 'None'}...")
        else:
            print(f"🎯 AI found {len(matches)} intelligent job matches!")
            
            # Save matches to database
            print("💾 Saving AI-analyzed matches to database...")
            saved_matches = await job_matching_service.save_job_matches(user_id, matches)
            print(f"✅ Saved {len(saved_matches)} AI matches to user_job_matches table")
            
            # Show top matches with AI insights
            for i, match in enumerate(matches[:5], 1):
                print(f"\n{i}. {match.job.title} at {match.job.company}")
                print(f"   🎯 AI Match Score: {match.match_score:.2f}")
                print(f"   🎖️  Confidence: {match.confidence}")
                print(f"   📊 Skill Coverage: {match.skill_coverage:.2f}")
                if match.matched_skills:
                    print(f"   ✅ Matched Skills: {', '.join(match.matched_skills[:5])}...")
                if match.missing_critical_skills:
                    print(f"   ❌ Missing Skills: {', '.join(match.missing_critical_skills[:3])}...")
                if match.ai_reasoning:
                    print(f"   🤖 AI Analysis: {match.ai_reasoning[:150]}...")
                if hasattr(match.job, 'location') and match.job.location:
                    print(f"   📍 Location: {match.job.location}")
                if hasattr(match.job, 'url') and match.job.url:
                    print(f"   🔗 URL: {match.job.url}")
        
        print("\n" + "="*50)
        print("🎉 AI-Powered Job Matching Test Completed!")
        
    except Exception as e:
        print(f"Error during job matching: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_job_matching())
