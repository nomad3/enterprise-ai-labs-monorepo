import React, { useState } from 'react';
import { coreService } from '../services/coreService';
import { fileService } from '../services/fileService';
import './CodeGenerationView.css';

interface CodeGenerationViewProps {
  ticketId?: string;
}

const CodeGenerationView: React.FC<CodeGenerationViewProps> = ({ ticketId }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedTests, setGeneratedTests] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileStatus, setFileStatus] = useState<{ code?: string; tests?: string }>({});

  const handleGenerateCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const code = await coreService.generateCode(prompt);
      setGeneratedCode(code);
      setFileName(prompt.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTests = async () => {
    if (!generatedCode) {
      setError('Please generate code first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const tests = await coreService.generateTests(generatedCode);
      setGeneratedTests(tests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteCodeToFile = async () => {
    if (!generatedCode || !fileName) {
      setError('Please generate code and provide a file name');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fileService.writeCodeToFile(generatedCode, `${fileName}.py`);
      setFileStatus(prev => ({ ...prev, code: response.message }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to write code to file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteTestsToFile = async () => {
    if (!generatedTests || !fileName) {
      setError('Please generate tests and provide a file name');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fileService.writeTestsToFile(generatedTests, `${fileName}_test.py`);
      setFileStatus(prev => ({ ...prev, tests: response.message }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to write tests to file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="code-generation">
      <h3>Code Generation</h3>
      
      <div className="input-section">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the code you want to generate..."
          className="prompt-input"
        />
        <button 
          onClick={handleGenerateCode}
          disabled={isLoading || !prompt}
          className="generate-button"
        >
          {isLoading ? 'Generating...' : 'Generate Code'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {generatedCode && (
        <div className="code-section">
          <div className="section-header">
            <h4>Generated Code</h4>
            <div className="button-group">
              <button 
                onClick={handleWriteCodeToFile}
                disabled={isLoading}
                className="write-button"
              >
                Write to File
              </button>
              <button 
                onClick={handleGenerateTests}
                disabled={isLoading}
                className="test-button"
              >
                {isLoading ? 'Generating...' : 'Generate Tests'}
              </button>
            </div>
          </div>
          {fileStatus.code && (
            <div className="success-message">
              {fileStatus.code}
            </div>
          )}
          <pre className="code-block">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}

      {generatedTests && (
        <div className="test-section">
          <div className="section-header">
            <h4>Generated Tests</h4>
            <button 
              onClick={handleWriteTestsToFile}
              disabled={isLoading}
              className="write-button"
            >
              Write to File
            </button>
          </div>
          {fileStatus.tests && (
            <div className="success-message">
              {fileStatus.tests}
            </div>
          )}
          <pre className="code-block">
            <code>{generatedTests}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeGenerationView; 