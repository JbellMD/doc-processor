"""
Export Mistral 7B Training Data Script

This script processes a document (PDF/DOCX/TXT), extracts text, images, and symbols,
and outputs a JSONL file in a format suitable for Mistral 7B training.
"""

import os
import sys
import json
from utils.document_extractor import DocumentExtractor
from utils.symbol_utils import extract_unicode_symbols, extract_math_expressions

# Usage: python export_mistral_jsonl.py <input_file> <output_jsonl>
def process_document_for_mistral(input_file, output_jsonl):
    extractor = DocumentExtractor()
    result = extractor.extract_with_images(input_file)

    samples = []
    # Add text (split by page/paragraph if available)
    text_chunks = []
    if "pages" in result and result["pages"]:
        for i, page in enumerate(result["pages"]):
            text_chunks.append((page, {"page": i+1}))
    elif "paragraphs" in result and result["paragraphs"]:
        for i, para in enumerate(result["paragraphs"]):
            text_chunks.append((para, {"paragraph": i+1}))
    elif "text" in result and result["text"]:
        text_chunks.append((result["text"], {}))

    for chunk, meta in text_chunks:
        # Add the text sample
        samples.append({
            "type": "text",
            "content": chunk,
            "meta": meta
        })
        # Extract and add Unicode symbols
        for symbol in extract_unicode_symbols(chunk):
            symbol["meta"].update(meta)
            samples.append(symbol)
        # Extract and add math expressions
        for math in extract_math_expressions(chunk):
            math["meta"].update(meta)
            samples.append(math)

    # Add images
    for img in result.get("images", []):
        samples.append(img)

    # Write to JSONL
    with open(output_jsonl, "w", encoding="utf-8") as f:
        for sample in samples:
            f.write(json.dumps(sample, ensure_ascii=False) + "\n")
    print(f"Exported {len(samples)} samples to {output_jsonl}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python export_mistral_jsonl.py <input_file> <output_jsonl>")
        sys.exit(1)
    process_document_for_mistral(sys.argv[1], sys.argv[2])
