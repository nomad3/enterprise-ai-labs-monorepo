import { useState } from 'react';
import { apiService } from '../services/api';
import styles from './CodeGeneration.module.css';

export default function CodeGeneration() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('python');
  const [framework, setFramework] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.generateCode({
        prompt,
        language,
        framework: framework || undefined,
      });
      setGeneratedCode(response.code);
    } catch (err) {
      setError('Failed to generate code');
      console.error('Error generating code:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Code Generation</h2>
      
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="prompt">Requirements</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to generate..."
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="language">Programming Language</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="framework">Framework (Optional)</label>
            <input
              type="text"
              id="framework"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              placeholder="e.g., React, Django, Spring"
            />
          </div>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Code'}
        </button>
      </form>

      {generatedCode && (
        <div className={styles.result}>
          <h3>Generated Code</h3>
          <pre className={styles.codeBlock}>
            <code>{generatedCode}</code>
          </pre>
          <button
            className={styles.copyButton}
            onClick={() => {
              navigator.clipboard.writeText(generatedCode);
            }}
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
} 