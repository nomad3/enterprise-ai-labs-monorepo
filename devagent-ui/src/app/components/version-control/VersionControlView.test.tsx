import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VersionControlView from './VersionControlView';
import { coreService } from '../../services/coreService';

// Mock the coreService
jest.mock('../../services/coreService', () => ({
  coreService: {
    gitOperation: jest.fn(),
  },
}));

describe('VersionControlView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders version control interface', () => {
    render(<VersionControlView />);
    
    expect(screen.getByText('Version Control')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter branch name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter commit message')).toBeInTheDocument();
    expect(screen.getByText('Create Branch')).toBeInTheDocument();
    expect(screen.getByText('Commit')).toBeInTheDocument();
    expect(screen.getByText('Push')).toBeInTheDocument();
    expect(screen.getByText('Pull')).toBeInTheDocument();
  });

  it('handles create branch operation', async () => {
    const mockResult = {
      operation: 'create-branch',
      result: 'Branch feature/new-branch created successfully'
    };

    (coreService.gitOperation as jest.Mock).mockResolvedValue(mockResult);

    render(<VersionControlView />);
    
    const branchInput = screen.getByPlaceholderText('Enter branch name');
    const createButton = screen.getByText('Create Branch');

    fireEvent.change(branchInput, { target: { value: 'feature/new-branch' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(coreService.gitOperation).toHaveBeenCalledWith('create-branch', { branchName: 'feature/new-branch' });
      expect(screen.getByText('Last Operation: create-branch')).toBeInTheDocument();
      expect(screen.getByText('Branch feature/new-branch created successfully')).toBeInTheDocument();
    });
  });

  it('handles commit operation', async () => {
    const mockResult = {
      operation: 'commit',
      result: 'Changes committed successfully'
    };

    (coreService.gitOperation as jest.Mock).mockResolvedValue(mockResult);

    render(<VersionControlView />);
    
    const commitInput = screen.getByPlaceholderText('Enter commit message');
    const commitButton = screen.getByText('Commit');

    fireEvent.change(commitInput, { target: { value: 'Add new feature' } });
    fireEvent.click(commitButton);

    await waitFor(() => {
      expect(coreService.gitOperation).toHaveBeenCalledWith('commit', { message: 'Add new feature' });
      expect(screen.getByText('Last Operation: commit')).toBeInTheDocument();
      expect(screen.getByText('Changes committed successfully')).toBeInTheDocument();
    });
  });

  it('handles push operation', async () => {
    const mockResult = {
      operation: 'push',
      result: 'Changes pushed successfully'
    };

    (coreService.gitOperation as jest.Mock).mockResolvedValue(mockResult);

    render(<VersionControlView />);
    
    const pushButton = screen.getByText('Push');
    fireEvent.click(pushButton);

    await waitFor(() => {
      expect(coreService.gitOperation).toHaveBeenCalledWith('push', {});
      expect(screen.getByText('Last Operation: push')).toBeInTheDocument();
      expect(screen.getByText('Changes pushed successfully')).toBeInTheDocument();
    });
  });

  it('handles pull operation', async () => {
    const mockResult = {
      operation: 'pull',
      result: 'Changes pulled successfully'
    };

    (coreService.gitOperation as jest.Mock).mockResolvedValue(mockResult);

    render(<VersionControlView />);
    
    const pullButton = screen.getByText('Pull');
    fireEvent.click(pullButton);

    await waitFor(() => {
      expect(coreService.gitOperation).toHaveBeenCalledWith('pull', {});
      expect(screen.getByText('Last Operation: pull')).toBeInTheDocument();
      expect(screen.getByText('Changes pulled successfully')).toBeInTheDocument();
    });
  });

  it('displays error message when operation fails', async () => {
    const errorMessage = 'Failed to create branch';
    (coreService.gitOperation as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<VersionControlView />);
    
    const branchInput = screen.getByPlaceholderText('Enter branch name');
    const createButton = screen.getByText('Create Branch');

    fireEvent.change(branchInput, { target: { value: 'feature/new-branch' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(<VersionControlView />);
    
    const createButton = screen.getByText('Create Branch');
    const commitButton = screen.getByText('Commit');

    fireEvent.click(createButton);
    expect(screen.getByText('Please enter a branch name')).toBeInTheDocument();

    fireEvent.click(commitButton);
    expect(screen.getByText('Please enter a commit message')).toBeInTheDocument();
  });
}); 