import React, { useState } from 'react';
import { coreService } from '../../services/coreService';
import type { GitOperation } from '../../services/coreService';

const VersionControlView: React.FC = () => {
  const [branchName, setBranchName] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOperation = async (operation: string, payload: any = {}) => {
    setLoading(true);
    setError(null);
    setOperationResult(null);
    setLastOperation(null);
    try {
      const result = await coreService.gitOperation(operation, payload);
      setLastOperation(result.operation);
      setOperationResult(result.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = () => {
    if (!branchName) {
      setError('Please enter a branch name');
      return;
    }
    handleOperation('create-branch', { branchName });
  };

  const handleCommit = () => {
    if (!commitMessage) {
      setError('Please enter a commit message');
      return;
    }
    handleOperation('commit', { message: commitMessage });
  };

  const handlePush = () => handleOperation('push');
  const handlePull = () => handleOperation('pull');

  return (
    <div className="version-control-view">
      <h3>Version Control</h3>
      <div>
        <input
          type="text"
          placeholder="Enter branch name"
          value={branchName}
          onChange={e => setBranchName(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleCreateBranch} disabled={loading}>
          Create Branch
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Enter commit message"
          value={commitMessage}
          onChange={e => setCommitMessage(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleCommit} disabled={loading}>
          Commit
        </button>
      </div>
      <div>
        <button onClick={handlePush} disabled={loading}>
          Push
        </button>
        <button onClick={handlePull} disabled={loading}>
          Pull
        </button>
      </div>
      {lastOperation && (
        <div>
          <strong>Last Operation: {lastOperation}</strong>
        </div>
      )}
      {operationResult && (
        <div>{operationResult}</div>
      )}
      {error && (
        <div style={{ color: 'red' }}>{error}</div>
      )}
    </div>
  );
};

export default VersionControlView; 