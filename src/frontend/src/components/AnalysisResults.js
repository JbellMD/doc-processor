import React, { useState } from 'react';
import { Card, Tabs, Tab, Badge } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalysisResults = ({ results }) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!results) {
    return null;
  }

  // Prepare chart data if topics exist
  let topicChartData = null;
  if (results.analysis?.topics) {
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
        {activeTab === 'summary' && results.analysis?.summary && (
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

        {activeTab === 'content' && results.extraction?.text && (
          <div>
            <h4 className="mb-3">Document Content</h4>
            <div className="border p-3 bg-light" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {results.extraction.text}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && results.analysis && (
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

        {activeTab === 'entities' && results.analysis?.entities && (
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

        {activeTab === 'topics' && results.analysis?.topics && (
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
  );
};

export default AnalysisResults;
