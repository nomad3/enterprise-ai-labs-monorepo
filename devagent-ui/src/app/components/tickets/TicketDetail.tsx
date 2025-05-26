import React, { useState, useEffect, useRef } from 'react';
import { coreService } from '../../services/coreService';
import type { Ticket, AgentInteraction, AgentResponse } from '../../services/coreService';
import './TicketDetail.css';

interface TicketDetailProps {
  ticket: Ticket;
  onUpdate: () => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, onUpdate }) => {
  const [interactions, setInteractions] = useState<AgentInteraction[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<AgentResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInteractions();
  }, [ticket.id]);

  useEffect(() => {
    scrollToBottom();
  }, [interactions]);

  const fetchInteractions = async () => {
    try {
      const response = await coreService.getTicketInteractions(ticket.id);
      setInteractions(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch interactions');
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Create WebSocket connection
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/tickets/${ticket.id}/interact`);

      ws.onopen = () => {
        ws.send(message);
      };

      ws.onmessage = (event) => {
        const response: AgentResponse = JSON.parse(event.data);
        
        if (response.requires_approval) {
          setPendingApproval(response);
        } else {
          setInteractions(prev => [...prev, {
            ticket_id: ticket.id,
            user_message: message,
            response,
            timestamp: new Date().toISOString()
          }]);
        }
      };

      ws.onerror = (error) => {
        setError('Failed to send message');
        console.error(error);
      };

      ws.onclose = () => {
        setLoading(false);
        setMessage('');
      };

    } catch (err) {
      setError('Failed to send message');
      console.error(err);
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!pendingApproval) return;

    try {
      setLoading(true);
      setError(null);

      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/tickets/${ticket.id}/interact`);

      ws.onopen = () => {
        ws.send(JSON.stringify({ approved: true }));
      };

      ws.onclose = () => {
        setLoading(false);
        setPendingApproval(null);
        onUpdate();
      };

    } catch (err) {
      setError('Failed to approve changes');
      console.error(err);
      setLoading(false);
    }
  };

  const handleReject = () => {
    setPendingApproval(null);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="ticket-detail">
      <div className="ticket-header">
        <h2>{ticket.key}: {ticket.summary}</h2>
        <div className="ticket-meta">
          <span className={`ticket-status ${ticket.status.toLowerCase().replace(' ', '-')}`}>
            {ticket.status}
          </span>
          <span className={`ticket-priority ${ticket.priority.toLowerCase()}`}>
            {ticket.priority}
          </span>
          <span className="ticket-type">{ticket.type}</span>
        </div>
      </div>

      <div className="ticket-description">
        <h3>Description</h3>
        <p>{ticket.description}</p>
      </div>

      <div className="interaction-container">
        <div className="interaction-messages">
          {interactions.map((interaction, index) => (
            <div key={index} className="interaction">
              <div className="interaction-header">
                <span className="interaction-timestamp">
                  {formatTimestamp(interaction.timestamp)}
                </span>
              </div>
              <div className="interaction-content">
                <div className="user-message">
                  <strong>You:</strong>
                  <p>{interaction.user_message}</p>
                </div>
                {interaction.response && (
                  <div className="agent-response">
                    <strong>Agent:</strong>
                    <p>{interaction.response.message}</p>
                    {interaction.response.suggestions && (
                      <div className="suggestions">
                        <h4>Suggestions:</h4>
                        <ul>
                          {interaction.response.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {interaction.response.code_changes && (
                      <div className="code-changes">
                        <h4>Code Changes:</h4>
                        {interaction.response.code_changes.map((change, i) => (
                          <div key={i} className="code-change">
                            <div className="file-path">{change.file}</div>
                            <pre><code>{change.content}</code></pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {pendingApproval && (
          <div className="approval-dialog">
            <h3>Review Changes</h3>
            <p>{pendingApproval.message}</p>
            {pendingApproval.code_changes && (
              <div className="code-changes">
                {pendingApproval.code_changes.map((change, i) => (
                  <div key={i} className="code-change">
                    <div className="file-path">{change.file}</div>
                    <pre><code>{change.content}</code></pre>
                  </div>
                ))}
              </div>
            )}
            <div className="approval-actions">
              <button onClick={handleApprove} disabled={loading}>
                Approve
              </button>
              <button onClick={handleReject} disabled={loading}>
                Reject
              </button>
            </div>
          </div>
        )}

        <div className="message-input">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask the agent about this ticket..."
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !message.trim()}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}; 