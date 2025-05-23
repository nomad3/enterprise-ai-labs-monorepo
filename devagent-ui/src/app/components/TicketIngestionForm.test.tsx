import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TicketIngestionForm from './TicketIngestionForm';

describe('TicketIngestionForm', () => {
  it('handles ticket information input and submission correctly', () => {
    const onIngestTicket = jest.fn();
    render(<TicketIngestionForm onIngestTicket={onIngestTicket} />);

    const textarea = screen.getByPlaceholderText('Paste your ticket information here...');
    const button = screen.getByText('Process Ticket');

    const ticketInfo = 'Title: Bug Fix\nDescription: Fix the login issue\nPriority: High';
    fireEvent.change(textarea, { target: { value: ticketInfo } });
    fireEvent.click(button);

    expect(onIngestTicket).toHaveBeenCalledWith(ticketInfo);
    expect(textarea).toHaveValue('');
  });

  it('does not submit empty ticket information', () => {
    const onIngestTicket = jest.fn();
    render(<TicketIngestionForm onIngestTicket={onIngestTicket} />);

    const button = screen.getByText('Process Ticket');
    fireEvent.click(button);

    expect(onIngestTicket).not.toHaveBeenCalled();
  });
}); 