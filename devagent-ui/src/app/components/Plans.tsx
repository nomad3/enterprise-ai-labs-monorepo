'use client';

import { useState } from 'react';
import styles from './Plans.module.css';

interface Plan {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePlan = () => {
    // TODO: Implement plan creation
  };

  const handleUpdatePlan = (planId: string) => {
    // TODO: Implement plan update
  };

  const handleDeletePlan = (planId: string) => {
    // TODO: Implement plan deletion
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Development Plans</h2>
        <button className={styles.createButton} onClick={handleCreatePlan}>
          Create New Plan
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className={styles.empty}>
          <p>No development plans yet.</p>
          <p>Click "Create New Plan" to get started.</p>
        </div>
      ) : (
        <div className={styles.plansList}>
          {plans.map((plan) => (
            <div key={plan.id} className={styles.planCard}>
              <div className={styles.planHeader}>
                <h3>{plan.title}</h3>
                <span className={`${styles.status} ${styles[plan.status]}`}>
                  {plan.status.replace('_', ' ')}
                </span>
              </div>
              <p className={styles.description}>{plan.description}</p>
              <div className={styles.planFooter}>
                <span className={styles.date}>
                  Last updated: {new Date(plan.updatedAt).toLocaleDateString()}
                </span>
                <div className={styles.actions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleUpdatePlan(plan.id)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeletePlan(plan.id)}
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