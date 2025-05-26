import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
// Core languages
import 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
// Programming languages
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
// Web technologies
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-html';
import 'prismjs/components/prism-xml';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-toml';
// Shell and config
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-shell';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-git';
import 'prismjs/components/prism-ini';
import 'prismjs/components/prism-properties';
// Database
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-mongodb';
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
    const normalizedLanguage = language.toLowerCase();
    switch (normalizedLanguage) {
      // Programming languages
      case 'python':
        return 'language-python';
      case 'javascript':
      case 'js':
        return 'language-javascript';
      case 'typescript':
      case 'ts':
        return 'language-typescript';
      case 'jsx':
        return 'language-jsx';
      case 'tsx':
        return 'language-tsx';
      case 'java':
        return 'language-java';
      case 'csharp':
      case 'c#':
        return 'language-csharp';
      case 'php':
        return 'language-php';
      case 'ruby':
        return 'language-ruby';
      case 'go':
      case 'golang':
        return 'language-go';
      case 'rust':
        return 'language-rust';
      case 'swift':
        return 'language-swift';
      case 'kotlin':
        return 'language-kotlin';
      // Web technologies
      case 'css':
        return 'language-css';
      case 'scss':
      case 'sass':
        return 'language-scss';
      case 'html':
        return 'language-html';
      case 'xml':
        return 'language-xml';
      case 'json':
        return 'language-json';
      case 'yaml':
      case 'yml':
        return 'language-yaml';
      case 'toml':
        return 'language-toml';
      // Shell and config
      case 'bash':
      case 'shell':
      case 'sh':
        return 'language-bash';
      case 'docker':
      case 'dockerfile':
        return 'language-docker';
      case 'git':
        return 'language-git';
      case 'ini':
      case 'conf':
        return 'language-ini';
      case 'properties':
        return 'language-properties';
      // Database
      case 'sql':
        return 'language-sql';
      case 'mongodb':
      case 'mongo':
        return 'language-mongodb';
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