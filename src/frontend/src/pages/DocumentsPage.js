import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaEye, FaTrash, FaSync } from 'react-icons/fa';
import axios from 'axios';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/documents');
        if (response.data.success) {
          setDocuments(response.data.documents);
        } else {
          setError(response.data.error || 'Failed to fetch documents');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching documents');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await axios.delete(`/api/documents/${id}`);
        if (response.data.success) {
          setDocuments(documents.filter(doc => doc.id !== id));
        } else {
          setError(response.data.error || 'Failed to delete document');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error deleting document');
        console.error('Delete error:', err);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Documents</h1>
            <div>
              <Button 
                variant="outline-primary" 
                className="me-2"
                onClick={handleRefresh}
                disabled={loading}
              >
                <FaSync className={loading ? 'spin' : ''} /> Refresh
              </Button>
              <Button 
                variant="primary" 
                as={Link} 
                to="/"
              >
                <FaFileAlt className="me-2" /> Upload New
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-5">
                  <FaFileAlt size={40} className="text-muted mb-3" />
                  <h4>No documents found</h4>
                  <p className="text-muted">Upload a document to get started</p>
                  <Button 
                    variant="primary" 
                    as={Link} 
                    to="/"
                  >
                    Upload Document
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Filename</th>
                        <th>Status</th>
                        <th>Size</th>
                        <th>Words</th>
                        <th>Upload Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map(doc => (
                        <tr key={doc.id}>
                          <td>
                            <Link 
                              to={`/documents/${doc.id}`}
                              className="text-decoration-none"
                            >
                              <FaFileAlt className="me-2 text-primary" />
                              {doc.filename}
                            </Link>
                          </td>
                          <td>
                            {doc.status === 'processed' ? (
                              <Badge bg="success">Processed</Badge>
                            ) : doc.status === 'processing' ? (
                              <Badge bg="warning">Processing</Badge>
                            ) : (
                              <Badge bg="secondary">Uploaded</Badge>
                            )}
                          </td>
                          <td>{formatFileSize(doc.file_size)}</td>
                          <td>{doc.word_count || 'N/A'}</td>
                          <td>{formatDate(doc.upload_time)}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              as={Link}
                              to={`/documents/${doc.id}`}
                            >
                              <FaEye /> View
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <FaTrash /> Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DocumentsPage;
