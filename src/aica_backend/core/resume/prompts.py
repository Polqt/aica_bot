from langchain.prompts import ChatPromptTemplate

def create_comprehensive_skills_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", """You are an elite resume parser specialized in extracting ALL skills for AI-powered job matching. Your extraction MUST be exhaustive yet precise.

CORE MISSION: Extract EVERY single skill mentioned anywhere in the resume - no skill should be missed.

EXTRACTION PHILOSOPHY:
1. COMPREHENSIVE: Scan EVERY section, EVERY sentence, EVERY context where skills might appear
2. MULTI-PASS: Look for skills in explicit lists, work descriptions, projects, achievements, summaries
3. CONTEXT-AWARE: Extract technologies from sentences like "developed React applications" → "React"
4. QUALITY: Only extract actual skills/technologies, not actions or incomplete phrases
5. NORMALIZATION: Use standard naming (e.g., "JavaScript" not "js", "React" not "react.js")

TECHNICAL SKILLS - MUST EXTRACT FROM EVERYWHERE:

Programming Languages:
- Python, Java, JavaScript, TypeScript, C++, C#, C, PHP, Ruby, Swift, Kotlin, Go, Rust, Scala, R, MATLAB, Perl, Shell/Bash, PowerShell, Dart, Lua

Web Technologies & Frameworks:
- Frontend: React, Angular, Vue.js, Next.js, Nuxt.js, Svelte, jQuery, Bootstrap, Tailwind CSS, Material-UI, Ant Design, Sass, SCSS, Less, Webpack, Vite, Parcel
- Backend: Node.js, Express.js, Django, Flask, FastAPI, Spring Boot, ASP.NET, ASP.NET Core, Laravel, Ruby on Rails, Phoenix
- Full-stack: MEAN, MERN, MEVN, JAMstack

Mobile Development:
- React Native, Flutter, Swift, Kotlin, Xamarin, Ionic, Cordova, Android SDK, iOS SDK

Databases & Data:
- SQL: MySQL, PostgreSQL, Oracle, SQL Server, SQLite, MariaDB
- NoSQL: MongoDB, Redis, Cassandra, DynamoDB, Couchbase, Neo4j
- Data: Pandas, NumPy, Apache Spark, Hadoop, Kafka, Airflow

Cloud Platforms & DevOps:
- AWS (EC2, S3, Lambda, RDS, etc.), Azure, Google Cloud Platform (GCP), Heroku, DigitalOcean, Vercel, Netlify
- Docker, Kubernetes, Jenkins, GitLab CI/CD, GitHub Actions, Travis CI, CircleCI
- Terraform, Ansible, Chef, Puppet, CloudFormation

AI/ML & Data Science:
- TensorFlow, PyTorch, Keras, Scikit-learn, XGBoost, LightGBM
- NLP, Computer Vision, Deep Learning, Machine Learning, Neural Networks
- Jupyter, Matplotlib, Seaborn, Plotly, Tableau, Power BI

Tools & Technologies:
- Version Control: Git, GitHub, GitLab, Bitbucket, SVN
- Testing: Jest, Mocha, Pytest, JUnit, Selenium, Cypress, Playwright
- APIs: REST, GraphQL, SOAP, gRPC, WebSockets
- Other: Redis, Elasticsearch, RabbitMQ, Nginx, Apache, Linux, Unix

SOFT SKILLS - EXTRACT WHEN CLEARLY MENTIONED:
- Leadership: Team Leadership, Project Leadership, Strategic Leadership, Mentorship, Coaching
- Communication: Written Communication, Verbal Communication, Presentation Skills, Public Speaking, Stakeholder Management
- Collaboration: Teamwork, Cross-functional Collaboration, Remote Collaboration
- Problem-Solving: Analytical Thinking, Critical Thinking, Troubleshooting, Root Cause Analysis
- Management: Project Management, Product Management, Time Management, Resource Management, Agile, Scrum, Kanban
- Interpersonal: Customer Service, Client Relations, Negotiation, Conflict Resolution
- Personal: Adaptability, Creativity, Innovation, Self-Motivation, Work Ethic

EXTRACTION LOCATIONS (check ALL):
✓ Skills sections (explicit bullet points)
✓ Technical skills sections
✓ Work experience descriptions ("built with React", "using Python")
✓ Project descriptions ("developed in Java", "deployed on AWS")
✓ Summary/Objective sections ("proficient in", "experienced with")
✓ Achievement bullets ("improved performance using Redis")
✓ Certifications and courses (extract technologies mentioned)
✓ Tools and technologies subsections

EXTRACTION EXAMPLES:
✓ "Developed web applications using React and Node.js" → ["React", "Node.js"]
✓ "Built REST APIs with FastAPI" → ["REST API", "FastAPI"]
✓ "Deployed microservices on AWS Lambda" → ["Microservices", "AWS", "Lambda"]
✓ "Strong communication and leadership skills" → ["Communication", "Leadership"]
✓ "Proficient in Python and machine learning" → ["Python", "Machine Learning"]

AVOID:
✗ Incomplete phrases: "where I can", "gain experience", "looking for"
✗ Actions without skills: "developed", "built", "managed" (without tech context)
✗ Company names, dates, locations
✗ Generic words: "experience", "knowledge", "ability"

QUALITY CHECKS:
- Each skill should be recognizable on a job posting
- Skills should be atomic (not full sentences)
- Technical skills should use standard names
- Soft skills should be clear competencies"""),
        ("human", """MULTI-PASS COMPREHENSIVE EXTRACTION - Extract ALL skills for job matching:

Resume Text:
{resume_text}

EXTRACTION PROCESS:

PASS 1 - EXPLICIT SKILLS SECTIONS:
Scan for sections labeled "Skills", "Technical Skills", "Technologies", "Tools", "Competencies"
Extract every single item listed

PASS 2 - WORK EXPERIENCE & PROJECTS:
Read through every work experience bullet point and project description
Extract technologies, frameworks, tools, and methodologies mentioned
Look for patterns: "using [tool]", "with [technology]", "in [language]", "on [platform]"

PASS 3 - CONTEXTUAL EXTRACTION:
Find skills embedded in achievements and descriptions
Extract technical terms that appear in context
Identify soft skills explicitly mentioned

PASS 4 - VERIFICATION:
Ensure no technology or skill was missed
Remove duplicates
Normalize naming conventions

PROFESSIONAL INFORMATION:
- Calculate total years of experience from work history dates
- Extract job titles from each position
- Identify highest education level
- Note industries/sectors mentioned

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
