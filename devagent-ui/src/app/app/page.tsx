"use client";

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../page.module.css';
import Tickets from '../components/Tickets';
import CodeGeneration from '../components/CodeGeneration';
import Plans from '../components/Plans';
import TestGeneration from '../components/TestGeneration';
import VersionControl from '../components/VersionControl';
import CICD from '../components/CICD';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import DevOps from '../components/DevOps';
import { Toaster } from '../components/ui/toaster';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Ticket, Bot, Lightbulb, GitMerge, CloudCog, LogOut, Settings } from 'lucide-react';

const TABS = [
  { id: 'devops', label: 'DevOps Dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" />, component: <DevOps /> },
  { id: 'tickets', label: 'Tickets', icon: <Ticket className="mr-2 h-4 w-4" />, component: <Tickets /> },
  { id: 'plans', label: 'Solution Plans', icon: <Lightbulb className="mr-2 h-4 w-4" />, component: <Plans /> },
  { id: 'codegen', label: 'Code Generation', icon: <Bot className="mr-2 h-4 w-4" />, component: <CodeGeneration /> },
  { id: 'testgen', label: 'Test Generation', icon: <Bot className="mr-2 h-4 w-4" />, component: <TestGeneration /> },
  { id: 'vcs', label: 'Version Control', icon: <GitMerge className="mr-2 h-4 w-4" />, component: <VersionControl /> },
  { id: 'cicd', label: 'CI/CD', icon: <CloudCog className="mr-2 h-4 w-4" />, component: <CICD /> },
];

export default function AppPage() {
  const { user, loading, logout } = useAuth();
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="bg-slate-700 p-8 rounded-lg shadow-2xl w-full max-w-md text-white">
          <h1 className="text-3xl font-bold text-center mb-6 text-sky-400">DevAgent</h1>
          {authMode === 'login' ? (
            <>
              <Login />
              <div className="text-center mt-4">
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-sm text-sky-400 hover:text-sky-300 transition"
                >
                  Don't have an account? Register
                </button>
              </div>
            </>
          ) : (
            <>
              <Register />
              <div className="text-center mt-4">
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-sm text-sky-400 hover:text-sky-300 transition"
                >
                  Already have an account? Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const ActiveComponent = TABS.find(tab => tab.id === selectedTab)?.component || <DevOps />;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col">
        <div className="text-2xl font-bold mb-6 flex items-center">
           <Settings className="mr-2 h-6 w-6 text-sky-400" /> DevAgent
        </div>
        <nav className="flex-grow">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "secondary" : "ghost"}
              className={`w-full justify-start mb-2 text-left ${selectedTab === tab.id ? 'bg-sky-600 text-white' : 'hover:bg-slate-700'}`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </Button>
          ))}
        </nav>
        <div className="mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-red-700 hover:text-white" 
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout ({user.email})
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {ActiveComponent}
      </main>

      <Toaster />
    </div>
  );
} 