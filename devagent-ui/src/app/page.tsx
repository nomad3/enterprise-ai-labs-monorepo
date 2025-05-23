'use client';

import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import styles from './page.module.css';
import Tickets from './components/Tickets';
import CodeGeneration from './components/CodeGeneration';
import Plans from './components/Plans';
import TestGeneration from './components/TestGeneration';
import VersionControl from './components/VersionControl';
import CICD from './components/CICD';
import Login from './components/Login';
import Register from './components/Register';
import DevOps from './components/DevOps';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const { user, loading } = useAuth();
  const [selectedTab, setSelectedTab] = useState('devops');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login />
    ) : (
      <Register />
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedTab('devops')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                selectedTab === 'devops'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              DevOps
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-6">
        {selectedTab === 'devops' && <DevOps />}
      </div>

      <Toaster />
    </main>
  );
}
