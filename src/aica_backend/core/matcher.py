from langchain_anthropic import ChatAnthropic
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain.prompts import ChatPromptTemplate
from typing import Dict

class JobMatcher:
    def __init__(self):
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0)
        
        self.response_schemas = [
            ResponseSchema(
                name="is_match",
                description="Whether the candidate's skills match the job requirements. Return 'true' or 'false'."
            ),
            ResponseSchema(
                name="reason",
                description="A brief explanation of why the candidate is or isn't a match for the job."
            )
        ]
        
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are an expert job interviewer with decades of experience. Analyze the resume and job posting to determine if the candidate is a good fit. Be critical in your assessment and accept only applicants that meet at least 75% of the requirements."
                ),
                (
                    "human",
                    """
                        Resume: {resume}
                        
                        Job Posting: {job_posting}

                        Determine if the candidate is a good fit for the job.
                        {format_instructions}
                    """,
                ),
            ]
        )
        
        self.output_parser = StructuredOutputParser.from_response_schemas(
            self.response_schemas
        )
        
    async def evaluate_match(self, resume: str, job_posting: str) -> Dict:
        format_prompt = self.prompt.format_prompt(
            resume=resume,
            job_posting=job_posting,
            format_instructions=self.output_parser.get_format_instructions()
        )
        
        response = await self.llm.invoke(format_prompt)
        return self.output_parser.parse(response)