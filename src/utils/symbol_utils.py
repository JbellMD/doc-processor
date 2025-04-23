"""
Symbol Extraction Utilities

Extracts special symbols (Unicode, math, etc.) from text, and tags them for training data.
"""
import re
import unicodedata
from typing import List, Dict, Any

def extract_unicode_symbols(text: str) -> List[Dict[str, Any]]:
    """
    Extracts all non-ASCII symbols from text, tagging with unicode and description.
    Returns a list of dicts.
    """
    symbols = []
    for idx, char in enumerate(text):
        if ord(char) > 127:
            try:
                desc = unicodedata.name(char)
            except ValueError:
                desc = "UNKNOWN"
            symbols.append({
                "type": "symbol",
                "content": char,
                "meta": {
                    "unicode": f"U+{ord(char):04X}",
                    "desc": desc,
                    "position": idx
                }
            })
    return symbols

def extract_math_expressions(text: str) -> List[Dict[str, Any]]:
    """
    Extracts LaTeX/math expressions from text using regex.
    Returns a list of dicts.
    """
    math_patterns = [
        r'\$.*?\$',           # $...$
        r'\\\(.*?\\\)',    # \( ... \)
        r'\\\[.*?\\\]'     # \[ ... \]
    ]
    matches = []
    for pat in math_patterns:
        for m in re.finditer(pat, text, re.DOTALL):
            matches.append({
                "type": "math",
                "content": m.group(0),
                "meta": {
                    "start": m.start(),
                    "end": m.end()
                }
            })
    return matches
