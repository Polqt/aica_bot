import logging
from typing import List

from langchain_anthropic import ChatAnthropic

logger = logging.getLogger(__name__)


class AIAnalyzer:

    def __init__(self, llm: ChatAnthropic):
        self.llm = llm
    
    async def generate_comprehensive_analysis(
        self,
        user_skills: List[str],
        job_skills: List[str],
        job_title: str,
        company: str,
        matched_skills: List[str],
        partial_matches: List[str],
        missing_skills: List[str],
        compatibility_score: float
    ) -> str:
        try:
            user_skills_text = ", ".join(user_skills[:20]) if user_skills else "No skills listed"  # Limit to top 20
            job_skills_text = ", ".join(job_skills[:15]) if job_skills else "No specific skills listed"  # Limit to 15
            matched_skills_text = ", ".join(matched_skills[:10]) if matched_skills else "None"
            partial_matches_text = ", ".join(partial_matches[:8]) if partial_matches else "None"
            missing_skills_text = ", ".join(missing_skills[:10]) if missing_skills else "None"
            
            analysis = f"""As a technical recruiter, analyze this job match concisely.
                                **CANDIDATE SKILLS:** {user_skills_text}
                                **JOB REQUIREMENTS:** {job_skills_text}
                                **POSITION:** {job_title} at {company}

                                **MATCH BREAKDOWN:**
                                • Direct Matches ({len(matched_skills)}): {matched_skills_text}
                                • Related Skills ({len(partial_matches)}): {partial_matches_text}
                                • Missing Skills ({len(missing_skills)}): {missing_skills_text}
                                • Overall Match: {round(compatibility_score * 100, 1)}%
                                
                                -------------------------------
                               
                                 NOW ANALYZE THIS MATCH:

                                 Provide a focused 250-300 word analysis with:

                                **1. SKILL ALIGNMENT** (100-120 words)
                                Explain the compatibility in depth:
                                - What makes this a {round(compatibility_score * 100, 1)}% match?
                                - Key strengths that align with the role (Identify 3-4 specific skills that directly address the job's core requirements)
                                - Most important skill gaps (Prioritize the 2-3 missing skills that matter most for this role's success)
                                - Transferable skills from related matches (Explain how partial matches can bridge gaps or demonstrate capability)

                                **2. APPLICATION RECOMMENDATION** (60-80 words)
                                Give a clear, actionable verdict:
                                - Should they apply now? (Strong Yes/Yes/Maybe/Not Yet)
                                - Why or why not based on actual match quality (Reference specific skills, experience level, and market competitiveness).
                                - Interview success likelihood  
                                - Best approach if applying

                                **3. IMPROVEMENT STEPS** (60-80 words)
                                Provide a concrete development roadmap:
                                - (Prioritize by impact and feasibility - what will close the gap fastest?)                                   - Realistic timeline for readiness
                                - Quick wins to boost candidacy
                                - Alternative roles if better aligned  (Suggest 1-3 specific job titles that might be a stronger match given their current skills)

                                Be accurate, specific, and actionable. Focus on what matters most.
                            """
            
            response = await self.llm.ainvoke(analysis)
            return response.content
        
        except Exception as e:
            return self._generate_fallback_analysis(
                matched_skills,
                partial_matches,
                missing_skills,
                compatibility_score,
                job_title
            )
    
    def _generate_fallback_analysis(
        self,
        matched_skills: List[str],
        partial_matches: List[str],
        missing_skills: List[str],
        compatibility_score: float,
        job_title: str
    ) -> str:
        match_percentage = round(compatibility_score * 100, 1)
        
        analysis_parts = [
            f"**Match Score: {match_percentage}%**\n",
            f"**Position: {job_title}**\n",
            "\n**Skills Analysis:**\n"
        ]
        
        if matched_skills:
            analysis_parts.append(f"\n✓ **Direct Matches ({len(matched_skills)}):**\n")
            analysis_parts.append("• " + "\n• ".join(matched_skills[:10]))
        
        if partial_matches:
            analysis_parts.append(f"\n\n⚠️ **Related Skills ({len(partial_matches)}):**\n")
            analysis_parts.append("• " + "\n• ".join(partial_matches[:10]))
        
        if missing_skills:
            analysis_parts.append(f"\n\n✗ **Skills to Develop ({len(missing_skills)}):**\n")
            analysis_parts.append("• " + "\n• ".join(missing_skills[:10]))
        
        # Add recommendation
        analysis_parts.append("\n\n**Recommendation:**\n")
        if match_percentage >= 80:
            analysis_parts.append("Strong match! You should definitely apply for this position. Focus on highlighting your directly matching skills in your application.")
        elif match_percentage >= 60:
            analysis_parts.append("Good match! Consider applying, especially if you can quickly learn the missing skills. Emphasize your related experience and transferable skills.")
        elif match_percentage >= 40:
            analysis_parts.append("Moderate match. You may want to upskill in the missing areas before applying, or look for positions with requirements closer to your current skill set.")
        else:
            analysis_parts.append("Lower match. Consider this as a growth opportunity and focus on developing the missing skills before applying. Look for intermediate roles that bridge your current skills to this position's requirements.")
        
        return "".join(analysis_parts)
