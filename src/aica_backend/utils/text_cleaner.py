"""Text cleaning utilities for resume processing."""

import re


class TextCleaner:
    """Utilities for cleaning and normalizing resume text."""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean resume text by removing artifacts and normalizing whitespace.
        
        Args:
            text: Raw text extracted from resume
            
        Returns:
            Cleaned text with normalized spacing and removed artifacts
        """
        if not text:
            return ""
        
        # Remove common resume artifacts
        artifacts_to_remove = [
            r'Page \d+ of \d+',
            r'\x00',  # null characters
        ]
        
        for pattern in artifacts_to_remove:
            text = re.sub(pattern, '', text, flags=re.MULTILINE)
        
        # Clean up each line individually to preserve line structure
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Remove excessive horizontal whitespace within each line
            line = re.sub(r'[ \t]+', ' ', line)
            # Remove leading/trailing whitespace
            line = line.strip()
            # Only keep non-empty lines
            if line:
                cleaned_lines.append(line)
        
        # Join lines back with newlines
        cleaned_text = '\n'.join(cleaned_lines)
        
        return cleaned_text.strip()
