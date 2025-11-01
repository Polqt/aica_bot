from typing import Final


# Default embedding model from sentence-transformers
DEFAULT_EMBEDDING_MODEL: Final[str] = "all-MiniLM-L6-v2"

# Device to run embeddings on (cpu or cuda)
EMBEDDING_DEVICE: Final[str] = "cpu"

# Whether to normalize embeddings for better cosine similarity
NORMALIZE_EMBEDDINGS: Final[bool] = True

# Maximum size of each text chunk in characters
CHUNK_SIZE: Final[int] = 400

# Overlap between consecutive chunks to maintain context
CHUNK_OVERLAP: Final[int] = 50

# Separators for splitting text (in order of priority)
TEXT_SEPARATORS: Final[list[str]] = ["\n\n", "\n", ". ", "! ", "? ", ", ", " ", ""]

# Default path for FAISS index persistence
DEFAULT_VECTOR_STORE_PATH: Final[str] = "./faiss_job_index"

# FAISS index file extension
FAISS_INDEX_EXTENSION: Final[str] = ".faiss"


# Default number of results to return
DEFAULT_SEARCH_K: Final[int] = 10

# Minimum similarity score threshold for results (0.0 to 1.0)
DEFAULT_SCORE_THRESHOLD: Final[float] = 0.3

# Multiplier for initial search to allow for re-ranking
SEARCH_EXPANSION_FACTOR: Final[int] = 4

# Weight for top matching chunk
TOP_CHUNK_WEIGHT: Final[float] = 0.5

# Weight for second-best matching chunk
SECOND_CHUNK_WEIGHT: Final[float] = 0.25

# Weight for remaining chunks (averaged)
REMAINING_CHUNKS_WEIGHT: Final[float] = 0.15

# Weight for multiple match bonus
COVERAGE_BONUS_WEIGHT: Final[float] = 0.1

# Maximum coverage bonus multiplier
MAX_COVERAGE_BONUS: Final[float] = 1.0

# Divisor for coverage bonus calculation
COVERAGE_BONUS_DIVISOR: Final[int] = 5

# Standard metadata fields for job documents
JOB_METADATA_FIELDS: Final[list[str]] = [
    "job_id",
    "title",
    "company",
    "location",
    "is_dummy"
]

# Content for dummy initialization document
DUMMY_DOC_CONTENT: Final[str] = "Initialization document for job matching system"

# Dummy document metadata
DUMMY_DOC_METADATA: Final[dict] = {"job_id": "dummy", "is_dummy": True}
