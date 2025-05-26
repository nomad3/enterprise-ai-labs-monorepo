import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PipelineView from './PipelineView';
import { coreService } from '../../services/coreService';

// Mock the coreService
jest.mock('../../services/coreService', () => ({
  coreService: {
    runPipeline: jest.fn(),
  },
}));

describe('PipelineView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pipeline interface', () => {
    render(<PipelineView />);
    
    expect(screen.getByText('CI/CD Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('displays pipeline status', async () => {
    const mockStatus = {
      build: 'success',
      test: 'running',
      deploy: 'pending'
    };

    (coreService.runPipeline as jest.Mock).mockResolvedValue(mockStatus);

    render(<PipelineView />);

    await waitFor(() => {
      expect(screen.getByText('Build')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Deploy')).toBeInTheDocument();
      expect(screen.getByText('success')).toBeInTheDocument();
      expect(screen.getByText('running')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    const mockStatus = {
      build: 'success',
      test: 'success',
      deploy: 'success'
    };

    (coreService.runPipeline as jest.Mock).mockResolvedValue(mockStatus);

    render(<PipelineView />);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(coreService.runPipeline).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });

  it('displays error message when pipeline status fetch fails', async () => {
    const errorMessage = 'Failed to fetch pipeline status';
    (coreService.runPipeline as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<PipelineView />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('disables refresh button while loading', async () => {
    (coreService.runPipeline as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<PipelineView />);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(refreshButton).toBeDisabled();
    expect(refreshButton).toHaveTextContent('Refreshing...');

    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
      expect(refreshButton).toHaveTextContent('Refresh');
    });
  });
}); 