from langchain.prompts import ChatPromptTemplate

def create_comprehensive_skills_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", """You are an expert resume parser focused on extracting ONLY the skills that the candidate has explicitly demonstrated or claimed to possess in their actual work experience, education, or skills sections.

⚠️ CRITICAL EXTRACTION RULES - READ CAREFULLY:

✅ EXTRACT SKILLS FROM THESE SECTIONS ONLY:
1. **Skills Section**: Any section explicitly labeled as "Skills", "Technical Skills", "Core Competencies", "Technologies", "Tools & Technologies", "Proficiencies", "Expertise"
2. **Work Experience**: Skills mentioned where the candidate ACTIVELY USED them with action verbs:
   - "developed with Python", "implemented React application", "managed AWS infrastructure"
   - "utilized Java for...", "created using Node.js", "designed with Figma"
   - "maintained MySQL databases", "deployed Docker containers"
3. **Projects Section**: Technologies explicitly used in personal or professional projects
4. **Education**: ONLY if specific technical coursework is mentioned (e.g., "Completed coursework in Machine Learning, Data Structures")
5. **Qualifications Summary/Profile**: Skills mentioned in summary sections where candidate claims proficiency

❌ ABSOLUTELY DO NOT EXTRACT SKILLS FROM:
- **Certifications/Certificates**: NEVER extract skills just because they appear in certification names
  - Example: "AWS Certified Solutions Architect" → DO NOT extract "AWS" from this alone
  - Example: "Java Programming Certificate" → DO NOT extract "Java" from this alone
  - Example: "Google Cloud Professional Certificate" → DO NOT extract "Google Cloud" from this alone
  - Only extract if the skill ALSO appears in work experience, projects, or skills section
- **Course Names/Training Titles**: Do NOT extract from course or training program names
- **Seminars/Workshops/Trainings**: Do NOT extract skills from seminar, workshop, or training attendance
  - Example: "Attended Python Programming Seminar" → DO NOT extract "Python" from this alone
  - Example: "Workshop on Machine Learning" → DO NOT extract "Machine Learning" from this alone
  - Example: "Training: Advanced JavaScript" → DO NOT extract "JavaScript" from this alone
  - Only extract if the skill ALSO appears in work experience, projects, or skills section
- **Certificate Descriptions**: Do NOT extract from what the certificate covers
- **References Section**: Do NOT extract from reference information or reference names
- **Education Degree Names**: Do NOT extract from degree titles unless in explicit skills/coursework section
- **Implied/Inferred Skills**: Do NOT guess skills that aren't explicitly stated
- **Tools mentioned in passing**: Only extract if there's evidence of actual usage
- **Soft skills without evidence**: Do NOT extract soft skills unless clearly demonstrated in experience

⚠️ NAME EXTRACTION - CRITICAL WARNING:
- DO NOT extract people's NAMES as skills (e.g., "John Smith", "Mary Johnson")
- Names are typically 2-4 capitalized words and should NEVER be in the skills list
- If you see a proper name (capitalized first and last name), it's NOT a skill
- Double-check: Does this look like a person's name? If yes, exclude it

⚠️ VERIFICATION REQUIREMENT (MANDATORY):
For EACH skill you consider extracting, verify it meets ONE of these criteria:
✓ Appears in a "Skills" or "Technical Skills" or "Core Competencies" section
✓ Appears in work experience with action verbs showing actual usage (developed, built, implemented, used, managed, deployed, created, designed, maintained, utilized)
✓ Appears in a project description showing actual application  
✓ Explicitly stated in summary/profile section as a claimed skill
✓ Listed in education as specific completed coursework

STRICT QUALITY STANDARDS:
- Prefer ACCURACY and PRECISION over quantity
- Extract 8-25 technical skills for tech resumes (NOT 40+)
- Extract 5-10 soft skills (only if clearly demonstrated with examples)
- Every skill MUST be verifiable in resume text through actual usage or explicit listing
- If in doubt, DO NOT INCLUDE the skill
- Exclude any proper names (people's names) from the skills list

EXAMPLES OF CORRECT EXTRACTION:

✅ EXTRACT:
- Skills section: "Python, React, PostgreSQL, Leadership" → Extract all
- Work: "Developed REST APIs using FastAPI and PostgreSQL" → Extract: FastAPI, PostgreSQL, REST API
- Work: "Led team of 5 engineers in agile environment" → Extract: Leadership, Team Management, Agile
- Project: "Built mobile app with React Native and Firebase" → Extract: React Native, Mobile Development, Firebase
- Education: "Relevant Coursework: Data Structures, Machine Learning, Database Systems" → Extract: Data Structures, Machine Learning, Database Systems

❌ DO NOT EXTRACT:
- "AWS Certified Developer Associate" → DON'T extract AWS (unless also in experience/skills)
- "Completed Java Programming course" → DON'T extract Java (unless also in experience/skills)  
- "Certificate in Machine Learning - Coursera" → DON'T extract ML (unless also in experience/skills)
- "Character Reference: Dr. John Smith, Professor" → DON'T extract "John Smith" or "Professor"
- "Bachelor of Science in Computer Science" → DON'T extract "Computer Science" (unless in skills section)
- Certification lists at bottom of resume → SKIP ENTIRELY unless skills also appear in work/skills sections

TECHNICAL SKILLS - Extract ONLY if explicitly mentioned in work/skills/projects:
• Programming Languages: Python, JavaScript, Java, C++, TypeScript, Go, PHP, Ruby, etc.
• Web Frameworks: React, Angular, Vue, Django, Flask, FastAPI, Spring Boot, Node.js, Express, etc.
• Mobile: React Native, Flutter, Swift, Kotlin, iOS Development, Android Development
• Databases: MySQL, PostgreSQL, MongoDB, Redis, DynamoDB, Oracle, SQL Server, etc.
• Cloud Platforms: AWS, Azure, GCP (and specific services like EC2, S3, Lambda) - ONLY if used in actual work
• DevOps/Tools: Docker, Kubernetes, Jenkins, CI/CD, Terraform, Git, GitHub, GitLab, etc.
• Data & Analytics: Data Analysis, Machine Learning, TensorFlow, Pandas, NumPy, Tableau, Power BI
• Design: UI/UX Design, Figma, Adobe XD, Photoshop, Graphic Design

SOFT SKILLS - Extract ONLY if explicitly stated or clearly demonstrated with examples:
• Leadership: Team Leadership, Project Management, Mentoring (must have led teams/projects)
• Communication: Technical Writing, Presentation, Public Speaking, Stakeholder Management
• Collaboration: Teamwork, Cross-functional Coordination, Agile/Scrum participation
• Problem Solving: Analytical Thinking, Troubleshooting, Critical Thinking
• Project Management: Planning, Coordination, Time Management

⚠️ CRITICAL OUTPUT FORMAT:
- Return ONLY valid JSON
- NO explanatory text before or after the JSON  
- NO markdown code blocks
- NO comments or descriptions
- NO people's names in the skills list
- Just the raw JSON object matching the schema"""),
        ("human", """Extract ONLY the skills that this candidate has ACTUALLY DEMONSTRATED or EXPLICITLY LISTED in their Skills, Experience, Projects, Education Coursework, or Summary sections.

🚫 MANDATORY RULES:
1. DO NOT extract skills that ONLY appear in certification/certificate names
2. DO NOT extract skills from course titles or training programs  
3. DO NOT extract skills from degree names (unless in explicit skills/coursework section)
4. DO NOT extract people's NAMES as skills - names are NOT skills!
5. ONLY extract skills with EVIDENCE of actual usage or explicit listing

⚠️ NAME FILTER - CRITICAL:
Before adding ANY skill to your list, ask: "Is this a person's name?"
- Examples of NAMES to EXCLUDE: "John Smith", "Dr. Maria Garcia", "Prof. David Lee"
- Names have 2-4 capitalized words and are typically in References or Education sections
- If it looks like a person's full name, DO NOT include it in skills

VERIFICATION CHECKLIST (use this for EACH skill):
□ Does it appear in a Skills/Technical Skills/Core Competencies section? OR
□ Does it appear in work experience with usage verbs (developed, built, created, managed, etc.)? OR  
□ Does it appear in a project with actual application? OR
□ Is it listed in education as completed coursework? OR
□ Is it explicitly stated in profile/summary as a claimed skill?
□ Is it definitely NOT a person's name?

If you can't check at least ONE box from the first 5 AND the last box, DO NOT EXTRACT that skill.

{resume_text}

STRICT 4-STEP EXTRACTION PROCESS:

STEP 1 - IDENTIFY SECTIONS TO EXCLUDE:
- Locate Certifications/Certificates section → IGNORE THIS ENTIRELY for skill extraction
- Locate Training/Courses section → IGNORE THIS ENTIRELY for skill extraction
- Locate Seminars/Workshops section → IGNORE THIS ENTIRELY for skill extraction
- Locate "Trainings Attended" or "Seminars Attended" → IGNORE THIS ENTIRELY
- Locate References section → IGNORE THIS ENTIRELY (contains people's names, not skills)
- Locate degree titles in Education → IGNORE unless coursework is listed

STEP 2 - EXTRACT FROM VALID SECTIONS ONLY:
- Skills/Technical Skills/Core Competencies section → Extract ALL listed skills
- Work Experience → Extract skills ONLY with usage verbs (built, developed, managed, created, implemented, designed, maintained, utilized, etc.)
- Projects → Extract technologies ONLY if explicitly mentioned as used
- Education Coursework → Extract ONLY if specific courses are listed (e.g., "Coursework: Machine Learning, Data Structures")
- Summary/Profile → Extract skills if explicitly claimed with confidence

STEP 3 - FILTER OUT NAMES (CRITICAL):
- Review your extracted list
- Remove ANY item that looks like a person's name (2-4 capitalized words, especially from References)
- Examples to remove: "John Doe", "Dr. Smith", "Professor Garcia", "Mary Johnson"

STEP 4 - CROSS-VERIFY (MANDATORY):
- Review your list: Is each skill backed by evidence of actual use or explicit listing?
- Remove any skill that only appears in certification/degree names
- Remove any skill without verification from Step 2
- Ensure no people's names made it through

FINAL QUALITY CHECK:
- Technical skills: 8-25 items (focused, not exhaustive)
- Soft skills: 5-10 items (only if demonstrated with examples)
- NO people's names in the list
- Every skill verifiable in resume text
- Zero skills extracted solely from certifications or degree names

Return a focused, accurate list of skills with EVIDENCE of actual use or explicit listing, and NO people's names.

⚠️ CRITICAL OUTPUT FORMAT:
- Return ONLY valid JSON
- NO explanatory text before or after the JSON
- NO markdown code blocks  
- NO comments or descriptions
- NO people's names
- Just the raw JSON object matching the schema

{format_instructions}""")
    ])


def create_personal_info_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", """You are an expert at extracting personal and contact information from resumes of all styles and formats (including Harvard, Chronological, Functional, Combination, and Modern formats).

EXTRACTION PRIORITIES:
1. Full name - usually at the very top of the resume
2. Contact information - phone, email, location
3. Professional profiles - LinkedIn, GitHub, etc.

NAME EXTRACTION RULES (CRITICAL):
- Look ONLY at the VERY TOP of the resume (first 300-500 characters / first 3-5 lines)
- The applicant's name is ALWAYS the FIRST prominent name at the top of the document
- Names are typically 2-4 words with proper capitalization
- May include titles (Dr., Mr., Ms.) or suffixes (Jr., Sr., III)
- Could be in different formats or split across lines (especially in Harvard format)
- DO NOT look for names anywhere else in the document after the header

❌ CRITICAL - DO NOT EXTRACT NAMES FROM:
- ANYWHERE after line 10 of the resume
- Reference sections (usually at bottom)
- Character reference sections
- Recommendation sections
- Professional references
- Contact person sections
- After keywords: "reference:", "recommended by:", "character reference:", "contact person:", "referee:", "provided by:"
- Names preceded by "Dr.", "Prof.", "Atty." that appear later in document (likely references)

✅ CORRECT NAME EXTRACTION PATTERN:
1. Read ONLY the top 500 characters (first 5 lines)
2. Find the first 2-4 word proper name with capital letters
3. This is the applicant's name - STOP looking for names
4. Ignore ALL other names in the rest of the document

CONTACT INFORMATION:
- Phone numbers in any format (+1, (555), 555-1234, etc.)
- Email addresses (any valid format)  
- Location/City (current residence or general area)
- LinkedIn profiles (full URLs or @usernames)

SPECIAL FORMAT HANDLING:
- Harvard Format: Name may be centered or split across lines with contact info
- Modern Format: Name may be in large font at top with contact below
- Traditional Format: Name is typically first line, contact info second line

Be thorough and handle various resume formats and styles."""),
        ("human", """Extract personal and contact information from this resume.

⚠️ CRITICAL INSTRUCTION FOR NAME EXTRACTION:
ONLY look at the FIRST 5 LINES for the applicant's name. The name you extract MUST be from the very top of the resume (first 500 characters). DO NOT extract any names that appear later in the document (e.g., in reference sections).

{resume_text}

STRICT EXTRACTION PROCESS:
1. NAME: Extract ONLY from the first 5 lines at the VERY TOP of the resume
   - This should be the resume owner's name appearing first in the document
   - Format: Usually 2-4 words, properly capitalized
   - Completely IGNORE any other names appearing anywhere else in the resume
   
2. CONTACT INFO: Scan the entire resume for:
   - PHONE: Phone number in any format (return as single string)
   - EMAIL: Email address (if multiple emails found, return ONLY the FIRST/PRIMARY email as a single string, NOT an array)
   - LOCATION: City/location information
   - LINKEDIN: LinkedIn profile URL if present

⚠️ CRITICAL EMAIL EXTRACTION RULE:
- Email MUST be a single string value, NOT an array
- If multiple emails are found, choose the FIRST/PRIMARY one ONLY
- Example: If you find "email1@example.com" and "email2@example.com", return ONLY "email1@example.com"
- Format: "email": "single.email@example.com" (NOT ["email1", "email2"])

VALIDATION:
- If you find a name after line 10, it's WRONG - go back to the top 5 lines
- If the name appears near words like "reference", "character reference", or "recommended by", it's WRONG
- The correct name is ALWAYS in the first 5 lines at the top
- Email must be a STRING, not an ARRAY

⚠️ CRITICAL OUTPUT FORMAT:
- Return ONLY valid JSON
- NO explanatory text before or after the JSON
- NO markdown code blocks
- NO comments or descriptions
- Just the raw JSON object matching the schema
- ENSURE "email" field is a STRING, not an array

{format_instructions}""")
    ])
