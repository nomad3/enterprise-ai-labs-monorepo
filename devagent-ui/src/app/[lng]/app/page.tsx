'use client';

import React from 'react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../page.module.css';
import Tickets from '../../components/tickets/Tickets';
import CodeGeneration from '../../components/code/CodeGeneration';
import Plans from '../../components/plans/Plans';
import TestGeneration from '../../components/test-generation/TestGeneration';
import VersionControl from '../../components/version-control/VersionControl';
import CICD from '../../components/devops/CICD';
import Login from '../../components/auth/Login';
import Register from '../../components/auth/Register';
import DevOps from '../../components/devops/DevOps';
import { ToastViewport } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Ticket, Bot, Lightbulb, GitMerge, CloudCog, LogOut, Settings } from 'lucide-react';
import { ToastProvider } from '@/components/ui/toast';

// Add placeholder components for new agent types
const FullStackDev = () => <div className="p-6">Full-Stack Development Agent (coming soon)</div>;
const DataScience = () => <div className="p-6">Data Analysis & Science Agent (coming soon)</div>;
const BusinessIntelligence = () => <div className="p-6">Business Intelligence Agent (coming soon)</div>;
const SecurityCompliance = () => <div className="p-6">Security & Compliance Agent (coming soon)</div>;
const Documentation = () => <div className="p-6">Documentation & Technical Writing Agent (coming soon)</div>;
const QATesting = () => <div className="p-6">QA & Testing Agent (coming soon)</div>;

const TABS = [
  { id: 'fullstack', label: 'Full-Stack Development', icon: <LayoutDashboard className="mr-2 h-4 w-4" />, component: <FullStackDev /> },
  { id: 'devops', label: 'DevOps & Infrastructure', icon: <CloudCog className="mr-2 h-4 w-4" />, component: <DevOps /> },
  { id: 'qa', label: 'QA & Testing', icon: <Bot className="mr-2 h-4 w-4" />, component: <QATesting /> },
  { id: 'data', label: 'Data Analysis & Science', icon: <Lightbulb className="mr-2 h-4 w-4" />, component: <DataScience /> },
  { id: 'bi', label: 'Business Intelligence', icon: <Ticket className="mr-2 h-4 w-4" />, component: <BusinessIntelligence /> },
  { id: 'security', label: 'Security & Compliance', icon: <Settings className="mr-2 h-4 w-4" />, component: <SecurityCompliance /> },
  { id: 'docs', label: 'Documentation & Technical Writing', icon: <GitMerge className="mr-2 h-4 w-4" />, component: <Documentation /> },
  { id: 'tickets', label: 'Tickets', icon: <Ticket className="mr-2 h-4 w-4" />, component: <Tickets /> },
  { id: 'plans', label: 'Solution Plans', icon: <Lightbulb className="mr-2 h-4 w-4" />, component: <Plans /> },
  { id: 'codegen', label: 'Code Generation', icon: <Bot className="mr-2 h-4 w-4" />, component: <CodeGeneration /> },
  { id: 'testgen', label: 'Test Generation', icon: <Bot className="mr-2 h-4 w-4" />, component: <TestGeneration /> },
  { id: 'vcs', label: 'Version Control', icon: <GitMerge className="mr-2 h-4 w-4" />, component: <VersionControl /> },
  { id: 'cicd', label: 'CI/CD', icon: <CloudCog className="mr-2 h-4 w-4" />, component: <CICD /> },
];

export default function AppPage({ params }: { params: { lng: string } }) {
  const { user, loading, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState('devops');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-lime-400">
        <p className="text-xl">Loading AgentForge Interface...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-md text-gray-300 border border-lime-800/50">
          <h1 className="text-3xl font-bold text-center mb-6 text-lime-400">AgentForge Access</h1>
          {authMode === 'login' ? (
            <>
              <Login />
              <div className="text-center mt-4">
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-sm text-lime-400 hover:text-lime-300 transition"
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
                  className="text-sm text-lime-400 hover:text-lime-300 transition"
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
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-950 text-gray-300">
        <aside className="hidden md:flex w-64 bg-gray-900 text-gray-300 p-4 flex-col border-r border-lime-800/50">
          <div className="text-2xl font-bold mb-8 flex items-center text-lime-400 pt-2">
             <Settings className="mr-3 h-7 w-7 text-lime-400" /> AgentForge
          </div>
          <nav className="flex-grow space-y-2">
            {TABS.map((tab) => (
              <Button
                key={tab.id}
                variant={selectedTab === tab.id ? "default" : "ghost"}
                className={`w-full justify-start text-left px-3 py-2.5 rounded-md transition-all duration-150 ease-in-out
                  ${selectedTab === tab.id 
                    ? 'bg-lime-600 text-gray-950 font-semibold shadow-md hover:bg-lime-500' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-lime-300'
                  }`
                }
                onClick={() => setSelectedTab(tab.id)}
              >
                {React.cloneElement(tab.icon, { className: `mr-3 h-5 w-5 ${selectedTab === tab.id ? 'text-gray-950' : 'text-lime-500 group-hover:text-lime-400'}` })} 
                {tab.label}
              </Button>
            ))}
          </nav>
          <div className="mt-auto pb-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-400 hover:bg-red-700/80 hover:text-white px-3 py-2.5 rounded-md transition-all duration-150 ease-in-out group" 
              onClick={logout}
            >
              <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-white" /> Logout ({user.email})
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {ActiveComponent}
        </main>

        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
