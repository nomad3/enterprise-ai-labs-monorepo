import { useState, useEffect } from 'react';
import { apiService, Ticket } from '../services/api';
import styles from './Tickets.module.css';

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    status: 'open',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTickets();
      setTickets(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tickets');
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdTicket = await apiService.createTicket(newTicket);
      setTickets([...tickets, createdTicket]);
      setNewTicket({ title: '', description: '', status: 'open' });
      setError(null);
    } catch (err) {
      setError('Failed to create ticket');
      console.error('Error creating ticket:', err);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading tickets...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Tickets</h2>
      
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={newTicket.title}
            onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={newTicket.description}
            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            required
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Create Ticket
        </button>
      </form>

      <div className={styles.ticketList}>
        {tickets.map((ticket) => (
          <div key={ticket.id} className={styles.ticket}>
            <h3>{ticket.title}</h3>
            <p>{ticket.description}</p>
            <div className={styles.ticketMeta}>
              <span className={`${styles.status} ${styles[ticket.status]}`}>
                {ticket.status}
              </span>
              <span className={styles.date}>
                {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 