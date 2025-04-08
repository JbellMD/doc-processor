import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer mt-auto py-3">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">
              &copy; {currentYear} Document Processor. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <a 
              href="https://github.com/JbellMD/doc-processor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white me-3"
            >
              <FaGithub size={20} />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white"
            >
              <FaLinkedin size={20} />
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
