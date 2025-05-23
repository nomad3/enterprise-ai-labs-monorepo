import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Ticket {
  id: string;
  key: string;
  summary: string;
  description: string;
  type: 'Task' | 'Story' | 'Bug' | 'Epic';
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
  created_at: string;
  updated_at: string;
}

export interface Requirement {
  id: string;
  ticket_id: string;
  description: string;
  status: string;
}

export interface Task {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  estimated_effort: number;
  dependencies?: string;
}

export interface SolutionPlan {
  id: string;
  ticket_id: string;
  summary: string;
  total_estimated_effort: number;
  tasks: Task[];
}

export interface PipelineStatus {
  build: string;
  test: string;
  deploy: string;
}

export interface GitOperation {
  operation: string;
  result: string;
}

export const coreService = {
  // Ticket Management
  async processTicket(ticketData: any): Promise<{ ticket: Ticket; requirements: Requirement[] }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets/process`, ticketData);
      return response.data as { ticket: Ticket; requirements: Requirement[] };
    } catch (error) {
      throw this.handleError(error, 'Failed to process ticket');
    }
  },

  // Solution Planning
  async generateSolutionPlan(ticketId: string): Promise<SolutionPlan> {
    try {
      const response = await axios.post(`${API_BASE_URL}/plans/generate`, { ticket_id: ticketId });
      return response.data as SolutionPlan;
    } catch (error) {
      throw this.handleError(error, 'Failed to generate solution plan');
    }
  },

  // Code Generation
  async generateCode(prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/code/generate`, { prompt });
      return response.data as string;
    } catch (error) {
      throw this.handleError(error, 'Failed to generate code');
    }
  },

  // Test Generation
  async generateTests(code: string): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tests/generate`, { code });
      return response.data as string;
    } catch (error) {
      throw this.handleError(error, 'Failed to generate tests');
    }
  },

  // CI/CD Pipeline
  async runPipeline(): Promise<PipelineStatus> {
    try {
      const response = await axios.post(`${API_BASE_URL}/pipeline/run`);
      return response.data as PipelineStatus;
    } catch (error) {
      throw this.handleError(error, 'Failed to run pipeline');
    }
  },

  // Version Control
  async gitOperation(operation: string, params: any = {}): Promise<GitOperation> {
    try {
      const response = await axios.post(`${API_BASE_URL}/git/${operation}`, params);
      return response.data as GitOperation;
    } catch (error) {
      throw this.handleError(error, `Failed to perform git operation: ${operation}`);
    }
  },

  // Error handling
  handleError(error: unknown, defaultMessage: string): Error {
    if (error instanceof AxiosError) {
      return new Error(error.response?.data?.detail || defaultMessage);
    }
    return new Error(defaultMessage);
  }
}; 