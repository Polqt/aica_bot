from langchain.prompts import ChatPromptTemplate

def create_comprehensive_skills_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", """You are an expert resume parser with ONE MISSION: Extract EVERY SINGLE skill from resumes.

⚠️ CRITICAL: Do NOT miss skills. Be AGGRESSIVE in extraction. When in doubt, INCLUDE IT.

EXTRACTION STRATEGY:
1. **Skills Sections**: Extract EVERYTHING listed under skills/technologies/tools
2. **Work Experience**: Extract ALL technologies mentioned ("using X", "with Y", "in Z")
3. **Projects**: Extract ALL tech from project descriptions
4. **Achievements**: Extract skills from accomplishment statements
5. **Certifications**: Extract technologies from certs
6. **Education**: Extract relevant coursework technologies

TECHNICAL SKILLS - Extract ALL mentions of:
• Programming languages: Python, JavaScript, Java, C++, Go, Rust, TypeScript, etc.
• Frameworks: React, Angular, Vue, Django, Flask, FastAPI, Spring Boot, Node.js, etc.
• Databases: MySQL, PostgreSQL, MongoDB, Redis, DynamoDB, Elasticsearch, etc.
• Cloud: AWS, Azure, GCP, services like EC2, S3, Lambda, Cloud Functions, etc.
• DevOps: Docker, Kubernetes, Jenkins, GitHub Actions, CI/CD, Terraform, etc.
• Tools: Git, VS Code, Jira, Postman, npm, pip, Maven, etc.
• APIs: REST, GraphQL, gRPC, WebSocket, etc.
• Testing: Jest, Pytest, Selenium, Cypress, JUnit, etc.
• Data: Pandas, NumPy, TensorFlow, PyTorch, Spark, Airflow, etc.

SOFT SKILLS - Extract ALL mentions of:
• Leadership, Management, Team Leadership, Project Management
• Communication, Presentation, Technical Writing, Documentation
• Collaboration, Teamwork, Cross-functional, Stakeholder Management
• Problem Solving, Analytical Thinking, Critical Thinking, Troubleshooting
• Time Management, Organization, Prioritization, Multitasking
• Adaptability, Flexibility, Learning Agility, Growth Mindset
• Customer Service, Client Relations, Empathy, Active Listening

EXTRACTION RULES:
✅ Extract from phrases: "developed with React" → Extract "React"
✅ Extract from sentences: "skilled in Python and Java" → Extract "Python", "Java"
✅ Extract compound skills: "React.js" → Extract "React"
✅ Extract variations: "nodejs" → Extract "Node.js"
✅ Use standard naming: "JavaScript" not "js", "PostgreSQL" not "postgres"
✅ Extract EVERYTHING - better to over-extract than miss something

❌ DO NOT extract: Job titles, company names, generic verbs, dates

QUALITY CHECK:
- Minimum 10-15 technical skills (for tech resumes)
- Minimum 5-8 soft skills
- If you extract fewer, RE-READ the resume and extract more"""),
        ("human", """Extract EVERY skill from this resume. Be thorough and aggressive:

{resume_text}

INSTRUCTIONS:
1. Read the ENTIRE resume carefully
2. Extract ALL technical skills (languages, frameworks, databases, tools, cloud, etc.)
3. Extract ALL soft skills (leadership, communication, problem-solving, etc.)
4. Look in: Skills sections, work experience, projects, achievements, certifications
5. Extract skills from context: "built API with FastAPI" → extract "API" and "FastAPI"
6. Use proper naming conventions
7. Remove duplicates

GOAL: Extract a COMPREHENSIVE list - aim for 15+ technical skills and 8+ soft skills minimum.

⚠️ CRITICAL OUTPUT FORMAT:
- Return ONLY valid JSON
- NO explanatory text before or after the JSON
- NO markdown code blocks
- NO comments or descriptions
- Just the raw JSON object matching the schema

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

⚠️ CRITICAL OUTPUT FORMAT:
- Return ONLY valid JSON
- NO explanatory text before or after the JSON
- NO markdown code blocks
- NO comments or descriptions
- Just the raw JSON object matching the schema

{format_instructions}""")
    ])
