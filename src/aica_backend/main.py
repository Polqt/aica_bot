import sys
import uvicorn
from dotenv import load_dotenv

from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env")

parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from aica_backend.api.routes.auth import router as auth_router

app = FastAPI(title="AICA Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["authentication"])

@app.get("/")
async def root():
    return {"message": "AICA Backend API"}

if __name__ == "__main__":
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except Exception as e:
        raise