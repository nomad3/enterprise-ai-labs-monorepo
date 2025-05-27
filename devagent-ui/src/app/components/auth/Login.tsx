'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// import styles from './Login.module.css'; // Remove CSS Modules
import { Button } from '@/components/ui/button'; // Use Shadcn Button for consistency
import { Input } from '@/components/ui/input'; // Use Shadcn Input for consistency

export default function Login() {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [componentError, setComponentError] = useState<string | null>(null); // Renamed to avoid conflict with authError
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setComponentError(null);
      await login({ email, password });
      // Login success is handled by AuthContext redirecting, no specific action here
    } catch (err: any) {
      // Use err.message if available, otherwise generic message
      setComponentError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Removed Login.module.css styles, using Tailwind throughout
    <div className="w-full">
      {/* The title "Login to DevAgent" or "AgentForge Access" is already in AppPage, so not repeated here */}
      
      {(componentError || authError) && (
        <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-400 text-red-700 text-sm">
          {componentError || authError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-blue-700 mb-1">
            Email Address
          </label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="bg-white border-gray-300 text-slate-800 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-blue-700 mb-1">
            Password
          </label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="bg-white border-gray-300 text-slate-800 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {loading ? 'Logging in...' : 'Login to AgentForge'}
        </Button>
      </form>
    </div>
  );
} 