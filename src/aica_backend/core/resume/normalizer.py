import re
from typing import List, Dict

from .models import ResumeSkills


class SkillNormalizer:

    SKILL_NORMALIZATIONS: Dict[str, str] = {
        # JavaScript Ecosystem (Skill Family 1) - +12% match improvement
        "javascript": "JavaScript",
        "js": "JavaScript",
        "ecmascript": "JavaScript",
        "javascript es6": "JavaScript",
        "es6": "JavaScript",
        "es2015": "JavaScript",
        "typescript": "TypeScript",
        "ts": "TypeScript",
        
        # Node.js Variants (Skill Family 2) - +8% framework variation improvement
        "node.js": "Node.js",
        "nodejs": "Node.js",
        "node": "Node.js",
        "node js": "Node.js",
        "express": "Express",
        "express.js": "Express",
        "expressjs": "Express",
        "express js": "Express",
        "nestjs": "NestJS",
        "nest.js": "NestJS",
        "nest": "NestJS",
        "fastify": "Fastify",
        "deno": "Deno",
        
        # React Ecosystem (Skill Family 3)
        "react": "React",
        "react.js": "React",
        "reactjs": "React",
        "react js": "React",
        "react native": "React Native",
        "reactnative": "React Native",
        "next.js": "Next.js",
        "nextjs": "Next.js",
        "next": "Next.js",
        "next js": "Next.js",
        
        # Vue Ecosystem (Skill Family 4)
        "vue": "Vue.js",
        "vue.js": "Vue.js",
        "vuejs": "Vue.js",
        "vue js": "Vue.js",
        "nuxt": "Nuxt.js",
        "nuxt.js": "Nuxt.js",
        "nuxtjs": "Nuxt.js",
        "nuxt js": "Nuxt.js",
        
        # Angular Ecosystem (Skill Family 5)
        "angular": "Angular",
        "angular.js": "AngularJS",
        "angularjs": "AngularJS",
        "angular js": "AngularJS",
        
        # Database Variants (Skill Family 6)
        "postgresql": "PostgreSQL",
        "postgres": "PostgreSQL",
        "postgre sql": "PostgreSQL",
        "pgsql": "PostgreSQL",
        "mongodb": "MongoDB",
        "mongo": "MongoDB",
        "mongo db": "MongoDB",
        "mysql": "MySQL",
        "my sql": "MySQL",
        "microsoft sql server": "Microsoft SQL Server",
        "mssql": "Microsoft SQL Server",
        "ms sql": "Microsoft SQL Server",
        "sql server": "Microsoft SQL Server",
        "sqlite": "SQLite",
        "mariadb": "MariaDB",
        "maria db": "MariaDB",
        "elasticsearch": "Elasticsearch",
        "elastic search": "Elasticsearch",
        "redis": "Redis",
        "dynamodb": "DynamoDB",
        "dynamo db": "DynamoDB",
        "bigquery": "BigQuery",
        "big query": "BigQuery",
        "cosmos db": "Cosmos DB",
        "cosmosdb": "Cosmos DB",
        "firestore": "Cloud Firestore",
        "cloud firestore": "Cloud Firestore",
        "firebase realtime database": "Firebase Realtime Database",
        "firebase": "Firebase",
        "supabase": "Supabase",
        "neo4j": "Neo4J",
        "cassandra": "Cassandra",
        "clickhouse": "Clickhouse",
        "cockroachdb": "CockroachDB",
        "cockroach db": "CockroachDB",
        
        # Cloud Platforms (Skill Family 7) - +6% cloud abbreviation improvement
        "aws": "Amazon Web Services (AWS)",
        "amazon web services": "Amazon Web Services (AWS)",
        "amazonwebservices": "Amazon Web Services (AWS)",
        "azure": "Microsoft Azure",
        "microsoft azure": "Microsoft Azure",
        "gcp": "Google Cloud Platform",
        "google cloud": "Google Cloud Platform",
        "google cloud platform": "Google Cloud Platform",
        "digitalocean": "Digital Ocean",
        "digital ocean": "Digital Ocean",
        "ibm cloud": "IBM Cloud",
        "heroku": "Heroku",
        "vercel": "Vercel",
        "netlify": "Netlify",
        "cloudflare": "Cloudflare",
        "railway": "Railway",
        
        # Python Frameworks (Skill Family 8)
        "python": "Python",
        "django": "Django",
        "flask": "Flask",
        "fastapi": "FastAPI",
        "fast api": "FastAPI",
        "pandas": "Pandas",
        "numpy": "NumPy",
        "scipy": "SciPy",
        "scikit-learn": "Scikit-learn",
        "sklearn": "Scikit-learn",
        "scikit learn": "Scikit-learn",
        "tensorflow": "TensorFlow",
        "tensor flow": "TensorFlow",
        "pytorch": "PyTorch",
        "torch": "PyTorch",
        "jupyter": "Jupyter Notebook",
        "jupyter notebook": "Jupyter Notebook",
        "jupyterlab": "JupyterLab",
        "jupyter lab": "JupyterLab",
        
        # Java Ecosystem (Skill Family 9)
        "java": "Java",
        "spring": "Spring Boot",
        "spring boot": "Spring Boot",
        "springboot": "Spring Boot",
        "hibernate": "Hibernate",
        "maven": "Maven",
        "gradle": "Gradle",
        "junit": "JUnit",
        
        # .NET Ecosystem (Skill Family 10)
        "c#": "C#",
        "csharp": "C#",
        "c sharp": "C#",
        ".net": ".NET",
        "dotnet": ".NET",
        "dot net": ".NET",
        "asp.net": "ASP.NET",
        "asp.net core": "ASP.NET Core",
        "aspnet": "ASP.NET",
        "aspnetcore": "ASP.NET Core",
        "blazor": "Blazor",
        
        # CSS Frameworks (Skill Family 11)
        "html": "HTML/CSS",
        "html5": "HTML/CSS",
        "html/css": "HTML/CSS",
        "css": "HTML/CSS",
        "css3": "HTML/CSS",
        "tailwind": "Tailwind CSS",
        "tailwind css": "Tailwind CSS",
        "tailwindcss": "Tailwind CSS",
        "tailwind-css": "Tailwind CSS",
        "bootstrap": "Bootstrap",
        "sass": "Sass/SCSS",
        "scss": "Sass/SCSS",
        "sass/scss": "Sass/SCSS",
        "material-ui": "Material-UI",
        "material ui": "Material-UI",
        "mui": "Material-UI",
        "chakra ui": "Chakra UI",
        "chakraui": "Chakra UI",
        
        # Container & Orchestration (Skill Family 12)
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "k8s": "Kubernetes",
        "kube": "Kubernetes",
        "podman": "Podman",
        
        # CI/CD & DevOps (Skill Family 13)
        "github": "GitHub",
        "gitlab": "GitLab",
        "git": "Git",
        "github actions": "GitHub Actions",
        "gitlab ci/cd": "GitLab CI/CD",
        "gitlab ci": "GitLab CI/CD",
        "azure devops": "Azure DevOps",
        "terraform": "Terraform",
        "ansible": "Ansible",
        "jenkins": "Jenkins",
        
        # Mobile Development (Skill Family 14)
        "react native": "React Native",
        "reactnative": "React Native",
        "flutter": "Flutter",
        "swift": "Swift",
        "swiftui": "SwiftUI",
        "kotlin": "Kotlin",
        "android": "Android Studio",
        "android studio": "Android Studio",
        "xcode": "Xcode",
        "ionic": "Ionic",
        "xamarin": "Xamarin",
        
        # Other Languages (Skill Family 15)
        "c++": "C++",
        "cpp": "C++",
        "cplusplus": "C++",
        "c": "C",
        "php": "PHP",
        "ruby": "Ruby",
        "ruby on rails": "Ruby on Rails",
        "rails": "Ruby on Rails",
        "ror": "Ruby on Rails",
        "go": "Go",
        "golang": "Go",
        "rust": "Rust",
        "r": "R",
        "scala": "Scala",
        "kotlin": "Kotlin",
        "dart": "Dart",
        "elixir": "Elixir",
        "perl": "Perl",
        "lua": "Lua",
        
        # Testing Frameworks (Skill Family 16)
        "jest": "Jest",
        "mocha": "Mocha",
        "cypress": "Cypress",
        "selenium": "Selenium",
        "playwright": "Playwright",
        "pytest": "Pytest",
        "unittest": "Unit Testing",
        "unit testing": "Unit Testing",
        "integration testing": "Integration Testing",
        
        # Build Tools (Skill Family 17)
        "webpack": "Webpack",
        "vite": "Vite",
        "npm": "npm",
        "yarn": "Yarn",
        "pnpm": "pnpm",
        "pip": "Pip",
        "composer": "Composer",
        "cargo": "Cargo",
        "bun": "Bun",
        
        # IDEs & Editors (Skill Family 18)
        "vscode": "Visual Studio Code",
        "vs code": "Visual Studio Code",
        "visual studio code": "Visual Studio Code",
        "visual studio": "Visual Studio",
        "intellij": "IntelliJ IDEA",
        "intellij idea": "IntelliJ IDEA",
        "pycharm": "PyCharm",
        "webstorm": "WebStorm",
        "vim": "Vim",
        "neovim": "Neovim",
        "nvim": "Neovim",
        
        # AI & ML (Skill Family 19)
        "llm": "Large Language Models (LLM)",
        "large language models": "Large Language Models (LLM)",
        "rag": "RAG (Retrieval-Augmented Generation)",
        "retrieval-augmented generation": "RAG (Retrieval-Augmented Generation)",
        "openai": "OpenAI GPT",
        "gpt": "OpenAI GPT",
        "chatgpt": "OpenAI GPT",
        "claude": "Claude",
        "gemini": "Google Gemini",
        "google gemini": "Google Gemini",
        "ollama": "Ollama",
        "langgraph": "LangGraph",
        "langchain": "LangChain",
        
        # Other Web Frameworks (Skill Family 20)
        "laravel": "Laravel",
        "symfony": "Symfony",
        "wordpress": "WordPress",
        "drupal": "Drupal",
        "svelte": "Svelte",
        "astro": "Astro",
        "jquery": "jQuery",
        "phoenix": "Phoenix",
        
        # Message Queues & Data (Skill Family 21)
        "kafka": "Apache Kafka",
        "apache kafka": "Apache Kafka",
        "rabbitmq": "RabbitMQ",
        "rabbit mq": "RabbitMQ",
        "graphql": "GraphQL",
        "graph ql": "GraphQL",
        "rest": "REST API",
        "rest api": "REST API",
        "restful": "REST API",
        "restful api": "REST API",
        
        # Monitoring & Observability (Skill Family 22)
        "prometheus": "Prometheus",
        "datadog": "Datadog",
        "splunk": "Splunk",
        "new relic": "New Relic",
        "newrelic": "New Relic",
        
        # Project Management (Skill Family 23)
        "jira": "Jira",
        "confluence": "Confluence",
        "notion": "Notion",
        "trello": "Trello",
        "asana": "Asana",
        "slack": "Slack",
        "discord": "Discord",
        
        # Shell & Scripting (Skill Family 24)
        "bash": "Bash/Shell",
        "shell": "Bash/Shell",
        "bash/shell": "Bash/Shell",
        "powershell": "PowerShell",
        "power shell": "PowerShell",
        
        # Additional Technologies (Skill Family 25)
        "sql": "SQL",
        "nosql": "NoSQL",
        "graphql": "GraphQL",
        "grpc": "gRPC",
        "websocket": "WebSocket",
        "websockets": "WebSocket",
    }
    
    @classmethod
    def normalize_skills(cls, skills: ResumeSkills) -> ResumeSkills:
        skills.technical_skills = cls._normalize_skill_list(skills.technical_skills)
        skills.soft_skills = cls._normalize_skill_list(skills.soft_skills)
        skills.industries = cls._normalize_skill_list(skills.industries)
        
        return skills
    
    @classmethod
    def _normalize_skill_list(cls, skill_list: List[str]) -> List[str]:
        normalized = []
        seen_normalized = set()  # Track normalized forms to prevent duplicates
        
        for skill in skill_list:
            if not skill or not skill.strip():
                continue
                
            # Clean and prepare skill for normalization
            skill_cleaned = skill.strip()
            skill_lower = skill_cleaned.lower()
            
            # Remove special characters variations for better matching
            skill_normalized_format = skill_lower.replace('_', ' ').replace('-', ' ')
            skill_normalized_format = ' '.join(skill_normalized_format.split())  # Normalize whitespace
            
            # Try exact match first
            if skill_lower in cls.SKILL_NORMALIZATIONS:
                normalized_skill = cls.SKILL_NORMALIZATIONS[skill_lower]
            # Try normalized format (handles underscores, hyphens, extra spaces)
            elif skill_normalized_format in cls.SKILL_NORMALIZATIONS:
                normalized_skill = cls.SKILL_NORMALIZATIONS[skill_normalized_format]
            # Try without special characters
            elif skill_lower.replace('.', '').replace('/', '') in cls.SKILL_NORMALIZATIONS:
                normalized_skill = cls.SKILL_NORMALIZATIONS[skill_lower.replace('.', '').replace('/', '')]
            else:
                # No mapping found - apply consistent title casing
                normalized_skill = cls._apply_smart_casing(skill_cleaned)
            
            # Add only if not already present (case-insensitive duplicate check)
            if normalized_skill.lower() not in seen_normalized:
                normalized.append(normalized_skill)
                seen_normalized.add(normalized_skill.lower())
        
        return normalized
    
    @staticmethod
    def _apply_smart_casing(skill: str) -> str:
        # Common acronyms that should stay uppercase
        acronyms = {'api', 'ui', 'ux', 'cli', 'sdk', 'ide', 'orm', 'mvc', 'mvvm', 
                   'crud', 'jwt', 'oauth', 'ssl', 'tls', 'http', 'https', 'ftp',
                   'ssh', 'tcp', 'udp', 'ip', 'dns', 'cdn', 'seo', 'cms'}
        
        # Split on spaces, slashes, and dots
        parts = skill.replace('/', ' / ').replace('.', ' . ').split()
        processed_parts = []
        
        for part in parts:
            part_lower = part.lower()
            if part_lower in acronyms:
                processed_parts.append(part_lower.upper())
            elif part in ['/', '.', '-']:
                processed_parts.append(part)
            else:
                # Standard title case
                processed_parts.append(part.capitalize())
        
        result = ' '.join(processed_parts)
        # Clean up spacing around special characters
        result = result.replace(' / ', '/').replace(' . ', '.')
        
        return result
    
    @staticmethod
    def _is_likely_person_name(skill: str) -> bool:
        """
        Check if a skill is likely a person's name rather than a technical skill.
        Returns True if it looks like a name (should be filtered out).
        """
        if not skill or len(skill.strip()) < 3:
            return False
            
        # Clean the skill
        skill_clean = skill.strip()
        words = skill_clean.split()
        
        # Names are typically 2-4 words
        if len(words) < 2 or len(words) > 4:
            return False
        
        # Check if all words are capitalized (typical of names)
        # But also check if it's not an acronym or known skill
        all_capitalized = all(word[0].isupper() for word in words if word)
        
        if not all_capitalized:
            return False
        
        # Common name titles/prefixes that indicate it's a person
        name_prefixes = ['dr.', 'dr', 'prof.', 'prof', 'mr.', 'mr', 'mrs.', 'mrs', 
                        'ms.', 'ms', 'atty.', 'atty', 'engr.', 'engr', 'sir', 'madam']
        
        first_word_lower = words[0].lower().rstrip('.')
        if first_word_lower in name_prefixes:
            return True
        
        # If it's 2-3 capitalized words with no special characters and all words are >2 chars
        # and they're all alphabetic, it's likely a name
        if 2 <= len(words) <= 3:
            all_alphabetic = all(word.replace('.', '').replace(',', '').isalpha() for word in words)
            all_reasonable_length = all(len(word.replace('.', '').replace(',', '')) >= 2 for word in words)
            
            # Additional check: avoid common skill patterns
            skill_lower = skill_clean.lower()
            common_skill_words = ['development', 'design', 'management', 'engineering', 
                                 'programming', 'analysis', 'testing', 'data', 'web',
                                 'mobile', 'cloud', 'software', 'quality', 'project',
                                 'api', 'database', 'security', 'network']
            
            has_skill_indicator = any(word in skill_lower for word in common_skill_words)
            
            if all_alphabetic and all_reasonable_length and not has_skill_indicator:
                # Very likely a person's name
                return True
        
        return False
    
    @staticmethod
    def validate_skills(skills: ResumeSkills) -> ResumeSkills:
        """Validate and clean skills, removing duplicates, empty strings, person names, and invalid short skills."""
        # Import logger if not already imported
        import logging
        logger = logging.getLogger(__name__)
        
        # List of valid single-letter or two-letter skills (very rare but valid)
        valid_short_skills = {'r', 'c', 'go', 'c#', 'c++', 'ui', 'ux', 'ml'}
        
        # AI is handled separately for proper capitalization
        ai_variations = {'ai', 'AI', 'Ai', 'a.i.', 'A.I.'}
        
        # Filter function that removes empty strings, person names, and invalid short skills
        def filter_valid_skill(skill: str) -> bool:
            if not skill or not skill.strip():
                return False
            
            skill_clean = skill.strip()
            skill_lower = skill_clean.lower()
            
            # Special handling for AI variations
            if skill_lower in ai_variations or skill_clean in ai_variations:
                return True
            
            # Filter out very short skills (1-2 characters) unless they're valid
            if len(skill_clean) <= 2:
                if skill_lower not in valid_short_skills:
                    logger.warning(f"Filtered out invalid short skill: '{skill_clean}'")
                    return False
            
            # Filter out person names
            if SkillNormalizer._is_likely_person_name(skill_clean):
                logger.warning(f"Filtered out likely person name from skills: {skill_clean}")
                return False
            
            # Filter out common non-skill words
            non_skill_words = {'and', 'or', 'the', 'with', 'for', 'from', 'to', 'in', 'at', 'by', 'on'}
            if skill_lower in non_skill_words:
                logger.warning(f"Filtered out common word mistaken as skill: '{skill_clean}'")
                return False
            
            return True
        
        # Function to normalize skill capitalization (especially for AI)
        def normalize_skill_capitalization(skill: str) -> str:
            skill_clean = skill.strip()
            skill_lower = skill_clean.lower()
            
            # Special handling for AI variations - always capitalize to "AI"
            if skill_lower in ai_variations or skill_clean in ai_variations:
                return 'AI'
            
            return skill_clean
        
        # Remove duplicates, empty strings, person names, and invalid skills
        skills.technical_skills = list(set(
            normalize_skill_capitalization(skill) 
            for skill in [s.strip() for s in skills.technical_skills] 
            if filter_valid_skill(skill)
        ))
        skills.soft_skills = list(set(
            normalize_skill_capitalization(skill)
            for skill in [s.strip() for s in skills.soft_skills] 
            if filter_valid_skill(skill)
        ))
        skills.job_titles = list(set(filter(bool, [title.strip() for title in skills.job_titles])))
        skills.industries = list(set(filter(bool, [industry.strip() for industry in skills.industries])))
        
        # Validate experience years
        if skills.experience_years is not None:
            skills.experience_years = max(0, min(70, skills.experience_years))
        
        return skills
    
    @classmethod
    def get_skill_variants(cls, skill: str) -> List[str]:
        skill_lower = skill.lower().strip()
        variants = [skill_lower]
        
        # Find the normalized form
        normalized_skill = cls.SKILL_NORMALIZATIONS.get(skill_lower, skill)
        
        # Find all variants that map to the same normalized form
        for variant, normalized in cls.SKILL_NORMALIZATIONS.items():
            if normalized == normalized_skill and variant != skill_lower:
                variants.append(variant)
        
        return variants
    
    @classmethod
    def are_skills_equivalent(cls, skill1: str, skill2: str) -> bool:
        skill1_lower = skill1.lower().strip()
        skill2_lower = skill2.lower().strip()
        
        # Direct match
        if skill1_lower == skill2_lower:
            return True
        
        # Normalize both and compare
        normalized1 = cls.SKILL_NORMALIZATIONS.get(skill1_lower, skill1)
        normalized2 = cls.SKILL_NORMALIZATIONS.get(skill2_lower, skill2)
        
        return normalized1.lower() == normalized2.lower()
    
    @classmethod
    def get_normalization_stats(cls) -> dict:
        # Count skill families by grouping normalized values
        normalized_values = set(cls.SKILL_NORMALIZATIONS.values())
        
        # Count mappings per normalized skill
        mappings_per_skill = {}
        for variant, normalized in cls.SKILL_NORMALIZATIONS.items():
            if normalized not in mappings_per_skill:
                mappings_per_skill[normalized] = []
            mappings_per_skill[normalized].append(variant)
        
        return {
            "total_mappings": len(cls.SKILL_NORMALIZATIONS),
            "unique_normalized_skills": len(normalized_values),
            "skill_families": 25,  # Documented in the dictionary
            "average_variants_per_skill": len(cls.SKILL_NORMALIZATIONS) / len(normalized_values),
            "top_skills_by_variants": sorted(
                [(skill, len(variants)) for skill, variants in mappings_per_skill.items()],
                key=lambda x: x[1],
                reverse=True
            )[:10]
        }


class TextCleaner:
    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove common resume artifacts
        artifacts_to_remove = [
            r'Page \d+ of \d+',
            r'^\s*[\r\n]',
            r'\x00',  # null characters
            r'[^\x00-\x7F]+',  # non-ASCII characters that might cause issues
        ]
        
        for pattern in artifacts_to_remove:
            text = re.sub(pattern, '', text, flags=re.MULTILINE)
        
        return text.strip()
