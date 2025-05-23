'use client';

import { useState } from 'react';
import styles from './TestGeneration.module.css';

interface Test {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e';
  status: 'pending' | 'running' | 'passed' | 'failed';
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

export default function TestGeneration() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [testType, setTestType] = useState<Test['type']>('unit');

  const handleGenerateTests = () => {
    // TODO: Implement test generation
  };

  const handleRunTests = (testId: string) => {
    // TODO: Implement test execution
  };

  const handleDeleteTest = (testId: string) => {
    // TODO: Implement test deletion
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Test Generation</h2>
        <div className={styles.actions}>
          <select
            className={styles.select}
            value={testType}
            onChange={(e) => setTestType(e.target.value as Test['type'])}
          >
            <option value="unit">Unit Tests</option>
            <option value="integration">Integration Tests</option>
            <option value="e2e">End-to-End Tests</option>
          </select>
          <button className={styles.generateButton} onClick={handleGenerateTests}>
            Generate Tests
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading tests...</div>
      ) : tests.length === 0 ? (
        <div className={styles.empty}>
          <p>No tests generated yet.</p>
          <p>Select a file and click "Generate Tests" to get started.</p>
        </div>
      ) : (
        <div className={styles.testList}>
          {tests.map((test) => (
            <div key={test.id} className={styles.testCard}>
              <div className={styles.testHeader}>
                <div className={styles.testInfo}>
                  <h3>{test.name}</h3>
                  <span className={`${styles.type} ${styles[test.type]}`}>
                    {test.type.toUpperCase()}
                  </span>
                </div>
                <span className={`${styles.status} ${styles[test.status]}`}>
                  {test.status}
                </span>
              </div>
              <p className={styles.description}>{test.description}</p>
              <div className={styles.testFooter}>
                <span className={styles.filePath}>{test.filePath}</span>
                <div className={styles.actions}>
                  <button
                    className={styles.runButton}
                    onClick={() => handleRunTests(test.id)}
                    disabled={test.status === 'running'}
                  >
                    {test.status === 'running' ? 'Running...' : 'Run Test'}
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteTest(test.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 