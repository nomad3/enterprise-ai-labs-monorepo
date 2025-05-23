'use client';

import { useState } from 'react';
import styles from './VersionControl.module.css';

interface Commit {
  id: string;
  message: string;
  author: string;
  date: string;
  branch: string;
}

interface Branch {
  name: string;
  isCurrent: boolean;
  lastCommit: string;
}

interface Change {
  file: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed';
  changes: number;
}

export default function VersionControl() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');

  const handleCommit = () => {
    // TODO: Implement commit
  };

  const handleCreateBranch = () => {
    // TODO: Implement branch creation
  };

  const handleSwitchBranch = (branchName: string) => {
    // TODO: Implement branch switching
  };

  const handlePush = () => {
    // TODO: Implement push
  };

  const handlePull = () => {
    // TODO: Implement pull
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Version Control</h2>
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={handlePull}>
            Pull Changes
          </button>
          <button className={styles.actionButton} onClick={handlePush}>
            Push Changes
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Current Branch</h3>
            <div className={styles.branchActions}>
              <input
                type="text"
                className={styles.input}
                placeholder="New branch name"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
              />
              <button
                className={styles.createButton}
                onClick={handleCreateBranch}
                disabled={!newBranchName}
              >
                Create Branch
              </button>
            </div>
          </div>
          <div className={styles.branches}>
            {branches.map((branch) => (
              <div
                key={branch.name}
                className={`${styles.branch} ${
                  branch.isCurrent ? styles.currentBranch : ''
                }`}
                onClick={() => handleSwitchBranch(branch.name)}
              >
                <span className={styles.branchName}>{branch.name}</span>
                <span className={styles.lastCommit}>{branch.lastCommit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3>Changes</h3>
          {changes.length === 0 ? (
            <p className={styles.emptyMessage}>No changes detected</p>
          ) : (
            <div className={styles.changes}>
              {changes.map((change) => (
                <div key={change.file} className={styles.change}>
                  <span className={`${styles.status} ${styles[change.status]}`}>
                    {change.status}
                  </span>
                  <span className={styles.fileName}>{change.file}</span>
                  <span className={styles.changeCount}>
                    {change.changes} changes
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h3>Commit Changes</h3>
          <div className={styles.commitForm}>
            <textarea
              className={styles.commitMessage}
              placeholder="Enter commit message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
            />
            <button
              className={styles.commitButton}
              onClick={handleCommit}
              disabled={!commitMessage || changes.length === 0}
            >
              Commit Changes
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Recent Commits</h3>
          {commits.length === 0 ? (
            <p className={styles.emptyMessage}>No commits yet</p>
          ) : (
            <div className={styles.commits}>
              {commits.map((commit) => (
                <div key={commit.id} className={styles.commit}>
                  <div className={styles.commitHeader}>
                    <span className={styles.commitId}>{commit.id.slice(0, 7)}</span>
                    <span className={styles.commitBranch}>{commit.branch}</span>
                  </div>
                  <p className={styles.commitMessage}>{commit.message}</p>
                  <div className={styles.commitFooter}>
                    <span className={styles.commitAuthor}>{commit.author}</span>
                    <span className={styles.commitDate}>
                      {new Date(commit.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 