import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaFileAlt, FaSearch, FaChartBar, FaCode, FaServer, FaDatabase } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>About Document Processor</h1>
          <p className="lead">
            A comprehensive document analysis and processing application
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="mb-4">Overview</h2>
              <p>
                Document Processor is a powerful application designed to extract text from various document formats,
                analyze content using advanced NLP techniques, and provide valuable insights about your documents.
              </p>
              <p>
                Whether you're a researcher analyzing papers, a business professional reviewing contracts,
                or anyone who works with text documents, our application helps you understand and extract
                meaningful information from your content.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="mb-4">Key Features</h2>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center p-4">
              <FaFileAlt className="text-primary mb-3" size={40} />
              <h4>Document Extraction</h4>
              <p>
                Extract text and metadata from various document formats including PDF, DOCX, and TXT files.
                Our system handles the complexity of parsing different file types so you don't have to.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center p-4">
              <FaSearch className="text-primary mb-3" size={40} />
              <h4>Content Analysis</h4>
              <p>
                Identify key topics, extract named entities, generate summaries, and analyze sentiment
                from your document content using advanced natural language processing techniques.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center p-4">
              <FaChartBar className="text-primary mb-3" size={40} />
              <h4>Insights Generation</h4>
              <p>
                Get readability metrics, keyword analysis, and content insights to better understand
                your documents. Visualize topic distributions and key information at a glance.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="mb-4">Technology Stack</h2>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <FaServer className="text-primary me-3" size={24} />
                <h4 className="mb-0">Backend</h4>
              </div>
              <ul>
                <li>Python with Flask for the API server</li>
                <li>PyPDF2 and python-docx for document parsing</li>
                <li>NLTK and spaCy for natural language processing</li>
                <li>Transformers for advanced NLP tasks</li>
                <li>RESTful API architecture</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <FaCode className="text-primary me-3" size={24} />
                <h4 className="mb-0">Frontend</h4>
              </div>
              <ul>
                <li>React.js for the user interface</li>
                <li>React Bootstrap for responsive design</li>
                <li>Axios for API communication</li>
                <li>React Router for navigation</li>
                <li>Chart.js for data visualization</li>
                <li>React Dropzone for file uploads</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <FaDatabase className="text-primary me-3" size={24} />
                <h4 className="mb-0">Data Processing</h4>
              </div>
              <ul>
                <li>TF-IDF for keyword extraction</li>
                <li>Named Entity Recognition (NER)</li>
                <li>Extractive and abstractive summarization</li>
                <li>Sentiment analysis</li>
                <li>Topic modeling</li>
                <li>Readability scoring algorithms</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="mb-4">How It Works</h2>
              <ol>
                <li className="mb-3">
                  <strong>Upload a Document:</strong> Upload your PDF, DOCX, or TXT file through the web interface.
                </li>
                <li className="mb-3">
                  <strong>Text Extraction:</strong> Our system extracts all text content from your document, handling different formats appropriately.
                </li>
                <li className="mb-3">
                  <strong>Analysis Processing:</strong> The extracted text is processed using various NLP techniques to identify key information.
                </li>
                <li className="mb-3">
                  <strong>View Insights:</strong> Review the generated insights, including summaries, keywords, entities, and more.
                </li>
                <li className="mb-3">
                  <strong>Export or Share:</strong> Save the analysis results for future reference or sharing with others.
                </li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-4 text-center">
              <h2 className="mb-4">About the Project</h2>
              <p>
                This project was developed as a demonstration of document processing capabilities using modern web technologies
                and natural language processing techniques. It showcases the integration of various libraries and frameworks
                to create a useful tool for document analysis.
              </p>
              <p className="mb-0">
                &copy; {new Date().getFullYear()} Document Processor
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;
