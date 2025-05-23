import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface TicketResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

export interface TicketError {
  message: string;
  details?: string;
}

export const ticketService = {
  async ingestTicket(ticketInfo: string): Promise<TicketResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets/ingest`, {
        ticket_info: ticketInfo
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message: error.response?.data?.detail || 'Failed to ingest ticket',
          details: error.message
        } as TicketError;
      }
      throw {
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as TicketError;
    }
  },

  async getTicketStatus(ticketId: string): Promise<TicketResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message: error.response?.data?.detail || 'Failed to get ticket status',
          details: error.message
        } as TicketError;
      }
      throw {
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as TicketError;
    }
  }
}; 