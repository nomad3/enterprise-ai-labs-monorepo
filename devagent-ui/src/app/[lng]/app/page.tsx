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
import Dashboard from '../../components/dashboard/Dashboard';
import InfrastructureSetupView from '../../components/infrastructure/InfrastructureSetupView';
import PipelineView from '../../components/pipeline/PipelineView';
import { TenantProvider, useTenant } from '../../contexts/TenantContext';

// Placeholder components for agent types
const FullStackDev = () => <div className="p-6">Full-Stack Development Agent (coming soon)</div>;
const DataScience = () => <div className="p-6">Data Analysis & Science Agent (coming soon)</div>;
const BusinessIntelligence = () => <div className="p-6">Business Intelligence Agent (coming soon)</div>;
const SecurityCompliance = () => <div className="p-6">Security & Compliance Agent (coming soon)</div>;
const Documentation = () => <div className="p-6">Documentation & Technical Writing Agent (coming soon)</div>;

const mockInfrastructureSetup = {
  resources: [
    { type: 'VM', name: 'web-server-1', configuration: { cpu: 2, memory: '4GB', os: 'Ubuntu 22.04' } },
    { type: 'DB', name: 'postgres-db', configuration: { version: '14', storage: '100GB' } },
  ],
  status: 'Provisioned',
};

const ManageTenants = () => <div className="p-8 bg-white rounded-xl shadow-lg border border-slate-200"><h1 className="text-2xl font-bold text-blue-600 mb-4">Manage Tenants</h1><p className="text-slate-700">Multi-tenant management dashboard (coming soon).</p></div>;
import AgentOrchestration from '../../components/orchestration/AgentOrchestration';

const OrchestrateAgents = () => <AgentOrchestration />;
const AgentAnalytics = () => <div className="p-8 bg-white rounded-xl shadow-lg border border-slate-200"><h1 className="text-2xl font-bold text-blue-600 mb-4">Agent Analytics</h1><p className="text-slate-700">Agent analytics and metrics (coming soon).</p></div>;
const Integrations = () => <div className="p-8 bg-white rounded-xl shadow-lg border border-slate-200"><h1 className="text-2xl font-bold text-blue-600 mb-4">Integrations</h1><p className="text-slate-700">Integrations hub for enterprise tools (coming soon).</p></div>;

const PLATFORM_GROUP = {
  label: 'Platform Management',
  tabs: [
    { id: 'tenants', label: 'Manage Tenants', icon: <Settings className="mr-2 h-4 w-4" />, component: <ManageTenants /> },
    { id: 'agents', label: 'Orchestrate Agents', icon: <CloudCog className="mr-2 h-4 w-4" />, component: <OrchestrateAgents /> },
    { id: 'agent-analytics', label: 'Agent Analytics', icon: <Lightbulb className="mr-2 h-4 w-4" />, component: <AgentAnalytics /> },
    { id: 'integrations', label: 'Integrations', icon: <GitMerge className="mr-2 h-4 w-4" />, component: <Integrations /> },
  ],
};

const AGENT_GROUPS = [
  PLATFORM_GROUP,
  {
    label: 'Full-Stack Development',
    tabs: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" />, component: <Dashboard /> },
      { id: 'fullstack', label: 'Full-Stack Dev', icon: <LayoutDashboard className="mr-2 h-4 w-4" />, component: <FullStackDev /> },
      { id: 'tickets', label: 'Tickets', icon: <Ticket className="mr-2 h-4 w-4" />, component: <Tickets /> },
      { id: 'plans', label: 'Solution Plans', icon: <Lightbulb className="mr-2 h-4 w-4" />, component: <Plans /> },
      { id: 'codegen', label: 'Code Generation', icon: <Bot className="mr-2 h-4 w-4" />, component: <CodeGeneration /> },
      { id: 'vcs', label: 'Version Control', icon: <GitMerge className="mr-2 h-4 w-4" />, component: <VersionControl /> },
    ],
  },
  {
    label: 'DevOps & Infrastructure',
    tabs: [
      { id: 'devops', label: 'DevOps Dashboard', icon: <CloudCog className="mr-2 h-4 w-4" />, component: <DevOps /> },
      { id: 'cicd', label: 'CI/CD', icon: <CloudCog className="mr-2 h-4 w-4" />, component: <CICD /> },
      { id: 'infrastructure', label: 'Infrastructure Setup', icon: <Settings className="mr-2 h-4 w-4" />, component: <InfrastructureSetupView setup={mockInfrastructureSetup} /> },
      { id: 'pipeline', label: 'Pipeline', icon: <CloudCog className="mr-2 h-4 w-4" />, component: <PipelineView /> },
    ],
  },
  {
    label: 'QA & Testing',
    tabs: [
      { id: 'testgen', label: 'Test Generation', icon: <Bot className="mr-2 h-4 w-4" />, component: <TestGeneration /> },
    ],
  },
  {
    label: 'Data & Business Intelligence',
    tabs: [
      { id: 'data', label: 'Data Analysis & Science', icon: <Lightbulb className="mr-2 h-4 w-4" />, component: <DataScience /> },
      { id: 'bi', label: 'Business Intelligence', icon: <Ticket className="mr-2 h-4 w-4" />, component: <BusinessIntelligence /> },
    ],
  },
  {
    label: 'Security & Compliance',
    tabs: [
      { id: 'security', label: 'Security & Compliance', icon: <Settings className="mr-2 h-4 w-4" />, component: <SecurityCompliance /> },
    ],
  },
  {
    label: 'Documentation & Technical Writing',
    tabs: [
      { id: 'docs', label: 'Documentation & Technical Writing', icon: <GitMerge className="mr-2 h-4 w-4" />, component: <Documentation /> },
    ],
  },
];

function SidebarTenantSwitcher() {
  const { tenant, setTenant, tenants } = useTenant();
  return (
    <div className="mb-8">
      <label className="block text-xs text-slate-500 font-semibold mb-1 pl-1">Tenant</label>
      <select
        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={tenant.id}
        onChange={e => setTenant(tenants.find(t => t.id === e.target.value) || tenants[0])}
      >
        {tenants.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}

export default function AppPage({ params }: { params: { lng: string } }) {
  const { user, loading, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState('dashboard');
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

  // Find the active tab component
  const allTabs = AGENT_GROUPS.flatMap(group => group.tabs);
  const ActiveComponent = allTabs.find(tab => tab.id === selectedTab)?.component || <Dashboard />;

  return (
    <TenantProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 text-slate-800" style={{ display: 'flex', flexDirection: 'row' }}>
          <aside className="hidden md:flex bg-white text-slate-800 p-6 flex-col border-r border-slate-200 shadow-lg" style={{ width: '288px', order: -1, flexShrink: 0 }}>
            <div className="text-2xl font-bold flex items-center text-blue-600 pt-2 mb-6">
              <Settings className="mr-3 h-7 w-7 text-blue-600" /> AgentForge
            </div>
            <SidebarTenantSwitcher />
            <nav className="flex-grow space-y-6">
              {AGENT_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="uppercase text-xs text-blue-600 font-bold mb-3 tracking-wider pl-2">{group.label}</div>
                  <div className="space-y-1">
                    {group.tabs.map(tab => (
                      <Button
                        key={tab.id}
                        variant={selectedTab === tab.id ? "default" : "ghost"}
                        className={`w-full justify-start text-left px-4 py-3 rounded-lg transition-all duration-150 ease-in-out font-medium text-base
                          ${selectedTab === tab.id 
                            ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                            : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                          }`
                        }
                        onClick={() => setSelectedTab(tab.id)}
                      >
                        {React.cloneElement(tab.icon, { className: `mr-3 h-5 w-5 ${selectedTab === tab.id ? 'text-white' : 'text-blue-600 group-hover:text-blue-700'}` })} 
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            <div className="mt-auto pt-8">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-500 hover:bg-blue-100 hover:text-blue-700 px-4 py-3 rounded-lg transition-all duration-150 ease-in-out group font-medium text-base" 
                onClick={logout}
              >
                <LogOut className="mr-3 h-5 w-5 text-blue-600 group-hover:text-blue-700" /> Logout ({user.email})
              </Button>
            </div>
          </aside>
          <main className="p-8 lg:p-12 overflow-auto bg-slate-50 min-h-screen" style={{ flex: 1, order: 1 }}>
            <div className="max-w-6xl mx-auto">
              {ActiveComponent}
            </div>
          </main>
          <ToastViewport />
        </div>
      </ToastProvider>
    </TenantProvider>
  );
}
