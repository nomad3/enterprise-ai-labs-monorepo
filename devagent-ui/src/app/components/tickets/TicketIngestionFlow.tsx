import React, { useState } from 'react';
import TicketIngestionForm from './TicketIngestionForm';
import { ticketService, TicketResponse, TicketError } from '../../services/ticketService';
import './TicketIngestionFlow.css';

const TicketIngestionFlow: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TicketError | null>(null);
  const [ticket, setTicket] = useState<TicketResponse | null>(null);

  const handleIngestTicket = async (ticketInfo: string) => {
    setIsLoading(true);
    setError(null);
    setTicket(null);

    try {
      const response = await ticketService.ingestTicket(ticketInfo);
      setTicket(response);
    } catch (err) {
      setError(err as TicketError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ticket-ingestion-flow">
      <TicketIngestionForm onIngestTicket={handleIngestTicket} />
      
      {isLoading && (
        <div className="loading-indicator">
          Processing ticket...
        </div>
      )}

      {error && (
        <div className="error-message">
          <h3>Error</h3>
          <p>{error.message}</p>
          {error.details && <p className="error-details">{error.details}</p>}
        </div>
      )}

      {ticket && (
        <div className="ticket-result">
          <h3>Ticket Processed Successfully</h3>
          <div className="ticket-details">
            <p><strong>ID:</strong> {ticket.id}</p>
            <p><strong>Title:</strong> {ticket.title}</p>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
            <p><strong>Description:</strong></p>
            <p className="ticket-description">{ticket.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketIngestionFlow; 