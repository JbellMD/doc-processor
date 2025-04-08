"""
Document Processor API

Flask-based API for document processing, including text extraction, analysis,
and insights generation.
"""

import os
import sys
import json
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.document_extractor import DocumentExtractor
from models.document_analyzer import DocumentAnalyzer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['UPLOAD_FOLDER'] = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'raw')
)
app.config['PROCESSED_FOLDER'] = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'processed')
)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload size
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'docx', 'doc', 'txt', 'rtf'}

# Create directories if they don't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['PROCESSED_FOLDER'], exist_ok=True)

# Initialize document processing components
document_extractor = DocumentExtractor()
document_analyzer = DocumentAnalyzer()


def allowed_file(filename: str) -> bool:
    """Check if file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/upload', methods=['POST'])
def upload_document():
    """
    Upload a document file for processing.
    
    Returns:
        JSON response with document ID and status
    """
    # Check if file is provided
    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No file provided'
        }), 400
    
    file = request.files['file']
    
    # Check if file is empty
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'No file selected'
        }), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'error': f'File type not allowed. Supported types: {", ".join(app.config["ALLOWED_EXTENSIONS"])}'
        }), 400
    
    try:
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        file_extension = os.path.splitext(original_filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Generate document ID
        document_id = str(uuid.uuid4())
        
        # Create document metadata
        document_metadata = {
            'id': document_id,
            'original_filename': original_filename,
            'filename': unique_filename,
            'file_path': file_path,
            'file_size': os.path.getsize(file_path),
            'upload_time': datetime.now().isoformat(),
            'status': 'uploaded'
        }
        
        # Save metadata
        metadata_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{document_id}.json")
        with open(metadata_path, 'w') as f:
            json.dump(document_metadata, f, indent=2)
        
        return jsonify({
            'success': True,
            'document_id': document_id,
            'filename': original_filename,
            'status': 'uploaded'
        })
    
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Error uploading document: {str(e)}"
        }), 500


@app.route('/api/process/<document_id>', methods=['POST'])
def process_document(document_id: str):
    """
    Process a previously uploaded document.
    
    Args:
        document_id: ID of the document to process
    
    Returns:
        JSON response with processing results
    """
    # Check if document exists
    metadata_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{document_id}.json")
    if not os.path.exists(metadata_path):
        return jsonify({
            'success': False,
            'error': f"Document not found: {document_id}"
        }), 404
    
    try:
        # Load document metadata
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        file_path = metadata['file_path']
        
        # Get processing options from request
        options = request.json or {}
        analysis_options = options.get('analysis_options', {
            'keywords': True,
            'entities': True,
            'summary': True,
            'topics': True,
            'sentiment': False,
            'readability': True
        })
        
        # Extract text from document
        logger.info(f"Extracting text from document: {document_id}")
        extraction_result = document_extractor.extract(file_path)
        
        if 'error' in extraction_result:
            return jsonify({
                'success': False,
                'error': extraction_result['error']
            }), 500
        
        # Analyze document content
        logger.info(f"Analyzing document content: {document_id}")
        analysis_result = document_analyzer.analyze(extraction_result['text'], analysis_options)
        
        # Combine results
        result = {
            'document_id': document_id,
            'filename': metadata['original_filename'],
            'extraction': extraction_result,
            'analysis': analysis_result,
            'processing_time': datetime.now().isoformat()
        }
        
        # Update metadata
        metadata['status'] = 'processed'
        metadata['processing_time'] = datetime.now().isoformat()
        metadata['word_count'] = analysis_result.get('word_count', 0)
        metadata['has_analysis'] = True
        
        # Save updated metadata and results
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        results_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{document_id}_results.json")
        with open(results_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        return jsonify({
            'success': True,
            'document_id': document_id,
            'results': result
        })
    
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Error processing document: {str(e)}"
        }), 500


@app.route('/api/documents', methods=['GET'])
def list_documents():
    """
    List all processed documents.
    
    Returns:
        JSON response with list of documents
    """
    try:
        documents = []
        
        # Get all metadata files
        for filename in os.listdir(app.config['PROCESSED_FOLDER']):
            if filename.endswith('.json') and not filename.endswith('_results.json'):
                file_path = os.path.join(app.config['PROCESSED_FOLDER'], filename)
                
                with open(file_path, 'r') as f:
                    metadata = json.load(f)
                
                # Add to list
                documents.append({
                    'id': metadata['id'],
                    'filename': metadata['original_filename'],
                    'upload_time': metadata['upload_time'],
                    'status': metadata['status'],
                    'file_size': metadata['file_size'],
                    'word_count': metadata.get('word_count', 0),
                    'has_analysis': metadata.get('has_analysis', False)
                })
        
        # Sort by upload time (newest first)
        documents.sort(key=lambda x: x['upload_time'], reverse=True)
        
        return jsonify({
            'success': True,
            'documents': documents
        })
    
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Error listing documents: {str(e)}"
        }), 500


@app.route('/api/documents/<document_id>', methods=['GET'])
def get_document(document_id: str):
    """
    Get document details and processing results.
    
    Args:
        document_id: ID of the document
    
    Returns:
        JSON response with document details and results
    """
    # Check if document exists
    metadata_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{document_id}.json")
    if not os.path.exists(metadata_path):
        return jsonify({
            'success': False,
            'error': f"Document not found: {document_id}"
        }), 404
    
    try:
        # Load document metadata
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        # Check if results exist
        results_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{document_id}_results.json")
        results = None
        
        if os.path.exists(results_path):
            with open(results_path, 'r') as f:
                results = json.load(f)
        
        return jsonify({
            'success': True,
            'metadata': metadata,
            'results': results
        })
    
    except Exception as e:
        logger.error(f"Error getting document: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Error getting document: {str(e)}"
        }), 500


@app.route('/api/documents/<document_id>', methods=['DELETE'])
def delete_document(document_id: str):
    """
    Delete a document and its processing results.
    
    Args:
        document_id: ID of the document
    
    Returns:
        JSON response with deletion status
    """
    # Check if document exists
    metadata_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{document_id}.json")
    if not os.path.exists(metadata_path):
        return jsonify({
            'success': False,
            'error': f"Document not found: {document_id}"
        }), 404
    
    try:
        # Load document metadata
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        # Delete file
        file_path = metadata['file_path']
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete metadata
        os.remove(metadata_path)
        
        # Delete results if they exist
        results_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{document_id}_results.json")
        if os.path.exists(results_path):
            os.remove(results_path)
        
        return jsonify({
            'success': True,
            'message': f"Document deleted: {document_id}"
        })
    
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Error deleting document: {str(e)}"
        }), 500


@app.route('/api/text-analysis', methods=['POST'])
def analyze_text():
    """
    Analyze raw text without document upload.
    
    Returns:
        JSON response with analysis results
    """
    # Get text and options from request
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({
            'success': False,
            'error': 'No text provided'
        }), 400
    
    text = data['text']
    options = data.get('options', {
        'keywords': True,
        'entities': True,
        'summary': True,
        'topics': True,
        'sentiment': False,
        'readability': True
    })
    
    try:
        # Analyze text
        analysis_result = document_analyzer.analyze(text, options)
        
        return jsonify({
            'success': True,
            'results': analysis_result
        })
    
    except Exception as e:
        logger.error(f"Error analyzing text: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Error analyzing text: {str(e)}"
        }), 500


@app.route('/api/batch-process', methods=['POST'])
def batch_process():
    """
    Process multiple documents in a batch.
    
    Returns:
        JSON response with batch processing status
    """
    # Get document IDs from request
    data = request.json
    
    if not data or 'document_ids' not in data:
        return jsonify({
            'success': False,
            'error': 'No document IDs provided'
        }), 400
    
    document_ids = data['document_ids']
    options = data.get('options', {
        'keywords': True,
        'entities': True,
        'summary': True,
        'topics': True,
        'sentiment': False,
        'readability': True
    })
    
    try:
        results = []
        
        for doc_id in document_ids:
            # Check if document exists
            metadata_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{doc_id}.json")
            if not os.path.exists(metadata_path):
                results.append({
                    'document_id': doc_id,
                    'success': False,
                    'error': 'Document not found'
                })
                continue
            
            # Load document metadata
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            file_path = metadata['file_path']
            
            # Extract text from document
            extraction_result = document_extractor.extract(file_path)
            
            if 'error' in extraction_result:
                results.append({
                    'document_id': doc_id,
                    'success': False,
                    'error': extraction_result['error']
                })
                continue
            
            # Analyze document content
            analysis_result = document_analyzer.analyze(extraction_result['text'], options)
            
            # Combine results
            result = {
                'document_id': doc_id,
                'filename': metadata['original_filename'],
                'extraction': extraction_result,
                'analysis': analysis_result,
                'processing_time': datetime.now().isoformat()
            }
            
            # Update metadata
            metadata['status'] = 'processed'
            metadata['processing_time'] = datetime.now().isoformat()
            metadata['word_count'] = analysis_result.get('word_count', 0)
            metadata['has_analysis'] = True
            
            # Save updated metadata and results
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            results_path = os.path.join(app.config['PROCESSED_FOLDER'], f"{doc_id}_results.json")
            with open(results_path, 'w') as f:
                json.dump(result, f, indent=2)
            
            results.append({
                'document_id': doc_id,
                'success': True,
                'word_count': analysis_result.get('word_count', 0)
            })
        
        return jsonify({
            'success': True,
            'results': results
        })
    
    except Exception as e:
        logger.error(f"Error in batch processing: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Error in batch processing: {str(e)}"
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
