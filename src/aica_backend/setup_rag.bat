@echo off
REM Quick setup script for AICA RAG system (Windows)

echo ╔═══════════════════════════════════════════════════╗
echo ║     AICA RAG System - Quick Setup                 ║
echo ╚═══════════════════════════════════════════════════╝
echo.

REM Check if in correct directory
if not exist "main.py" (
    echo ❌ Error: Please run this script from src\aica_backend directory
    exit /b 1
)

echo 📦 Step 1: Checking Python dependencies...
python -c "import langchain, faiss, sentence_transformers" 2>nul
if errorlevel 1 (
    echo ⚠️  Missing dependencies. Installing...
    pip install -q langchain langchain-anthropic langchain-community faiss-cpu sentence-transformers
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies OK
)

echo.
echo 🔍 Step 2: Checking environment variables...
if "%ANTHROPIC_API_KEY%"=="" (
    echo ❌ ANTHROPIC_API_KEY not set
    echo    Please add to .env file or set environment variable
) else (
    echo ✅ ANTHROPIC_API_KEY set
)

if "%SUPABASE_URL%"=="" (
    echo ❌ SUPABASE_URL not set
) else (
    echo ✅ SUPABASE_URL set
)

if "%SUPABASE_KEY%"=="" (
    echo ❌ SUPABASE_KEY not set
) else (
    echo ✅ SUPABASE_KEY set
)

echo.
echo 🗂️  Step 3: Checking vector store...
if exist "faiss_job_index.faiss" (
    if exist "faiss_job_index.pkl" (
        echo ✅ Vector store exists
    ) else (
        echo ⚠️  Vector store incomplete
        goto index_prompt
    )
) else (
    :index_prompt
    echo ⚠️  Vector store not found
    echo.
    set /p INDEX_NOW="Would you like to index jobs now? (y/n): "
    if /i "%INDEX_NOW%"=="y" (
        echo 📇 Indexing jobs...
        python scripts\index_jobs.py
    )
)

echo.
echo 🧪 Step 4: Running verification tests...
python scripts\verify_rag.py

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║              Setup Complete!                      ║
echo ╠═══════════════════════════════════════════════════╣
echo ║                                                   ║
echo ║  Next Steps:                                      ║
echo ║  1. Start backend: uvicorn main:app --reload     ║
echo ║  2. Test resume upload through frontend           ║
echo ║  3. Check match results for AI reasoning          ║
echo ║                                                   ║
echo ║  Documentation:                                   ║
echo ║  - RAG_IMPLEMENTATION.md                          ║
echo ║  - MIGRATION_GUIDE.md                             ║
echo ║  - IMPLEMENTATION_SUMMARY.md                      ║
echo ║                                                   ║
echo ╚═══════════════════════════════════════════════════╝
echo.
pause
