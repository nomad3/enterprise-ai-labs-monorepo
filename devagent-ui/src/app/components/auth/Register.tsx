'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// import styles from './Register.module.css'; // Remove CSS Modules
import { Button } from '@/components/ui/button'; // Use Shadcn Button
import { Input } from '@/components/ui/input'; // Use Shadcn Input

export default function Register() {
  const { register, error: authError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [componentError, setComponentError] = useState<string | null>(null); // Renamed for clarity
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setComponentError(null); // Clear previous errors
    
    if (password !== confirmPassword) {
      setComponentError('Passwords do not match. Please re-enter.');
      return;
    }
    if (password.length < 8) {
      setComponentError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register({ name, email, password });
      // Register success is handled by AuthContext redirecting or updating user state
    } catch (err: any) {
      setComponentError(err.message || 'Registration failed. Please try again.');
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="name" className="block text-sm font-semibold text-[#2563eb] mb-1">
            Full Name
          </label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            placeholder="Your Name"
              className="bg-[#f8fafc] border border-slate-300 text-[#334155] focus:ring-[#2563eb] focus:border-[#2563eb] rounded-lg px-3 py-2"
          />
        </div>
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
            placeholder="Create a password (min. 8 characters)"
            minLength={8}
              className="bg-[#f8fafc] border border-slate-300 text-[#334155] focus:ring-[#2563eb] focus:border-[#2563eb] rounded-lg px-3 py-2"
          />
        </div>
        <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#2563eb] mb-1">
            Confirm Password
          </label>
          <Input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
            minLength={8}
              className="bg-[#f8fafc] border border-slate-300 text-[#334155] focus:ring-[#2563eb] focus:border-[#2563eb] rounded-lg px-3 py-2"
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-opacity-50 text-lg mt-2"
        >
          {loading ? 'Creating Account...' : 'Create AgentForge Account'}
        </Button>
      </form>
      </div>
    </div>
  );
} 