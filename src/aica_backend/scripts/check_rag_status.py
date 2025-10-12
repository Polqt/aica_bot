import os
import sys
from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent.parent))
env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env'
load_dotenv(env_path)

print("1️⃣  Environment Variables:")
api_key = os.getenv('ANTHROPIC_API_KEY')
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')

print(f"   ANTHROPIC_API_KEY: {'✅ Set' if api_key else '❌ Missing'}")
print(f"   SUPABASE_URL: {'✅ Set' if supabase_url else '❌ Missing'}")
print(f"   SUPABASE_KEY: {'✅ Set' if supabase_key else '❌ Missing'}")
print()

print("2️⃣  RAG Implementation:")
try:
    from core.matching.matcher import JobMatcher
    
    # Check if method exists
    has_rag_method = hasattr(JobMatcher, '_evaluate_match_with_context')
    print(f"   _evaluate_match_with_context method: {'✅ Exists' if has_rag_method else '❌ Missing'}")
    
    if has_rag_method:
        import inspect
        method = getattr(JobMatcher, '_evaluate_match_with_context')
        source = inspect.getsource(method)
        has_context = 'similarity_score' in source and 'RETRIEVAL CONTEXT' in source
        print(f"   Uses retrieval context: {'✅ Yes' if has_context else '❌ No'}")
    
except Exception as e:
    print(f"   ❌ Error checking matcher: {e}")
print()

# 3. Check vector store
print("3️⃣  Vector Store:")
faiss_dir = Path(__file__).parent.parent / 'faiss_job_index'
faiss_index = faiss_dir / 'index.faiss'
faiss_pkl = faiss_dir / 'index.pkl'

print(f"   FAISS index file: {'✅ Exists' if faiss_index.exists() else '❌ Not created'}")
print(f"   FAISS metadata: {'✅ Exists' if faiss_pkl.exists() else '❌ Not created'}")

if not faiss_index.exists():
    print(f"   ⚠️  Run: python scripts/index_jobs.py")
print()

# 4. Try to initialize matcher
print("4️⃣  Matcher Initialization:")
if api_key and supabase_url and supabase_key:
    try:
        matcher = JobMatcher()
        print(f"   Matcher created: ✅ Success")
        print(f"   Vector search enabled: {'✅ Yes' if matcher.use_vector_search else '⚠️  No (fallback mode)'}")
        
        # Check LLM
        print(f"   LLM initialized: {'✅ Yes' if matcher.llm else '❌ No'}")
        
        # Check vector store
        print(f"   Vector store: {'✅ Ready' if matcher.vector_store else '⚠️  Not loaded'}")
        
    except Exception as e:
        print(f"   ❌ Failed: {e}")
else:
    print("   ⚠️  Skipped (missing env vars)")
print()

# 5. Final verdict
print("="*60)
print("📊 FINAL VERDICT")
print("="*60)

if has_rag_method and has_context:
    print("✅ RAG CODE: Implemented correctly")
else:
    print("❌ RAG CODE: Not implemented")

if faiss_index.exists():
    print("✅ VECTOR STORE: Ready")
else:
    print("⚠️  VECTOR STORE: Needs indexing (run: python scripts/index_jobs.py)")

if api_key and supabase_url and supabase_key:
    print("✅ CONFIGURATION: Complete")
else:
    print("❌ CONFIGURATION: Missing environment variables")

print()
print("OVERALL STATUS:")
if has_rag_method and has_context:
    if faiss_index.exists():
        print("🎉 RAG is FULLY IMPLEMENTED and READY!")
    else:
        print("🔶 RAG is IMPLEMENTED but needs job indexing")
else:
    print("❌ RAG is NOT implemented")
print("="*60)
