@echo off
REM Quick setup script for real-time job scraping (Windows)

echo ==================================
echo AICA Real-Time Scraping Setup
echo ==================================
echo.

REM Check if running in correct directory
if not exist "requirements.txt" (
    echo Error: Please run this script from the aica_backend directory
    exit /b 1
)

echo [OK] Running from correct directory
echo.

REM Check if .env file exists
if not exist ".env" (
    echo Error: .env file not found
    echo Please create a .env file with required variables
    exit /b 1
)

echo [OK] .env file found
echo.

REM Check for SCRAPING_API_KEY
findstr /C:"SCRAPING_API_KEY" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] SCRAPING_API_KEY found in .env
) else (
    echo [WARNING] SCRAPING_API_KEY not found in .env
    echo Generating a secure API key...
    python -c "import secrets; print('SCRAPING_API_KEY=' + secrets.token_urlsafe(32))" >> .env
    echo [OK] Added SCRAPING_API_KEY to .env
    echo     ^(Save this key for Google Cloud Scheduler setup^)
)

echo.
echo ==================================
echo Next Steps:
echo ==================================
echo.
echo 1. Run database migration:
echo    - Open Supabase SQL Editor
echo    - Copy contents of scripts\add_job_expiration_columns.sql
echo    - Execute the SQL
echo.
echo 2. Install dependencies:
echo    pip install -r requirements.txt
echo.
echo 3. Test the scraping endpoint locally:
echo    python main.py
echo    # In another terminal:
echo    curl -X POST http://localhost:8000/api/jobs/admin/trigger-scraping ^
echo      -H "X-API-Key: YOUR_KEY_FROM_ENV"
echo.
echo 4. Deploy to Google Cloud:
echo    gcloud app deploy app.yaml
echo.
echo 5. Set up Cloud Scheduler:
echo    See REAL_TIME_SCRAPING_SETUP.md for full instructions
echo.
echo ==================================
echo [OK] Setup preparation complete!
echo ==================================

pause
