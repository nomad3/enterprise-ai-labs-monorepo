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
            Future-Proof Your Enterprise: <span className="text-blue-400">AI-Powered Operations for Market Leadership</span>
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100/90 mb-10 max-w-4xl mx-auto">
            AgentForge delivers a unified AI orchestration platform to master multi-cloud complexity, accelerate go-to-market, and drive significant ROI—securely and at scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="#contact">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl px-10 py-6">Request a Demo</Button>
            </Link>
            <Link href="/app">
              <Button size="lg" variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-800 hover:text-white font-bold text-lg px-10 py-6">Explore Platform</Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center items-center mt-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/70 text-blue-200 rounded-full text-md font-medium"><CloudCog className="w-5 h-5 text-blue-400" /> Strategic Cloud Dominance</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/70 text-blue-200 rounded-full text-md font-medium"><ShieldCheck className="w-5 h-5 text-blue-400" /> Ironclad Governance & Security</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/70 text-blue-200 rounded-full text-md font-medium"><Zap className="w-5 h-5 text-blue-400" /> Accelerated Innovation Cycles</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/70 text-blue-200 rounded-full text-md font-medium"><Briefcase className="w-5 h-5 text-blue-400" /> Measurable Business Impact</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-background">
        <h2 className="text-4xl font-bold text-center text-blue-200 mb-16">Key Capabilities for Enterprise Transformation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto px-6">
          <FeatureCard 
            icon={<CloudCog className="w-10 h-10 text-blue-400" />} 
            title="Optimize Multi-Cloud Investments" 
            desc="Gain unified control over your entire cloud estate (AWS, Azure, GCP, private). Drive substantial cost savings, enhance workload performance, and eliminate vendor lock-in to maximize strategic flexibility."
            image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_cloud.jpg"
          />
          <FeatureCard 
            icon={<Network className="w-10 h-10 text-blue-400" />} 
            title="Enterprise-Wide Scalability & Governance" 
            desc="Securely scale AI initiatives across all business units and client engagements. Ensure strict data isolation, maintain regulatory compliance (e.g., GDPR, SOC2), and enforce granular control with a robust, auditable framework."
            image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_devops_howitworks_step1.jpg"
          />
          <FeatureCard 
            icon={<Zap className="w-10 h-10 text-blue-400" />} 
            title="Unlock Cross-Functional Synergies" 
            desc="Empower specialized AI agents to collaborate seamlessly across departmental silos—from R&D and operations to GRC and customer success. Transform complex challenges into strategic growth opportunities."
            image="https://storage.googleapis.com/devagent-assets/landing-page/hero_multi_agent_step2.jpg"
          />
          <FeatureCard 
            icon={<Code2 className="w-10 h-10 text-blue-400" />} 
            title="Drastically Reduce Time-to-Market" 
            desc="Automate and intelligently optimize your entire software development lifecycle. Deliver innovative products and services faster, respond rapidly to market changes, and secure a decisive competitive advantage."
            image="https://storage.googleapis.com/devagent-assets/landing-page/feature_software_delivery.jpg"
          />
          <FeatureCard 
            icon={<GitBranch className="w-10 h-10 text-blue-400" />} 
            title="Enhance Operational Resilience & Efficiency" 
            desc="Automate infrastructure provisioning, optimize CI/CD pipelines, and proactively manage cloud resources with AI-driven insights. Significantly improve uptime, reduce operational risk, and optimize total cost of ownership (TCO)."
            image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_devops_howitworks_step1.jpg"
          />
          <FeatureCard 
            icon={<Briefcase className="w-10 h-10 text-blue-400" />} 
            title="Tailored AI for Your Unique Strategy" 
            desc="Adapt AgentForge to your precise business objectives and integrate flawlessly with existing enterprise systems. Leverage bespoke AI solutions to maximize ROI from current investments and conquer unique market challenges."
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
              title="Phase 1: Strategic Architectural Alignment" 
              desc="We partner with your leadership to align AgentForge with your overarching multi-cloud vision. Our experts ensure seamless integration, maximizing existing infrastructure investments while optimizing for peak performance, cost governance, and data sovereignty."
              image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_devops_howitworks_step1.jpg"
            />
            <StepCard 
              step="2" 
              title="Phase 2: Tailored Implementation & Empowerment" 
              desc="AgentForge is configured to mirror your precise organizational structure. We empower your teams by deploying bespoke AI agents and intelligent workflows, fully customized for your specific business units, client engagements, and strategic objectives, ensuring rapid adoption and value realization."
              image="https://storage.googleapis.com/devagent-assets/landing-page/hero_multi_agent_step2.jpg"
            />
            <StepCard 
              step="3" 
              title="Phase 3: Continuous Strategic Oversight & Evolution" 
              desc="Maintain complete executive oversight with real-time dashboards tracking AI performance, resource allocation, and enterprise-wide compliance. AgentForge provides the critical insights needed to continuously optimize operations, mitigate risk, and strategically scale your AI capabilities for sustained competitive advantage."
              image="https://storage.googleapis.com/devagent-assets/landing-page/feature_custom_solutions_step3.jpg"
            />
          </div>
        </div>
      </section>

      {/* Benefits - Refocused */}
      <section className="py-20 bg-background">
        <h2 className="text-4xl font-bold text-center text-blue-200 mb-16">The AgentForge Advantage for Your Enterprise</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto px-6">
          <BenefitCard 
            title="Deliver Demonstrable Shareholder Value" 
            desc="Directly impact your bottom line. AgentForge automates complex operations, drastically cuts overhead, and accelerates revenue-generating innovation, delivering measurable and significant returns on your AI investment."
          />
          <BenefitCard 
            title="Build Enduring Business Agility" 
            desc="Navigate market volatility with confidence. AgentForge is architected for dynamic growth, scaling effortlessly across your global operations and adapting to your evolving strategic imperatives."
          />
          <BenefitCard 
            title="Fortify Enterprise Trust & Compliance" 
            desc="Operate with confidence. AgentForge embeds enterprise-grade security, guarantees data integrity across tenants, and ensures adherence to the most stringent global compliance mandates (SOC2, ISO, GDPR, etc.)."
          />
          <BenefitCard 
            title="Achieve True Operational Command" 
            desc="Gain a single source of truth. Oversee all AI agents, organizational tenants, and multi-cloud resources from an intuitive executive dashboard, simplifying complexity and amplifying strategic visibility."
          />
          <BenefitCard 
            title="Cultivate Sustained Competitive Dominance" 
            desc="Empower your organization to not just compete, but to lead. Equip every department with transformative AI tools to solve critical challenges in product development, operational excellence, and market expansion."
          />
          <BenefitCard 
            title="Your Committed Partner in AI Transformation" 
            desc="Beyond technology, gain a dedicated strategic ally. We provide C-suite level advisory, continuous platform innovation, and expert support to ensure your AI transformation journey is a resounding success."
          />
        </div>
      </section>

      {/* Call to Action - Enhanced */}
      <section id="contact" className="py-24 flex flex-col items-center bg-blue-900 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Lead the Next Wave of AI-Driven Enterprise Performance?</h2>
        <p className="text-xl text-blue-100/90 mb-10 max-w-3xl">
          Let's architect your AI transformation. Partner with AgentForge to convert your strategic challenges into market-leading advantages. Schedule a confidential executive briefing today.
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <a href="mailto:sales@agentforge.ai?subject=AgentForge Executive Briefing Request" className="px-10 py-4 rounded-lg bg-blue-600 text-white font-bold text-xl shadow-xl hover:bg-blue-700 transition-transform hover:scale-105">
            Request Executive Briefing
          </a>
          <Link href="/docs/enterprise-overview">
            <Button size="lg" variant="outline" className="border-blue-400 text-blue-200 hover:bg-blue-800 hover:text-white font-bold text-xl px-10 py-4 transition-transform hover:scale-105">
              View Strategic Capabilities Deck
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
