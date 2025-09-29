import axios from 'axios';

export interface FileWriteResponse {
  success: boolean;
  message: string;
  filePath?: string;
}

const VITE_API_URL = (import.meta as any)?.env?.VITE_API_URL;
const DEFAULT_BASE_URL = (typeof window !== 'undefined'
  ? `${window.location.origin}/api/v1`
  : 'http://localhost:8000/api/v1');
const BASE_URL = VITE_API_URL || DEFAULT_BASE_URL;

class FileService {
  private baseUrl = BASE_URL;

  async writeCodeToFile(code: string, fileName: string): Promise<FileWriteResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/files/write`, {
        content: code,
        fileName,
        fileType: 'code'
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to write code to file');
      }
      throw error;
    }
  }

  async writeTestsToFile(tests: string, fileName: string): Promise<FileWriteResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/files/write`, {
        content: tests,
        fileName,
        fileType: 'test'
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to write tests to file');
      }
      throw error;
    }
  }
}

export const fileService = new FileService();
