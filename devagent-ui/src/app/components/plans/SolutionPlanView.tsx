import React from 'react';
import { SolutionPlan } from '../services/devAgentService';
import './SolutionPlanView.css';

interface SolutionPlanViewProps {
  plan: SolutionPlan;
}

const SolutionPlanView: React.FC<SolutionPlanViewProps> = ({ plan }) => {
  return (
    <div className="solution-plan">
      <h3>Solution Plan</h3>
      
      <div className="plan-metadata">
        <div className="metadata-item">
          <span className="label">Estimated Time:</span>
          <span className="value">{plan.estimated_time}</span>
        </div>
      </div>

      <div className="plan-steps">
        <h4>Implementation Steps</h4>
        <ol>
          {plan.steps.map((step, index) => (
            <li key={index} className="step-item">
              {step}
            </li>
          ))}
        </ol>
      </div>

      {plan.dependencies.length > 0 && (
        <div className="plan-dependencies">
          <h4>Dependencies</h4>
          <ul>
            {plan.dependencies.map((dependency, index) => (
              <li key={index} className="dependency-item">
                {dependency}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SolutionPlanView; 