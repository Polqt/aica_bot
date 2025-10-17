#!/bin/bash
# Quick setup script for real-time job scraping

echo "=================================="
echo "AICA Real-Time Scraping Setup"
echo "=================================="
echo ""

# Check if running in correct directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the aica_backend directory"
    exit 1
fi

echo "✅ Running from correct directory"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with required variables"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check for SCRAPING_API_KEY
if grep -q "SCRAPING_API_KEY" .env; then
    echo "✅ SCRAPING_API_KEY found in .env"
else
    echo "⚠️  SCRAPING_API_KEY not found in .env"
    echo "Generating a secure API key..."
    NEW_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    echo "SCRAPING_API_KEY=$NEW_KEY" >> .env
    echo "✅ Added SCRAPING_API_KEY to .env: $NEW_KEY"
    echo "   (Save this key for Google Cloud Scheduler setup)"
fi

echo ""
echo "=================================="
echo "Next Steps:"
echo "=================================="
echo ""
echo "1. Run database migration:"
echo "   - Open Supabase SQL Editor"
echo "   - Copy contents of scripts/add_job_expiration_columns.sql"
echo "   - Execute the SQL"
echo ""
echo "2. Install dependencies:"
echo "   pip install -r requirements.txt"
echo ""
echo "3. Test the scraping endpoint locally:"
echo "   uvicorn main:app --reload"
echo "   # In another terminal:"
echo "   curl -X POST http://localhost:8000/api/jobs/admin/trigger-scraping \\"
echo "     -H \"X-API-Key: \$(grep SCRAPING_API_KEY .env | cut -d'=' -f2)\""
echo ""
echo "4. Deploy to Google Cloud:"
echo "   gcloud app deploy app.yaml"
echo ""
echo "5. Set up Cloud Scheduler:"
echo "   gcloud scheduler jobs create http weekly-job-scraping \\"
echo "     --schedule=\"0 2 * * 0\" \\"
echo "     --uri=\"https://YOUR_PROJECT_ID.appspot.com/api/jobs/admin/trigger-scraping\" \\"
echo "     --http-method=POST \\"
echo "     --headers=\"X-API-Key=\$(grep SCRAPING_API_KEY .env | cut -d'=' -f2)\" \\"
echo "     --time-zone=\"Asia/Manila\""
echo ""
echo "=================================="
echo "✅ Setup preparation complete!"
echo "=================================="
