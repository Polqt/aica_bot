import logging
from typing import List

from langchain_anthropic import ChatAnthropic

from prompts.matching_prompts import create_ai_analysis_prompt, create_fallback_analysis

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
            analysis = create_ai_analysis_prompt(
                user_skills,
                job_skills,
                job_title,
                company,
                matched_skills,
                partial_matches,
                missing_skills,
                compatibility_score
            )
            
            response = await self.llm.ainvoke(analysis)
            return response.content
        
        except Exception as e:
            return create_fallback_analysis(
                matched_skills,
                partial_matches,
                missing_skills,
                compatibility_score,
                job_title
            )
