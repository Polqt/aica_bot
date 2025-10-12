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

__all__ = [
    "JobMatcher",
    "MatchResult",
    "JobMatch"
]
