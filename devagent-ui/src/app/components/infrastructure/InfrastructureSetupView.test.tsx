import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InfrastructureSetupView from './InfrastructureSetupView';
import { InfrastructureSetup } from '../services/devAgentService';

const mockInfrastructureSetup: InfrastructureSetup = {
  status: 'COMPLETED',
  resources: [
    {
      type: 'AWS Lambda',
      name: 'api-handler',
      configuration: {
        runtime: 'nodejs18.x',
        memory: 256,
        timeout: 30
      }
    },
    {
      type: 'DynamoDB',
      name: 'user-table',
      configuration: {
        billingMode: 'PAY_PER_REQUEST',
        attributes: [
          { name: 'userId', type: 'STRING' }
        ]
      }
    }
  ]
};

describe('InfrastructureSetupView', () => {
  it('renders infrastructure setup with status', () => {
    render(<InfrastructureSetupView setup={mockInfrastructureSetup} />);
    
    expect(screen.getByText('Infrastructure Setup')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('renders all resources with their details', () => {
    render(<InfrastructureSetupView setup={mockInfrastructureSetup} />);
    
    mockInfrastructureSetup.resources.forEach(resource => {
      expect(screen.getByText(resource.type)).toBeInTheDocument();
      expect(screen.getByText(resource.name)).toBeInTheDocument();
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });
  });

  it('displays resource configurations in a formatted way', () => {
    render(<InfrastructureSetupView setup={mockInfrastructureSetup} />);
    
    const configElements = screen.getAllByText(/Configuration/);
    expect(configElements).toHaveLength(mockInfrastructureSetup.resources.length);
    
    // Check if the configuration JSON is properly formatted
    const preElements = document.getElementsByTagName('pre');
    expect(preElements.length).toBe(mockInfrastructureSetup.resources.length);
  });

  it('applies correct status badge styling', () => {
    render(<InfrastructureSetupView setup={mockInfrastructureSetup} />);
    
    const statusBadge = screen.getByText('COMPLETED');
    expect(statusBadge).toHaveClass('status-badge', 'completed');
  });
}); 