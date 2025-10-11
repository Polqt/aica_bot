import warnings

from core.matching import (
    JobMatcher,
    MatchResult,
    JobMatch
)

warnings.warn(
    DeprecationWarning,
    stacklevel=2
)

# Re-export for backward compatibility
__all__ = [
    "JobMatcher",
    "MatchResult",
    "JobMatch"
]
