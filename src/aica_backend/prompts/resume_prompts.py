from langchain_core.prompts import ChatPromptTemplate


def create_comprehensive_skills_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        (
            "system",
            """You are an expert resume parser focused on extracting ONLY the skills that the candidate has explicitly demonstrated or claimed to possess in their actual work experience, education, or skills sections.
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
            • Leadership: Team Leadership, Project Management, Mentoring
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
            - Just the raw JSON object matching the schema"""
        ),
        (
            "human",
            """Extract ONLY the skills that this candidate has ACTUALLY DEMONSTRATED or EXPLICITLY LISTED in their Skills, Experience, Projects, Education Coursework, or Summary sections.

            🚫 MANDATORY RULES:
            1. DO NOT extract skills that ONLY appear in certification/certificate names
            2. DO NOT extract skills from course titles or training programs
            3. DO NOT extract skills from degree names (unless in explicit skills/coursework section)
            4. DO NOT extract people's NAMES as skills - names are NOT skills!
            5. ONLY extract skills with EVIDENCE of actual usage or explicit listing
            
            ⚠️ NAME FILTER - CRITICAL:
            Before adding ANY skill to your list, ask: "Is this a person's name?"
            
            {resume_text}
            
            STRICT 4-STEP EXTRACTION PROCESS:
            STEP 1 - IDENTIFY SECTIONS TO EXCLUDE:
            - Certifications, courses, seminars, trainings, references → IGNORE
            
            STEP 2 - EXTRACT FROM VALID SECTIONS:
            - Skills section
            - Work experience (usage verbs only)
            - Projects
            - Coursework
            - Summary
            
            STEP 3 - FILTER OUT NAMES
            
            STEP 4 - CROSS-VERIFY
            
            ⚠️ CRITICAL OUTPUT FORMAT:
            - Return ONLY valid JSON
            - NO markdown, no comments
            - Just the raw JSON object
            
            {format_instructions}"""
        ),
    ])


def create_personal_info_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        (
            "system",
            """You are an expert at extracting personal and contact information from resumes of all styles and formats.

            EXTRACTION PRIORITIES:
            1. Full name (very top of resume)
            2. Contact information (phone, email, location)
            3. Professional profiles (LinkedIn, GitHub)
            
            NAME EXTRACTION RULES:
            - Look ONLY at the FIRST 5 LINES of the resume
            - First proper name is the applicant's name
            - Ignore names appearing later (references, etc.)
            
            CONTACT INFORMATION:
            - Phone
            - Email (single string, never array)
            - Location
            - LinkedIn"""
        ),
        (
            "human",
             """Extract personal and contact information from this resume.
            
            ⚠️ NAME MUST COME ONLY FROM FIRST 5 LINES.
            
            {resume_text}
            
            OUTPUT FORMAT:
            - ONLY valid JSON
            - No markdown
            - Email must be a SINGLE STRING
            
            {format_instructions}"""
        ),
    ])
