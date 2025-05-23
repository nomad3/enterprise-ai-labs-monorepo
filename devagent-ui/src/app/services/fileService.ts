import axios from 'axios';

export interface FileWriteResponse {
  success: boolean;
  message: string;
  filePath?: string;
}

class FileService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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