import axios from 'axios';

const VITE_API_URL = (import.meta as any)?.env?.VITE_API_URL;
const DEFAULT_BASE_URL = (typeof window !== 'undefined'
  ? `${window.location.origin}/api/v1`
  : 'http://localhost:8000/api/v1');
const API_BASE_URL = VITE_API_URL || DEFAULT_BASE_URL;

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
