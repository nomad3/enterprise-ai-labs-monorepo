'use client';

import { useState } from 'react';
import styles from './CICD.module.css';

interface Pipeline {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  branch: string;
  lastRun: string;
  duration: string;
  stages: Stage[];
}

interface Stage {
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  duration: string;
}

export default function CICD() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);

  const handleRunPipeline = (pipelineId: string) => {
    // TODO: Implement pipeline run
  };

  const handleStopPipeline = (pipelineId: string) => {
    // TODO: Implement pipeline stop
  };

  const handleViewLogs = (pipelineId: string) => {
    // TODO: Implement view logs
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>CI/CD Pipelines</h2>
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={() => {}}>
            Create Pipeline
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.pipelines}>
          <h3>Active Pipelines</h3>
          {pipelines.length === 0 ? (
            <p className={styles.emptyMessage}>No active pipelines</p>
          ) : (
            <div className={styles.pipelineList}>
              {pipelines.map((pipeline) => (
                <div
                  key={pipeline.id}
                  className={`${styles.pipeline} ${
                    selectedPipeline?.id === pipeline.id ? styles.selected : ''
                  }`}
                  onClick={() => setSelectedPipeline(pipeline)}
                >
                  <div className={styles.pipelineHeader}>
                    <span className={styles.pipelineName}>{pipeline.name}</span>
                    <span
                      className={`${styles.status} ${styles[pipeline.status]}`}
                    >
                      {pipeline.status}
                    </span>
                  </div>
                  <div className={styles.pipelineInfo}>
                    <span className={styles.branch}>{pipeline.branch}</span>
                    <span className={styles.lastRun}>
                      Last run: {new Date(pipeline.lastRun).toLocaleString()}
                    </span>
                    <span className={styles.duration}>
                      Duration: {pipeline.duration}
                    </span>
                  </div>
                  <div className={styles.pipelineActions}>
                    <button
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunPipeline(pipeline.id);
                      }}
                      disabled={pipeline.status === 'running'}
                    >
                      Run
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStopPipeline(pipeline.id);
                      }}
                      disabled={pipeline.status !== 'running'}
                    >
                      Stop
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewLogs(pipeline.id);
                      }}
                    >
                      View Logs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPipeline && (
          <div className={styles.pipelineDetails}>
            <h3>Pipeline Details</h3>
            <div className={styles.stages}>
              {selectedPipeline.stages.map((stage) => (
                <div key={stage.name} className={styles.stage}>
                  <div className={styles.stageHeader}>
                    <span className={styles.stageName}>{stage.name}</span>
                    <span
                      className={`${styles.status} ${styles[stage.status]}`}
                    >
                      {stage.status}
                    </span>
                  </div>
                  <div className={styles.stageInfo}>
                    <span className={styles.duration}>
                      Duration: {stage.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 