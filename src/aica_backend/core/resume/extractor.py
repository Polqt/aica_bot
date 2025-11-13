from utils.file_utils import (
    SUPPORTED_FILE_TYPES,
    extract_text_from_file
)


class FileExtractor:
    SUPPORTED_FILE_TYPES = SUPPORTED_FILE_TYPES
    
    @classmethod
    def extract_text_from_file(cls, file_content: bytes, file_type: str) -> str:
        return extract_text_from_file(file_content, file_type)
