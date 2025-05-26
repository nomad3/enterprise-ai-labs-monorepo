import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CodeGenerationView from './CodeGenerationView';
import { coreService } from '../../services/coreService';

// Mock the coreService
jest.mock('../../services/coreService', () => ({
  coreService: {
    generateCode: jest.fn(),
    generateTests: jest.fn(),
  },
}));

describe('CodeGenerationView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders code generation interface', () => {
    render(<CodeGenerationView />);
    
    expect(screen.getByText('Code Generation')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe the code you want to generate...')).toBeInTheDocument();
    expect(screen.getByText('Generate Code')).toBeInTheDocument();
  });

  it('handles code generation', async () => {
    const mockCode = 'const example = () => { return true; };';
    (coreService.generateCode as jest.Mock).mockResolvedValue(mockCode);

    render(<CodeGenerationView />);
    
    const input = screen.getByPlaceholderText('Describe the code you want to generate...');
    const generateButton = screen.getByText('Generate Code');

    fireEvent.change(input, { target: { value: 'Generate a simple function' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Generated Code')).toBeInTheDocument();
      expect(screen.getByText(mockCode)).toBeInTheDocument();
    });
  });

  it('handles test generation', async () => {
    const mockCode = 'const example = () => { return true; };';
    const mockTests = 'describe("example", () => { it("should return true", () => { expect(example()).toBe(true); }); });';
    
    (coreService.generateCode as jest.Mock).mockResolvedValue(mockCode);
    (coreService.generateTests as jest.Mock).mockResolvedValue(mockTests);

    render(<CodeGenerationView />);
    
    // Generate code first
    const input = screen.getByPlaceholderText('Describe the code you want to generate...');
    const generateButton = screen.getByText('Generate Code');
    fireEvent.change(input, { target: { value: 'Generate a simple function' } });
    fireEvent.click(generateButton);

    // Wait for code generation and then generate tests
    await waitFor(() => {
      expect(screen.getByText('Generated Code')).toBeInTheDocument();
    });

    const testButton = screen.getByText('Generate Tests');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('Generated Tests')).toBeInTheDocument();
      expect(screen.getByText(mockTests)).toBeInTheDocument();
    });
  });

  it('displays error message when code generation fails', async () => {
    const errorMessage = 'Failed to generate code';
    (coreService.generateCode as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<CodeGenerationView />);
    
    const input = screen.getByPlaceholderText('Describe the code you want to generate...');
    const generateButton = screen.getByText('Generate Code');

    fireEvent.change(input, { target: { value: 'Generate a simple function' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('disables generate button when input is empty', () => {
    render(<CodeGenerationView />);
    
    const generateButton = screen.getByText('Generate Code');
    expect(generateButton).toBeDisabled();
  });
}); 