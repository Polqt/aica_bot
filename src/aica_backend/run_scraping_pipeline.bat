echo ==========================================
echo 🚀 AICA Job Scraping Pipeline
echo ==========================================
echo.

REM Step 1: Clear the FAISS index
echo Step 1: Clearing FAISS index...
echo ------------------------------------------
python scripts\clear_faiss_index.py

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to clear FAISS index
    exit /b 1
)

echo.
echo ✅ FAISS index cleared successfully!
echo.

REM Wait a moment
timeout /t 2 /nobreak > NUL

REM Step 2: Run the scraper
echo Step 2: Scraping jobs (target: ~500 jobs)...
echo ------------------------------------------
python scraper.py

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to scrape jobs
    exit /b 1
)

echo.
echo ==========================================
echo ✅ Pipeline completed successfully!
echo ==========================================
echo.
echo Next steps:
echo   - Check the logs above for details
echo   - Verify jobs in your database
echo   - Test the job matching functionality
echo.

pause
