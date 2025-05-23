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

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

class CoreService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  // Ticket Management
  async processTicket(ticketData: any): Promise<{ ticket: Ticket; requirements: Requirement[] }> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/tickets`, ticketData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to process ticket');
    }
  }

  // Solution Planning
  async generateSolutionPlan(ticketId: string): Promise<SolutionPlan> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tickets/${ticketId}/solution`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to generate solution plan');
    }
  }

  // Test Generation
  async generateTests(ticketId: string): Promise<TestPlan> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tickets/${ticketId}/tests`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to generate tests');
    }
  }

  // CI/CD Pipeline
  async runPipeline(): Promise<PipelineStatus> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/pipeline/run`);
      return response.data as PipelineStatus;
    } catch (error) {
      throw this.handleError(error, 'Failed to run pipeline');
    }
  }

  // Version Control
  async gitOperation(operation: string, params: any): Promise<GitOperation> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/git/${operation}`, params);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to perform git operation');
    }
  }

  async setupInfrastructure(ticketId: string): Promise<InfrastructureSetup> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tickets/${ticketId}/infrastructure`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to setup infrastructure');
    }
  }

  async listFiles(): Promise<FileNode[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/files`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to list files');
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/files/${encodeURIComponent(path)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to read file');
    }
  }

  // Error handling
  handleError(error: unknown, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      return new Error(error.response?.data?.message || defaultMessage);
    }
    return new Error(defaultMessage);
  }
}

export const coreService = new CoreService(); 