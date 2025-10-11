from langchain.prompts import ChatPromptTemplate

def create_comprehensive_skills_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", """You are an expert resume parser. Your task: Extract EVERY skill mentioned in the resume.

CRITICAL RULE: Extract ALL skills - technical AND soft skills. No skill should be missed.

EXTRACTION RULES:
1. Extract from EVERYWHERE: Skills sections, work experience, projects, achievements, summaries
2. Extract skills from context: "developed React app" → "React", "using Python" → "Python"
3. Use standard names: "JavaScript" not "js", "React" not "react.js"
4. Extract ONLY actual skills, not actions or generic words

WHAT TO EXTRACT:
- ALL programming languages (Python, Java, JavaScript, C++, etc.)
- ALL frameworks & libraries (React, Django, Spring, FastAPI, etc.)
- ALL databases (MySQL, MongoDB, PostgreSQL, Redis, etc.)
- ALL cloud platforms (AWS, Azure, GCP, etc.)
- ALL tools (Git, Docker, Kubernetes, Jenkins, etc.)
- ALL soft skills explicitly mentioned (Leadership, Communication, Teamwork, etc.)

WHERE TO LOOK:
- Skills sections
- Work experience ("built with X", "using Y")
- Projects ("developed in Z")
- Achievements ("improved with A")
- Certifications

EXAMPLES:
"Developed web apps using React and Node.js" → Extract: React, Node.js
"Built REST APIs with FastAPI" → Extract: REST API, FastAPI
"Strong leadership and communication" → Extract: Leadership, Communication

DO NOT EXTRACT:
- Actions only: "developed", "built", "managed"
- Generic words: "experience", "knowledge"
- Company names or dates"""),
        ("human", """Extract ALL skills from this resume:

{resume_text}

INSTRUCTIONS:
1. Extract EVERY skill mentioned (technical AND soft skills)
2. Check skills sections, work history, projects, achievements, certifications
3. Extract skills from context (e.g., "built with React" → extract "React")
4. Remove duplicates and use standard naming

{format_instructions}""")
    ])


def create_personal_info_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", """You are an expert at extracting personal and contact information from resumes of all styles and formats.

EXTRACTION PRIORITIES:
1. Full name - usually at the very top of the resume
2. Contact information - phone, email, location
3. Professional profiles - LinkedIn, GitHub, etc.

NAME EXTRACTION RULES:
- Look at the top 3-5 lines of the resume first
- Names are typically 2-4 words with proper capitalization
- May include titles (Dr., Mr., Ms.) or suffixes (Jr., Sr., III)
- Could be in different formats or split across lines
- Choose the most complete name if multiple found

CONTACT INFORMATION:
- Phone numbers in any format (+1, (555), 555-1234, etc.)
- Email addresses (any valid format)
- Location/City (current residence or general area)
- LinkedIn profiles (full URLs or @usernames)

Be thorough and handle various resume formats and styles."""),
        ("human", """Extract personal and contact information from this resume:

{resume_text}

EXTRACTION REQUIREMENTS:
- FULL NAME: Find the person's complete name from the resume header
- PHONE: Extract phone number in any format
- EMAIL: Find the email address
- LOCATION: Extract city/location information
- LINKEDIN: Find LinkedIn profile URL if present

Look carefully at the beginning of the resume for the name, and scan all sections for contact information.

{format_instructions}""")
    ])
