from langchain_core.prompts import ChatPromptTemplate


def create_job_extraction_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        (
            "system",
            """
            You are an expert job posting analyzer. Extract structured information 
            from job postings with high accuracy. Focus on identifying all relevant 
            skills, requirements, and qualifications that would be important for 
            job matching algorithms.

            CRITICAL: You must provide valid, complete JSON output. Do not repeat 
            the same text multiple times. If you encounter parsing issues, provide
            a minimal valid response rather than malformed output.

            For the title field, extract ONLY the actual job title, not repeated text.
            """
        ),
        (
            "human",
            """
            Extract structured information from this job posting:
            {job_content}

            {format_instructions}

            Remember: Provide clean, non-repetitive output. If the content is unclear,
            make reasonable assumptions but keep the response well-structured.
            """
        )
    ])
