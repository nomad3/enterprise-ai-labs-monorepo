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
    <div className="min-h-screen flex items-center justify-center bg-[#0a192f] py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
      {(componentError || authError) && (
          <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-500 text-red-700 text-sm font-semibold">
          {componentError || authError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#2563eb] mb-1">
            Email Address
          </label>
            <Input
            type="email"
            id="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
              className="bg-[#f8fafc] border border-slate-300 text-[#334155] focus:ring-[#2563eb] focus:border-[#2563eb] rounded-lg px-3 py-2"
          />
        </div>
        <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#2563eb] mb-1">
            Password
          </label>
            <Input
            type="password"
            id="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
              className="bg-[#f8fafc] border border-slate-300 text-[#334155] focus:ring-[#2563eb] focus:border-[#2563eb] rounded-lg px-3 py-2"
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-opacity-50 text-lg"
        >
          {loading ? 'Logging in...' : 'Login to AgentForge'}
        </Button>
      </form>
      </div>
    </div>
  );
} 