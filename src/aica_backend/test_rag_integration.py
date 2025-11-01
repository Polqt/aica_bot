import logging
from core.rag import TextEmbedder, VectorJobStore, JobIndexer, JobSearcher, UserContext

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_rag_integration():
    """Test the complete RAG pipeline."""
    
    logger.info("=" * 60)
    logger.info("Testing RAG Pipeline Integration")
    logger.info("=" * 60)
    
    # Step 1: Initialize components
    logger.info("\n1️⃣ Initializing RAG components...")
    try:
        embedder = TextEmbedder()
        vector_store = VectorJobStore(embedder)
        indexer = JobIndexer(vector_store)
        searcher = JobSearcher(vector_store)
        logger.info("✅ All components initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize: {e}")
        return False
    
    # Step 2: Check indexed jobs
    logger.info("\n2️⃣ Checking indexed jobs...")
    try:
        stats = indexer.get_indexing_stats()
        logger.info(f"📊 Vector Store Stats:")
        logger.info(f"   - Total jobs indexed: {stats['total_jobs']}")
        logger.info(f"   - Metadata count: {stats['metadata_count']}")
        logger.info(f"   - Is initialized: {stats['is_initialized']}")
        
        if stats['total_jobs'] == 0:
            logger.warning("⚠️ No jobs found in vector store. Run scraping first!")
            return False
    except Exception as e:
        logger.error(f"❌ Failed to get stats: {e}")
        return False
    
    # Step 3: Test search with sample skills
    logger.info("\n3️⃣ Testing job search...")
    try:
        # Test with Python developer profile
        context = UserContext(
            skills=["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
            experience_years=3,
            job_titles=["Backend Developer", "Python Developer"]
        )
        
        logger.info(f"🔍 Searching with context:")
        logger.info(f"   - Skills: {', '.join(context.skills)}")
        logger.info(f"   - Experience: {context.experience_years} years")
        logger.info(f"   - Desired roles: {', '.join(context.job_titles)}")
        
        # Perform search
        matches = searcher.search_jobs(
            context=context,
            top_k=5,
            use_multi_query=True,
            score_threshold=0.3
        )
        
        logger.info(f"\n✅ Found {len(matches)} matches!")
        
        if matches:
            logger.info("\n🏆 Top 5 Matches:")
            for i, match in enumerate(matches[:5], 1):
                logger.info(f"\n   Match #{i}:")
                logger.info(f"   - Job ID: {match.get('job_id', 'N/A')}")
                logger.info(f"   - Title: {match.get('title', 'N/A')}")
                logger.info(f"   - Company: {match.get('company', 'N/A')}")
                logger.info(f"   - Match Score: {match.get('match_score', 0):.2f}")
                logger.info(f"   - Location: {match.get('location', 'N/A')}")
        else:
            logger.warning("⚠️ No matches found. Try different skills or lower threshold.")
            
    except Exception as e:
        logger.error(f"❌ Search failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Step 4: Test simple skills search
    logger.info("\n4️⃣ Testing simple skills search...")
    try:
        simple_matches = searcher.search_by_skills(
            skills=["JavaScript", "React", "Node.js"],
            top_k=3,
            score_threshold=0.3
        )
        
        logger.info(f"✅ Found {len(simple_matches)} matches for JS/React/Node skills")
        
    except Exception as e:
        logger.error(f"❌ Simple search failed: {e}")
        return False
    
    logger.info("\n" + "=" * 60)
    logger.info("✅ RAG Pipeline Integration Test Complete!")
    logger.info("=" * 60)
    
    return True


if __name__ == "__main__":
    success = test_rag_integration()
    exit(0 if success else 1)
