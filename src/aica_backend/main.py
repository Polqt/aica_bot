import sys
import uvicorn
import logging
import os
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from scripts.index_jobs import index_all_jobs

from pathlib import Path

# Configure logging for Google Cloud
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s: %(name)s - %(message)s',
    force=True  # Force reconfiguration
)
logger = logging.getLogger(__name__)

env_path = Path(__file__).parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    logger.info("Loaded .env file from: %s", env_path)

parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from api.routes.auth import router as auth_router
from api.routes.jobs import router as jobs_router
from api.routes.resume_builder import router as resume_builder_router

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="AICA Backend", version="1.0.0")

# Startup event for logging
@app.on_event("startup")
async def startup_event():
    logger.info("="*60)
    logger.info("AICA BACKEND STARTING UP (RAG VERSION)")
    logger.info("="*60)
    logger.info("Python version: %s", sys.version)
    logger.info("Environment variables loaded:")
    logger.info("  - ANTHROPIC_API_KEY: %s", "SET" if os.getenv("ANTHROPIC_API_KEY") else "NOT SET")
    logger.info("  - SUPABASE_URL: %s", "SET" if os.getenv("SUPABASE_URL") else "NOT SET")
    
    # Check FAISS index existence (but don't load it yet - lazy loading)
    faiss_path = Path(__file__).parent / "faiss_job_index" / "index.faiss"
    
    if not faiss_path.exists():
        logger.warning("⚠️  FAISS index not found at startup")
        logger.warning("⚠️  Will rebuild on first job matching request")
    else:
        logger.info(f"✅ FAISS index found ({faiss_path.stat().st_size / 1024 / 1024:.2f} MB)")
        logger.info("✅ Will load FAISS on first job matching request (lazy loading)")
    
    logger.info("✅ Startup complete - Ready to serve requests")
    logger.info("="*60)

# Rate limiting setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global exception handler to ensure CORS headers on ALL responses including errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        response = JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    elif isinstance(exc, RateLimitExceeded):
        logging.warning(f"Rate limit exceeded for request: {request.url} from {request.client.host}")
        response = JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded"}
        )
    else:
        logging.error(f"Unhandled exception: {exc}", exc_info=True)
        response = JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

    # Add CORS headers to ALL error responses
    origin = request.headers.get("origin")
    # Allow localhost on any port + local network IPs for QA testing
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:8000", 
        "http://127.0.0.1:3000",
        "https://your-production-frontend-domain.com"
    ]
    # Allow any local network IP (192.168.x.x, 10.x.x.x, etc.)
    if origin and (origin.startswith("http://192.168.") or 
                   origin.startswith("http://10.") or
                   origin.startswith("http://172.") or
                   origin in allowed_origins):
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Accept-Language, Content-Language, Content-Type, Authorization, Origin, X-Requested-With, X-CSRF-Token"
    response.headers["Access-Control-Expose-Headers"] = "*"

    return response

# Custom CORS middleware to ensure headers are added to ALL responses
class CORSFixedMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Handle preflight requests explicitly
        if request.method == "OPTIONS":
            response = JSONResponse(content={})
            # Set origin based on request
            origin = request.headers.get("origin")
            # Allow localhost on any port + local network IPs for QA testing
            allowed_origins = [
                "http://localhost:3000",
                "http://localhost:8000",
                "http://127.0.0.1:3000", 
                "https://your-production-frontend-domain.com"
            ]
            # Allow any local network IP (192.168.x.x, 10.x.x.x, etc.)
            if origin and (origin.startswith("http://192.168.") or 
                           origin.startswith("http://10.") or
                           origin.startswith("http://172.") or
                           origin in allowed_origins):
                response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
            response.headers["Access-Control-Allow-Headers"] = "Accept, Accept-Language, Content-Language, Content-Type, Authorization, Origin, X-Requested-With, X-CSRF-Token"
            response.headers["Access-Control-Max-Age"] = "86400"
            return response

        response = await call_next(request)

        # Add CORS headers to ALL responses
        origin = request.headers.get("origin")
        # Allow localhost on any port + local network IPs for QA testing
        allowed_origins = [
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:3000",
            "https://your-production-frontend-domain.com"
        ]
        # Allow any local network IP (192.168.x.x, 10.x.x.x, etc.)
        if origin and (origin.startswith("http://192.168.") or 
                       origin.startswith("http://10.") or
                       origin.startswith("http://172.") or
                       origin in allowed_origins):
            response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
        response.headers["Access-Control-Allow-Headers"] = "Accept, Accept-Language, Content-Language, Content-Type, Authorization, Origin, X-Requested-With, X-CSRF-Token"
        response.headers["Access-Control-Expose-Headers"] = "*"

        return response

app.add_middleware(CORSFixedMiddleware)

# Add the standard CORS middleware for preflight handling
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development/QA
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

# Add rate limiting middleware
app.add_middleware(SlowAPIMiddleware)

app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(jobs_router, prefix="/jobs", tags=["job matching"])
app.include_router(resume_builder_router, prefix="/resume", tags=["resume builder"])

@app.get("/")
async def root():
    return {"message": "AICA Backend API"}

if __name__ == "__main__":
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except Exception as e:
        raise
    