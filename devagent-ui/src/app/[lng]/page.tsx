'use client'; // Ensure this is present if not already
// Trigger CI build (if this comment was part of the original, keep it)

// All existing imports should be here, ensure these are complete and correct:
import { useState } from 'react'; // Keep if used, though currentYear doesn't need it directly for LandingPage
import { Toaster } from '@/app/components/ui/toaster';
import { Rocket, ShieldCheck, Code2, GitBranch, Zap, Briefcase, CloudCog, Network, Building, Users, Palette } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useTranslation, Trans } from 'next-i18next';
import { useRouter, usePathname } from 'next/navigation';

// Helper for language switcher - THIS SHOULD BE CORRECT AS PER PREVIOUS GOOD VERSION
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    const currentPath = pathname;
    const pathSegments = currentPath.split('/');
    if (pathSegments.length > 1 && (pathSegments[1] === 'en' || pathSegments[1] === 'es')) {
      pathSegments[1] = newLocale;
    } else {
      pathSegments.splice(1, 0, newLocale);
    }
    let newPath = pathSegments.join('/');
    if (newPath === ('/' + newLocale + '/')) {
      newPath = '/' + newLocale;
    }
    router.push(newPath.startsWith('//') ? newPath.substring(1) : newPath);
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => changeLanguage('en')} className={`text-slate-600 hover:bg-sky-100 hover:text-blue-700 ${i18n.language.startsWith('en') ? 'font-semibold text-blue-600 ring-2 ring-blue-500' : ''}`}>EN</Button>
      <Button variant="ghost" size="sm" onClick={() => changeLanguage('es')} className={`text-slate-600 hover:bg-sky-100 hover:text-blue-700 ${i18n.language.startsWith('es') ? 'font-semibold text-blue-600 ring-2 ring-blue-500' : ''}`}>ES</Button>
    </div>
  );
};

// Main Landing Page Component - RESTORED STRUCTURE
export default function LandingPage({ params }: { params: { lng: string } }) {
  const { t, i18n } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  const featuresData = [
    {
      icon: <CloudCog className="w-10 h-10 text-blue-600" />,
      title: "Seamless Multi-Cloud Operations",
      desc: "Deploy and manage agents across AWS, Azure, GCP, and private clouds with a unified control plane. Optimize costs and avoid vendor lock-in.",
      image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_cloud.jpg",
      name: "feature1" // key for t()
    },
    {
      icon: <Network className="w-10 h-10 text-blue-600" />,
      title: "Secure Multi-Tenant Architecture",
      desc: "Isolate data and operations for different departments or clients within a single platform. Ensure data privacy and granular access control.",
      image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant.jpg",
      name: "feature2"
    },
    {
      icon: <Zap className="w-10 h-10 text-blue-600" />,
      title: "Powerful Multi-Agent Collaboration",
      desc: "Orchestrate diverse AI agents specializing in development, DevOps, QA, data analysis, and more. Foster synergy for complex problem-solving.",
      image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_agent.jpg",
      name: "feature3"
    },
    {
      icon: <Code2 className="w-10 h-10 text-blue-600" />,
      title: "Accelerated Software Delivery",
      desc: "Automate coding, testing, and deployment pipelines. Reduce development cycles and improve code quality with AI-powered assistance.",
      image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_dev.jpg",
      name: "feature4"
    },
    {
      icon: <GitBranch className="w-10 h-10 text-blue-600" />,
      title: "Intelligent DevOps & IaC",
      desc: "Streamline infrastructure management, CI/CD, and GitOps workflows. Proactively manage your cloud resources with AI-driven insights.",
      image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_devops.jpg",
      name: "feature5"
    },
    {
      icon: <Briefcase className="w-10 h-10 text-blue-600" />,
      title: "Custom Enterprise Solutions",
      desc: "Tailor agent capabilities and workflows to your specific business needs. Integrate seamlessly with your existing enterprise ecosystem.",
      image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_enterprise.jpg",
      name: "feature6"
    }
  ];

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex flex-col bg-white">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
          <Link href={`/${params.lng}`} className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Rocket className="w-7 h-7" />
            <span>AgentForge</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
            <Link href={`/${params.lng}/app`}>
              <Button variant="ghost" className="text-slate-700 hover:bg-sky-100 hover:text-blue-700 px-3 sm:px-4">Login</Button>
            </Link>
            <Link href={`/${params.lng}/app`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 sm:px-4 py-2">Sign Up</Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center px-4 py-20 sm:py-28 bg-sky-50 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b"
              alt="AI and Technology Background"
              fill
              className="object-cover opacity-10"
              priority
            />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 mb-6 leading-tight">
              Revolutionize Your Enterprise with <span className="text-blue-600">Intelligent Agent Orchestration</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10">
              AgentForge empowers your business with a cutting-edge <strong className="font-semibold text-blue-700">Multi-Cloud, Multi-Tenant, and Multi-Agent platform</strong>.
              Drive innovation, enhance productivity, and scale operations with unparalleled security and control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href={`/${params.lng}#contact`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-3 shadow-md hover:shadow-lg transition-shadow">
                  Request a Demo
                </Button>
              </Link>
              <Link href={`/${params.lng}/app`}>
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold text-lg px-8 py-3 shadow-sm hover:shadow-md transition-shadow">
                  Explore Platform
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 justify-center mt-10">
              {[ 
                { text: 'Multi-Cloud Flexibility', icon: <CloudCog className="w-5 h-5 text-blue-600" /> },
                { text: 'Secure Multi-Tenancy', icon: <Network className="w-5 h-5 text-blue-600" /> }, 
                { text: 'Diverse Agent Ecosystem', icon: <Zap className="w-5 h-5 text-blue-600" /> },
                { text: 'Enterprise-Grade Solutions', icon: <Building className="w-5 h-5 text-blue-600" /> },
                { text: 'Robust Security & Compliance', icon: <ShieldCheck className="w-5 h-5 text-blue-600" /> }
              ].map((badge, index) => (
                <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm sm:text-md font-medium border border-blue-200">
                  {badge.icon}
                  {badge.text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-16 sm:py-24 bg-white">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-12 sm:mb-16 px-4">Unlock Unprecedented Efficiency with AgentForge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
            {featuresData.map((feature) => (
              <FeatureCard
                key={feature.name}
                icon={feature.icon}
                title={t(`features.${feature.name}.title`, feature.title)}
                desc={t(`features.${feature.name}.desc`, feature.desc)}
                image={feature.image}
              />
            ))}
          </div>
        </section>

        {/* How it Works / Enterprise Deployment */}
        <section className="py-16 sm:py-24 bg-sky-50">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-12 sm:mb-16 px-4">Streamlined Enterprise Integration & Deployment</h2>
          <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto px-6 items-stretch justify-center">
            <StepCard 
              step="1" 
              title="Strategic Cloud Setup" 
              desc="Define your multi-cloud strategy. AgentForge integrates with your existing infrastructure, ensuring optimal performance and data sovereignty."
              image="https://storage.googleapis.com/devagent-assets/landing-page/step_cloud_setup.jpg"
            />
            <StepCard 
              step="2" 
              title="Tenant & Agent Configuration" 
              desc="Easily onboard tenants and deploy specialized AI agents. Customize roles, permissions, and workflows to match your organizational structure."
              image="https://storage.googleapis.com/devagent-assets/landing-page/step_config.jpg"
            />
            <StepCard 
              step="3" 
              title="Govern, Monitor & Optimize" 
              desc="Leverage comprehensive dashboards for real-time insights into agent performance, resource utilization, and compliance. Scale with confidence."
              image="https://storage.googleapis.com/devagent-assets/landing-page/step_monitor.jpg"
            />
          </div>
        </section>

        {/* Benefits - Refocused */}
        <section className="py-16 sm:py-24 bg-white">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-12 sm:mb-16 px-4">The AgentForge Advantage for Your Enterprise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
            <BenefitCard icon={<Users className="w-8 h-8 text-blue-600" />} title="Maximize ROI" desc="Automate complex tasks, reduce operational overhead, and accelerate innovation cycles, delivering tangible returns on your AI investment." />
            <BenefitCard icon={<ShieldCheck className="w-8 h-8 text-blue-600" />} title="Future-Proof Scalability" desc="Built for growth, AgentForge scales seamlessly across multiple clouds and tenants, adapting to your evolving business demands." />
            <BenefitCard icon={<Palette className="w-8 h-8 text-blue-600" />} title="Uncompromised Security" desc="Benefit from enterprise-grade security, robust multi-tenancy, and adherence to stringent compliance standards (SOC2, ISO, GDPR)." />
            <BenefitCard icon={<CloudCog className="w-8 h-8 text-blue-600" />} title="Unified Control Plane" desc="Manage all your agents, tenants, and cloud resources from a single, intuitive interface. Simplify complexity and enhance visibility." />
            <BenefitCard icon={<Zap className="w-8 h-8 text-blue-600" />} title="Drive Innovation" desc="Empower your teams with specialized AI tools to tackle challenges in software development, DevOps, data analytics, and beyond." />
            <BenefitCard icon={<Briefcase className="w-8 h-8 text-blue-600" />} title="Strategic Partnership" desc="Gain a dedicated partner in your AI transformation journey, with expert support and continuous platform enhancements." />
          </div>
        </section>

        {/* Call to Action - Enhanced */}
        <section id="contact" className="py-20 sm:py-28 flex flex-col items-center bg-blue-600 text-center px-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Elevate Your Enterprise with AI?</h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Discover how AgentForge's multi-cloud, multi-tenant, and multi-agent platform can drive transformative results for your business.
            Let's discuss your unique challenges and tailor a solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <a 
              href={`mailto:sales@agentforge.ai?subject=AgentForge Enterprise Demo Request`} 
              className="px-8 py-3 rounded-lg bg-white text-blue-600 font-bold text-lg shadow-md hover:bg-slate-100 transition-transform hover:scale-105"
            >
              Schedule Your Personalized Demo
            </a>
            <Link href={`/${params.lng}/docs/enterprise-overview`}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-bold text-lg px-8 py-3 transition-transform hover:scale-105">
                Read Enterprise Docs
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 text-center text-slate-600 bg-slate-50 border-t border-slate-200">
          <div className="mb-3 font-semibold text-md text-slate-700">AgentForge &copy; {currentYear}</div>
          <div className="flex justify-center gap-x-6 sm:gap-x-8 gap-y-2 flex-wrap text-sm sm:text-md">
            <a href="https://github.com/thefullstackagent" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 hover:underline transition-colors">GitHub</a>
            <Link href={`/${params.lng}/docs`} className="text-slate-600 hover:text-blue-600 hover:underline transition-colors">Documentation</Link>
            <Link href={`/${params.lng}/app/dashboard`} className="text-slate-600 hover:text-blue-600 hover:underline transition-colors">Platform Login</Link>
            <a href="mailto:sales@agentforge.ai" className="text-slate-600 hover:text-blue-600 hover:underline transition-colors">Contact Sales</a>
            <Link href={`/${params.lng}/privacy-policy`} className="text-slate-600 hover:text-blue-600 hover:underline transition-colors">Privacy Policy</Link>
            <Link href={`/${params.lng}/terms-of-service`} className="text-slate-600 hover:text-blue-600 hover:underline transition-colors">Terms of Service</Link>
          </div>
        </footer>
      </div>
    </>
  );
}

// FeatureCard, StepCard, BenefitCard components - THESE SHOULD BE CORRECT AS PER PREVIOUS GOOD VERSION
function FeatureCard({ icon, title, desc, image }: { icon: React.ReactNode; title: string; desc: string; image: string }) {
  return (
    <div className="group flex flex-col bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200 overflow-hidden">
      <div className="relative w-full h-48 sm:h-56">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Optional subtle gradient overlay if images are too busy */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div> */}
      </div>
      <div className="p-6 flex-grow flex flex-col items-center">
        <div className="mb-4 p-3 rounded-full bg-sky-100 text-blue-600">
          {icon}
        </div>
        <h3 className="font-bold text-xl sm:text-2xl mb-2 text-slate-800 text-center">{title}</h3>
        <p className="text-slate-600 text-sm sm:text-md leading-relaxed flex-grow text-center">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ step, title, desc, image }: { step: string; title: string; desc: string; image: string }) {
  const { t } = useTranslation('common');
  return (
    <div className="group flex flex-col items-center bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200 flex-1 overflow-hidden">
      <div className="relative w-full h-48 sm:h-56">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6 text-center flex-grow flex flex-col items-center w-full">
        <div className="mb-4 text-blue-600 font-bold text-md bg-sky-100 px-4 py-2 rounded-full self-center border border-blue-200">
          {t('howItWorks.stepLabel', 'Step {{stepNumber}}', { stepNumber: step })}
        </div>
        <h3 className="font-bold text-xl sm:text-2xl mb-2 text-slate-800">{title}</h3>
        <p className="text-slate-600 text-sm sm:text-md leading-relaxed flex-grow">{desc}</p>
      </div>
    </div>
  );
}

function BenefitCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-start bg-white rounded-xl shadow-lg hover:shadow-xl p-6 transition-shadow duration-300 border border-slate-200 text-left h-full">
      <div className="mb-4 p-3 rounded-full bg-sky-100 text-blue-600">
        {icon}
      </div>
      <h3 className="font-bold text-xl sm:text-2xl mb-2 text-slate-800">{title}</h3>
      <p className="text-slate-600 text-sm sm:text-md leading-relaxed">{desc}</p>
    </div>
  );
}
