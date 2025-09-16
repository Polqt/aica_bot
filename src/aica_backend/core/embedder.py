import os

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from typing import List, Optional

class TextEmbedder:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.embeddings = HuggingFaceEmbeddings(
            model_name=f"sentence-transformers/{model_name}",
            model_kwargs={'device': 'cpu'}  # Use CPU for consistency
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len,
        )
    
    def create_embeddings(self, texts: List[str], metadatas: List[dict] = None) -> List[float]:
        return self.embeddings.embed_documents(texts)
    
    def embed_single_text(self, text: str) -> List[float]:
        return self.embeddings.embed_query(text)
    
    def split_text(self, text: str) -> List[str]:
        return self.text_splitter.split_text(text)


class VectorJobStore:
    def __init__(self, embedder: TextEmbedder, persist_path: str = "./faiss_job_index"):
        self.embedder = embedder
        self.persist_path = persist_path
        self.vector_store: Optional[FAISS] = None
        self._load_or_create_store()
    
    def _load_or_create_store(self) -> None:
        if os.path.exists(f"{self.persist_path}.faiss"):
            try:
                self.vector_store = FAISS.load_local(
                    self.persist_path, 
                    self.embedder.embeddings,
                    allow_dangerous_deserialization=True
                )
            except Exception:
                self._create_empty_store()
        else:
            self._create_empty_store()
    
    def _create_empty_store(self) -> None:
        # FAISS requires at least one document to initialize
        dummy_doc = Document(page_content="dummy", metadata={"job_id": "dummy"})
        self.vector_store = FAISS.from_documents([dummy_doc], self.embedder.embeddings)
    
    def add_job(self, job_id: str, job_content: str, metadata: dict = None) -> None:
        if metadata is None:
            metadata = {}
        
        metadata.update({"job_id": job_id})
        
        # Split job content for better matching
        chunks = self.embedder.split_text(job_content)
        
        documents = [
            Document(page_content=chunk, metadata=metadata) 
            for chunk in chunks
        ]
        
        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(documents, self.embedder.embeddings)
        else:
            self.vector_store.add_documents(documents)
        
        self.save()
    
    def search_similar_jobs(self, resume_text: str, k: int = 10) -> List[dict]:
        if self.vector_store is None:
            return []
        
        # Search for similar job chunks
        results = self.vector_store.similarity_search_with_score(resume_text, k=k)
        
        # Deduplicate by job_id and aggregate scores
        job_scores = {}
        for doc, score in results:
            job_id = doc.metadata.get("job_id")
            if job_id == "dummy":  # Skip dummy document
                continue
                
            if job_id not in job_scores:
                job_scores[job_id] = {
                    "job_id": job_id,
                    "metadata": doc.metadata,
                    "scores": [],
                    "content": doc.page_content
                }
            job_scores[job_id]["scores"].append(score)
        
        # Calculate average scores and sort
        job_matches = []
        for job_data in job_scores.values():
            avg_score = sum(job_data["scores"]) / len(job_data["scores"])
            job_matches.append({
                "job_id": job_data["job_id"],
                "similarity_score": avg_score,
                "metadata": job_data["metadata"]
            })
        
        # Sort by similarity (lower score = more similar in FAISS)
        job_matches.sort(key=lambda x: x["similarity_score"])
        return job_matches
    
    def save(self) -> None:
        if self.vector_store:
            self.vector_store.save_local(self.persist_path)
    
    def clear(self) -> None:
        self._create_empty_store()
        self.save()
        