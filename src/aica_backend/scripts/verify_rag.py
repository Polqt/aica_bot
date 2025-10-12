import os
import sys
import asyncio
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env'
load_dotenv(env_path)

def check_env_variables():

    required_vars = {
        "ANTHROPIC_API_KEY": "LLM analysis",
        "SUPABASE_URL": "Database connection",
        "SUPABASE_KEY": "Database authentication"
    }
    
    all_good = True
    for var, purpose in required_vars.items():
        if os.getenv(var):
            print(f"  ✅ {var} - Set ({purpose})")
        else:
            print(f"  ❌ {var} - MISSING ({purpose})")
            all_good = False
    
    return all_good


def check_vector_store():

    faiss_path = Path("faiss_job_index.faiss")
    pkl_path = Path("faiss_job_index.pkl")
    
    if faiss_path.exists() and pkl_path.exists():
        print(f"  ✅ Vector store found")
        print(f"     - {faiss_path}")
        print(f"     - {pkl_path}")
        return True
    else:
        print(f"  ⚠️  Vector store not found")
        print(f"     Run: python scripts/index_jobs.py")
        return False


def check_dependencies():

    required_packages = [
        "langchain",
        "langchain_anthropic",
        "langchain_community",
        "faiss",
        "sentence_transformers",
        "supabase",
        "pydantic"
    ]
    
    all_installed = True
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package} - NOT INSTALLED")
            all_installed = False
    
    return all_installed


async def test_embedder():

    try:
        from core.embedder import TextEmbedder
        
        embedder = TextEmbedder()
        test_text = "Python developer with React experience"
        embedding = embedder.embed_single_text(test_text)
        
        if embedding and len(embedding) == 384:
            print(f"  ✅ Embedder working (dimension: {len(embedding)})")
            return True
        else:
            print(f"  ❌ Embedder returned invalid embedding")
            return False
    except Exception as e:
        print(f"  ❌ Embedder failed: {e}")
        return False


async def test_skill_extraction():
    try:
        from core.resume.skill_extractor import SkillExtractor
        
        test_resume = """
        Senior Software Engineer with 5 years of experience.
        
        Skills: Python, JavaScript, React, Node.js, FastAPI, PostgreSQL, Docker, AWS
        
        Built RESTful APIs using FastAPI framework.
        Developed frontend applications with React and TypeScript.
        Strong leadership and communication skills.
        """
        
        skills = SkillExtractor.extract_with_fallback(test_resume)
        
        tech_count = len(skills.technical_skills)
        soft_count = len(skills.soft_skills)
        
        print(f"  ✅ Technical skills extracted: {tech_count}")
        print(f"     {', '.join(skills.technical_skills[:10])}")
        print(f"  ✅ Soft skills extracted: {soft_count}")
        print(f"     {', '.join(skills.soft_skills[:5])}")
        
        if tech_count >= 8 and soft_count >= 2:
            print(f"  ✅ Extraction quality: GOOD")
            return True
        else:
            print(f"  ⚠️  Extraction quality: Could be better")
            return True  # Still passes, just a warning
            
    except Exception as e:
        print(f"  ❌ Skill extraction failed: {e}")
        return False


async def test_vector_search():
    try:
        from core.embedder import TextEmbedder, VectorJobStore
        
        embedder = TextEmbedder()
        store = VectorJobStore(embedder)
        
        job_count = store.get_job_count()
        print(f"  ✅ Vector store loaded: {job_count} jobs indexed")
        
        if job_count == 0:
            print(f"  ⚠️  No jobs indexed yet")
            print(f"     Run: python scripts/index_jobs.py")
            return True  

        query = "Python developer with React experience"
        results = store.search_similar_jobs(query, k=5)
        
        if results:
            print(f"  ✅ Search working: Found {len(results)} matches")
            for i, r in enumerate(results[:3], 1):
                print(f"     {i}. {r['metadata'].get('title', 'Unknown')} - {r['similarity_score']:.2%}")
            return True
        else:
            print(f"  ⚠️  No search results (may need more jobs indexed)")
            return True
            
    except Exception as e:
        print(f"  ❌ Vector search failed: {e}")
        return False


async def test_matcher():
    try:
        from core.matching.matcher import JobMatcher
        
        matcher = JobMatcher()
        
        # Check if vector search is enabled
        if matcher.use_vector_search:
            print(f"  ✅ JobMatcher initialized with vector search")
        else:
            print(f"  ⚠️  JobMatcher initialized without vector search (fallback mode)")
        
        return True
        
    except Exception as e:
        print(f"  ❌ JobMatcher initialization failed: {e}")
        return False


async def run_all_tests():
    results = {}
    
    # Run tests
    results['env'] = check_env_variables()
    results['deps'] = check_dependencies()
    results['vector_store'] = check_vector_store()
    results['embedder'] = await test_embedder()
    results['skills'] = await test_skill_extraction()
    results['search'] = await test_vector_search()
    results['matcher'] = await test_matcher()
    
    # Summary
    print("\n" + "="*60)
    print("📊 Verification Summary")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} - {test.replace('_', ' ').title()}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All systems operational! Your RAG implementation is ready.")
        print("\n📝 Next steps:")
        print("   1. If vector store is empty, run: python scripts/index_jobs.py")
        print("   2. Test resume upload through the frontend")
        print("   3. Check match results for AI reasoning")
    else:
        print("\n⚠️  Some issues detected. Please review the failures above.")
        print("\n🔧 Common fixes:")
        print("   - Set missing environment variables in .env")
        print("   - Install missing packages: pip install -r requirements.txt")
        print("   - Run job indexing: python scripts/index_jobs.py")
    
    return passed == total


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
