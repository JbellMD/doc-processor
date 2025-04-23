"""
Image Extraction Utilities

Provides functions to extract images from PDF and DOCX files.
"""

import io
import base64
from typing import List, Dict, Any
from PIL import Image

# For PDF image extraction
import fitz  # PyMuPDF
# For DOCX image extraction
import docx
from .ocr_utils import ocr_image_from_base64, image_perceptual_hash


def extract_images_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    """
    Extract images from a PDF file using PyMuPDF (fitz).
    Returns a list of dicts with base64-encoded image data and metadata.
    """
    images = []
    doc = fitz.open(file_path)
    for page_num in range(len(doc)):
        page = doc[page_num]
        img_list = page.get_images(full=True)
        for img_index, img in enumerate(img_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            img_format = base_image["ext"]
            b64 = base64.b64encode(image_bytes).decode("utf-8")
            # OCR and perceptual hash
            ocr = ocr_image_from_base64(b64)
            phash = image_perceptual_hash(b64)
            images.append({
                "type": "symbol_image",
                "content": b64,
                "format": img_format,
                "meta": {
                    "page": page_num + 1,
                    "index": img_index,
                    "ocr_text": ocr["text"],
                    "ocr_confidence": ocr["confidence"],
                    "phash": phash
                }
            })
    return images

def extract_images_from_docx(file_path: str) -> List[Dict[str, Any]]:
    """
    Extract images from a DOCX file using python-docx.
    Returns a list of dicts with base64-encoded image data and metadata.
    """
    images = []
    doc = docx.Document(file_path)
    rels = doc.part.rels
    for rel in rels:
        rel_obj = rels[rel]
        if "image" in rel_obj.target_ref:
            image_part = rel_obj.target_part
            image_bytes = image_part.blob
            img_format = image_part.content_type.split("/")[-1]
            b64 = base64.b64encode(image_bytes).decode("utf-8")
            # OCR and perceptual hash
            ocr = ocr_image_from_base64(b64)
            phash = image_perceptual_hash(b64)
            images.append({
                "type": "symbol_image",
                "content": b64,
                "format": img_format,
                "meta": {
                    "relationship_id": rel,
                    "ocr_text": ocr["text"],
                    "ocr_confidence": ocr["confidence"],
                    "phash": phash
                }
            })
    return images
