# AICA Job Matching System Architecture

## Complete System Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│                        FRONTEND (Next.js/React)                            │
│                                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Landing    │  │   Sign Up    │  │   Upload     │  │  Onboarding  │ │
│  │     Page     │  │   /sign-up   │  │   Resume     │  │   Profile    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Dashboard   │  │ Job Matches  │  │ Saved Jobs   │  │    Profile   │ │
│  │ /dashboard   │  │ /job-matches │  │ /saved-jobs  │  │ /user-profile│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                            │
└────────────────────────────────────┬───────────────────────────────────────┘
                                     │
                          REST API Calls (HTTP)
                                     │
┌────────────────────────────────────▼───────────────────────────────────────┐
│                                                                            │
│                          BACKEND API (FastAPI)                             │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  API Routes (/api/routes/)                                         │   │
│  │                                                                     │   │
│  │  • POST /auth/register          - User registration                │   │
│  │  • POST /auth/login             - User login                       │   │
│  │  • POST /auth/upload-resume     - Upload & parse resume            │   │
│  │  • GET  /auth/processing-status - Check resume processing          │   │
│  │                                                                     │   │
│  │  • GET  /jobs/matches           - Get personalized matches         │   │
│  │  • GET  /jobs/{job_id}          - Get job details                  │   │
│  │  • POST /jobs/saved             - Save job                         │   │
│  │  • DELETE /jobs/saved/{id}      - Remove saved job                 │   │
│  │  • POST /jobs/index             - Index new jobs (admin/scraper)   │   │
│  │                                                                     │   │
│  │  • GET  /resume-builder/        - Resume builder endpoints         │   │
│  │  • POST /resume-builder/skills  - Add/update skills                │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└────────────────────────────────────┬───────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│                    BUSINESS LOGIC LAYER (Services)                         │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │  JobMatchingService (services/job_matching.py)                   │     │
│  │                                                                   │     │
│  │  Main Orchestrator - Combines RAG + AI + Scoring                 │     │
│  │                                                                   │     │
│  │  find_job_matches(user_id, limit=20):                            │     │
│  │    1. Get user skills from database                              │     │
│  │    2. RAG fast screening (10,000 → 60 jobs)                      │     │
│  │    3. AI detailed analysis (60 → 20 jobs)                        │     │
│  │    4. Score calculation & ranking                                │     │
│  │    5. Return enriched matches                                    │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                            │
└─────┬────────────────────────────┬──────────────────────────┬─────────────┘
      │                            │                          │
      ▼                            ▼                          ▼
┌──────────────┐         ┌──────────────────┐      ┌─────────────────┐
│   RAG        │         │   MATCHING       │      │   DATABASES     │
│   MODULE     │         │   MODULE         │      │                 │
│              │         │                  │      │  ┌───────────┐  │
│ core/rag/    │         │ core/matching/   │      │  │ Supabase  │  │
│              │         │                  │      │  │ PostgreSQL│  │
│ ┌──────────┐ │         │ ┌──────────────┐ │      │  └───────────┘  │
│ │Embeddings│ │         │ │ AI Analyzer  │ │      │                 │
│ │          │ │         │ │  (Claude)    │ │      │  Tables:        │
│ │HuggingF. │ │         │ │              │ │      │  • users        │
│ │sentence- │ │         │ │- Qualitative │ │      │  • user_skills  │
│ │transform.│ │         │ │  assessment  │ │      │  • jobs         │
│ └──────────┘ │         │ │- AI reasoning│ │      │  • job_matches  │
│              │         │ └──────────────┘ │      │  • saved_jobs   │
│ ┌──────────┐ │         │                  │      │                 │
│ │Chunking  │ │         │ ┌──────────────┐ │      └─────────────────┘
│ │          │ │         │ │ Skill Matcher│ │
│ │Job       │ │         │ │              │ │
│ │Chunker   │ │         │ │- Exact match │ │
│ └──────────┘ │         │ │- Fuzzy match │ │
│              │         │ │- Synonym     │ │
│ ┌──────────┐ │         │ └──────────────┘ │
│ │Storage   │ │         │                  │
│ │          │ │         │ ┌──────────────┐ │
│ │FAISS     │ │         │ │ Scorer       │ │
│ │Vector    │ │         │ │              │ │
│ │Store     │ │         │ │- Base score  │ │
│ │          │ │         │ │- Coverage    │ │
│ │10K+ jobs │ │         │ │- Confidence  │ │
│ └──────────┘ │         │ └──────────────┘ │
│              │         │                  │
│ ┌──────────┐ │         │ ┌──────────────┐ │
│ │Retrieval │ │         │ │ Job Matcher  │ │
│ │          │ │         │ │              │ │
│ │Semantic  │ │         │ │Main pipeline │ │
│ │Search    │ │         │ │orchestrator  │ │
│ │Ranking   │ │         │ └──────────────┘ │
│ └──────────┘ │         │                  │
│              │         └──────────────────┘
│ ┌──────────┐ │
│ │Pipeline  │ │
│ │          │ │
│ │Indexing  │ │
│ │Searching │ │
│ └──────────┘ │
│              │
└──────────────┘
```

## Detailed Job Matching Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: User Request                                                    │
│ "Find jobs matching my skills"                                          │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Get User Data (from Database)                                   │
│                                                                          │
│ User ID: "user_123"                                                      │
│ Skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"]            │
│ Experience: 3 years                                                      │
│ Preferred Locations: ["Remote", "New York"]                             │
│ Education: "Bachelor's in Computer Science"                             │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: RAG Fast Screening (core/rag/)                                  │
│                                                                          │
│ Input: 10,000 jobs in database                                          │
│                                                                          │
│ Process:                                                                 │
│ 1. Create query: "Python FastAPI PostgreSQL Docker AWS"                 │
│ 2. Embed query → vector [0.12, -0.45, 0.87, ...]                       │
│ 3. FAISS similarity search (milliseconds)                               │
│ 4. Find k-nearest neighbors                                             │
│                                                                          │
│ Output: Top 60 semantically similar jobs                                │
│ [                                                                        │
│   {job_id: "job_001", similarity: 0.89, title: "Senior Python Dev"},   │
│   {job_id: "job_045", similarity: 0.87, title: "Backend Engineer"},    │
│   {job_id: "job_123", similarity: 0.85, title: "Full Stack Dev"},      │
│   ...                                                                    │
│ ]                                                                        │
│                                                                          │
│ ⚡ Performance: 10,000 jobs → 60 candidates in ~50ms                    │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: AI Detailed Analysis (core/matching/)                           │
│                                                                          │
│ For each of the 60 candidates:                                          │
│                                                                          │
│ A. Skill Matching                                                        │
│    • Exact matches: Python ✓, FastAPI ✓, PostgreSQL ✓                  │
│    • Fuzzy matches: Docker ✓, Kubernetes ✗                             │
│    • Coverage: 4/5 = 80%                                                │
│                                                                          │
│ B. AI Reasoning (Claude)                                                │
│    Prompt: "Analyze match between:"                                     │
│    - User: 3 years exp, Python/FastAPI/PostgreSQL                      │
│    - Job: Senior Python Dev, requires Python/FastAPI/PostgreSQL/K8s    │
│    - RAG similarity: 0.89                                               │
│                                                                          │
│    AI Response:                                                          │
│    "Strong match! Candidate has excellent foundation in Python and      │
│     FastAPI. Missing Kubernetes but can learn quickly given strong      │
│     Docker experience. Recommend applying with emphasis on Docker       │
│     containerization experience as transferable skill."                 │
│                                                                          │
│ C. Scoring                                                               │
│    • Base score: 85 (from skill coverage)                               │
│    • RAG bonus: +5 (high similarity)                                    │
│    • Experience match: +3 (3 years matches "2-4 years")                │
│    • AI confidence: High                                                │
│    • Final score: 93                                                    │
│                                                                          │
│ ⚡ Performance: 60 jobs analyzed in ~30 seconds                         │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Ranking & Filtering                                             │
│                                                                          │
│ Sort by:                                                                 │
│ 1. Final match score (highest first)                                    │
│ 2. AI confidence level                                                  │
│ 3. Skill coverage                                                       │
│                                                                          │
│ Filter:                                                                  │
│ • Remove matches < 40% score                                            │
│ • Apply location preferences                                            │
│ • Deduplicate                                                           │
│                                                                          │
│ Output: Top 20 best matches                                             │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 6: Return to Frontend                                              │
│                                                                          │
│ JSON Response:                                                           │
│ {                                                                        │
│   "matches": [                                                           │
│     {                                                                    │
│       "job_id": "job_001",                                              │
│       "title": "Senior Python Developer",                               │
│       "company": "Tech Corp",                                           │
│       "location": "Remote",                                             │
│       "match_score": 93,              ← Combined score                  │
│       "similarity_score": 0.89,       ← From RAG                        │
│       "skill_coverage": 0.80,         ← From skill matcher              │
│       "confidence": "High",            ← From AI                        │
│       "ai_reasoning": "Strong match...", ← From AI                      │
│       "matched_skills": ["Python", "FastAPI", ...],                     │
│       "missing_skills": ["Kubernetes"],                                 │
│       "skill_gap_analysis": {                                           │
│         "Kubernetes": "Can learn quickly given Docker experience"       │
│       }                                                                  │
│     }                                                                    │
│   ]                                                                      │
│ }                                                                        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 7: Display in Frontend                                             │
│                                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ 📊 Job Matches (20)                              🔄 Refresh     │    │
│ ├─────────────────────────────────────────────────────────────────┤    │
│ │                                                                  │    │
│ │ ┌────────────────────────────────────────────────────────────┐  │    │
│ │ │ 🏢 Tech Corp                          93% Match 🎯 High     │  │    │
│ │ │ Senior Python Developer                                     │  │    │
│ │ │ 📍 Remote • 💰 $120k-150k                                   │  │    │
│ │ │                                                              │  │    │
│ │ │ ✅ Matched Skills (4)                                        │  │    │
│ │ │ [Python] [FastAPI] [PostgreSQL] [Docker]                   │  │    │
│ │ │                                                              │  │    │
│ │ │ ⚠️ Missing Skills (1)                                        │  │    │
│ │ │ [Kubernetes] - Can learn quickly given Docker experience   │  │    │
│ │ │                                                              │  │    │
│ │ │ 🤖 AI Says:                                                  │  │    │
│ │ │ "Strong match! Your Python and FastAPI experience aligns   │  │    │
│ │ │  perfectly. Missing Kubernetes but can learn quickly..."    │  │    │
│ │ │                                                              │  │    │
│ │ │ [View Details] [Apply Now] [💾 Save]                        │  │    │
│ │ └────────────────────────────────────────────────────────────┘  │    │
│ │                                                                  │    │
│ │ ... 19 more job cards ...                                       │    │
│ └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Module Responsibilities

### RAG Module (core/rag/)
**Role:** Information Retrieval Engine

**Provides:**
- Fast semantic search (vector similarity)
- Job indexing and storage
- Query processing
- Similarity scoring

**Does NOT provide:**
- Job quality assessment
- Skill gap analysis
- AI reasoning
- Final match decisions

**Analogy:** Library search system - finds relevant books quickly

### Matching Module (core/matching/)
**Role:** Intelligent Decision Maker

**Provides:**
- AI-powered analysis (Claude)
- Skill matching algorithms
- Experience level matching
- Confidence scoring
- Reasoning and recommendations
- Skill gap analysis

**Uses:**
- RAG for candidate retrieval
- AI for qualitative assessment
- Algorithms for quantitative scoring

**Analogy:** Career advisor - analyzes opportunities and gives advice

### Database Layer
**Role:** Data Persistence

**Stores:**
- User profiles and skills
- Job postings
- Match history
- Saved jobs
- Application tracking

### API Layer
**Role:** Interface & Orchestration

**Responsibilities:**
- HTTP endpoint management
- Authentication/authorization
- Request validation
- Response formatting
- Error handling

### Frontend
**Role:** User Interface

**Displays:**
- Job matches with scores
- AI reasoning
- Skill analysis
- Interactive filtering
- Application management

## Key Insights

1. **RAG is Stage 1** - Fast filtering from thousands to dozens
2. **Matching is Stage 2** - Deep analysis of the filtered candidates
3. **They work together** - RAG feeds Matching, Matching enriches RAG results
4. **Frontend is abstracted** - Only calls API, doesn't know about RAG internals
5. **Complete pipeline** - From user skills → database query → RAG → AI → Frontend

## Performance Benefits

**Without RAG:**
- AI analyzes 10,000 jobs × 30 seconds = 83 hours ❌
- Unacceptable for real-time matching

**With RAG:**
- RAG filters: 10,000 → 60 in 50ms ✅
- AI analyzes: 60 jobs × 0.5 seconds = 30 seconds ✅
- Total: ~30 seconds ✅
- **5,980x faster!**

---

**Status:** Complete architectural overview provided! 🎉
