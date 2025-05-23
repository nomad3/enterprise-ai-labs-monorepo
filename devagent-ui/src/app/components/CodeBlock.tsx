import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import './CodeBlock.css';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, showLineNumbers = true }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const getLanguageClass = () => {
    switch (language.toLowerCase()) {
      case 'python':
        return 'language-python';
      case 'javascript':
        return 'language-javascript';
      case 'typescript':
        return 'language-typescript';
      case 'jsx':
        return 'language-jsx';
      case 'tsx':
        return 'language-tsx';
      case 'json':
        return 'language-json';
      case 'bash':
        return 'language-bash';
      default:
        return 'language-plaintext';
    }
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="language-label">{language}</span>
        <button
          className="copy-button"
          onClick={() => navigator.clipboard.writeText(code)}
        >
          Copy
        </button>
      </div>
      <pre className={showLineNumbers ? 'line-numbers' : ''}>
        <code className={getLanguageClass()}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock; 