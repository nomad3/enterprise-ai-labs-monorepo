import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TestPlanView from './TestPlanView';
import { TestPlan } from '../services/devAgentService';

const mockTestPlan: TestPlan = {
  coverage: 85,
  test_cases: [
    {
      name: 'Test Case 1',
      description: 'Verify user authentication',
      expected_result: 'User should be successfully authenticated'
    },
    {
      name: 'Test Case 2',
      description: 'Check data validation',
      expected_result: 'Invalid data should be rejected'
    }
  ]
};

describe('TestPlanView', () => {
  it('renders test plan with coverage information', () => {
    render(<TestPlanView plan={mockTestPlan} />);
    
    expect(screen.getByText('Test Plan')).toBeInTheDocument();
    expect(screen.getByText('Test Coverage: 85%')).toBeInTheDocument();
  });

  it('renders all test cases with their details', () => {
    render(<TestPlanView plan={mockTestPlan} />);
    
    mockTestPlan.test_cases.forEach(testCase => {
      expect(screen.getByText(testCase.name)).toBeInTheDocument();
      expect(screen.getByText(testCase.description)).toBeInTheDocument();
      expect(screen.getByText(testCase.expected_result)).toBeInTheDocument();
    });
  });

  it('displays expected result sections with correct styling', () => {
    render(<TestPlanView plan={mockTestPlan} />);
    
    const expectedResultLabels = screen.getAllByText('Expected Result:');
    expect(expectedResultLabels).toHaveLength(mockTestPlan.test_cases.length);
    
    expectedResultLabels.forEach(label => {
      expect(label).toHaveClass('label');
    });
  });
}); 