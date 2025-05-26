'use client';
// Trigger CI build

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
import { Rocket, ShieldCheck, Code2, GitBranch, ServerCog, Activity, Users, Cloud, Zap } from 'lucide-react';
import Link from 'next/link';
// import AgentCard from './components/AgentCard'; // Removed as it's not used and file is missing
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 bg-background/80 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 text-2xl font-bold text-blue-400">
          <Rocket className="w-7 h-7 text-blue-300" />
          AgentForge
        </div>
        <div className="flex gap-4">
          <Link href="/app">
            <button className="px-4 py-2 rounded-md text-blue-300 font-medium hover:bg-blue-900 transition">Login</button>
          </Link>
          <Link href="/app">
            <button className="px-4 py-2 rounded-md bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition">Sign Up</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 py-16">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-200 mb-4 leading-tight">
          Enterprise-Grade <span className="text-blue-400">Multi-Agent Platform</span>
        </h1>
        <p className="text-xl sm:text-2xl text-blue-100/80 mb-8 max-w-3xl">
          Deploy, manage, and orchestrate specialized AI agents across your organization. <br />
          <span className="font-semibold">Secure. Compliant. Scalable.</span>
        </p>
        <div className="flex gap-4 justify-center mb-12">
          <Link href="/app">
            <button className="px-8 py-3 rounded-lg bg-blue-700 text-white font-bold text-lg shadow-lg hover:bg-blue-800 transition">Get Started</button>
          </Link>
          <a href="#features" className="px-8 py-3 rounded-lg border border-blue-700 text-blue-300 font-bold text-lg hover:bg-blue-900 transition">Explore Features</a>
          <Link href="/enterprise">
            <button className="px-8 py-3 rounded-lg bg-blue-900 text-white font-bold text-lg shadow-lg hover:bg-blue-800 transition">Enterprise Dashboard</button>
          </Link>
        </div>
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-blue-300 rounded-full text-sm font-medium"><Zap className="w-4 h-4" /> Multi-Agent</span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-blue-300 rounded-full text-sm font-medium"><Cloud className="w-4 h-4" /> Enterprise Ready</span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-blue-300 rounded-full text-sm font-medium"><ShieldCheck className="w-4 h-4" /> SOC 2 & ISO 27001</span>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-background/90">
        <h2 className="text-3xl font-bold text-center text-blue-200 mb-10">Specialized Agent Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
          <FeatureCard icon={<Code2 className="w-8 h-8 text-blue-400" />} title="Full-Stack Development" desc="AI agents for code generation, testing, and deployment automation." />
          <FeatureCard icon={<GitBranch className="w-8 h-8 text-blue-400" />} title="DevOps & Infrastructure" desc="Intelligent infrastructure management and CI/CD orchestration." />
          <FeatureCard icon={<ServerCog className="w-8 h-8 text-blue-400" />} title="QA & Testing" desc="Automated testing, quality assurance, and performance monitoring." />
          <FeatureCard icon={<Activity className="w-8 h-8 text-blue-400" />} title="Data Analysis" desc="Advanced data processing, analytics, and business intelligence." />
          <FeatureCard icon={<ShieldCheck className="w-8 h-8 text-blue-400" />} title="Security & Compliance" desc="Proactive security monitoring and compliance management." />
          <FeatureCard icon={<Users className="w-8 h-8 text-blue-400" />} title="Documentation" desc="Automated technical writing and documentation generation." />
          <FeatureCard icon={<Cloud className="w-8 h-8 text-blue-400" />} title="Multi-Tenant" desc="Complete isolation between organizations and teams." />
          <FeatureCard icon={<Zap className="w-8 h-8 text-blue-400" />} title="Enterprise Integration" desc="Seamless integration with existing enterprise tools." />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gradient-to-r from-blue-950 to-blue-900">
        <h2 className="text-3xl font-bold text-center text-blue-200 mb-10">Enterprise Deployment</h2>
        <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto px-4 items-center justify-center">
          <StepCard step="1" title="Configure" desc="Set up your organization's policies, security, and compliance requirements." />
          <StepCard step="2" title="Deploy Agents" desc="Choose and configure specialized agents for your needs." />
          <StepCard step="3" title="Monitor & Scale" desc="Track performance, manage resources, and scale as needed." />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-background/90">
        <h2 className="text-3xl font-bold text-center text-blue-200 mb-10">Enterprise Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          <BenefitCard title="Enhanced Security" desc="Enterprise-grade security with multi-tenant isolation." />
          <BenefitCard title="Compliance Ready" desc="Built-in compliance frameworks and audit trails." />
          <BenefitCard title="Operational Efficiency" desc="Streamlined workflows and automated processes." />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 flex flex-col items-center bg-blue-950">
        <h2 className="text-3xl font-bold text-blue-200 mb-4">Ready to transform your organization?</h2>
        <p className="text-lg text-blue-100 mb-8">Schedule a demo or start your enterprise trial today.</p>
        <div className="flex gap-4">
          <Link href="/app">
            <button className="px-8 py-3 rounded-lg bg-blue-700 text-white font-bold text-lg shadow-lg hover:bg-blue-800 transition">Start Trial</button>
          </Link>
          <a href="mailto:enterprise@agentforge.ai" className="px-8 py-3 rounded-lg border border-blue-700 text-blue-300 font-bold text-lg hover:bg-blue-900 transition">Request Demo</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-blue-200/70 bg-background border-t mt-8">
        <div className="mb-2 font-semibold">AgentForge &copy; {new Date().getFullYear()}</div>
        <div className="flex justify-center gap-6 text-sm">
          <a href="https://github.com/thefullstackagent" target="_blank" rel="noopener" className="hover:underline">GitHub</a>
          <a href="/docs" className="hover:underline">Documentation</a>
          <a href="/enterprise" className="hover:underline">Enterprise</a>
          <a href="mailto:enterprise@agentforge.ai" className="hover:underline">Contact</a>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center bg-background rounded-xl shadow p-6 hover:shadow-lg transition">
      <div className="mb-3">{icon}</div>
      <div className="font-bold text-lg mb-1 text-blue-200">{title}</div>
      <div className="text-blue-100/80 text-sm">{desc}</div>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center bg-background rounded-xl shadow p-6 w-full max-w-xs mx-auto">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-700 text-white text-2xl font-bold mb-3">{step}</div>
      <div className="font-bold text-lg mb-1 text-blue-200">{title}</div>
      <div className="text-blue-100/80 text-sm text-center">{desc}</div>
    </div>
  );
}

function BenefitCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center bg-blue-950 rounded-xl shadow p-6">
      <div className="font-bold text-lg mb-1 text-blue-200">{title}</div>
      <div className="text-blue-100/80 text-sm text-center">{desc}</div>
    </div>
  );
}
