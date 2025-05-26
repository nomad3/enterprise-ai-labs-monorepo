'use client';
// Trigger CI build

import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import styles from './page.module.css';
import Tickets from './components/tickets/Tickets';
import CodeGeneration from './components/code/CodeGeneration';
import Plans from './components/plans/Plans';
import TestGeneration from './components/test-generation/TestGeneration';
import VersionControl from './components/version-control/VersionControl';
import CICD from './components/devops/CICD';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DevOps from './components/devops/DevOps';
import { Toaster } from './components/ui/toaster';
import { Rocket, ShieldCheck, Code2, GitBranch, ServerCog, Activity, Users, Cloud, Zap, Briefcase, CloudCog, Network } from 'lucide-react'; // Added Briefcase, CloudCog, Network
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
      <section className="relative flex flex-col items-center justify-center flex-1 text-center px-4 py-20 bg-gradient-to-b from-blue-900 to-background overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://storage.googleapis.com/devagent-assets/landing-page/hero_multi_agent_step2.jpg"
            alt="AI and Technology Background"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 leading-tight">
            Unlock Strategic Agility & Drive Growth with <span className="text-blue-400">Intelligent Automation</span>
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100/90 mb-10 max-w-4xl">
            AgentForge empowers your enterprise to streamline complex workflows, accelerate innovation, and optimize resource allocation across your multi-cloud landscape – all with robust security and governance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="#contact">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl px-10 py-6">Request a Demo</Button>
            </Link>
            <Link href="/app">
              <Button size="lg" variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-800 hover:text-white font-bold text-lg px-10 py-6">Explore Platform</Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center mt-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/70 text-blue-200 rounded-full text-md font-medium"><CloudCog className="w-5 h-5 text-blue-400" /> Multi-Cloud Flexibility</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/70 text-blue-200 rounded-full text-md font-medium"><Network className="w-5 h-5 text-blue-400" /> Secure Multi-Tenancy</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/70 text-blue-200 rounded-full text-md font-medium"><Zap className="w-5 h-5 text-blue-400" /> Diverse Agent Ecosystem</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/70 text-blue-200 rounded-full text-md font-medium"><Briefcase className="w-5 h-5 text-blue-400" /> Enterprise-Grade Solutions</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/70 text-blue-200 rounded-full text-md font-medium"><ShieldCheck className="w-5 h-5 text-blue-400" /> Robust Security & Compliance</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-background">
        <h2 className="text-4xl font-bold text-center text-blue-200 mb-16">Key Capabilities for Enterprise Transformation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto px-6">
          <FeatureCard 
            icon={<CloudCog className="w-10 h-10 text-blue-400" />} 
            title="Seamless Multi-Cloud Operations" 
            desc="Deploy and manage agents across AWS, Azure, GCP, and private clouds with a unified control plane, enabling strategic workload placement, cost optimization, and freedom from vendor lock-in."
            image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_cloud.jpg"
          />
          <FeatureCard 
            icon={<Network className="w-10 h-10 text-blue-400" />} 
            title="Secure Multi-Tenant Architecture" 
            desc="Isolate data and operations for different departments or clients within a single platform, ensuring stringent data privacy, regulatory compliance, and granular access control for distinct business units or clients."
            image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_devops_howitworks_step1.jpg"
          />
          <FeatureCard 
            icon={<Zap className="w-10 h-10 text-blue-400" />} 
            title="Powerful Multi-Agent Collaboration" 
            desc="Orchestrate diverse AI agents specializing in development, DevOps, QA, data analysis, and more. Foster cross-functional synergy to tackle complex business challenges and unlock new opportunities faster."
            image="https://storage.googleapis.com/devagent-assets/landing-page/hero_multi_agent_step2.jpg"
          />
          <FeatureCard 
            icon={<Code2 className="w-10 h-10 text-blue-400" />} 
            title="Accelerated Software Delivery" 
            desc="Automate coding, testing, and deployment pipelines. Reduce development cycles and improve code quality with AI-powered assistance. Deliver higher quality software to market faster, gaining a competitive edge."
            image="https://storage.googleapis.com/devagent-assets/landing-page/feature_software_delivery.jpg"
          />
          <FeatureCard 
            icon={<GitBranch className="w-10 h-10 text-blue-400" />} 
            title="Intelligent DevOps & IaC" 
            desc="Streamline infrastructure management, CI/CD, and GitOps workflows. Proactively manage your cloud resources with AI-driven insights. Enhance operational stability, reduce deployment risks, and optimize cloud spend."
            image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_devops_howitworks_step1.jpg"
          />
          <FeatureCard 
            icon={<Briefcase className="w-10 h-10 text-blue-400" />} 
            title="Custom Enterprise Solutions" 
            desc="Tailor agent capabilities and workflows to your specific business needs. Integrate seamlessly with your existing enterprise ecosystem. Maximize the value of your current investments and address unique operational requirements effectively."
            image="https://storage.googleapis.com/devagent-assets/landing-page/feature_custom_solutions_step3.jpg"
          />
        </div>
      </section>

      {/* How it Works / Enterprise Deployment */}
      <section className="relative py-20 bg-gradient-to-br from-blue-900 via-blue-950 to-background overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_devops_howitworks_step1.jpg"
            alt="Enterprise Technology Background"
            fill
            className="object-cover opacity-10"
          />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-center text-blue-100 mb-16">Streamlined Enterprise Integration & Deployment</h2>
          <div className="flex flex-col md:flex-row gap-10 max-w-6xl mx-auto px-6 items-stretch justify-center">
            <StepCard 
              step="1" 
              title="Strategic Cloud Setup" 
              desc="Collaboratively define your multi-cloud strategy. AgentForge seamlessly integrates with your existing infrastructure, offering expert guidance to ensure optimal performance, cost-efficiency, and data sovereignty."
              image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_devops_howitworks_step1.jpg"
            />
            <StepCard 
              step="2" 
              title="Tenant & Agent Configuration" 
              desc="Efficiently onboard distinct business units or clients as tenants and deploy specialized AI agents. Intuitively customize roles, permissions, and intelligent workflows that mirror your organizational structure and scale with your needs."
              image="https://storage.googleapis.com/devagent-assets/landing-page/hero_multi_agent_step2.jpg"
            />
            <StepCard 
              step="3" 
              title="Govern, Monitor & Optimize" 
              desc="Utilize comprehensive dashboards for continuous, real-time insights into agent performance, resource utilization, and adherence to compliance mandates. Proactively optimize operations and scale your AI initiatives with confidence."
              image="https://storage.googleapis.com/devagent-assets/landing-page/feature_custom_solutions_step3.jpg"
            />
          </div>
        </div>
      </section>

      {/* Benefits - Refocused */}
      <section className="py-20 bg-background">
        <h2 className="text-4xl font-bold text-center text-blue-200 mb-16">The AgentForge Advantage for Your Enterprise</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto px-6">
          <BenefitCard title="Maximize ROI" desc="Automate complex tasks, reduce operational overhead, and accelerate innovation cycles, delivering tangible returns on your AI investment." />
          <BenefitCard title="Future-Proof Scalability" desc="Built for growth, AgentForge scales seamlessly across multiple clouds and tenants, adapting to your evolving business demands." />
          <BenefitCard title="Uncompromised Security" desc="Benefit from enterprise-grade security, robust multi-tenancy, and adherence to stringent compliance standards (SOC2, ISO, GDPR)." />
          <BenefitCard title="Unified Control Plane" desc="Manage all your agents, tenants, and cloud resources from a single, intuitive interface. Simplify complexity and enhance visibility." />
          <BenefitCard title="Drive Innovation" desc="Empower your teams with specialized AI tools to tackle challenges in software development, DevOps, data analytics, and beyond, fostering a culture of innovation and maintaining a competitive edge." />
          <BenefitCard title="Strategic Partnership" desc="Gain a dedicated partner in your AI transformation journey, with expert support and continuous platform enhancements." />
        </div>
      </section>

      {/* Call to Action - Enhanced */}
      <section id="contact" className="py-24 flex flex-col items-center bg-blue-900 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Elevate Your Enterprise with AI?</h2>
        <p className="text-xl text-blue-100/90 mb-10 max-w-3xl">
          Discover how AgentForge's multi-cloud, multi-tenant, and multi-agent platform can drive transformative results for your business.
          Let's discuss your unique challenges and tailor a solution.
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <a href="mailto:sales@agentforge.ai?subject=AgentForge Enterprise Demo Request" className="px-10 py-4 rounded-lg bg-blue-600 text-white font-bold text-xl shadow-xl hover:bg-blue-700 transition-transform hover:scale-105">
            Schedule Your Personalized Demo
          </a>
          <Link href="/docs/enterprise-overview">
            <Button size="lg" variant="outline" className="border-blue-400 text-blue-200 hover:bg-blue-800 hover:text-white font-bold text-xl px-10 py-4 transition-transform hover:scale-105">
              Explore Enterprise Overview
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer - Minor update to contact email */}
      <footer className="py-10 text-center text-blue-200/70 bg-background border-t border-gray-700 mt-auto">
        <div className="mb-3 font-semibold text-lg">AgentForge &copy; {new Date().getFullYear()}</div>
        <div className="flex justify-center gap-x-8 gap-y-2 flex-wrap text-md">
          <a href="https://github.com/thefullstackagent" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">GitHub</a>
          <a href="/docs" className="hover:text-blue-400 transition-colors">Documentation</a>
          <Link href="/app/dashboard" className="hover:text-blue-400 transition-colors">Platform Login</Link>
          <a href="mailto:sales@agentforge.ai" className="hover:text-blue-400 transition-colors">Contact Sales</a>
          <a href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
          <a href="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}

// FeatureCard, StepCard, BenefitCard styling might need minor adjustments for new text lengths or emphasis
// For example, increasing padding or ensuring text alignment remains good.

function FeatureCard({ icon, title, desc, image }: { icon: React.ReactNode; title: string; desc: string; image: string }) {
  return (
    <div className="group flex flex-col items-start bg-blue-950/30 rounded-xl shadow-lg overflow-hidden hover:shadow-blue-500/30 transition-shadow duration-300 border border-blue-800/50">
      <div className="relative w-full h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent" />
      </div>
      <div className="p-8">
        <div className="mb-5 p-3 rounded-full bg-blue-700/30">{icon}</div>
        <h3 className="font-bold text-2xl mb-3 text-blue-200">{title}</h3>
        <p className="text-blue-100/80 text-md leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ step, title, desc, image }: { step: string; title: string; desc: string; image: string }) {
  return (
    <div className="group flex flex-col items-start bg-background/50 rounded-xl shadow-lg overflow-hidden hover:shadow-blue-600/30 transition-shadow duration-300 border border-blue-700/50 flex-1">
      <div className="relative w-full h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent" />
      </div>
      <div className="p-8">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-5 shadow-md">{step}</div>
        <h3 className="font-bold text-2xl mb-3 text-blue-200">{title}</h3>
        <p className="text-blue-100/80 text-md leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function BenefitCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-start bg-blue-950/30 rounded-xl shadow-lg p-8 hover:shadow-blue-500/30 transition-shadow duration-300 border border-blue-800/50">
      <h3 className="font-bold text-2xl mb-3 text-blue-200">{title}</h3>
      <p className="text-blue-100/80 text-md leading-relaxed">{desc}</p>
    </div>
  );
}
