import json
import logging
from pathlib import Path
from functools import lru_cache
from typing import Dict, Tuple, List

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def load_skill_extraction_config() -> dict:
    try:
        data_dir = Path(__file__).parent.parent / 'data'
        with open(data_dir / 'skill_extraction_config.json', 'r', encoding='utf-8') as f:
            config = json.load(f)
        logger.info(f"Loaded skill extraction config with {len(config)} sections")
        return config
    except Exception as e:
        logger.error(f"Error loading skill extraction config: {e}")
        return {}


@lru_cache(maxsize=1)
def load_skills_data() -> Tuple[List[str], List[str]]:
    try:
        data_dir = Path(__file__).parent.parent / 'data'
        
        with open(data_dir / 'technical_skills.json', 'r', encoding='utf-8') as f:
            technical_data = json.load(f)
            technical_skills = []
            for category in technical_data.values():
                technical_skills.extend(category)
        
        with open(data_dir / 'soft_skills.json', 'r', encoding='utf-8') as f:
            soft_data = json.load(f)
            soft_skills = []
            for category in soft_data.values():
                soft_skills.extend(category)
        
        logger.info(f"Loaded {len(technical_skills)} technical skills and {len(soft_skills)} soft skills from JSON")
        return technical_skills, soft_skills
        
    except Exception as e:
        logger.error(f"Error loading skills data: {e}")
        return [], []


@lru_cache(maxsize=1)
def load_name_extraction_config() -> dict:
    try:
        config_path = Path(__file__).parent.parent / 'data' / 'name_extraction_config.json'
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading name extraction config: {e}")
        return {
            "reference_keywords": [],
            "skip_keywords": [],
            "reference_indicators": [],
            "invalid_name_words": [],
            "name_prefixes_to_remove": []
        }


@lru_cache(maxsize=1)
def load_skill_normalizations() -> Dict[str, str]:
    try:
        data_dir = Path(__file__).parent.parent / 'data'
        with open(data_dir / 'skill_normalizations.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data['normalizations']
    except Exception as e:
        logger.error(f"Error loading skill normalizations: {e}")
        return {}
