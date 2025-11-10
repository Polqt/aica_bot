from utils.file_utils import (
    SUPPORTED_FILE_TYPES,
    extract_text_from_file
)


class FileExtractor:
    """Wrapper class for file extraction utilities."""
    SUPPORTED_FILE_TYPES = SUPPORTED_FILE_TYPES
    
    @classmethod
    def extract_text_from_file(cls, file_content: bytes, file_type: str) -> str:
        """Extract text from a file based on its type.
        
        Args:
            file_content: The file content as bytes
            file_type: The file type/extension
            
        Returns:
            Extracted text from the file
        """
        return extract_text_from_file(file_content, file_type)
