from typing import Optional, List


def is_likely_person_name(skill: str) -> bool:
    if not skill or len(skill.strip()) < 3:
        return False
        
    skill_clean = skill.strip()
    words = skill_clean.split()
    
    if len(words) < 2 or len(words) > 4:
        return False
    
    all_capitalized = all(word[0].isupper() for word in words if word)
    
    if not all_capitalized:
        return False
    
    name_prefixes = ['dr.', 'dr', 'prof.', 'prof', 'mr.', 'mr', 'mrs.', 'mrs', 
                    'ms.', 'ms', 'atty.', 'atty', 'engr.', 'engr', 'sir', 'madam']
    
    first_word_lower = words[0].lower().rstrip('.')
    if first_word_lower in name_prefixes:
        return True
    
    if 2 <= len(words) <= 3:
        all_alphabetic = all(word.replace('.', '').replace(',', '').isalpha() for word in words)
        all_reasonable_length = all(len(word.replace('.', '').replace(',', '')) >= 2 for word in words)
        
        skill_lower = skill_clean.lower()
        common_skill_words = ['development', 'design', 'management', 'engineering', 
                             'programming', 'analysis', 'testing', 'data', 'web',
                             'mobile', 'cloud', 'software', 'quality', 'project',
                             'api', 'database', 'security', 'network']
        
        has_skill_indicator = any(word in skill_lower for word in common_skill_words)
        
        if all_alphabetic and all_reasonable_length and not has_skill_indicator:
            return True
    
    return False


def is_likely_reference_name(full_text: str, extracted_name: str, reference_indicators: List[str]) -> bool:
    if not extracted_name:
        return False
    
    name_positions = []
    text_lower = full_text.lower()
    name_lower = extracted_name.lower()
    
    start = 0
    while True:
        pos = text_lower.find(name_lower, start)
        if pos == -1:
            break
        name_positions.append(pos)
        start = pos + 1
    
    if not name_positions:
        return False
    
    first_pos = name_positions[0]
    
    if first_pos < 800:
        context_start = max(0, first_pos - 300)
        context_end = min(len(full_text), first_pos + 300)
        context = full_text[context_start:context_end].lower()
        
        for indicator in reference_indicators:
            if indicator in context:
                indicator_pos = context.find(indicator)
                name_pos_in_context = first_pos - context_start
                if abs(indicator_pos - name_pos_in_context) < 100:
                    return True
        
        return False
    
    if first_pos > 800:
        return True
    
    context_start = max(0, first_pos - 500)
    context_end = min(len(full_text), first_pos + 500)
    context = full_text[context_start:context_end].lower()
    
    for indicator in reference_indicators:
        if indicator in context:
            indicator_pos = context.find(indicator)
            name_pos_in_context = first_pos - context_start
            if abs(indicator_pos - name_pos_in_context) < 200:
                return True
    
    return False


def extract_name_from_text(text: str, reference_keywords: List[str], skip_keywords: List[str], 
                          invalid_name_words: List[str], prefixes_to_remove: List[str]) -> Optional[str]:
    from utils.text_utils import clean_extracted_name
    
    lines = text.split('\n')
    lines = [line.strip() for line in lines if line.strip()]
    
    if not lines:
        return None
    
    for i, line in enumerate(lines[:5]):  
        line_lower = line.lower()
        
        if any(keyword in line_lower for keyword in reference_keywords):
            continue
        
        if any(keyword in line_lower for keyword in skip_keywords):
            continue
        
        words = line.split()
        if 2 <= len(words) <= 4:
            valid_words = []
            for word in words:
                clean_word = word.replace('-', '').replace("'", '').replace('.', '').replace(',', '')
                if clean_word and clean_word.isalpha() and word[0].isupper():
                    valid_words.append(word.rstrip(','))
            
            if 2 <= len(valid_words) <= 4:
                if i > 0:
                    prev_line_lower = lines[i-1].lower()
                    if any(keyword in prev_line_lower for keyword in reference_keywords):
                        continue
                
                extracted_name = clean_extracted_name(' '.join(valid_words), prefixes_to_remove)
                
                if not any(word in extracted_name.lower() for word in invalid_name_words):
                    return extracted_name
    
    return None


def is_valid_skill(skill: str, valid_short_skills: set, ai_variations: set) -> bool:
    if not skill or not skill.strip():
        return False
    
    skill_clean = skill.strip()
    skill_lower = skill_clean.lower()
    
    if skill_lower in ai_variations or skill_clean in ai_variations:
        return True
    
    if len(skill_clean) <= 2:
        if skill_lower not in valid_short_skills:
            return False
    
    if is_likely_person_name(skill_clean):
        return False
    
    non_skill_words = {'and', 'or', 'the', 'with', 'for', 'from', 'to', 'in', 'at', 'by', 'on'}
    if skill_lower in non_skill_words:
        return False
    
    return True
