import React from 'react';
import Link from 'next/link';
import { Rocket, Users, Code2, GitBranch, ServerCog, Activity, Cloud, Zap, ShieldCheck, BarChart2, Settings } from 'lucide-react';

const features = [
  { name: 'Tenants', icon: <Users className="w-6 h-6 text-blue-600" />, route: '/enterprise/tenants', metric: '3 Active', description: 'Manage organizations and isolation.' },
  { name: 'Agents', icon: <Rocket className="w-6 h-6 text-blue-600" />, route: '/enterprise/agents', metric: '12 Running', description: 'View and orchestrate AI agents.' },
  { name: 'Tickets', icon: <Code2 className="w-6 h-6 text-blue-600" />, route: '/app/tickets', metric: '24 Open', description: 'Track and manage work items.' },
  { name: 'CI/CD', icon: <ServerCog className="w-6 h-6 text-blue-600" />, route: '/app/cicd', metric: '2 Pipelines', description: 'Automate deployments and builds.' },
  { name: 'Version Control', icon: <GitBranch className="w-6 h-6 text-blue-600" />, route: '/app/version-control', metric: '5 Repos', description: 'Manage code repositories.' },
  { name: 'Files', icon: <Cloud className="w-6 h-6 text-blue-600" />, route: '/app/files', metric: '120 Files', description: 'Browse and manage files.' },
  { name: 'Analytics', icon: <BarChart2 className="w-6 h-6 text-blue-600" />, route: '/enterprise/analytics', metric: '99%', description: 'View usage and performance metrics.' },
  { name: 'Security', icon: <ShieldCheck className="w-6 h-6 text-blue-600" />, route: '/enterprise/security', metric: 'Compliant', description: 'Security & compliance status.' },
  { name: 'Settings', icon: <Settings className="w-6 h-6 text-blue-600" />, route: '/enterprise/settings', metric: '', description: 'Platform configuration.' },
];

export default function EnterpriseDashboard() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border shadow-sm flex flex-col py-8 px-4">
        <div className="flex items-center gap-2 text-2xl font-bold text-blue-400 mb-10">
          <Rocket className="w-7 h-7 text-blue-300" />
          AgentForge
        </div>
        <nav className="flex flex-col gap-2">
          {features.map((f) => (
            <Link key={f.name} href={f.route} className="flex items-center gap-3 px-3 py-2 rounded-md text-blue-200 hover:bg-blue-900 font-medium transition">
              {f.icon}
              {f.name}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-blue-200 mb-8">Enterprise Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <Link key={f.name} href={f.route} className="block bg-blue-900 rounded-xl shadow p-6 hover:shadow-lg transition border border-border">
              <div className="flex items-center gap-3 mb-2">
                {f.icon}
                <span className="font-bold text-lg text-blue-200">{f.name}</span>
              </div>
              <div className="text-2xl font-extrabold text-blue-400 mb-1">{f.metric}</div>
              <div className="text-blue-100/80 text-sm">{f.description}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
} 