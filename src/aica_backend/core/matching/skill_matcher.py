from typing import List, Dict

class SkillMatcher:

    SKILL_RELATIONSHIPS: Dict[str, List[str]] = {
        # Frontend frameworks
        'react': ['reactjs', 'react.js', 'react native'],
        'angular': ['angularjs', 'angular.js'],
        'vue': ['vuejs', 'vue.js', 'nuxt', 'nuxtjs'],
        
        # Backend frameworks
        'node': ['nodejs', 'node.js', 'express', 'expressjs', 'nest', 'nestjs'],
        'django': ['python', 'drf', 'django rest framework'],
        'flask': ['python'],
        'spring': ['spring boot', 'java', 'springboot'],
        
        # Databases
        'sql': ['mysql', 'postgresql', 'postgres', 'mssql', 'sql server', 'oracle'],
        'nosql': ['mongodb', 'cassandra', 'couchdb', 'dynamodb'],
        'mongodb': ['mongo', 'nosql'],
        'postgresql': ['postgres', 'sql'],
        
        # Cloud
        'aws': ['amazon web services', 'ec2', 's3', 'lambda', 'cloud'],
        'azure': ['microsoft azure', 'azure devops', 'cloud'],
        'gcp': ['google cloud', 'google cloud platform', 'cloud'],
        
        # Languages
        'javascript': ['js', 'typescript', 'ts', 'node', 'react', 'angular', 'vue'],
        'typescript': ['ts', 'javascript', 'js'],
        'python': ['django', 'flask', 'fastapi', 'pandas'],
        
        # DevOps
        'docker': ['containerization', 'kubernetes', 'k8s'],
        'kubernetes': ['k8s', 'docker', 'containerization'],
        'ci/cd': ['jenkins', 'gitlab ci', 'github actions', 'travis'],
        
        # Testing
        'testing': ['jest', 'mocha', 'pytest', 'junit', 'tdd', 'bdd'],
        'jest': ['testing', 'unit testing', 'react testing'],
        
        # Mobile
        'ios': ['swift', 'objective-c', 'xcode', 'mobile'],
        'android': ['kotlin', 'java', 'android studio', 'mobile'],
        'mobile': ['ios', 'android', 'react native', 'flutter'],
    }
    
    # Common skill name variations and normalizations
    SKILL_VARIATIONS: Dict[str, List[str]] = {
        'js': ['javascript', 'java script'],
        'ts': ['typescript', 'type script'],
        'react.js': ['react', 'reactjs'],
        'node.js': ['nodejs', 'node', 'node js'],
        'vue.js': ['vue', 'vuejs'],
        'mongodb': ['mongo', 'mongo db'],
        'postgresql': ['postgres', 'postgre sql'],
        'mysql': ['sql', 'my sql'],
        'tailwindcss': ['tailwind css', 'tailwind', 'tailwind-css'],
        'nextjs': ['next.js', 'next js', 'next'],
        'expressjs': ['express.js', 'express js', 'express'],
        'aws': ['amazon web services', 'amazonwebservices'],
        'docker': ['containerization', 'container'],
        'kubernetes': ['k8s', 'kube'],
        'html': ['html5', 'hypertext markup language'],
        'css': ['css3', 'cascading style sheets'],
        'sass': ['scss', 'syntactically awesome style sheets'],
        'git': ['github', 'gitlab', 'version control'],
        'api': ['rest api', 'restful api', 'web api'],
        'testing': ['unit testing', 'integration testing', 'test'],
    }
    
    @classmethod
    def find_exact_matches(cls, user_skills: List[str], job_skills: List[str]) -> List[str]:
        matched_skills = []
        user_skills_lower = {skill.lower().strip(): skill for skill in user_skills}
        
        for job_skill in job_skills:
            job_skill_lower = job_skill.lower().strip()
            
            # Check for exact or substring matches
            for user_skill_lower in user_skills_lower.keys():
                if (user_skill_lower == job_skill_lower or
                    user_skill_lower in job_skill_lower or
                    job_skill_lower in user_skill_lower):
                    matched_skills.append(job_skill)
                    break
        
        return matched_skills
    
    @classmethod
    def find_partial_matches(cls, user_skills: List[str], job_skills: List[str]) -> List[str]:
        partial_matches = []
        user_skills_lower = [skill.lower().strip() for skill in user_skills]
        exact_matches = cls.find_exact_matches(user_skills, job_skills)
        exact_matches_lower = [skill.lower().strip() for skill in exact_matches]
        
        for job_skill in job_skills:
            job_skill_lower = job_skill.lower().strip()
            
            # Skip if already exact match
            if job_skill_lower in exact_matches_lower:
                continue
            
            # Check if any user skill is related
            for user_skill_lower in user_skills_lower:
                if cls.check_skill_relationship(user_skill_lower, job_skill_lower):
                    partial_matches.append(job_skill)
                    break
        
        return partial_matches
    
    @classmethod
    def find_missing_skills(
        cls,
        user_skills: List[str],
        job_skills: List[str]
    ) -> List[str]:
        exact_matches = cls.find_exact_matches(user_skills, job_skills)
        partial_matches = cls.find_partial_matches(user_skills, job_skills)
        all_matches = set(exact_matches + partial_matches)
        
        return [skill for skill in job_skills if skill not in all_matches]
    
    @classmethod
    def check_skill_relationship(cls, user_skill: str, job_skill: str) -> bool:
        # Check direct relationships
        for key, related_skills in cls.SKILL_RELATIONSHIPS.items():
            if key in user_skill and job_skill in related_skills:
                return True
            if key in job_skill and user_skill in related_skills:
                return True
            # Check if both are in the same relationship group
            if user_skill in related_skills and job_skill in related_skills:
                return True
        
        # Check variations
        for main_skill, variations in cls.SKILL_VARIATIONS.items():
            if (user_skill in variations or user_skill == main_skill) and \
               (job_skill in variations or job_skill == main_skill):
                return True
        
        return False
    
    @classmethod
    def skills_match_with_variations(cls, user_skill: str, job_skill: str) -> bool:
        user_skill = user_skill.lower().strip()
        job_skill = job_skill.lower().strip()
        
        # Exact match
        if user_skill == job_skill:
            return True
        
        # Normalize spacing, hyphens, underscores
        user_normalized = user_skill.replace(' ', '').replace('-', '').replace('_', '')
        job_normalized = job_skill.replace(' ', '').replace('-', '').replace('_', '')
        
        if user_normalized == job_normalized:
            return True
        
        # Check if one contains the other
        if (user_skill in job_skill or
            job_skill in user_skill or
            user_normalized in job_normalized or
            job_normalized in user_normalized):
            return True
        
        # Check skill variations
        for main_skill, variations in cls.SKILL_VARIATIONS.items():
            if (user_skill in variations or user_skill == main_skill or
                job_skill in variations or job_skill == main_skill or
                user_normalized in variations or user_normalized == main_skill or
                job_normalized in variations or job_normalized == main_skill):
                return True
        
        # Check reverse mappings
        for main_skill, variations in cls.SKILL_VARIATIONS.items():
            if user_skill == main_skill and job_skill in variations:
                return True
            if job_skill == main_skill and user_skill in variations:
                return True
        
        return False
    
    @classmethod
    def calculate_skill_coverage(
        cls,
        user_skills: List[str],
        job_skills: List[str]
    ) -> float:
        if not job_skills:
            return 1.0
        
        exact_matches = cls.find_exact_matches(user_skills, job_skills)
        return len(exact_matches) / len(job_skills)
    
    @classmethod
    def calculate_weighted_match_score(
        cls,
        user_skills: List[str],
        job_skills: List[str]
    ) -> float:
        if not job_skills:
            return 0.5  # Neutral score if no requirements
        
        exact_matches = cls.find_exact_matches(user_skills, job_skills)
        partial_matches = cls.find_partial_matches(user_skills, job_skills)
        
        # Direct matches contribute 100%, partial matches contribute 50%
        weighted_matches = len(exact_matches) + (len(partial_matches) * 0.5)
        match_score = weighted_matches / len(job_skills)
        
        # Cap at 98% for realism (no perfect matches)
        return min(match_score, 0.98)
