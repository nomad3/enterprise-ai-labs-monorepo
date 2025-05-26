import React, { useState, useEffect } from 'react';
import { coreService } from '../../services/coreService';
import './PipelineView.css';

interface PipelineStatus {
  build: string;
  test: string;
  deploy: string;
}

const PipelineView: React.FC = () => {
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPipelineStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await coreService.runPipeline();
      setPipelineStatus({
        build: status.result || '',
        test: status.result || '',
        deploy: status.result || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pipeline status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineStatus();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'status-success';
      case 'failed':
        return 'status-failed';
      case 'running':
        return 'status-running';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="pipeline-view">
      <div className="pipeline-header">
        <h3>CI/CD Pipeline</h3>
        <button 
          onClick={fetchPipelineStatus}
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

      {pipelineStatus && (
        <div className="pipeline-stages">
          <div className="pipeline-stage">
            <h4>Build</h4>
            <div className={`status-indicator ${getStatusClass(pipelineStatus.build)}`}>
              {pipelineStatus.build}
            </div>
          </div>

          <div className="pipeline-stage">
            <h4>Test</h4>
            <div className={`status-indicator ${getStatusClass(pipelineStatus.test)}`}>
              {pipelineStatus.test}
            </div>
          </div>

          <div className="pipeline-stage">
            <h4>Deploy</h4>
            <div className={`status-indicator ${getStatusClass(pipelineStatus.deploy)}`}>
              {pipelineStatus.deploy}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineView; 