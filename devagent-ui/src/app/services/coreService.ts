import axios from 'axios';
import type { AxiosError as AxiosErrorType } from 'axios';

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

interface Context {
  ticketId?: string;
  [key: string]: any;
}

interface TestPlan {
  testCases: string[];
  coverage: number;
}

interface InfrastructureSetup {
  services: string[];
  configuration: Record<string, any>;
}

export interface FileNode {
  name: string;
  type: string;
  path: string;
  children?: FileNode[];
}

export interface FileContent {
  content: string;
  language: string;
}

export interface FileWrite {
  content: string;
}

export interface TestPlan {
  testCases: string[];
  coverage: string;
}

export interface GitOperation {
  type: string;
  status: string;
  message: string;
}

export interface InfrastructureSetup {
  components: string[];
  configuration: string;
}

export const coreService = {
  async getTicket(ticketId: string): Promise<{ ticket: Ticket; requirements: Requirement[] }> {
    try {
      const response = await axios.get<{ ticket: Ticket; requirements: Requirement[] }>(`${API_BASE_URL}/tickets/${ticketId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to get ticket');
      }
      throw error;
    }
  },

  async generateSolutionPlan(ticketId: string): Promise<SolutionPlan> {
    try {
      const response = await axios.get<SolutionPlan>(`${API_BASE_URL}/tickets/${ticketId}/solution`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to generate solution plan');
      }
      throw error;
    }
  },

  async generateTests(ticketId: string): Promise<TestPlan> {
    try {
      const response = await axios.get<TestPlan>(`${API_BASE_URL}/tickets/${ticketId}/tests`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to generate tests');
      }
      throw error;
    }
  },

  async runPipeline(): Promise<GitOperation> {
    try {
      const response = await axios.post<GitOperation>(`${API_BASE_URL}/pipeline/run`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to run pipeline');
      }
      throw error;
    }
  },

  async setupInfrastructure(ticketId: string): Promise<InfrastructureSetup> {
    try {
      const response = await axios.post<InfrastructureSetup>(`${API_BASE_URL}/infrastructure/setup/${ticketId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to setup infrastructure');
      }
      throw error;
    }
  },

  // File operations
  async listFiles(path: string = ""): Promise<FileNode[]> {
    try {
      const response = await axios.get<FileNode[]>(`${API_BASE_URL}/files/list/${path}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to list files');
      }
      throw error;
    }
  },

  async readFile(path: string): Promise<FileContent> {
    try {
      const response = await axios.get<FileContent>(`${API_BASE_URL}/files/read/${path}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to read file');
      }
      throw error;
    }
  },

  async writeFile(path: string, content: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/files/write/${path}`, { content });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to write file');
      }
      throw error;
    }
  },

  async deleteFile(path: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/files/delete/${path}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to delete file');
      }
      throw error;
    }
  },

  async createDirectory(path: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/files/mkdir/${path}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to create directory');
      }
      throw error;
    }
  }
}; 