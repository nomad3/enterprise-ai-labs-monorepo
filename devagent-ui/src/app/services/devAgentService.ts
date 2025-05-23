import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SolutionPlan {
  steps: string[];
  estimated_time: string;
  dependencies: string[];
}

export interface TestPlan {
  test_cases: {
    name: string;
    description: string;
    expected_result: string;
  }[];
  coverage: number;
}

export interface InfrastructureSetup {
  resources: {
    type: string;
    name: string;
    configuration: Record<string, any>;
  }[];
  status: string;
}

export interface DevAgentError {
  message: string;
  details?: string;
}

export const devAgentService = {
  async generateSolutionPlan(ticketId: string): Promise<SolutionPlan> {
    try {
      const response = await axios.post(`${API_BASE_URL}/plans/generate`, {
        ticket_id: ticketId
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message: error.response?.data?.detail || 'Failed to generate solution plan',
          details: error.message
        } as DevAgentError;
      }
      throw {
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as DevAgentError;
    }
  },

  async generateTests(ticketId: string): Promise<TestPlan> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tests/generate`, {
        ticket_id: ticketId
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message: error.response?.data?.detail || 'Failed to generate tests',
          details: error.message
        } as DevAgentError;
      }
      throw {
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as DevAgentError;
    }
  },

  async setupInfrastructure(ticketId: string): Promise<InfrastructureSetup> {
    try {
      const response = await axios.post(`${API_BASE_URL}/infrastructure/setup`, {
        ticket_id: ticketId
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message: error.response?.data?.detail || 'Failed to setup infrastructure',
          details: error.message
        } as DevAgentError;
      }
      throw {
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as DevAgentError;
    }
  }
}; 