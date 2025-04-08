import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaFileUpload, FaFileAlt, FaSearch, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import Dropzone from 'react-dropzone';

const HomePage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Document uploaded successfully!');
        setFile(null);
        
        // Navigate to document page after short delay
        setTimeout(() => {
          navigate(`/documents/${response.data.document_id}`);
        }, 1500);
      } else {
        setError(response.data.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading document');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="text-center mb-5">
            <h1 className="display-4 mb-3">Document Processor</h1>
            <p className="lead">
              Extract insights, analyze content, and understand your documents with AI-powered processing
            </p>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="card-title mb-4 text-center">Upload a Document</h3>
              
              <Dropzone
                onDrop={handleDrop}
                accept={{
                  'application/pdf': ['.pdf'],
                  'application/msword': ['.doc'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                  'text/plain': ['.txt']
                }}
                multiple={false}
              >
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div 
                    {...getRootProps()} 
                    className={`upload-area mb-4 ${isDragActive ? 'active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <FaFileUpload className="upload-icon" />
                    {file ? (
                      <div>
                        <p className="mb-1">Selected file:</p>
                        <p className="mb-0 fw-bold">{file.name}</p>
                        <p className="text-muted small">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-1">Drag & drop a document here, or click to select</p>
                        <p className="text-muted small mb-0">
                          Supported formats: PDF, DOCX, DOC, TXT
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Dropzone>
              
              <div className="d-grid">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleUpload}
                  disabled={!file || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload & Process Document'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h2 className="text-center mb-4">Features</h2>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center p-4">
              <FaFileAlt className="text-primary mb-3" size={40} />
              <h4>Document Extraction</h4>
              <p>
                Extract text and metadata from various document formats including PDF, DOCX, and TXT files.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center p-4">
              <FaSearch className="text-primary mb-3" size={40} />
              <h4>Content Analysis</h4>
              <p>
                Identify key topics, extract entities, and generate summaries from your document content.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center p-4">
              <FaChartBar className="text-primary mb-3" size={40} />
              <h4>Insights Generation</h4>
              <p>
                Get readability metrics, keyword analysis, and content insights to better understand your documents.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col className="text-center">
          <h3 className="mb-4">Try Text Analysis</h3>
          <p className="mb-4">
            Don't have a document? You can also analyze text directly without uploading a file.
          </p>
          <Button 
            variant="outline-primary" 
            size="lg" 
            onClick={() => navigate('/text-analysis')}
          >
            Go to Text Analysis
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
