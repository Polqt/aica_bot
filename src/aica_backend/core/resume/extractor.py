from utils.file_utils import (
    SUPPORTED_FILE_TYPES,
    extract_text_from_file,
    extract_from_pdf,
    extract_from_docx,
    extract_from_doc
)


class FileExtractor:
    SUPPORTED_FILE_TYPES = SUPPORTED_FILE_TYPES
    
    @classmethod
    def extract_text_from_file(cls, file_content: bytes, file_type: str) -> str:
        return extract_text_from_file(file_content, file_type)
    
    @staticmethod
    def _extract_from_pdf(file_content: bytes) -> str:
        return extract_from_pdf(file_content)
    
    @staticmethod
    def _extract_from_docx(file_content: bytes) -> str:
        return extract_from_docx(file_content)
    
    @staticmethod
    def _extract_from_doc(file_content: bytes) -> str:
        return extract_from_doc(file_content)
