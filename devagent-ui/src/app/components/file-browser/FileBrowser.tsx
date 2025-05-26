import React, { useState, useEffect } from 'react';
import { coreService } from '../services/coreService';
import './FileBrowser.css';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

const FileBrowser: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fileTree = await coreService.listFiles();
      setFiles(fileTree);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const content = await coreService.readFile(path);
      setSelectedFile(path);
      setFileContent(content.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.path} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={`file-node ${node.type} ${selectedFile === node.path ? 'selected' : ''}`}
          onClick={() => node.type === 'file' && handleFileClick(node.path)}
        >
          <span className="icon">
            {node.type === 'directory' ? '📁' : '📄'}
          </span>
          {node.name}
        </div>
        {node.type === 'directory' && node.children && renderFileTree(node.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="file-browser">
      <div className="file-browser-header">
        <h3>File Browser</h3>
        <button 
          onClick={fetchFiles}
          disabled={isLoading}
          className="refresh-button"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="file-browser-content">
        <div className="file-tree">
          {renderFileTree(files)}
        </div>
        {selectedFile && (
          <div className="file-preview">
            <div className="file-preview-header">
              <h4>{selectedFile}</h4>
            </div>
            <pre className="file-content">
              {fileContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileBrowser; 