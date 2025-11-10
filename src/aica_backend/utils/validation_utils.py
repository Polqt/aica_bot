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
    
    # First pass: Look for name in first 10 lines, skip reference sections entirely
    candidates = []
    
    for i, line in enumerate(lines[:10]):  
        line_lower = line.lower()
        
        # Skip lines with reference indicators
        if any(keyword in line_lower for keyword in reference_keywords):
            continue
        
        # Skip common header/metadata lines
        if any(keyword in line_lower for keyword in skip_keywords):
            continue
        
        # Skip lines with credentials/titles that might confuse name extraction
        # These often appear BEFORE the actual name
        if any(indicator in line_lower for indicator in ['mba', 'lpt', 'phd', 'ph.d.', 'md', 'm.d.']):
            # Check if this looks like credentials without a full name
            words = line.split()
            # If line is mostly titles/credentials (e.g., "MBA, LPT"), skip it
            if len(words) <= 3 and any(w.lower().replace(',', '') in ['mba', 'lpt', 'phd', 'md'] for w in words):
                continue
        
        # Extract potential names from this line
        words = line.split()
        
        # Handle names with unusual spacing (e.g., "BILLY M AGALO NA" -> "Billy Magalona")
        # First, try to detect if this is an ALL CAPS name with spacing issues
        if len(words) >= 2 and all(w.isupper() for w in words if w.isalpha()):
            # Try to reconstruct the name by looking for patterns
            # E.g., "BILLY M AGALO NA" -> first word is likely first name, rest could be surname
            if 2 <= len(words) <= 6:
                # Filter out single letters and reconstruct
                name_parts = []
                i_word = 0
                while i_word < len(words):
                    word = words[i_word]
                    # Skip punctuation-only words
                    if not word.replace(',', '').replace('.', '').isalpha():
                        i_word += 1
                        continue
                    
                    # If it's a single letter or very short word, it might be a middle initial or part of split surname
                    if len(word) == 1:
                        # Single letter - could be middle initial or part of broken surname
                        # If it's not the last word, check if next words are also short
                        if i_word + 1 < len(words):
                            # Peek ahead to see if we have multiple short segments
                            next_word = words[i_word + 1]
                            if len(next_word) <= 5:
                                # Likely part of broken surname: "M AGALO NA" -> "Magalona"
                                # Collect all consecutive short segments
                                surname_parts = [word]
                                j = i_word + 1
                                while j < len(words) and len(words[j]) <= 5 and words[j].isalpha():
                                    surname_parts.append(words[j])
                                    j += 1
                                # Combine into single surname
                                combined_surname = ''.join(surname_parts).title()
                                name_parts.append(combined_surname)
                                i_word = j
                            else:
                                # Just a middle initial
                                name_parts.append(word)
                                i_word += 1
                        else:
                            name_parts.append(word)
                            i_word += 1
                    elif len(word) <= 5 and i_word > 0:
                        # Short word after first name - might be part of broken surname
                        # Check if next words are also short
                        if i_word + 1 < len(words) and len(words[i_word + 1]) <= 5:
                            # Likely part of broken surname: "AGALO NA" -> "Agalona"
                            surname_parts = [word]
                            j = i_word + 1
                            while j < len(words) and len(words[j]) <= 5 and words[j].isalpha():
                                surname_parts.append(words[j])
                                j += 1
                            combined_surname = ''.join(surname_parts).title()
                            name_parts.append(combined_surname)
                            i_word = j
                        else:
                            name_parts.append(word.title())
                            i_word += 1
                    else:
                        name_parts.append(word.title())
                        i_word += 1
                
                if 2 <= len(name_parts) <= 4:
                    extracted_name = ' '.join(name_parts)
                    extracted_name = clean_extracted_name(extracted_name, prefixes_to_remove)
                    if not any(word in extracted_name.lower() for word in invalid_name_words):
                        # Verify this isn't a reference by checking position
                        if i < 3:  # Names in first 3 lines are more likely to be the actual name
                            candidates.append((i, extracted_name))
                        continue
        
        # Standard name extraction (existing logic)
        if 2 <= len(words) <= 5:  # Extended to 5 to allow middle names
            valid_words = []
            for word in words:
                # Remove common punctuation and check if it's a valid name word
                clean_word = word.replace('-', '').replace("'", '').replace('.', '').replace(',', '').replace('|', '')
                
                # Check if word is alphabetic and capitalized (typical for names)
                if clean_word and clean_word.isalpha() and word[0].isupper():
                    # Skip if word is a credential/title
                    if clean_word.lower() not in ['mba', 'lpt', 'phd', 'md', 'cpa', 'pmp']:
                        valid_words.append(word.rstrip(','))
            
            # Valid name candidate: 2-4 capitalized words
            if 2 <= len(valid_words) <= 4:
                # Check previous line doesn't contain reference keywords
                if i > 0:
                    prev_line_lower = lines[i-1].lower()
                    if any(keyword in prev_line_lower for keyword in reference_keywords):
                        continue
                
                # Check next line doesn't indicate this is a reference
                if i < len(lines) - 1:
                    next_line_lower = lines[i+1].lower()
                    if any(keyword in next_line_lower for keyword in reference_keywords):
                        continue
                
                extracted_name = clean_extracted_name(' '.join(valid_words), prefixes_to_remove)
                
                # Validate the name
                if not any(word in extracted_name.lower() for word in invalid_name_words):
                    # Add to candidates with line position for priority
                    candidates.append((i, extracted_name))
    
    # Prefer candidates from earlier lines (typically lines 1-5)
    if candidates:
        # Sort by line number (earlier is better)
        candidates.sort(key=lambda x: x[0])
        
        # Additional filtering: Skip first candidate if it appears to be in a reference context
        for line_num, name in candidates:
            # Check if this name appears near reference keywords in the full text
            if line_num < 3:  # Names in first 3 lines are prioritized
                return name
        
        # Fallback to first candidate
        return candidates[0][1]
    
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
