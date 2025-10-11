import warnings

from core.resume import (
    ResumeParser,
    ResumeSkills,
    PersonalInfo,
    ParsedResume
)

warnings.warn(
    DeprecationWarning,
    stacklevel=2
)

# Re-export for backward compatibility
__all__ = [
    "ResumeParser",
    "ResumeSkills",
    "PersonalInfo",
    "ParsedResume"
]
