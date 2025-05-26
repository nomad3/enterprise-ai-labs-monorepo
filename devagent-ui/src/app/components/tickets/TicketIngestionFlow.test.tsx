import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicketIngestionFlow from './TicketIngestionFlow';
import { ticketService } from '../../services/ticketService';

// Mock the ticketService
jest.mock('../../services/ticketService');

describe('TicketIngestionFlow', () => {
  const mockTicketResponse = {
    id: '123',
    title: 'Test Ticket',
    description: 'Test Description',
    status: 'open',
    priority: 'high',
    created_at: '2024-03-20T12:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles successful ticket ingestion', async () => {
    (ticketService.ingestTicket as jest.Mock).mockResolvedValueOnce(mockTicketResponse);

    render(<TicketIngestionFlow />);

    const textarea = screen.getByPlaceholderText('Paste your ticket information here...');
    const button = screen.getByText('Process Ticket');

    fireEvent.change(textarea, { target: { value: 'Test ticket info' } });
    fireEvent.click(button);

    // Check loading state
    expect(screen.getByText('Processing ticket...')).toBeInTheDocument();

    // Wait for the ticket to be processed
    await waitFor(() => {
      expect(screen.getByText('Ticket Processed Successfully')).toBeInTheDocument();
    });

    // Verify ticket details are displayed
    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('handles ticket ingestion error', async () => {
    const mockError = {
      message: 'Failed to process ticket',
      details: 'Invalid ticket format'
    };
    (ticketService.ingestTicket as jest.Mock).mockRejectedValueOnce(mockError);

    render(<TicketIngestionFlow />);

    const textarea = screen.getByPlaceholderText('Paste your ticket information here...');
    const button = screen.getByText('Process Ticket');

    fireEvent.change(textarea, { target: { value: 'Invalid ticket info' } });
    fireEvent.click(button);

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to process ticket')).toBeInTheDocument();
    });

    expect(screen.getByText('Invalid ticket format')).toBeInTheDocument();
  });
}); 