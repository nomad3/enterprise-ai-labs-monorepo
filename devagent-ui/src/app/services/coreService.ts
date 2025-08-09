import axios, { AxiosError } from 'axios';

const DEFAULT_BASE_URL = (typeof window !== 'undefined'
  ? `${window.location.origin}/api/v1`
  : 'http://localhost:8000/api/v1');
const ENV_API_URL = (import.meta as any)?.env?.VITE_API_URL || (process as any)?.env?.NEXT_PUBLIC_API_URL;
const API_BASE_URL = ENV_API_URL || DEFAULT_BASE_URL;

export type TicketStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
export type TicketType = 'Task' | 'Story' | 'Bug' | 'Epic';
export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Ticket {
  id: string;
  key: string;
  summary: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority | string;
  assignee?: string;
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

export interface TestPlan {
  testCases: string[];
  coverage: string;
}

export interface InfrastructureSetup {
  components: string[];
  configuration: string;
}

export interface FileNode {
  name: string;
  type: 'directory' | 'file';
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

export interface FileOperation {
    source_path: string;
    destination_path: string;
}

export interface SearchResult {
    path: string;
    name: string;
    type: string;
}

export interface AgentResponse {
  message: string;
  code_changes?: Array<{
    file: string;
    content: string;
  }>;
  suggestions?: string[];
  requires_approval: boolean;
}

export interface AgentInteraction {
  ticket_id: string;
  user_message: string;
  timestamp: string;
  response?: AgentResponse;
  approved?: boolean;
}

export const coreService = {
  async getTicket(ticketId: string): Promise<{ ticket: Ticket; requirements: Requirement[] }> {
    try {
      const response = await axios.get<{ ticket: Ticket; requirements: Requirement[] }>(`${API_BASE_URL}/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to get ticket');
      }
      throw error;
    }
  },

  async generateSolutionPlan(ticketId: string): Promise<SolutionPlan> {
    try {
      const response = await axios.get<SolutionPlan>(`${API_BASE_URL}/tickets/${ticketId}/solution`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to generate solution plan');
      }
      throw error;
    }
  },

  async generateTests(ticketId: string): Promise<TestPlan> {
    try {
      const response = await axios.get<TestPlan>(`${API_BASE_URL}/tickets/${ticketId}/tests`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to generate tests');
      }
      throw error;
    }
  },

  async runPipeline(): Promise<GitOperation> {
    try {
      const response = await axios.post<GitOperation>(`${API_BASE_URL}/pipeline/run`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to run pipeline');
      }
      throw error;
    }
  },

  async setupInfrastructure(ticketId: string): Promise<InfrastructureSetup> {
    try {
      const response = await axios.post<InfrastructureSetup>(`${API_BASE_URL}/infrastructure/setup/${ticketId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
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
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to list files');
      }
      throw error;
    }
  },

  async readFile(path: string): Promise<FileContent> {
    try {
      const response = await axios.get<FileContent>(`${API_BASE_URL}/files/read/${path}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to read file');
      }
      throw error;
    }
  },

  async writeFile(path: string, content: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/files/write/${path}`, { content });
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to write file');
      }
      throw error;
    }
  },

  async deleteFile(path: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/files/delete/${path}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to delete file');
      }
      throw error;
    }
  },

  async createDirectory(path: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/files/mkdir/${path}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to create directory');
      }
      throw error;
    }
  },

  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/files/copy`, {
        source_path: sourcePath,
        destination_path: destinationPath
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to copy file');
      }
      throw error;
    }
  },

  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/files/move`, {
        source_path: sourcePath,
        destination_path: destinationPath
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to move file');
      }
      throw error;
    }
  },

  async searchFiles(query: string, path: string = "", caseSensitive: boolean = false): Promise<SearchResult[]> {
    try {
      const response = await axios.get<SearchResult[]>(`${API_BASE_URL}/files/search`, {
        params: {
          query,
          path,
          case_sensitive: caseSensitive
        }
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to search files');
      }
      throw error;
    }
  },

  async searchByName(pattern: string, path: string = "", caseSensitive: boolean = false): Promise<SearchResult[]> {
    try {
      const response = await axios.get<SearchResult[]>(`${API_BASE_URL}/files/search/name`, {
        params: {
          pattern,
          path,
          case_sensitive: caseSensitive
        }
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to search files by name');
      }
      throw error;
    }
  },

  async gitOperation(operation: string, payload: any = {}): Promise<GitOperation> {
    try {
      const response = await axios.post<GitOperation>(
        `${API_BASE_URL}/version/operation`,
        { operation, ...payload }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || 'Failed to perform git operation');
      }
      throw error;
    }
  },

  async getTicketInteractions(ticketId: string): Promise<AgentInteraction[]> {
    try {
      const response = await axios.get<AgentInteraction[]>(`${API_BASE_URL}/tickets/${ticketId}/interactions`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to fetch ticket interactions');
      }
      throw error;
    }
  },

  async listTickets(filters: any = {}): Promise<Ticket[]> {
    try {
      const response = await axios.get<Ticket[]>(`${API_BASE_URL}/tickets`, { params: filters });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to fetch tickets');
      }
      throw error;
    }
  }
};
