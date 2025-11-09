import PyPDF2
import mammoth
import docx
import logging

from io import BytesIO
from typing import Dict

logger = logging.getLogger(__name__)


SUPPORTED_FILE_TYPES: Dict[str, str] = {
    "application/pdf": "PDF",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/msword": "DOC"
}


def extract_text_from_file(file_content: bytes, file_type: str) -> str:
    if file_type not in SUPPORTED_FILE_TYPES:
        supported_types = ", ".join(SUPPORTED_FILE_TYPES.values())
        raise ValueError(f"Unsupported file type. Supported types: {supported_types}")
    
    extractors = {
        "application/pdf": extract_from_pdf,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": extract_from_docx,
        "application/msword": extract_from_doc
    }
    
    try:
        text = extractors[file_type](file_content)
        if not text or not text.strip():
            raise ValueError("No readable text found in the file")
        return text
    except Exception as e:
        file_type_name = SUPPORTED_FILE_TYPES[file_type]
        logger.error(f"Failed to extract text from {file_type_name}: {str(e)}")
        raise RuntimeError(f"Failed to extract text from {file_type_name}: {str(e)}")


def extract_from_pdf(file_content: bytes) -> str:
    try:
        pdf_file = BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        if len(pdf_reader.pages) == 0:
            raise ValueError("PDF file has no pages")
        
        text_parts = []
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text and page_text.strip():
                text_parts.append(page_text)
        
        return "\n".join(text_parts).strip()
    except Exception as e:
        raise RuntimeError(f"PDF extraction failed: {str(e)}")


def extract_from_docx(file_content: bytes) -> str:
    try:
        doc = docx.Document(BytesIO(file_content))
        text_parts = [
            paragraph.text 
            for paragraph in doc.paragraphs 
            if paragraph.text.strip()
        ]
        return "\n".join(text_parts).strip()
    except Exception as e:
        raise RuntimeError(f"DOCX extraction failed: {str(e)}")


def extract_from_doc(file_content: bytes) -> str:
    try:
        result = mammoth.extract_raw_text(BytesIO(file_content))
        return result.value.strip()
    except Exception as e:
        raise RuntimeError(f"DOC extraction failed: {str(e)}")
