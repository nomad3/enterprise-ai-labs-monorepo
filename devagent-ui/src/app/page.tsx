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
import AgentCard from './components/AgentCard';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white/80 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 text-2xl font-bold text-blue-700">
          <Rocket className="w-7 h-7 text-blue-500" />
          DevAgent
        </div>
        <div className="flex gap-4">
          <Link href="/app">
            <button className="px-4 py-2 rounded-md text-blue-700 font-medium hover:bg-blue-50 transition">Login</button>
          </Link>
          <Link href="/app">
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">Sign Up</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 py-16">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-800 mb-4 leading-tight">
          The All-in-One <span className="text-blue-500">AI DevOps Agent</span>
        </h1>
        <p className="text-xl sm:text-2xl text-blue-900/80 mb-8 max-w-2xl">
          Automate your software delivery, infrastructure, and operations with a single, intelligent agent. <br />
          <span className="font-semibold">Code. Deploy. Monitor. Scale.</span>
        </p>
        <div className="flex gap-4 justify-center mb-12">
          <Link href="/app">
            <button className="px-8 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg shadow-lg hover:bg-blue-700 transition">Get Started</button>
          </Link>
          <a href="#features" className="px-8 py-3 rounded-lg border border-blue-600 text-blue-700 font-bold text-lg hover:bg-blue-50 transition">See Features</a>
        </div>
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"><Zap className="w-4 h-4" /> AI-Powered</span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"><Cloud className="w-4 h-4" /> Cloud Native</span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"><ShieldCheck className="w-4 h-4" /> Secure by Design</span>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-white/90">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
          <FeatureCard icon={<Code2 className="w-8 h-8 text-blue-500" />} title="AI Code Generation" desc="Generate production-ready code, tests, and infrastructure from requirements using Gemini AI." />
          <FeatureCard icon={<GitBranch className="w-8 h-8 text-blue-500" />} title="Version Control" desc="Integrated Git workflows: branch, commit, merge, and review with a single click." />
          <FeatureCard icon={<ServerCog className="w-8 h-8 text-blue-500" />} title="CI/CD Automation" desc="Automate build, test, and deployment pipelines with rollback and notifications." />
          <FeatureCard icon={<Activity className="w-8 h-8 text-blue-500" />} title="Monitoring & Alerts" desc="Real-time metrics, dashboards, and smart alerting with Prometheus & Grafana." />
          <FeatureCard icon={<ShieldCheck className="w-8 h-8 text-blue-500" />} title="Security & Compliance" desc="Built-in best practices for secrets, access, and audit trails." />
          <FeatureCard icon={<Users className="w-8 h-8 text-blue-500" />} title="Team Collaboration" desc="Role-based access, ticketing, and shared knowledge base." />
          <FeatureCard icon={<Cloud className="w-8 h-8 text-blue-500" />} title="Cloud & On-Prem" desc="Deploy anywhere: GCP, AWS, Azure, or your own Kubernetes cluster." />
          <FeatureCard icon={<Zap className="w-8 h-8 text-blue-500" />} title="Agent as a Service" desc="API-first, scalable, and ready to integrate with your stack." />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-blue-100">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto px-4 items-center justify-center">
          <StepCard step="1" title="Connect" desc="Link your repo, cloud, and tools." />
          <StepCard step="2" title="Automate" desc="Describe your goal. Let DevAgent generate code, infra, and pipelines." />
          <StepCard step="3" title="Deploy & Monitor" desc="Ship to production with confidence. Get real-time feedback and alerts." />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white/90">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">Why DevAgent?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          <BenefitCard title="Faster Delivery" desc="Accelerate your SDLC with automation and AI." />
          <BenefitCard title="Fewer Incidents" desc="Proactive monitoring and smart troubleshooting." />
          <BenefitCard title="Lower Costs" desc="Optimize resources and reduce manual work." />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 flex flex-col items-center bg-blue-50">
        <h2 className="text-3xl font-bold text-blue-800 mb-4">Ready to supercharge your DevOps?</h2>
        <p className="text-lg text-blue-900 mb-8">Start your free trial or request a demo today.</p>
        <div className="flex gap-4">
          <Link href="/app">
            <button className="px-8 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg shadow-lg hover:bg-blue-700 transition">Get Started</button>
          </Link>
          <a href="mailto:sales@devagent.ai" className="px-8 py-3 rounded-lg border border-blue-600 text-blue-700 font-bold text-lg hover:bg-blue-50 transition">Request Demo</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-blue-900/70 bg-white border-t mt-8">
        <div className="mb-2 font-semibold">DevAgent &copy; {new Date().getFullYear()}</div>
        <div className="flex justify-center gap-6 text-sm">
          <a href="https://github.com/thefullstackagent" target="_blank" rel="noopener" className="hover:underline">GitHub</a>
          <a href="/docs" className="hover:underline">Docs</a>
          <a href="mailto:hello@devagent.ai" className="hover:underline">Contact</a>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
      <div className="mb-3">{icon}</div>
      <div className="font-bold text-lg mb-1 text-blue-800">{title}</div>
      <div className="text-blue-900/80 text-sm">{desc}</div>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center bg-white rounded-xl shadow p-6 w-full max-w-xs mx-auto">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-3">{step}</div>
      <div className="font-bold text-lg mb-1 text-blue-800">{title}</div>
      <div className="text-blue-900/80 text-sm text-center">{desc}</div>
    </div>
  );
}

function BenefitCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center bg-blue-50 rounded-xl shadow p-6">
      <div className="font-bold text-lg mb-1 text-blue-800">{title}</div>
      <div className="text-blue-900/80 text-sm text-center">{desc}</div>
    </div>
  );
}
