from langchain.prompts import ChatPromptTemplate

def create_comprehensive_skills_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", """You are an expert resume parser focused on extracting ONLY the skills that the candidate has explicitly demonstrated or claimed to possess.

⚠️ CRITICAL EXTRACTION RULES:

✅ EXTRACT SKILLS FROM THESE SECTIONS ONLY:
1. **Skills Section**: Any section explicitly labeled as "Skills", "Technical Skills", "Core Competencies", "Technologies", "Tools & Technologies"
2. **Work Experience**: Skills mentioned in job descriptions where the candidate actively used them ("developed with X", "implemented using Y", "managed Z systems")
3. **Projects**: Technologies and tools used in personal or professional projects
4. **Qualifications Summary**: Skills mentioned in profile/summary sections

❌ DO NOT EXTRACT SKILLS FROM:
- **Certifications**: Do NOT extract skills from certification names alone (e.g., "AWS Certified Developer" - only extract AWS if it's mentioned elsewhere in actual work experience or skills section)
- **Course Names**: Do NOT extract from training course titles or syllabi
- **Certificate Content**: Do NOT extract from descriptions of what a certificate covers
- **References**: Do NOT extract from reference sections
- **Education Course Lists**: Do NOT extract from lists of courses taken unless the skill is also mentioned in experience/projects
- **Implied Skills**: Do NOT infer skills that aren't explicitly stated

EXTRACTION GUIDELINES:
• Only extract skills the candidate has ACTUALLY USED or EXPLICITLY LISTED in their skills section
• Verify that technical skills appear in context of actual work, not just certifications
• For each skill extracted, it must be mentioned in at least one of: Skills section, Work experience description, or Projects
• When in doubt, DO NOT INCLUDE - we want accuracy over completeness

TECHNICAL SKILLS - Extract ONLY if explicitly mentioned in work/skills/projects:
• Programming languages: Python, JavaScript, Java, C++, Go, Rust, TypeScript, etc.
• Frameworks: React, Angular, Vue, Django, Flask, FastAPI, Spring Boot, Node.js, etc.
• Databases: MySQL, PostgreSQL, MongoDB, Redis, DynamoDB, Elasticsearch, etc.
• Cloud: AWS, Azure, GCP, and specific services (EC2, S3, Lambda, etc.) - ONLY if used in actual work
• DevOps: Docker, Kubernetes, Jenkins, GitHub Actions, CI/CD, Terraform, etc.
• Tools: Git, VS Code, Jira, Postman, npm, pip, Maven, etc.
• APIs: REST, GraphQL, gRPC, WebSocket, etc.

SOFT SKILLS - Extract ONLY if explicitly stated or clearly demonstrated:
• Leadership, Management, Team Leadership, Project Management
• Communication, Presentation, Technical Writing
• Collaboration, Teamwork, Cross-functional coordination
• Problem Solving, Analytical Thinking, Critical Thinking
• Time Management, Organization, Prioritization
• Adaptability, Flexibility, Learning Agility

QUALITY STANDARDS:
- Prefer ACCURACY over quantity
- Extract 8-20 technical skills for tech resumes (not 40+)
- Extract 5-10 soft skills
- Every skill must be verifiable in the resume text
- DO NOT hallucinate or assume skills"""),
        ("human", """Extract ONLY the skills that this candidate has explicitly demonstrated or listed in their Skills, Experience, Projects, or Qualifications sections.

DO NOT extract skills that only appear in:
- Certification names
- Course titles
- Training programs
- Certificate descriptions

{resume_text}

STRICT EXTRACTION PROCESS:
1. Identify the Skills/Technical Skills section → Extract all skills listed there
2. Read Work Experience → Extract skills ONLY where actively used (e.g., "built API with FastAPI", "managed AWS infrastructure")
3. Read Projects → Extract technologies ONLY if explicitly mentioned as used
4. Read Qualifications/Summary → Extract skills if explicitly stated
5. Cross-verify: Each skill must appear in at least one of the above contexts
6. Exclude: Any skill that only appears in certification names or course titles

EXAMPLE OF WHAT NOT TO EXTRACT:
- "AWS Certified Solutions Architect" → DO NOT extract AWS unless it's also in experience/skills
- "Java Programming Certificate" → DO NOT extract Java unless it's also in experience/skills
- "Completed course in Machine Learning" → DO NOT extract ML unless it's in actual work

EXAMPLE OF WHAT TO EXTRACT:
- Skills section lists "Python, React, PostgreSQL" → Extract these
- "Developed REST API using FastAPI and PostgreSQL" → Extract FastAPI, PostgreSQL, REST API
- "Led team of 5 engineers" → Extract Leadership, Team Management

Return a focused, accurate list of skills the candidate has actually demonstrated.

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
- Look at the VERY TOP of the resume (first 5-10 lines) - this is where the applicant's name appears
- The applicant's name is typically the FIRST prominent name in the document
- Names are typically 2-4 words with proper capitalization
- May include titles (Dr., Mr., Ms.) or suffixes (Jr., Sr., III)
- Could be in different formats or split across lines
- If multiple names appear, choose the one at the TOP of the resume
- IGNORE names in: reference sections, character references, recommendation sections, or contact references
- IGNORE names that appear after keywords like "reference:", "recommended by:", "character reference:", "contact person:"

CONTACT INFORMATION:
- Phone numbers in any format (+1, (555), 555-1234, etc.)
- Email addresses (any valid format)
- Location/City (current residence or general area)
- LinkedIn profiles (full URLs or @usernames)

Be thorough and handle various resume formats and styles."""),
        ("human", """Extract personal and contact information from this resume:

{resume_text}

EXTRACTION REQUIREMENTS:
- FULL NAME: Find the applicant's name from the VERY TOP of the resume (usually the first or second line)
  * This should be the resume owner's name, NOT a reference or contact person
  * Skip names that appear after "Reference:", "Character Reference:", "Recommended by:", etc.
- PHONE: Extract phone number in any format
- EMAIL: Find the email address
- LOCATION: Extract city/location information
- LINKEDIN: Find LinkedIn profile URL if present

Look carefully at the BEGINNING of the resume (first 10 lines) for the applicant's name, and scan all sections for contact information.
The name you extract should be the person whose resume this is, not anyone mentioned as a reference.

⚠️ CRITICAL OUTPUT FORMAT:
- Return ONLY valid JSON
- NO explanatory text before or after the JSON
- NO markdown code blocks
- NO comments or descriptions
- Just the raw JSON object matching the schema

{format_instructions}""")
    ])
