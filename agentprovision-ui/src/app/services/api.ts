import axios from 'axios';

const VITE_API_URL = (import.meta as any)?.env?.VITE_API_URL;
const DEFAULT_BASE_URL = (typeof window !== 'undefined'
  ? `${window.location.origin}/api/v1`
  : 'http://localhost:8000/api/v1');
const BASE_URL = VITE_API_URL || DEFAULT_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export interface CodeGenerationRequest {
  prompt: string;
  language: string;
  framework?: string;
}

export interface TestGenerationRequest {
  code: string;
  language: string;
  framework?: string;
}

export interface Commit {
  id: string;
  message: string;
  author: string;
  timestamp: string;
}

export interface Pipeline {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export const apiService = {
  // Tickets
  getTickets: async (): Promise<Ticket[]> => {
    const response = await api.get<Ticket[]>('/tickets');
    return response.data;
  },

  createTicket: async (ticket: Omit<Ticket, 'id' | 'created_at'>): Promise<Ticket> => {
    const response = await api.post<Ticket>('/tickets', ticket);
    return response.data;
  },

  // Plans
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get<Plan[]>('/plans');
    return response.data;
  },

  createPlan: async (plan: Omit<Plan, 'id' | 'created_at'>): Promise<Plan> => {
    const response = await api.post<Plan>('/plans', plan);
    return response.data;
  },

  // Code Generation
  generateCode: async (request: CodeGenerationRequest): Promise<{ code: string }> => {
    const response = await api.post<{ code: string }>('/code/generate', request);
    return response.data;
  },

  // Test Generation
  generateTests: async (request: TestGenerationRequest): Promise<{ tests: string }> => {
    const response = await api.post<{ tests: string }>('/tests/generate', request);
    return response.data;
  },

  // Version Control
  getCommits: async (): Promise<{ commits: Commit[] }> => {
    const response = await api.get<{ commits: Commit[] }>('/version/commits');
    return response.data;
  },

  // CI/CD
  getPipelines: async (): Promise<{ pipelines: Pipeline[] }> => {
    const response = await api.get<{ pipelines: Pipeline[] }>('/cicd/pipelines');
    return response.data;
  },
};
