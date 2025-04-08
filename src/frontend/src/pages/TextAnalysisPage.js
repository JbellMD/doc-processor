import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FaCheck, FaFileAlt, FaChartBar, FaSearch } from 'react-icons/fa';
import axios from 'axios';

const TextAnalysisPage = () => {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [options, setOptions] = useState({
    keywords: true,
    entities: true,
    summary: true,
    topics: true,
    sentiment: true,
    readability: true
  });

  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setOptions({
      ...options,
      [name]: checked
    });
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');
      
      const response = await axios.post('/api/text-analysis', {
        text,
        options
      });
      
      if (response.data.success) {
        setResults(response.data.results);
        setActiveTab('summary');
      } else {
        setError(response.data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error analyzing text');
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResults(null);
    setError('');
  };

  // Sample text for analysis
  const sampleText = `Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.

The term "artificial intelligence" had previously been used to describe machines that mimic and display "human" cognitive skills that are associated with the human mind, such as "learning" and "problem-solving". This definition has since been rejected by major AI researchers who now describe AI in terms of rationality and acting rationally, which does not limit how intelligence can be articulated.

AI applications include advanced web search engines (e.g., Google), recommendation systems (used by YouTube, Amazon, and Netflix), understanding human speech (such as Siri and Alexa), self-driving cars (e.g., Waymo), generative or creative tools (ChatGPT and AI art), automated decision-making, and competing at the highest level in strategic game systems (such as chess and Go).

As machines become increasingly capable, tasks considered to require "intelligence" are often removed from the definition of AI, a phenomenon known as the AI effect. For instance, optical character recognition is frequently excluded from things considered to be AI, having become a routine technology.`;

  const handleUseSampleText = () => {
    setText(sampleText);
    setResults(null);
    setError('');
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Text Analysis</h1>
          <p className="lead">
            Analyze text content without uploading a document
          </p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Input Text</h5>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={handleUseSampleText}
                  className="p-0"
                >
                  Use Sample Text
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={12}
                  placeholder="Enter or paste text to analyze..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </Form.Group>
              
              <div className="mb-3">
                <h6>Analysis Options</h6>
                <div className="d-flex flex-wrap">
                  <Form.Check
                    type="checkbox"
                    id="option-keywords"
                    label="Keywords"
                    name="keywords"
                    checked={options.keywords}
                    onChange={handleOptionChange}
                    className="me-3 mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="option-entities"
                    label="Entities"
                    name="entities"
                    checked={options.entities}
                    onChange={handleOptionChange}
                    className="me-3 mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="option-summary"
                    label="Summary"
                    name="summary"
                    checked={options.summary}
                    onChange={handleOptionChange}
                    className="me-3 mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="option-topics"
                    label="Topics"
                    name="topics"
                    checked={options.topics}
                    onChange={handleOptionChange}
                    className="me-3 mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="option-sentiment"
                    label="Sentiment"
                    name="sentiment"
                    checked={options.sentiment}
                    onChange={handleOptionChange}
                    className="me-3 mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    id="option-readability"
                    label="Readability"
                    name="readability"
                    checked={options.readability}
                    onChange={handleOptionChange}
                    className="mb-2"
                  />
                </div>
              </div>
              
              <div className="d-flex">
                <Button 
                  variant="primary" 
                  onClick={handleAnalyze}
                  disabled={analyzing || !text.trim()}
                  className="me-2"
                >
                  {analyzing ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FaSearch className="me-2" /> Analyze Text
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleClear}
                  disabled={analyzing || (!text.trim() && !results)}
                >
                  Clear
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          {!results ? (
            <Card className="shadow-sm h-100">
              <Card.Body className="text-center py-5">
                <FaFileAlt size={40} className="text-muted mb-3" />
                <h4>No Analysis Results Yet</h4>
                <p className="text-muted">
                  Enter text and click "Analyze Text" to see insights and analysis results.
                </p>
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
                  <Tab eventKey="keywords" title="Keywords">
                  </Tab>
                  <Tab eventKey="entities" title="Entities">
                  </Tab>
                  <Tab eventKey="metrics" title="Metrics">
                  </Tab>
                </Tabs>
              </Card.Header>
              <Card.Body>
                {activeTab === 'summary' && (
                  <div>
                    <h4 className="mb-3">Text Summary</h4>
                    
                    {results.summary ? (
                      <p>{results.summary}</p>
                    ) : (
                      <p className="text-muted">No summary generated. Enable the summary option and reanalyze.</p>
                    )}
                    
                    {results.word_count && (
                      <div className="mt-4">
                        <h5>Text Statistics</h5>
                        <div className="d-flex flex-wrap">
                          <div className="me-4 mb-2">
                            <strong>Word Count:</strong> {results.word_count.toLocaleString()}
                          </div>
                          <div className="me-4 mb-2">
                            <strong>Sentence Count:</strong> {results.sentence_count.toLocaleString()}
                          </div>
                          <div className="mb-2">
                            <strong>Average Words Per Sentence:</strong> {results.avg_word_per_sentence.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {results.sentiment && (
                      <div className="mt-4">
                        <h5>Sentiment Analysis</h5>
                        <div className="d-flex align-items-center mb-3">
                          <div className="me-3">
                            <strong>Polarity:</strong> {results.sentiment.polarity.toFixed(2)}
                          </div>
                          <div>
                            <strong>Subjectivity:</strong> {results.sentiment.subjectivity.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <strong>Assessment:</strong>{' '}
                          {results.sentiment.polarity > 0.05 ? (
                            <span className="text-success">Positive</span>
                          ) : results.sentiment.polarity < -0.05 ? (
                            <span className="text-danger">Negative</span>
                          ) : (
                            <span className="text-secondary">Neutral</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'keywords' && (
                  <div>
                    <h4 className="mb-3">Keywords & Topics</h4>
                    
                    {results.keywords && results.keywords.length > 0 ? (
                      <div className="mb-4">
                        <h5>Keywords</h5>
                        <div>
                          {results.keywords.map((keyword, index) => (
                            <span key={index} className="keyword-item">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted">No keywords extracted. Enable the keywords option and reanalyze.</p>
                    )}
                    
                    {results.topics && results.topics.length > 0 && (
                      <div className="mt-4">
                        <h5>Topics</h5>
                        {results.topics.map((topic, index) => (
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
                    )}
                  </div>
                )}

                {activeTab === 'entities' && (
                  <div>
                    <h4 className="mb-3">Named Entities</h4>
                    
                    {results.entities && Object.keys(results.entities).length > 0 ? (
                      Object.entries(results.entities).map(([entityType, entities]) => (
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
                      ))
                    ) : (
                      <p className="text-muted">No entities found. Enable the entities option and reanalyze.</p>
                    )}
                  </div>
                )}

                {activeTab === 'metrics' && (
                  <div>
                    <h4 className="mb-3">Readability Metrics</h4>
                    
                    {results.readability ? (
                      <div>
                        <div className="row mb-4">
                          <div className="col-md-6 mb-3">
                            <Card className="h-100">
                              <Card.Body className="text-center">
                                <h6>Flesch Reading Ease</h6>
                                <h3 className="mb-0">{results.readability.flesch_reading_ease.toFixed(1)}</h3>
                                <p className="text-muted small mb-0">
                                  {results.readability.flesch_reading_ease >= 90 ? 'Very Easy' :
                                   results.readability.flesch_reading_ease >= 80 ? 'Easy' :
                                   results.readability.flesch_reading_ease >= 70 ? 'Fairly Easy' :
                                   results.readability.flesch_reading_ease >= 60 ? 'Standard' :
                                   results.readability.flesch_reading_ease >= 50 ? 'Fairly Difficult' :
                                   results.readability.flesch_reading_ease >= 30 ? 'Difficult' :
                                   'Very Difficult'}
                                </p>
                              </Card.Body>
                            </Card>
                          </div>
                          <div className="col-md-6 mb-3">
                            <Card className="h-100">
                              <Card.Body className="text-center">
                                <h6>Flesch-Kincaid Grade</h6>
                                <h3 className="mb-0">{results.readability.flesch_kincaid_grade.toFixed(1)}</h3>
                                <p className="text-muted small mb-0">
                                  Grade Level
                                </p>
                              </Card.Body>
                            </Card>
                          </div>
                        </div>
                        
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <Card className="h-100">
                              <Card.Body className="text-center">
                                <h6>SMOG Index</h6>
                                <h3 className="mb-0">{results.readability.smog_index.toFixed(1)}</h3>
                                <p className="text-muted small mb-0">
                                  Years of Education Needed
                                </p>
                              </Card.Body>
                            </Card>
                          </div>
                          <div className="col-md-6 mb-3">
                            <Card className="h-100">
                              <Card.Body className="text-center">
                                <h6>Automated Readability Index</h6>
                                <h3 className="mb-0">{results.readability.automated_readability_index.toFixed(1)}</h3>
                                <p className="text-muted small mb-0">
                                  Grade Level
                                </p>
                              </Card.Body>
                            </Card>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <h5>What do these metrics mean?</h5>
                          <p className="small text-muted">
                            <strong>Flesch Reading Ease:</strong> Higher scores indicate material that is easier to read. 
                            Scores between 60-70 are considered standard/plain English.
                            <br />
                            <strong>Flesch-Kincaid Grade:</strong> Indicates the U.S. grade level needed to comprehend the text.
                            <br />
                            <strong>SMOG Index:</strong> Estimates the years of education needed to understand the text.
                            <br />
                            <strong>Automated Readability Index:</strong> Approximates the grade level needed to comprehend the text.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted">No readability metrics available. Enable the readability option and reanalyze.</p>
                    )}
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

export default TextAnalysisPage;
