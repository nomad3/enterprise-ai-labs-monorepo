import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { coreService } from '../../services/coreService';

// Mock the coreService
jest.mock('../../services/coreService', () => ({
  coreService: {
    processTicket: jest.fn(),
    runPipeline: jest.fn(),
    gitOperation: jest.fn(),
    listFiles: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all navigation buttons', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Tickets')).toBeInTheDocument();
    expect(screen.getByText('CI/CD Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Version Control')).toBeInTheDocument();
    expect(screen.getByText('Files')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    render(<Dashboard />);
    
    // Initial tab should be Tickets
    expect(screen.getByText('Ticket Ingestion')).toBeInTheDocument();
    
    // Switch to Pipeline tab
    fireEvent.click(screen.getByText('CI/CD Pipeline'));
    await waitFor(() => {
      expect(screen.getByText('CI/CD Pipeline')).toBeInTheDocument();
    });
    
    // Switch to Version Control tab
    fireEvent.click(screen.getByText('Version Control'));
    await waitFor(() => {
      expect(screen.getByText('Version Control')).toBeInTheDocument();
    });
    
    // Switch to Files tab
    fireEvent.click(screen.getByText('Files'));
    await waitFor(() => {
      expect(screen.getByText('File Browser')).toBeInTheDocument();
    });
  });

  it('handles ticket ingestion flow', async () => {
    const mockTicketResponse = {
      ticket: { id: '123', title: 'Test Ticket' },
      requirements: [{ id: '1', description: 'Test Requirement' }],
    };

    (coreService.processTicket as jest.Mock).mockResolvedValue(mockTicketResponse);

    render(<Dashboard />);
    
    const ticketInput = screen.getByPlaceholderText('Enter ticket information...');
    const submitButton = screen.getByText('Submit');

    await userEvent.type(ticketInput, 'Test ticket description');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(coreService.processTicket).toHaveBeenCalledWith({
        description: 'Test ticket description',
      });
      expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    });
  });

  it('handles pipeline status updates', async () => {
    const mockPipelineStatus = {
      build: 'success',
      test: 'running',
      deploy: 'pending',
    };

    (coreService.runPipeline as jest.Mock).mockResolvedValue(mockPipelineStatus);

    render(<Dashboard />);
    
    // Switch to Pipeline tab
    fireEvent.click(screen.getByText('CI/CD Pipeline'));

    await waitFor(() => {
      expect(screen.getByText('Build')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Deploy')).toBeInTheDocument();
      expect(screen.getByText('success')).toBeInTheDocument();
      expect(screen.getByText('running')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  it('handles version control operations', async () => {
    const mockGitResponse = {
      operation: 'create-branch',
      result: 'Branch feature/test created successfully',
    };

    (coreService.gitOperation as jest.Mock).mockResolvedValue(mockGitResponse);

    render(<Dashboard />);
    
    // Switch to Version Control tab
    fireEvent.click(screen.getByText('Version Control'));

    const branchInput = screen.getByPlaceholderText('Enter branch name');
    const createButton = screen.getByText('Create Branch');

    await userEvent.type(branchInput, 'feature/test');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(coreService.gitOperation).toHaveBeenCalledWith('create-branch', {
        branchName: 'feature/test',
      });
      expect(screen.getByText('Branch feature/test created successfully')).toBeInTheDocument();
    });
  });

  it('handles file browser operations', async () => {
    const mockFileTree = [
      {
        name: 'src',
        type: 'directory',
        path: '/src',
        children: [
          {
            name: 'index.ts',
            type: 'file',
            path: '/src/index.ts',
          },
        ],
      },
    ];

    const mockFileContent = 'console.log("Hello, World!");';

    (coreService.listFiles as jest.Mock).mockResolvedValue(mockFileTree);
    (coreService.readFile as jest.Mock).mockResolvedValue(mockFileContent);

    render(<Dashboard />);
    
    // Switch to Files tab
    fireEvent.click(screen.getByText('Files'));

    await waitFor(() => {
      expect(screen.getByText('src')).toBeInTheDocument();
    });

    // Click on a file
    fireEvent.click(screen.getByText('index.ts'));

    await waitFor(() => {
      expect(coreService.readFile).toHaveBeenCalledWith('/src/index.ts');
      expect(screen.getByText('console.log("Hello, World!");')).toBeInTheDocument();
    });
  });
}); 