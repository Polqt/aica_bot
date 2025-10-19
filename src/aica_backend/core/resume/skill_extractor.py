import re
import logging
from typing import List, Optional

from .models import ResumeSkills

logger = logging.getLogger(__name__)


class SkillExtractor:
    
    # Comprehensive technical skills database
    TECHNICAL_KEYWORDS = [
        # Programming Languages
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby',
        'swift', 'kotlin', 'r', 'matlab', 'scala', 'perl', 'bash', 'powershell',
        'go', 'golang', 'rust', 'dart', 'lua', 'haskell', 'clojure', 'elixir',
        'objective-c', 'visual basic', 'vb.net', 'fortran', 'cobol', 'assembly',

        # Web Frontend Technologies
        'html', 'html5', 'css', 'css3', 'react', 'reactjs', 'react.js', 
        'angular', 'angularjs', 'angular.js', 'vue', 'vuejs', 'vue.js',
        'jquery', 'bootstrap', 'tailwind', 'tailwind css', 'tailwindcss',
        'material-ui', 'mui', 'ant design', 'chakra ui', 'sass', 'scss', 'less',
        'webpack', 'vite', 'parcel', 'rollup', 'babel', 'eslint', 'prettier',
        'next.js', 'nextjs', 'nuxt.js', 'nuxtjs', 'gatsby', 'svelte', 'ember',
        'backbone', 'knockout', 'preact', 'lit', 'stencil', 'alpine.js',

        # Backend Technologies  
        'node.js', 'nodejs', 'node', 'express', 'express.js', 'expressjs',
        'django', 'flask', 'fastapi', 'spring', 'spring boot', 'springboot',
        'asp.net', 'asp.net core', 'laravel', 'symfony', 'codeigniter',
        'ruby on rails', 'rails', 'sinatra', 'phoenix', 'elixir', 'nest.js',
        'koa', 'hapi', 'adonis', 'meteor', 'sails', 'loopback', 'strapi',

        # Databases - SQL
        'sql', 'mysql', 'postgresql', 'postgres', 'oracle', 'sql server',
        'sqlite', 'mariadb', 'db2', 'teradata', 'amazon aurora', 'cockroachdb',
        'snowflake', 'bigquery', 'redshift',

        # Databases - NoSQL
        'mongodb', 'mongo', 'redis', 'cassandra', 'dynamodb', 'couchbase',
        'neo4j', 'arangodb', 'couchdb', 'riak', 'hbase', 'memcached',
        'elasticsearch', 'solr', 'firebase', 'realm', 'influxdb', 'timescaledb',

        # Cloud Platforms & Services
        'aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds', 'dynamodb',
        'cloudfront', 'route53', 'elastic beanstalk', 'ecs', 'eks', 'fargate',
        'azure', 'microsoft azure', 'azure devops', 'azure functions',
        'google cloud', 'gcp', 'google cloud platform', 'app engine',
        'cloud functions', 'cloud run', 'heroku', 'digitalocean', 'vercel',
        'netlify', 'cloudflare', 'linode', 'vultr', 'ibm cloud', 'oracle cloud',

        # DevOps & CI/CD
        'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab ci', 'github actions',
        'travis ci', 'circle ci', 'circleci', 'terraform', 'ansible',
        'chef', 'puppet', 'cloudformation', 'vagrant', 'packer',
        'ci/cd', 'continuous integration', 'continuous deployment',

        # Version Control
        'git', 'github', 'gitlab', 'bitbucket', 'svn', 'subversion',
        'mercurial', 'perforce', 'cvs',

        # Web Servers & Proxies
        'nginx', 'apache', 'apache tomcat', 'iis', 'lighttpd', 'caddy',
        'traefik', 'haproxy', 'varnish',

        # Data Science & AI/ML
        'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
        'scipy', 'matplotlib', 'seaborn', 'plotly', 'jupyter', 'jupyter notebook',
        'apache spark', 'pyspark', 'hadoop', 'hive', 'pig', 'kafka',
        'airflow', 'luigi', 'mlflow', 'kubeflow', 'dask', 'ray',
        'opencv', 'pillow', 'nltk', 'spacy', 'transformers', 'hugging face',
        'xgboost', 'lightgbm', 'catboost', 'statsmodels',
        'machine learning', 'deep learning', 'neural networks', 'cnn', 'rnn',
        'lstm', 'nlp', 'natural language processing', 'computer vision',
        'reinforcement learning', 'supervised learning', 'unsupervised learning',

        # Data Visualization & BI
        'tableau', 'power bi', 'looker', 'qlik', 'quicksight', 'metabase',
        'superset', 'grafana', 'kibana', 'd3.js', 'd3', 'chart.js',

        # Mobile Development
        'react native', 'flutter', 'ios', 'android', 'swift ui', 'xamarin',
        'ionic', 'cordova', 'phonegap', 'android sdk', 'ios sdk',
        'kotlin multiplatform', 'nativescript',

        # Testing & Quality Assurance
        'jest', 'mocha', 'chai', 'jasmine', 'karma', 'cypress', 'selenium',
        'playwright', 'puppeteer', 'testcafe', 'nightwatch', 'webdriverio',
        'junit', 'testng', 'pytest', 'unittest', 'nose', 'cucumber',
        'behave', 'robot framework', 'postman', 'insomnia', 'jmeter',
        'loadrunner', 'gatling', 'tdd', 'bdd', 'unit testing',
        'integration testing', 'e2e testing', 'test automation',

        # API & Protocols
        'rest', 'rest api', 'restful', 'graphql', 'grpc', 'soap',
        'websocket', 'webhooks', 'oauth', 'oauth2', 'jwt', 'saml',
        'openapi', 'swagger', 'json', 'xml', 'yaml', 'protobuf',

        # Messaging & Streaming
        'rabbitmq', 'activemq', 'zeromq', 'kafka', 'kinesis', 'pub/sub',
        'mqtt', 'nats', 'pulsar', 'event-driven architecture', 'message queue',

        # Methodologies & Practices
        'agile', 'scrum', 'kanban', 'lean', 'waterfall', 'devops',
        'microservices', 'monolithic', 'serverless', 'event-driven',
        'domain-driven design', 'ddd', 'clean architecture', 'solid',
        'design patterns', 'mvc', 'mvvm', 'rest architecture',

        # Operating Systems
        'linux', 'unix', 'ubuntu', 'debian', 'centos', 'red hat', 'fedora',
        'windows', 'windows server', 'macos', 'ios', 'android',

        # Blockchain & Web3
        'blockchain', 'ethereum', 'solidity', 'smart contracts', 'web3',
        'bitcoin', 'cryptocurrency', 'nft', 'defi', 'hyperledger',

        # Security
        'cybersecurity', 'infosec', 'penetration testing', 'owasp',
        'ssl', 'tls', 'https', 'authentication', 'authorization',
        'encryption', 'firewall', 'vpn', 'iam', 'oauth', 'sso',

        # CMS & E-commerce
        'wordpress', 'drupal', 'joomla', 'magento', 'shopify', 'woocommerce',
        'contentful', 'strapi', 'ghost', 'sanity',

        # Other Tools & Technologies
        'jira', 'confluence', 'slack', 'trello', 'asana', 'notion',
        'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
        'vs code', 'visual studio', 'intellij', 'pycharm', 'eclipse',
        'netbeans', 'sublime text', 'atom', 'vim', 'emacs',
        'raspberry pi', 'arduino', 'iot', 'embedded systems',
    ]
    
    # Comprehensive soft skills database
    SOFT_KEYWORDS = [
        # Leadership & Management
        'leadership', 'team leadership', 'project leadership', 'strategic leadership',
        'management', 'team management', 'project management', 'product management',
        'people management', 'resource management', 'change management',
        'strategic planning', 'decision making', 'delegation', 'supervision',
        'executive leadership', 'servant leadership', 'transformational leadership',

        # Communication
        'communication', 'communication skills', 'verbal communication',
        'written communication', 'presentation', 'presentation skills',
        'public speaking', 'technical writing', 'documentation',
        'stakeholder management', 'client communication', 'reporting',
        'negotiation', 'persuasion', 'active listening', 'articulation',
        'cross-cultural communication', 'interpersonal communication',

        # Teamwork & Collaboration
        'teamwork', 'team collaboration', 'collaboration', 'team player',
        'cross-functional', 'cross-functional collaboration',
        'interpersonal skills', 'relationship building', 'networking',
        'partnership', 'cooperative', 'consensus building',
        'conflict resolution', 'mediation', 'remote collaboration',

        # Problem Solving & Analysis
        'problem solving', 'problem-solving', 'analytical', 'analytical thinking',
        'critical thinking', 'troubleshooting', 'debugging', 'root cause analysis',
        'solution oriented', 'strategic thinking', 'systems thinking',
        'logical thinking', 'research', 'data analysis', 'investigation',
        'innovation', 'creative problem solving', 'decision making',

        # Organization & Time Management
        'organization', 'organizational skills', 'time management',
        'prioritization', 'multitasking', 'multi-tasking', 'planning',
        'scheduling', 'attention to detail', 'detail-oriented',
        'task management', 'workflow management', 'efficiency',
        'productivity', 'process improvement', 'optimization',

        # Adaptability & Learning
        'adaptability', 'flexibility', 'learning agility', 'fast learner',
        'quick learner', 'continuous learning', 'self-learning',
        'growth mindset', 'resilience', 'versatility', 'open-minded',
        'change management', 'embracing change', 'proactive',

        # Customer & Service Orientation
        'customer service', 'client service', 'customer focus', 'client focus',
        'user experience', 'ux', 'customer satisfaction', 'client relations',
        'customer relations', 'empathy', 'patience', 'service orientation',
        'customer support', 'technical support', 'help desk',

        # Creativity & Innovation
        'creativity', 'creative', 'innovation', 'innovative',
        'design thinking', 'brainstorming', 'ideation', 'imagination',
        'artistic', 'original thinking', 'out-of-the-box thinking',
        'creative problem solving', 'inventive',

        # Work Ethic & Personal Qualities
        'work ethic', 'strong work ethic', 'reliability', 'reliable',
        'accountability', 'responsible', 'initiative', 'self-starter',
        'self-motivated', 'motivated', 'driven', 'discipline',
        'commitment', 'dedicated', 'passionate', 'enthusiastic',
        'professional', 'integrity', 'honesty', 'punctuality',
        'dependable', 'hardworking', 'diligent', 'persistent',

        # Mentoring & Development
        'mentoring', 'mentorship', 'coaching', 'teaching', 'training',
        'knowledge sharing', 'knowledge transfer', 'onboarding',
        'professional development', 'talent development', 'guidance',
        'instructing', 'educating', 'facilitating',

        # Business & Strategy
        'business acumen', 'strategic thinking', 'business strategy',
        'market analysis', 'competitive analysis', 'financial analysis',
        'budget management', 'cost optimization', 'roi analysis',
        'stakeholder management', 'vendor management', 'procurement',

        # Agile & Project Management
        'agile', 'scrum', 'scrum master', 'kanban', 'sprint planning',
        'backlog management', 'user stories', 'story pointing',
        'retrospectives', 'stand-ups', 'product owner', 'pmp',
        'risk management', 'quality assurance', 'delivery management',
    ]
    
    @classmethod
    def extract_with_fallback(cls, text: str) -> ResumeSkills:
        text_lower = text.lower()
        
        # Identify and exclude certification/course sections
        certification_free_text = cls._remove_certification_sections(text_lower)
        
        # Extract skills from the cleaned text
        found_technical = cls._extract_technical_skills(certification_free_text)
        found_soft = cls._extract_soft_skills(certification_free_text)
        
        # Extract additional professional information
        experience_years = cls._estimate_experience_years(text)
        job_titles = cls._extract_job_titles(text)
        education_level = cls._extract_education_level(text)
        industries = cls._extract_industries(text)
        
        return ResumeSkills(
            technical_skills=found_technical,
            soft_skills=found_soft,
            experience_years=experience_years,
            job_titles=job_titles,
            education_level=education_level,
            industries=industries
        )
    
    @staticmethod
    def _remove_certification_sections(text: str) -> str:
        """
        Aggressively remove certification, course, and training sections from text
        to prevent skill extraction from these areas.
        """
        lines = text.split('\n')
        filtered_lines = []
        skip_section = False
        lines_skipped_count = 0
        
        # Keywords that indicate certification/course sections - EXPANDED LIST
        cert_section_headers = [
            'certification', 'certifications', 'certificates', 'certificate',
            'licenses', 'license', 'licensing', 'licensed', 
            'training', 'trainings', 'courses', 'coursework', 'course work',
            'professional development', 'continuing education',
            'academic courses', 'relevant coursework', 'coursework:',
            'credentials', 'accreditation', 'qualified in',
            'completed training', 'training completed', 'training programs',
            'seminars', 'seminar', 'workshops', 'workshop', 'attended',
            'training attended', 'seminars attended', 'workshops attended'
        ]
        
        # Keywords that indicate other sections (end of cert section)
        other_section_headers = [
            'experience', 'work experience', 'employment', 'professional experience',
            'employment history', 'work history', 'career history',
            'projects', 'project', 'personal projects', 'professional projects',
            'skills', 'technical skills', 'core competencies', 'core skills',
            'proficiencies', 'expertise', 'technologies',
            'education', 'academic background', 'educational background',
            'summary', 'profile', 'objective', 'career objective',
            'achievements', 'accomplishments', 'awards',
            'references', 'professional references'
        ]
        
        for i, line in enumerate(lines):
            line_stripped = line.strip().lower()
            
            # Skip empty lines
            if not line_stripped:
                if not skip_section:
                    filtered_lines.append(line)
                continue
            
            # Check if this is a certification section header
            is_cert_header = False
            for header in cert_section_headers:
                # Match if the line is short (likely a header) and contains the keyword
                if header in line_stripped and len(line_stripped) < 60:
                    # Additional check: line should not have too many numbers or dates
                    # (actual certifications have dates, headers don't)
                    digit_count = sum(c.isdigit() for c in line_stripped)
                    if digit_count < 6:  # Less than 6 digits (not a certification entry)
                        is_cert_header = True
                        break
            
            if is_cert_header:
                skip_section = True
                lines_skipped_count = 0
                continue
            
            # Check if we're entering a different section (exit cert section)
            if skip_section:
                for header in other_section_headers:
                    if header in line_stripped and len(line_stripped) < 60:
                        # Check it's actually a section header (short, not much punctuation)
                        if line_stripped.count(':') <= 1 and line_stripped.count(',') <= 1:
                            skip_section = False
                            break
                
                # Also exit cert section after 30 lines even without finding a new section
                # (handles resumes where certifications are at the end)
                lines_skipped_count += 1
                if lines_skipped_count > 30:
                    skip_section = False
            
            # Include line if not in certification section
            if not skip_section:
                filtered_lines.append(line)
            else:
                # Skip this line (it's in cert section)
                pass
        
        return '\n'.join(filtered_lines)
    
    @classmethod
    def _extract_technical_skills(cls, text_lower: str) -> List[str]:
        found_skills = []
        
        # Context patterns that indicate actual skill usage (not just mentions)
        usage_patterns = [
            r'(?:experience|skilled|proficient|expert|familiar)\s+(?:in|with)\s+',
            r'(?:using|used|utilizing|implemented|developed|built|created|managed|deployed)\s+',
            r'(?:knowledge\s+of|understanding\s+of)\s+',
        ]
        
        for skill in cls.TECHNICAL_KEYWORDS:
            # Create flexible pattern that handles variations and context
            # Match word boundaries but also allow for common prefixes/suffixes
            patterns = [
                r'\b' + re.escape(skill).replace(r'\.', r'\.?') + r'\b',  # Exact match
                r'\b' + re.escape(skill).replace(r'\.', r'\.?') + r's?\b',  # Plural
                r'\b' + re.escape(skill.replace('.', '')) + r'\b',  # No dots version
            ]
            
            matched = False
            for pattern in patterns:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    matched = True
                    break
            
            if matched:
                # Capitalize properly based on known patterns
                if skill in ['aws', 'gcp', 'api', 'sql', 'html', 'css', 'php', 'ios', 'iot', 'jwt', 'rest', 'soap', 'xml', 'json', 'yaml', 'ci/cd', 'tdd', 'bdd', 'mvc', 'mvvm', 'nlp', 'ddd', 'sso', 'iam', 'ssl', 'tls', 'cnn', 'rnn', 'lstm', 'ux', 'ui', 'ml', 'bi', 'http', 'https', 'ftp', 'ssh', 'tcp', 'udp', 'dns']:
                    found_skills.append(skill.upper())
                elif skill == 'ai':
                    found_skills.append('AI')
                elif '.' in skill or skill.endswith('js'):
                    found_skills.append(skill)  # Keep as-is for tech with dots or js suffix
                else:
                    found_skills.append(skill.title())
        
        # Remove duplicates while preserving order
        return list(dict.fromkeys(found_skills))
    
    @classmethod
    def _extract_soft_skills(cls, text_lower: str) -> List[str]:
        found_skills = []
        
        for skill in cls.SOFT_KEYWORDS:
            # More flexible matching - check if skill appears in text
            # Also check for common variations
            variations = [
                skill,
                skill.replace('-', ' '),  # "problem-solving" → "problem solving"
                skill.replace(' ', '-'),  # "problem solving" → "problem-solving"
            ]
            
            matched = False
            for variation in variations:
                if variation in text_lower:
                    matched = True
                    break
            
            if matched:
                found_skills.append(skill.title())
        
        # Remove duplicates while preserving order
        return list(dict.fromkeys(found_skills))
    
    @staticmethod
    def _estimate_experience_years(text: str) -> Optional[int]:
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+?\s*years?\s*in(?:\s+the\s+)?(?:software|tech|it)?\s*industry',
            r'experience:\s*(\d+)\+?\s*years?',
            r'over\s*(\d+)\s*years?',
            r'(\d+)\+?\s*years?\s*professional\s*experience'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    years = max(int(match) for match in matches)
                    return min(years, 70)  # Cap at 70 years
                except ValueError:
                    continue
        
        return None
    
    @staticmethod
    def _extract_job_titles(text: str) -> List[str]:
        # Look for common job title patterns
        title_patterns = [
            r'(?:^|\n)([A-Z][^.\n]{10,50}?)(?:\n|$)',  # Lines that look like job titles
            r'(?:position|role|title)[:\s]*([A-Z][^.\n]{5,30})',  # Explicit position mentions
            r'(?:software|web|full.?stack|backend|frontend|devops|data)\s+(?:engineer|developer|analyst|scientist|architect)',
        ]
        
        found_titles = []
        for pattern in title_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                title = match.strip()
                if len(title) > 3 and len(title) < 50:
                    # Filter out non-job-title content
                    if not any(word in title.lower() for word in ['email', 'phone', 'address', 'www', 'http', 'university', 'college']):
                        found_titles.append(title)
        
        return list(set(found_titles))[:5]  # Limit to 5 most relevant
    
    @staticmethod
    def _extract_education_level(text: str) -> Optional[str]:
        text_lower = text.lower()
        education_levels = [
            ('phd', 'PhD'), ('doctorate', 'PhD'), ('doctoral', 'PhD'),
            ("master's", "Master's"), ('masters', "Master's"), ('mba', 'MBA'),
            ('ms', 'MS'), ('ma', 'MA'), ('msc', 'MSc'), ('meng', 'MEng'),
            ("bachelor's", "Bachelor's"), ('bachelors', 'Bachelor\'s'), ('bachelor', 'Bachelor\'s'),
            ('bs', 'BS'), ('ba', 'BA'), ('bsc', 'BSc'), ('beng', 'BEng'),
            ('associate', 'Associate'), ('diploma', 'Diploma'), ('certificate', 'Certificate')
        ]
        
        for keyword, level in education_levels:
            if keyword in text_lower:
                return level
        
        return None
    
    @staticmethod
    def _extract_industries(text: str) -> List[str]:
        industries = [
            'technology', 'software', 'it', 'finance', 'banking', 'healthcare', 'medical',
            'retail', 'e-commerce', 'education', 'consulting', 'manufacturing', 'automotive',
            'telecommunications', 'energy', 'oil', 'gas', 'government', 'non-profit',
            'marketing', 'advertising', 'media', 'entertainment', 'hospitality', 'real estate',
            'logistics', 'supply chain', 'construction', 'pharmaceuticals', 'biotechnology'
        ]
        
        found_industries = [industry for industry in industries if industry in text.lower()]
        return list(set(found_industries))
