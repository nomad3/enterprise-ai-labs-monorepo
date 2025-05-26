import React, { useState, useEffect } from 'react';
import { coreService } from '../services/coreService';
import type { Ticket, TicketStatus, TicketType, TicketPriority } from '../services/coreService';
import './TicketList.css';

interface TicketListProps {
  onSelectTicket: (ticket: Ticket) => void;
}

export const TicketList: React.FC<TicketListProps> = ({ onSelectTicket }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: [] as TicketStatus[],
    type: [] as TicketType[],
    priority: [] as TicketPriority[],
    search: '',
  });

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await coreService.listTickets(filters);
      setTickets(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusClass = (status: TicketStatus) => {
    switch (status) {
      case 'To Do':
        return 'status-todo';
      case 'In Progress':
        return 'status-in-progress';
      case 'In Review':
        return 'status-in-review';
      case 'Done':
        return 'status-done';
      case 'Blocked':
        return 'status-blocked';
      default:
        return '';
    }
  };

  const getPriorityClass = (priority: TicketPriority | string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'priority-critical';
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getPriorityDisplay = (priority: TicketPriority | string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'Critical';
      case 'HIGH':
        return 'High';
      case 'MEDIUM':
        return 'Medium';
      case 'LOW':
        return 'Low';
      default:
        return priority;
    }
  };

  if (loading) {
    return <div className="ticket-list-loading">Loading tickets...</div>;
  }

  if (error) {
    return <div className="ticket-list-error">{error}</div>;
  }

  return (
    <div className="ticket-list">
      <div className="ticket-filters">
        <input
          type="text"
          placeholder="Search tickets..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="ticket-search"
        />
        <div className="filter-group">
          <label>Status:</label>
          <select
            multiple
            value={filters.status}
            onChange={(e) => handleFilterChange('status', Array.from(e.target.selectedOptions, option => option.value))}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Type:</label>
          <select
            multiple
            value={filters.type}
            onChange={(e) => handleFilterChange('type', Array.from(e.target.selectedOptions, option => option.value))}
          >
            <option value="Task">Task</option>
            <option value="Story">Story</option>
            <option value="Bug">Bug</option>
            <option value="Epic">Epic</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority:</label>
          <select
            multiple
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', Array.from(e.target.selectedOptions, option => option.value))}
          >
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <div className="ticket-grid">
        <div className="ticket-header">
          <div className="ticket-key">Key</div>
          <div className="ticket-summary">Summary</div>
          <div className="ticket-type">Type</div>
          <div className="ticket-status">Status</div>
          <div className="ticket-priority">Priority</div>
          <div className="ticket-assignee">Assignee</div>
        </div>

        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="ticket-row"
            onClick={() => onSelectTicket(ticket)}
          >
            <div className="ticket-key">{ticket.key}</div>
            <div className="ticket-summary">{ticket.summary}</div>
            <div className="ticket-type">{ticket.type}</div>
            <div className={`ticket-status ${getStatusClass(ticket.status)}`}>
              {ticket.status}
            </div>
            <div className={`ticket-priority ${getPriorityClass(ticket.priority)}`}>
              {getPriorityDisplay(ticket.priority)}
            </div>
            <div className="ticket-assignee">{ticket.assignee || 'Unassigned'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}; 