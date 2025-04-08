import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Tabs, Tab } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaFileAlt, FaArrowLeft, FaTrash, FaSync, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/documents/${id}`);
        if (response.data.success) {
          setDocument(response.data.metadata);
          setResults(response.data.results);
        } else {
          setError(response.data.error || 'Failed to fetch document');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching document');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleProcess = async () => {
    try {
      setProcessing(true);
      setError('');
      
      const response = await axios.post(`/api/process/${id}`, {
        analysis_options: {
          keywords: true,
          entities: true,
          summary: true,
          topics: true,
          sentiment: true,
          readability: true
        }
      });
      
      if (response.data.success) {
        setResults(response.data.results);
        setDocument({
          ...document,
          status: 'processed',
          has_analysis: true,
          word_count: response.data.results.analysis.word_count || 0
        });
      } else {
        setError(response.data.error || 'Processing failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error processing document');
      console.error('Processing error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await axios.delete(`/api/documents/${id}`);
        if (response.data.success) {
          navigate('/documents');
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

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading document...</p>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          Document not found or has been deleted.
        </Alert>
        <Button 
          variant="primary" 
          as={Link} 
          to="/documents"
          className="mt-3"
        >
          <FaArrowLeft className="me-2" /> Back to Documents
        </Button>
      </Container>
    );
  }

  // Prepare chart data if results exist
  let topicChartData = null;
  if (results?.analysis?.topics) {
    const topics = results.analysis.topics.slice(0, 10); // Top 10 topics
    topicChartData = {
      labels: topics.map(topic => topic.name),
      datasets: [
        {
          label: 'Relevance Score',
          data: topics.map(topic => topic.score * 100), // Convert to percentage
          backgroundColor: 'rgba(52, 152, 219, 0.6)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  return (
    <Container>
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button 
                variant="outline-secondary" 
                as={Link} 
                to="/documents"
                className="me-2"
              >
                <FaArrowLeft className="me-1" /> Back
              </Button>
              <h1 className="d-inline-block mb-0 ms-2">
                {document.original_filename}
              </h1>
            </div>
            <div>
              {document.status !== 'processed' ? (
                <Button 
                  variant="primary" 
                  onClick={handleProcess}
                  disabled={processing}
                  className="me-2"
                >
                  {processing ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaSync className="me-2" /> Process Document
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="outline-primary" 
                  onClick={handleProcess}
                  disabled={processing}
                  className="me-2"
                >
                  <FaSync className="me-2" /> Reprocess
                </Button>
              )}
              <Button 
                variant="outline-danger" 
                onClick={handleDelete}
              >
                <FaTrash className="me-2" /> Delete
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header>Document Information</Card.Header>
            <Card.Body>
              <p>
                <strong>Status:</strong>{' '}
                {document.status === 'processed' ? (
                  <Badge bg="success">Processed</Badge>
                ) : document.status === 'processing' ? (
                  <Badge bg="warning">Processing</Badge>
                ) : (
                  <Badge bg="secondary">Uploaded</Badge>
                )}
              </p>
              <p>
                <strong>File Size:</strong> {formatFileSize(document.file_size)}
              </p>
              <p>
                <strong>Upload Date:</strong> {formatDate(document.upload_time)}
              </p>
              {document.processing_time && (
                <p>
                  <strong>Processing Date:</strong> {formatDate(document.processing_time)}
                </p>
              )}
              {document.word_count > 0 && (
                <p>
                  <strong>Word Count:</strong> {document.word_count.toLocaleString()}
                </p>
              )}
              <p>
                <strong>Document ID:</strong> <small className="text-muted">{document.id}</small>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {!results && document.status !== 'processed' ? (
            <Card className="shadow-sm">
              <Card.Body className="text-center py-5">
                <FaFileAlt size={40} className="text-muted mb-3" />
                <h4>Document Not Processed Yet</h4>
                <p className="text-muted mb-4">
                  Click the "Process Document" button to extract insights and analyze the content.
                </p>
                <Button 
                  variant="primary" 
                  onClick={handleProcess}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Process Document'}
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <Card.Header>
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-0"
                >
                  <Tab eventKey="summary" title="Summary">
                  </Tab>
                  <Tab eventKey="content" title="Content">
                  </Tab>
                  <Tab eventKey="analysis" title="Analysis">
                  </Tab>
                  <Tab eventKey="entities" title="Entities">
                  </Tab>
                  <Tab eventKey="topics" title="Topics">
                  </Tab>
                </Tabs>
              </Card.Header>
              <Card.Body>
                {activeTab === 'summary' && results?.analysis?.summary && (
                  <div>
                    <h4 className="mb-3">Document Summary</h4>
                    <p>{results.analysis.summary}</p>
                    
                    {results.analysis.readability && (
                      <div className="mt-4">
                        <h5>Readability Metrics</h5>
                        <div className="d-flex flex-wrap">
                          <div className="me-4 mb-3">
                            <p className="mb-1"><strong>Flesch Reading Ease:</strong></p>
                            <p className="mb-0">{results.analysis.readability.flesch_reading_ease.toFixed(2)}</p>
                          </div>
                          <div className="me-4 mb-3">
                            <p className="mb-1"><strong>Flesch-Kincaid Grade:</strong></p>
                            <p className="mb-0">{results.analysis.readability.flesch_kincaid_grade.toFixed(2)}</p>
                          </div>
                          <div className="me-4 mb-3">
                            <p className="mb-1"><strong>SMOG Index:</strong></p>
                            <p className="mb-0">{results.analysis.readability.smog_index.toFixed(2)}</p>
                          </div>
                          <div className="mb-3">
                            <p className="mb-1"><strong>Automated Readability Index:</strong></p>
                            <p className="mb-0">{results.analysis.readability.automated_readability_index.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {results.analysis.keywords && results.analysis.keywords.length > 0 && (
                      <div className="mt-4">
                        <h5>Top Keywords</h5>
                        <div>
                          {results.analysis.keywords.slice(0, 15).map((keyword, index) => (
                            <span key={index} className="keyword-item">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'content' && results?.extraction?.text && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="mb-0">Document Content</h4>
                      <Button variant="outline-secondary" size="sm">
                        <FaDownload className="me-1" /> Download Text
                      </Button>
                    </div>
                    <div className="border p-3 bg-light" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {results.extraction.text}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === 'analysis' && results?.analysis && (
                  <div>
                    <h4 className="mb-4">Content Analysis</h4>
                    
                    {results.analysis.sentiment && (
                      <div className="mb-4">
                        <h5>Sentiment Analysis</h5>
                        <div className="d-flex align-items-center mb-3">
                          <div className="me-3">
                            <strong>Polarity:</strong> {results.analysis.sentiment.polarity.toFixed(2)}
                          </div>
                          <div>
                            <strong>Subjectivity:</strong> {results.analysis.sentiment.subjectivity.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <strong>Assessment:</strong>{' '}
                          {results.analysis.sentiment.polarity > 0.05 ? (
                            <Badge bg="success">Positive</Badge>
                          ) : results.analysis.sentiment.polarity < -0.05 ? (
                            <Badge bg="danger">Negative</Badge>
                          ) : (
                            <Badge bg="secondary">Neutral</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {results.analysis.keywords && results.analysis.keywords.length > 0 && (
                      <div className="mb-4">
                        <h5>Keywords</h5>
                        <div>
                          {results.analysis.keywords.map((keyword, index) => (
                            <span key={index} className="keyword-item">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {results.analysis.word_count && (
                      <div className="mb-4">
                        <h5>Text Statistics</h5>
                        <div className="d-flex flex-wrap">
                          <div className="me-4 mb-2">
                            <strong>Word Count:</strong> {results.analysis.word_count.toLocaleString()}
                          </div>
                          <div className="me-4 mb-2">
                            <strong>Sentence Count:</strong> {results.analysis.sentence_count.toLocaleString()}
                          </div>
                          <div className="mb-2">
                            <strong>Average Words Per Sentence:</strong> {results.analysis.avg_word_per_sentence.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'entities' && results?.analysis?.entities && (
                  <div>
                    <h4 className="mb-4">Named Entities</h4>
                    
                    {Object.entries(results.analysis.entities).map(([entityType, entities]) => (
                      <div key={entityType} className="mb-4">
                        <h5 className="text-capitalize">{entityType.replace('_', ' ')}</h5>
                        <div>
                          {entities.map((entity, index) => (
                            <span key={index} className="entity-item">
                              {entity}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'topics' && results?.analysis?.topics && (
                  <div>
                    <h4 className="mb-4">Topic Analysis</h4>
                    
                    {topicChartData && (
                      <div className="mb-4" style={{ height: '300px' }}>
                        <Bar
                          data={topicChartData}
                          options={{
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              x: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                  display: true,
                                  text: 'Relevance Score (%)'
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                display: false
                              },
                              title: {
                                display: true,
                                text: 'Top Topics by Relevance'
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                    
                    <div>
                      <h5>All Topics</h5>
                      {results.analysis.topics.map((topic, index) => (
                        <div key={index} className="topic-item">
                          <div className="topic-name">{topic.name}</div>
                          <div className="topic-bar">
                            <div 
                              className="topic-bar-fill" 
                              style={{ width: `${topic.score * 100}%` }}
                            ></div>
                          </div>
                          <div className="topic-score">{(topic.score * 100).toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DocumentDetailPage;
