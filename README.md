# Document Processor

A comprehensive document processing application that extracts text, analyzes content, and generates insights from various document formats.

## Features

- Extract text from multiple document formats (PDF, DOCX, TXT, RTF)
- Analyze document content using NLP techniques
- Generate document summaries and key insights
- Identify and extract entities, keywords, and topics
- Assess document sentiment and readability metrics
- Provide a user-friendly web interface for document processing
- Support for batch processing of multiple documents
- Direct text analysis without document upload

## Project Structure

```
doc-processor/
├── data/
│   ├── raw/          # Raw document files
│   └── processed/    # Processed document data
├── src/
│   ├── backend/      # Backend API and processing logic
│   ├── frontend/     # Web interface
│   ├── models/       # ML models for document analysis
│   └── utils/        # Utility functions
├── tests/            # Unit and integration tests
├── run.py            # Script to run both backend and frontend
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- Required Python packages (see requirements.txt)

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```
   cd src/frontend
   npm install
   ```

### Usage

#### Option 1: Using the run script (Recommended)

The easiest way to run the application is to use the provided run script:

```
python run.py
```

This will:
- Start the Flask backend server on port 5000
- Start the React frontend development server on port 3000
- Automatically open your browser to the application
- Handle all the necessary environment setup

#### Option 2: Manual startup

1. Start the backend server:
   ```
   cd src/backend
   python -m flask run --port=5000
   ```
2. Start the frontend development server:
   ```
   cd src/frontend
   npm start
   ```
3. Open your browser and navigate to `http://localhost:3000`

## Application Components

### Backend

The backend is built with Flask and provides a RESTful API for document processing:

- `/api/upload` - Upload documents
- `/api/process/<document_id>` - Process a document
- `/api/documents` - List all documents
- `/api/documents/<document_id>` - Get document details
- `/api/text-analysis` - Analyze text directly

### Frontend

The React frontend provides an intuitive interface for:

- Document uploading and management
- Viewing document analysis results
- Direct text analysis without document upload
- Batch processing of multiple documents

### Document Analysis

The application uses various NLP techniques to analyze documents:

- **Text Extraction**: Extract text from PDF, DOCX, DOC, TXT, and RTF files
- **Keyword Extraction**: Identify important keywords using TF-IDF
- **Entity Recognition**: Extract named entities (people, organizations, locations, etc.)
- **Summarization**: Generate concise summaries of document content
- **Topic Modeling**: Identify main topics and their relevance
- **Sentiment Analysis**: Assess the overall sentiment of the document
- **Readability Metrics**: Calculate readability scores (Flesch Reading Ease, etc.)

## Development

### Adding New Features

To add new document analysis capabilities:

1. Update the `DocumentAnalyzer` class in `src/models/document_analyzer.py`
2. Add corresponding API endpoints in `src/backend/app.py`
3. Update the frontend components to display the new analysis results

### Adding Support for New Document Types

To add support for new document formats:

1. Update the `DocumentExtractor` class in `src/utils/document_extractor.py`
2. Add the new file extension to the allowed extensions list in `src/backend/app.py`
3. Update the file type validation in the frontend dropzone component

## License

This project is licensed under the MIT License - see the LICENSE file for details.
