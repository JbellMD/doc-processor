"""
OCR Utilities for Symbol Images

Provides functions to run OCR on images, extract single-character symbols, and compute perceptual hashes for clustering.
"""
import io
import base64
from typing import Dict, Any
from PIL import Image
import pytesseract
import imagehash

def ocr_image_from_base64(b64_image: str) -> Dict[str, Any]:
    """
    Runs OCR on a base64-encoded image. Returns text and confidence.
    """
    image = Image.open(io.BytesIO(base64.b64decode(b64_image)))
    ocr_result = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    text = " ".join([t for t in ocr_result['text'] if t.strip()])
    conf = [int(c) for c in ocr_result['conf'] if c.isdigit()]
    avg_conf = sum(conf)/len(conf) if conf else 0
    return {"text": text, "confidence": avg_conf}

def image_perceptual_hash(b64_image: str) -> str:
    """
    Computes a perceptual hash (phash) for a base64-encoded image.
    Useful for clustering visually similar symbols.
    """
    image = Image.open(io.BytesIO(base64.b64decode(b64_image)))
    return str(imagehash.phash(image))
