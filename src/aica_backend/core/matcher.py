from langchain_anthropic import ChatAnthropic
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from dataclasses import dataclass

from .embedder import VectorJobStore, TextEmbedder
from .resume_parser import ResumeParser, ParsedResume

from database.user_db import UserDatabase
from database.job_db import JobDatabase

class MatchResult(BaseModel):
    is_match: bool = Field(description="Whether the candidate matches the job")
    match_score: float = Field(description="Match score from 0-100")
    matching_skills: List[str] = Field(description="Skills that match the job requirements")
    missing_skills: List[str] = Field(description="Required skills the candidate lacks")
    reason: str = Field(description="Detailed explanation of the match assessment")


@dataclass
class JobMatch:
    job_id: str
    job_title: str
    company: str
    match_result: MatchResult
    similarity_score: float


class JobMatcher:
    def __init__(self):
        self.llm = ChatAnthropic(model="claude-3-haiku-20240307", temperature=0)
        self.parser = PydanticOutputParser(pydantic_object=MatchResult)

        try:
            self.embedder = TextEmbedder()
            self.vector_store = VectorJobStore(self.embedder)
            self.use_vector_search = True
        except Exception as e:
            self.embedder = None
            self.vector_store = None
            self.use_vector_search = False
            
        self.resume_parser = ResumeParser()
        
        self.match_prompt = ChatPromptTemplate.from_messages([
            (
                "system", 
                """
                    You are an expert job interviewer. Analyze resumes against job postings 
                    and provide detailed matching assessment. Be thorough and fair in your evaluation.
                """
            ),
            (
                "human",
                """
                    Resume Information:\n{resume_info}\n\n
                    Job Posting:\n{job_posting}\n\n
                    Provide a detailed match analysis.\n{format_instructions}
                """
            )
        ])
    
    async def add_job_to_index(self, job_id: str, job_content: str, metadata: Dict = None) -> None:
        self.vector_store.add_job(job_id, job_content, metadata)
    
    async def find_matching_jobs(self, resume_text: str, top_k: int = 20) -> List[JobMatch]:
        if self.use_vector_search and self.vector_store:
            return await self._find_matching_jobs_vector(resume_text, top_k)
        else:
            return await self._find_matching_jobs_direct(resume_text, top_k)
    
    async def _find_matching_jobs_vector(self, resume_text: str, top_k: int = 20) -> List[JobMatch]:
        # Create search text optimized for job matching
        # For skills-based text, use it directly; for full resume, extract key terms
        search_text = self._create_search_text_from_resume_text(resume_text)
        
        # Find similar jobs using vector search
        similar_jobs = self.vector_store.search_similar_jobs(search_text, k=top_k)
        
        # Evaluate each job match
        job_matches = []
        for job_data in similar_jobs:
            # Get full job content (you'll need to fetch this from your database)
            job_content = await self._get_job_content(job_data["job_id"])
            if not job_content:
                continue
            
            # Evaluate the match using LLM (simplified approach for skills-based text)
            match_result = await self._evaluate_text_based_match(resume_text, job_content)
            
            job_match = JobMatch(
                job_id=job_data["job_id"],
                job_title=job_data["metadata"].get("title", "Unknown"),
                company=job_data["metadata"].get("company", "Unknown"),
                match_result=match_result,
                similarity_score=job_data["similarity_score"]
            )
            job_matches.append(job_match)
        
        # Sort by match score
        job_matches.sort(key=lambda x: x.match_result.match_score, reverse=True)
        return job_matches
    
    async def _find_matching_jobs_direct(self, resume_text: str, top_k: int = 20) -> List[JobMatch]:
        job_db = JobDatabase()
        
        # Get all available jobs
        all_jobs = job_db.get_all_jobs(limit=top_k * 2)  # Get more to filter
        
        if not all_jobs:
            return []
        
        job_matches = []
        for job in all_jobs:
            try:
                # Create job content for matching
                job_content = f"""
                Title: {job.title}
                Company: {job.company}
                Location: {job.location}
                Description: {job.description}
                Requirements: {job.requirements}
                Skills: {', '.join(job.skills) if job.skills else 'None specified'}
                """
                
                # Evaluate the match using LLM
                match_result = await self._evaluate_text_based_match(resume_text, job_content)
                
                # Only include jobs with reasonable match scores
                if match_result.match_score >= 30:  # At least 30% match
                    job_match = JobMatch(
                        job_id=job.id,
                        job_title=job.title,
                        company=job.company,
                        match_result=match_result,
                        similarity_score=1.0 - (match_result.match_score / 100)  # Fake similarity score
                    )
                    job_matches.append(job_match)
                    
            except Exception as e:
                continue
        
        # Sort by match score and limit results
        job_matches.sort(key=lambda x: x.match_result.match_score, reverse=True)
        
        return job_matches[:top_k]

    async def find_matches_for_user(self, user_id: str, top_k: int = 20) -> List[JobMatch]:
        try: 
            user_db = UserDatabase()
            job_db = JobDatabase()
            
            # Get user's resume content (if stored) or skills
            user_skills = user_db.get_user_skills(user_id)
            if not user_skills:
                return []
            
            # Create a resume-like text from user skills for matching
            skills_text = self._create_skills_text(user_skills)
            
            # Find matching jobs
            job_matches = await self.find_matching_jobs(skills_text, top_k)
            
            # Store matches in database
            for match in job_matches:
                try:
                    # Get detailed compatibility analysis
                    job_db = JobDatabase()
                    job = job_db.get_job_by_id(match.job_id)
                    if job:
                        user_skills = user_db.get_user_skills(user_id)
                        user_skill_names = [skill.skill_name for skill in user_skills]

                        # Calculate detailed compatibility with AI reasoning
                        compatibility = await self.calculate_compatibility(
                            user_skill_names,
                            job.skills or [],
                            job.title,
                            job.company
                        )

                        user_db.save_job_match(
                            user_id=user_id,
                            job_id=match.job_id,
                            match_score=compatibility["compatibility_score"],
                            matched_skills=compatibility["matched_skills"],
                            missing_critical_skills=compatibility["missing_skills"],
                            skill_coverage=compatibility["skill_coverage"],
                            confidence=compatibility["confidence"],
                            ai_reasoning=compatibility["ai_reasoning"]
                        )
                    else:
                        # Fallback to basic match
                        user_db.save_job_match(
                            user_id=user_id,
                            job_id=match.job_id,
                            match_score=match.match_result.match_score,
                            matched_skills=match.match_result.matching_skills
                        )
                except Exception as save_error:
                    print(f"Failed to save match for user {user_id}, job {match.job_id}: {save_error}")
            
            return job_matches
            
        except Exception as e:
            return []
    
    def _create_skills_text(self, user_skills) -> str:
        skills_by_category = {}
        
        for skill in user_skills:
            category = skill.skill_category or 'general'
            if category not in skills_by_category:
                skills_by_category[category] = []
            skills_by_category[category].append(skill.skill_name)
        
        # Create a resume-like text
        text_parts = []
        
        if 'technical' in skills_by_category:
            text_parts.append(f"Technical Skills: {', '.join(skills_by_category['technical'])}")
        
        if 'soft' in skills_by_category:
            text_parts.append(f"Soft Skills: {', '.join(skills_by_category['soft'])}")
            
        if 'industry' in skills_by_category:
            text_parts.append(f"Industry Experience: {', '.join(skills_by_category['industry'])}")
            
        if 'job_title' in skills_by_category:
            text_parts.append(f"Job Titles: {', '.join(skills_by_category['job_title'])}")
        
        return "\n".join(text_parts)
    
    def _calculate_confidence(self, match_score: float) -> str:
        if match_score >= 80:
            return "high"
        elif match_score >= 60:
            return "medium"
        else:
            return "low"
    
    async def _evaluate_detailed_match(self, parsed_resume: ParsedResume, job_posting: str) -> MatchResult:
        resume_summary = self._create_resume_summary(parsed_resume)
        
        prompt = self.match_prompt.format_prompt(
            resume_info=resume_summary,
            job_posting=job_posting,
            format_instructions=self.parser.get_format_instructions()
        )
        
        response = await self.llm.ainvoke(prompt)
        return self.parser.parse(response.content)
    
    def _create_resume_summary(self, parsed_resume: ParsedResume) -> str:
        skills = parsed_resume.skills
        
        summary_parts = [
            f"Technical Skills: {', '.join(skills.technical_skills)}",
            f"Soft Skills: {', '.join(skills.soft_skills)}",
            f"Experience: {skills.experience_years} years" if skills.experience_years else "Experience: Not specified",
            f"Previous Roles: {', '.join(skills.job_titles)}",
            f"Education: {skills.education_level}" if skills.education_level else "Education: Not specified",
            f"Industries: {', '.join(skills.industries)}",
        ]
        
        return "\n".join(filter(None, summary_parts))
    
    async def _get_job_content(self, job_id: str) -> Optional[str]:
        return f"Job content for {job_id} - implement database fetch here"
    
    async def calculate_compatibility(self, user_skills: List[str], job_skills: List[str], job_title: str, company: str) -> Dict:
        """Calculate detailed compatibility between user skills and job requirements with comprehensive AI reasoning."""
        try:
            # Create detailed prompts for AI analysis
            user_skills_text = ", ".join(user_skills) if user_skills else "No skills listed"
            job_skills_text = ", ".join(job_skills) if job_skills else "No specific skills listed"
            
            analysis_prompt = f"""As an elite technical recruiter and career advisor, provide a comprehensive job fit analysis.

            CANDIDATE'S SKILLS: {user_skills_text}
            JOB REQUIREMENTS: {job_skills_text}
            POSITION: {job_title} at {company}

            CRITICAL ANALYSIS RULES:
            1. ACCURACY: Only match skills the candidate ACTUALLY has - no assumptions
            2. HONESTY: Be transparent about gaps and mismatches
            3. FAIRNESS: Consider related skills and transferable competencies
            4. ACTIONABILITY: Provide specific, practical guidance for improvement

            ANALYSIS STRUCTURE:

            **SKILLS ALIGNMENT** (200-300 words)
            Evaluate how the candidate's actual skills match the job requirements:
            
            ✓ STRONG MATCHES: List specific skills that directly align
            • Explain WHY each match is valuable for this role
            • Note if skills are core vs. complementary
            
            ⚠️ PARTIAL MATCHES: Identify related but not exact skills
            • Example: Has "React" but needs "Vue.js" - related frontend frameworks
            • Explain transferability and learning curve
            
            ✗ MISSING CRITICAL SKILLS: Be honest about gaps
            • List key requirements the candidate doesn't have
            • Prioritize by importance (must-have vs. nice-to-have)
            • Estimate learning effort for each gap

            **MATCH ASSESSMENT** (100-150 words)
            • Overall compatibility score reasoning
            • Confidence level in the match (High/Medium/Low)
            • Role fit assessment (Excellent/Good/Fair/Poor)
            • Readiness level (Ready Now/Nearly Ready/Needs Development)

            **SKILL GAP ANALYSIS** (150-200 words)
            Break down missing skills into categories:
            • CRITICAL GAPS: Must-have skills completely missing
            • TRAINABLE GAPS: Skills that can be learned relatively quickly
            • ADVANCED GAPS: Complex skills requiring significant time investment
            
            For each gap, provide:
            • Difficulty level (Easy/Moderate/Hard)
            • Typical learning timeline (days/weeks/months)
            • Recommended resources (online courses, books, practice projects)

            **CAREER RECOMMENDATIONS** (150-200 words)
            Provide actionable next steps:
            
            IF HIGH MATCH (80%+):
            • Emphasize application worthiness
            • Suggest how to highlight relevant experience
            • Recommend interview preparation focus areas
            
            IF MEDIUM MATCH (50-80%):
            • Identify quick wins to improve candidacy
            • Suggest alternative similar positions
            • Provide 30-60-90 day skill development plan
            
            IF LOW MATCH (<50%):
            • Be honest about fit challenges
            • Suggest better-matched alternative roles
            • Provide comprehensive upskilling roadmap
            • Recommend intermediate stepping-stone positions

            **STANDOUT STRENGTHS** (50-100 words)
            Highlight candidate's unique value propositions:
            • Rare or highly valuable skills they possess
            • Combinations of skills that create unique expertise
            • Competitive advantages over typical candidates

            **FINAL VERDICT** (50-100 words)
            Summary recommendation:
            • Should they apply? (Strongly Yes/Yes/Maybe/Not Yet)
            • Expected interview success likelihood
            • Timeframe to become fully qualified (if not already)
            • One key action item to improve match

            TONE & STYLE:
            - Professional but encouraging
            - Honest without being discouraging
            - Specific and actionable
            - Balanced (acknowledge both strengths and gaps)
            - Use clear headings and bullet points
            - Avoid jargon unless explaining it
            - Target total length: 750-1000 words
            
            Focus on being genuinely helpful for the candidate's career development."""

            # Get comprehensive AI response
            response = await self.llm.ainvoke(analysis_prompt)
            ai_reasoning = response.content

            # Calculate precise metrics - STRICT matching only
            matched_skills = []
            missing_skills = []
            partial_matches = []

            # Convert user skills to lowercase for comparison
            user_skills_lower = {skill.lower().strip(): skill for skill in user_skills}
            job_skills_original = {skill: skill for skill in job_skills}

            for job_skill in job_skills:
                job_skill_lower = job_skill.lower().strip()
                skill_matched = False
                partial_match = False

                # Check for exact or substring matches
                for user_skill_lower, user_skill_original in user_skills_lower.items():
                    # Exact match
                    if user_skill_lower == job_skill_lower:
                        matched_skills.append(job_skill)
                        skill_matched = True
                        break
                    # Substring match (user has broader or narrower skill)
                    elif user_skill_lower in job_skill_lower or job_skill_lower in user_skill_lower:
                        matched_skills.append(job_skill)
                        skill_matched = True
                        break
                    # Partial/related match using skill mappings
                    elif self._check_skill_relationship(user_skill_lower, job_skill_lower):
                        partial_matches.append(job_skill)
                        partial_match = True
                        # Don't break - might find exact match

                if not skill_matched and not partial_match:
                    missing_skills.append(job_skill)

            # Calculate comprehensive scores
            total_required = len(job_skills) if job_skills else 1
            direct_matches = len(matched_skills)
            related_matches = len(partial_matches)
            
            # Skill coverage: direct matches / total required
            skill_coverage = direct_matches / total_required
            
            # Compatibility score: weighted combination
            # Direct matches contribute 100%, partial matches contribute 50%
            weighted_matches = direct_matches + (related_matches * 0.5)
            compatibility_score = min(weighted_matches / total_required, 0.98)  # Cap at 98% for realism
            
            # Determine confidence level
            if compatibility_score >= 0.8 and skill_coverage >= 0.7:
                confidence = "high"
            elif compatibility_score >= 0.55 and skill_coverage >= 0.4:
                confidence = "medium"
            else:
                confidence = "low"

            # Categorize missing skills by criticality
            critical_missing = missing_skills[:3]  # Top 3 most important
            trainable_missing = missing_skills[3:6] if len(missing_skills) > 3 else []
            advanced_missing = missing_skills[6:] if len(missing_skills) > 6 else []

            return {
                "compatibility_score": compatibility_score,
                "confidence": confidence,
                "skill_coverage": skill_coverage,
                "matched_skills": matched_skills,
                "partial_matches": partial_matches,
                "missing_skills": missing_skills,
                "ai_reasoning": ai_reasoning,
                "skill_gap_analysis": {
                    "critical_gaps": critical_missing,
                    "trainable_skills": trainable_missing,
                    "advanced_skills": advanced_missing,
                    "strength_areas": matched_skills[:5],  # Top 5 matched skills
                    "total_gaps": len(missing_skills),
                    "gap_severity": "high" if len(critical_missing) > 2 else "medium" if len(critical_missing) > 0 else "low"
                },
                "match_metrics": {
                    "direct_matches": direct_matches,
                    "related_matches": related_matches,
                    "total_required": total_required,
                    "match_percentage": round(compatibility_score * 100, 1)
                }
            }

        except Exception as e:
            logger.error(f"AI compatibility calculation failed: {str(e)}")
            # Fallback to basic calculation
            matched_count = len([skill for skill in user_skills if any(
                self._basic_skill_match(skill.lower(), job_skill.lower()) 
                for job_skill in job_skills
            )])
            basic_score = matched_count / len(job_skills) if job_skills else 0
            
            return {
                "compatibility_score": basic_score,
                "confidence": "low",
                "skill_coverage": basic_score,
                "matched_skills": [],
                "partial_matches": [],
                "missing_skills": job_skills,
                "ai_reasoning": f"Basic calculation used due to error. Match score: {round(basic_score * 100, 1)}%. Please review job requirements and your skills carefully.",
                "skill_gap_analysis": {
                    "critical_gaps": job_skills[:3],
                    "trainable_skills": job_skills[3:6] if len(job_skills) > 3 else [],
                    "advanced_skills": [],
                    "strength_areas": [],
                    "total_gaps": len(job_skills),
                    "gap_severity": "unknown"
                },
                "match_metrics": {
                    "direct_matches": matched_count,
                    "related_matches": 0,
                    "total_required": len(job_skills),
                    "match_percentage": round(basic_score * 100, 1)
                }
            }

    def _check_skill_relationship(self, user_skill: str, job_skill: str) -> bool:
        """Check if two skills are related through common mappings."""
        skill_relationships = {
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
        
        # Check direct relationships
        for key, related_skills in skill_relationships.items():
            if key in user_skill and job_skill in related_skills:
                return True
            if key in job_skill and user_skill in related_skills:
                return True
            # Check if both are in the same relationship group
            if user_skill in related_skills and job_skill in related_skills:
                return True
                
        return False

    def _basic_skill_match(self, user_skill: str, job_skill: str) -> bool:
        """Basic skill matching for fallback."""
        return (user_skill == job_skill or 
                user_skill in job_skill or 
                job_skill in user_skill)

    def _skills_match(self, user_skill: str, job_skill: str) -> bool:
        user_skill = user_skill.lower().strip()
        job_skill = job_skill.lower().strip()

        # Exact match
        if user_skill == job_skill:
            return True

        # Handle spacing variations (e.g., "tailwind css" vs "tailwindcss")
        user_skill_normalized = user_skill.replace(' ', '').replace('-', '').replace('_', '')
        job_skill_normalized = job_skill.replace(' ', '').replace('-', '').replace('_', '')

        if user_skill_normalized == job_skill_normalized:
            return True

        # Check if one skill contains the other (with and without spaces)
        if (user_skill in job_skill or
            job_skill in user_skill or
            user_skill_normalized in job_skill_normalized or
            job_skill_normalized in user_skill_normalized):
            return True

        # Common skill mappings with spacing variations
        skill_mappings = {
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

        # Check mappings for both original and normalized versions
        for main_skill, variations in skill_mappings.items():
            if (user_skill in variations or user_skill == main_skill or
                job_skill in variations or job_skill == main_skill or
                user_skill_normalized in variations or user_skill_normalized == main_skill or
                job_skill_normalized in variations or job_skill_normalized == main_skill):
                return True

        # Check reverse mappings
        for main_skill, variations in skill_mappings.items():
            if user_skill == main_skill and job_skill in variations:
                return True
            if job_skill == main_skill and user_skill in variations:
                return True

        return False

    def get_match_statistics(self, job_matches: List[JobMatch]) -> Dict:
        if not job_matches:
            return {"total_jobs": 0, "matches": 0, "average_score": 0}
        
        matches = [job for job in job_matches if job.match_result.is_match]
        total_score = sum(job.match_result.match_score for job in job_matches)
        
        return {
            "total_jobs": len(job_matches),
            "matches": len(matches),
            "match_rate": len(matches) / len(job_matches) * 100,
            "average_score": total_score / len(job_matches),
            "top_score": max(job.match_result.match_score for job in job_matches),
        }
    
    def _create_search_text_from_resume_text(self, resume_text: str) -> str:
        # For skills-based text (from user profiles), use directly
        # For full resume text, extract key terms
        if len(resume_text) < 500:  # Likely skills text
            return resume_text
        else:
            # Extract key skills and terms from longer resume text
            key_terms = []
            lines = resume_text.lower().split('\n')
            for line in lines:
                if any(keyword in line for keyword in ['skill', 'technology', 'experience', 'proficient']):
                    key_terms.append(line.strip())
            return ' '.join(key_terms[:10])  # Limit to top terms
    
    async def _evaluate_text_based_match(self, resume_text: str, job_content: str) -> MatchResult:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", """
                You are an expert job matching system. Analyze the compatibility between 
                a candidate's profile and a job posting.
                
                Consider:
                - Skills alignment
                - Experience relevance
                - Requirements fulfillment
                
                Provide a match score (0-100), identify matching skills, missing skills,
                and explain your reasoning.
                """),
                ("human", """
                Candidate Profile:
                {resume_text}
                
                Job Posting:
                {job_content}
                
                {format_instructions}
                """)
            ])
            
            formatted_prompt = prompt.format_messages(
                resume_text=resume_text,
                job_content=job_content,
                format_instructions=self.parser.get_format_instructions()
            )
            
            response = await self.llm.ainvoke(formatted_prompt)
            return self.parser.parse(response.content)
            
        except Exception as e:
            return MatchResult(
                match_score=50.0,
                is_match=True,
                matching_skills=["General skills match"],
                missing_skills=["Unable to analyze specific skills"],
                reason="Fallback match due to evaluation error"
            )
        