from .file_utils import (
    SUPPORTED_FILE_TYPES,
    extract_text_from_file,
    extract_from_pdf,
    extract_from_docx,
    extract_from_doc
)

from .pattern_utils import (
    EMAIL_PATTERN,
    PHONE_PATTERN,
    LINKEDIN_PATTERN,
    EXPERIENCE_YEAR_PATTERNS,
    extract_email,
    extract_phone,
    extract_linkedin,
    estimate_experience_years,
    build_skill_patterns,
    match_skill_pattern
)

from .text_utils import (
    extract_json_from_text,
    clean_extracted_name,
    apply_smart_casing,
    remove_section_from_text,
    normalize_skill_capitalization,
    normalize_whitespace,
    remove_duplicates_preserve_order
)

from .validation_utils import (
    is_likely_person_name,
    is_likely_reference_name,
    extract_name_from_text,
    is_valid_skill
)

from .config_loader import (
    load_skill_extraction_config,
    load_skills_data,
    load_name_extraction_config,
    load_skill_normalizations
)

__all__ = [
    'SUPPORTED_FILE_TYPES',
    'extract_text_from_file',
    'extract_from_pdf',
    'extract_from_docx',
    'extract_from_doc',
    'EMAIL_PATTERN',
    'PHONE_PATTERN',
    'LINKEDIN_PATTERN',
    'EXPERIENCE_YEAR_PATTERNS',
    'extract_email',
    'extract_phone',
    'extract_linkedin',
    'estimate_experience_years',
    'build_skill_patterns',
    'match_skill_pattern',
    'extract_json_from_text',
    'clean_extracted_name',
    'apply_smart_casing',
    'remove_section_from_text',
    'normalize_skill_capitalization',
    'normalize_whitespace',
    'remove_duplicates_preserve_order',
    'is_likely_person_name',
    'is_likely_reference_name',
    'extract_name_from_text',
    'is_valid_skill',
    'load_skill_extraction_config',
    'load_skills_data',
    'load_name_extraction_config',
    'load_skill_normalizations'
]
