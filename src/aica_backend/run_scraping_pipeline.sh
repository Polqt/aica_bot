echo "=========================================="
echo "🚀 AICA Job Scraping Pipeline"
echo "=========================================="
echo ""

# Step 1: Clear the FAISS index
echo "Step 1: Clearing FAISS index..."
echo "----------------------------------------"
python scripts/clear_faiss_index.py

if [ $? -ne 0 ]; then
    echo "❌ Failed to clear FAISS index"
    exit 1
fi

echo ""
echo "✅ FAISS index cleared successfully!"
echo ""

# Wait a moment
sleep 2

# Step 2: Run the scraper
echo "Step 2: Scraping jobs (target: ~500 jobs)..."
echo "----------------------------------------"
python scraper.py

if [ $? -ne 0 ]; then
    echo "❌ Failed to scrape jobs"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Pipeline completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  - Check the logs above for details"
echo "  - Verify jobs in your database"
echo "  - Test the job matching functionality"
echo ""
