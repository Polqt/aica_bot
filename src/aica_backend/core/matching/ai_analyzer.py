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
            logger.info(f"🤖 Starting AI analysis for {job_title} at {company}...")
            
            user_skills_text = ", ".join(user_skills) if user_skills else "No skills listed"
            job_skills_text = ", ".join(job_skills) if job_skills else "No specific skills listed"
            matched_skills_text = ", ".join(matched_skills) if matched_skills else "None"
            partial_matches_text = ", ".join(partial_matches) if partial_matches else "None"
            missing_skills_text = ", ".join(missing_skills) if missing_skills else "None"
            
            analysis_prompt = f"""As an elite technical recruiter and career advisor, provide a comprehensive job fit analysis.

CANDIDATE'S SKILLS: {user_skills_text}
JOB REQUIREMENTS: {job_skills_text}
POSITION: {job_title} at {company}

MATCH BREAKDOWN:
• Direct Matches: {matched_skills_text}
• Related Skills: {partial_matches_text}
• Missing Skills: {missing_skills_text}
• Overall Match: {round(compatibility_score * 100, 1)}%

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
            
            logger.info("📤 Sending request to Anthropic API...")
            response = await self.llm.ainvoke(analysis_prompt)
            logger.info(f"✅ AI analysis completed successfully ({len(response.content)} chars)")
            return response.content
        
        except Exception as e:
            logger.error(f"AI analysis generation failed: {str(e)}")
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
        """Generate fallback analysis when AI is unavailable.
        
        Args:
            matched_skills: Skills that match exactly
            partial_matches: Skills that are related
            missing_skills: Skills the candidate lacks
            compatibility_score: Overall match score
            job_title: Position title
            
        Returns:
            Basic analysis text
        """
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
