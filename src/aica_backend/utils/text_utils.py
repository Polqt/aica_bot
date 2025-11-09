import re
import json
from typing import Optional, List


def extract_json_from_text(text: str) -> str:
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        potential_json = json_match.group()
        try:
            json.loads(potential_json)
            return potential_json
        except json.JSONDecodeError:
            pass
    return text


def clean_extracted_name(name: str, prefixes_to_remove: List[str]) -> str:
    if not name:
        return name
    
    name_lower = name.lower().strip()
    
    for prefix in prefixes_to_remove:
        if name_lower.startswith(prefix):
            name = name[len(prefix):].strip()
            break
    
    name = ' '.join(name.split())
    
    if name.isupper() or name.islower():
        name = name.title()
    
    return name


def apply_smart_casing(skill: str) -> str:
    acronyms = {'api', 'ui', 'ux', 'cli', 'sdk', 'ide', 'orm', 'mvc', 'mvvm', 
               'crud', 'jwt', 'oauth', 'ssl', 'tls', 'http', 'https', 'ftp',
               'ssh', 'tcp', 'udp', 'ip', 'dns', 'cdn', 'seo', 'cms'}
    
    parts = skill.replace('/', ' / ').replace('.', ' . ').split()
    processed_parts = []
    
    for part in parts:
        part_lower = part.lower()
        if part_lower in acronyms:
            processed_parts.append(part_lower.upper())
        elif part in ['/', '.', '-']:
            processed_parts.append(part)
        else:
            processed_parts.append(part.capitalize())
    
    result = ' '.join(processed_parts)
    result = result.replace(' / ', '/').replace(' . ', '.')
    
    return result


def remove_section_from_text(text: str, section_headers: List[str], other_headers: List[str]) -> str:
    lines = text.split('\n')
    filtered_lines = []
    skip_section = False
    skip_count = 0
    
    for line in lines:
        line_stripped = line.strip().lower()
        
        if not line_stripped:
            if not skip_section:
                filtered_lines.append(line)
            continue
        
        is_section_header = any(
            header in line_stripped and len(line_stripped) < 60 
            and sum(c.isdigit() for c in line_stripped) < 6
            for header in section_headers
        )
        
        if is_section_header:
            skip_section = True
            skip_count = 0
            continue
        
        if skip_section:
            is_other_header = any(
                header in line_stripped and len(line_stripped) < 60
                and line_stripped.count(':') <= 1
                for header in other_headers
            )
            
            if is_other_header or skip_count > 30:
                skip_section = False
            else:
                skip_count += 1
        
        if not skip_section:
            filtered_lines.append(line)
    
    return '\n'.join(filtered_lines)


def normalize_skill_capitalization(skill: str, ai_variations: set) -> str:
    skill_clean = skill.strip()
    skill_lower = skill_clean.lower()
    
    if skill_lower in ai_variations or skill_clean in ai_variations:
        return 'AI'
    
    return skill_clean


def normalize_whitespace(text: str) -> str:
    return ' '.join(text.split())


def remove_duplicates_preserve_order(items: List[str]) -> List[str]:
    return list(dict.fromkeys(items))
