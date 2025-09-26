import sys
import uvicorn
import logging
from dotenv import load_dotenv

from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Load .env file if it exists (for local development)
env_path = Path(__file__).parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# Import routers (App Engine runs from workspace root)
from api.routes.auth import router as auth_router
from api.routes.jobs import router as jobs_router
from api.routes.resume_builder import router as resume_builder_router

class CORSMiddlewareFixed(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        # Handle preflight requests
        if request.method == "OPTIONS":
            response = Response(status_code=200)
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Max-Age"] = "600"
            return response

        # Process the request
        response = await call_next(request)

        # Add CORS headers to all responses
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"

        return response

app = FastAPI(title="AICA Backend", version="1.0.0")

# Add custom CORS middleware
app.add_middleware(CORSMiddlewareFixed)

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