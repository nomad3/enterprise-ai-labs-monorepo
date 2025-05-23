import React from 'react';
import { TestPlan } from '../services/devAgentService';
import './TestPlanView.css';

interface TestPlanViewProps {
  plan: TestPlan;
}

const TestPlanView: React.FC<TestPlanViewProps> = ({ plan }) => {
  return (
    <div className="test-plan">
      <h3>Test Plan</h3>
      
      <div className="coverage-info">
        <div className="coverage-bar">
          <div 
            className="coverage-fill"
            style={{ width: `${plan.coverage}%` }}
          />
        </div>
        <span className="coverage-text">
          Test Coverage: {plan.coverage}%
        </span>
      </div>

      <div className="test-cases">
        <h4>Test Cases</h4>
        {plan.test_cases.map((testCase, index) => (
          <div key={index} className="test-case">
            <h5 className="test-name">{testCase.name}</h5>
            <p className="test-description">{testCase.description}</p>
            <div className="expected-result">
              <span className="label">Expected Result:</span>
              <p>{testCase.expected_result}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestPlanView; 