import axios from 'axios';

const VITE_API_URL = (import.meta as any)?.env?.VITE_API_URL;
const DEFAULT_BASE_URL = (typeof window !== 'undefined'
  ? `${window.location.origin}/api/v1`
  : 'http://localhost:8000/api/v1');
const API_BASE_URL = VITE_API_URL || DEFAULT_BASE_URL;

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/token`, { username, password });
    return response.data;
  },

  async getCurrentUser(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/auth/me`);
    return response.data;
  },

  async register(data: any): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return response.data;
  },

  async logout(): Promise<void> {
    await Promise.resolve();
  },
};
