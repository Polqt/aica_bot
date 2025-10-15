import logging
import sys
import os
import shutil
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from core.rag import TextEmbedder, VectorJobStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def clear_faiss_index():
    try:
        logger.info("🧹 Starting FAISS index cleanup...")

        embedder = TextEmbedder()
        vector_store = VectorJobStore(embedder)
        
        # Get current stats before clearing
        stats = vector_store.get_stats()
        logger.info(f"Current vector store stats: {stats}")
        
        # Clear the index
        vector_store.clear()
        logger.info("✅ FAISS index cleared successfully!")
        
        persist_path = "./faiss_job_index"
        faiss_file = f"{persist_path}.faiss"
        pkl_file = f"{persist_path}.pkl"
        
        if os.path.exists(faiss_file):
            os.remove(faiss_file)
            logger.info(f"🗑️  Deleted {faiss_file}")
        
        if os.path.exists(pkl_file):
            os.remove(pkl_file)
            logger.info(f"🗑️  Deleted {pkl_file}")
        
        # Check if persist_path is a directory and remove it
        if os.path.isdir(persist_path):
            shutil.rmtree(persist_path)
            logger.info(f"🗑️  Deleted directory {persist_path}")
        
        logger.info("✅ FAISS index cleanup completed! Ready for fresh indexing.")
        
    except Exception as e:
        logger.error(f"❌ Error clearing FAISS index: {e}")
        raise


if __name__ == "__main__":
    clear_faiss_index()
