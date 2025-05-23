import React, { useState } from 'react';
import './TicketIngestionForm.css';

interface TicketIngestionFormProps {
  onIngestTicket: (ticketInfo: string) => void;
}

const TicketIngestionForm: React.FC<TicketIngestionFormProps> = ({ onIngestTicket }) => {
  const [ticketInfo, setTicketInfo] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (ticketInfo.trim()) {
      onIngestTicket(ticketInfo);
      setTicketInfo('');
    }
  };

  return (
    <div className="ticket-ingestion-container">
      <h2>Ingest Ticket</h2>
      <form className="ticket-ingestion-form" onSubmit={handleSubmit}>
        <textarea
          value={ticketInfo}
          onChange={(e) => setTicketInfo(e.target.value)}
          placeholder="Paste your ticket information here..."
          className="ticket-textarea"
          rows={10}
        />
        <button type="submit" className="ticket-submit-button">
          Process Ticket
        </button>
      </form>
    </div>
  );
};

export default TicketIngestionForm; 