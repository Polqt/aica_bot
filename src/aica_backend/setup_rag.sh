echo "╔═══════════════════════════════════════════════════╗"
echo "║     AICA RAG System - Quick Setup                 ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Check if in correct directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: Please run this script from src/aica_backend directory"
    exit 1
fi

echo "📦 Step 1: Checking Python dependencies..."
python -c "import langchain, faiss, sentence_transformers" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Missing dependencies. Installing..."
    pip install -q langchain langchain-anthropic langchain-community faiss-cpu sentence-transformers
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies OK"
fi

echo ""
echo "🔍 Step 2: Checking environment variables..."
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY not set"
    echo "   Please add to .env file or export it"
else
    echo "✅ ANTHROPIC_API_KEY set"
fi

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL not set"
else
    echo "✅ SUPABASE_URL set"
fi

if [ -z "$SUPABASE_KEY" ]; then
    echo "❌ SUPABASE_KEY not set"
else
    echo "✅ SUPABASE_KEY set"
fi

echo ""
echo "🗂️  Step 3: Checking vector store..."
if [ -f "faiss_job_index.faiss" ] && [ -f "faiss_job_index.pkl" ]; then
    echo "✅ Vector store exists"
else
    echo "⚠️  Vector store not found"
    echo ""
    read -p "Would you like to index jobs now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📇 Indexing jobs..."
        python scripts/index_jobs.py
    fi
fi

echo ""
echo "🧪 Step 4: Running verification tests..."
python scripts/verify_rag.py

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║              Setup Complete!                      ║"
echo "╠═══════════════════════════════════════════════════╣"
echo "║                                                   ║"
echo "║  Next Steps:                                      ║"
echo "║  1. Start backend: uvicorn main:app --reload     ║"
echo "║  2. Test resume upload through frontend           ║"
echo "║  3. Check match results for AI reasoning          ║"
echo "║                                                   ║"
echo "║  Documentation:                                   ║"
echo "║  - RAG_IMPLEMENTATION.md                          ║"
echo "║  - MIGRATION_GUIDE.md                             ║"
echo "║  - IMPLEMENTATION_SUMMARY.md                      ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
