"""
Database helper utilities for common operations.
"""
import json
from typing import Any, Optional


def handle_db_response(response, operation: str):
    """
    Handle database response and raise error if operation failed.
    
    Args:
        response: Supabase response object
        operation: Description of the operation for error messages
        
    Returns:
        The response object if successful
        
    Raises:
        ValueError: If the operation failed
    """
    if hasattr(response, 'error') and response.error:
        error_msg = f"Database {operation} failed: {response.error}"
        raise ValueError(error_msg)
    return response


def deserialize_json_field(data: Any, field_name: str, default: Any = None) -> Any:
    """
    Safely deserialize a JSON field from database response.
    
    Args:
        data: Dictionary containing the field
        field_name: Name of the field to deserialize
        default: Default value if deserialization fails
        
    Returns:
        Deserialized value or default
    """
    field_value = data.get(field_name)
    
    if not field_value:
        return default
    
    # If already deserialized
    if not isinstance(field_value, str):
        return field_value
    
    # Try to parse JSON string
    try:
        return json.loads(field_value)
    except (json.JSONDecodeError, TypeError):
        return default
