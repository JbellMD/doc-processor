import React, { useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { FaFileUpload } from 'react-icons/fa';
import Dropzone from 'react-dropzone';
import axios from 'axios';

const FileUploader = ({ onUploadSuccess, onUploadError }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setFile(null);
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      } else {
        const errorMsg = response.data.error || 'Upload failed';
        setError(errorMsg);
        if (onUploadError) {
          onUploadError(errorMsg);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error uploading document';
      setError(errorMsg);
      if (onUploadError) {
        onUploadError(errorMsg);
      }
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <Dropzone
        onDrop={handleDrop}
        accept={{
          'application/pdf': ['.pdf'],
          'application/msword': ['.doc'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          'text/plain': ['.txt'],
          'application/rtf': ['.rtf']
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
                  Supported formats: PDF, DOCX, DOC, TXT, RTF
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
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
    </div>
  );
};

export default FileUploader;
