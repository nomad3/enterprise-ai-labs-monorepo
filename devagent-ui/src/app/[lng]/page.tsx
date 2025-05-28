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

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex flex-col bg-white">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
          <Link href={`/${params.lng}`} className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Rocket className="w-7 h-7" />
            <span>{t('navbar.productName', 'AgentForge')}</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
            <Link href={`/${params.lng}/app`}>
              <Button variant="ghost" className="text-slate-700 hover:bg-sky-100 hover:text-blue-700 px-3 sm:px-4">{t('navbar.login', 'Login')}</Button>
            </Link>
            <Link href={`/${params.lng}/app`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 sm:px-4 py-2">{t('navbar.signUp', 'Sign Up')}</Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center px-4 py-20 sm:py-28 bg-sky-50 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-50">
            {/* Optional subtle pattern or abstract background image here if desired, keeping it light */}
            {/* Example: <div className="absolute inset-0 bg-[url('/path/to/light-pattern.svg')] opacity-10"></div> */}
          </div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 mb-6 leading-tight">
              {t('hero.title.static', 'Revolutionize Your Enterprise with')} <span className="text-blue-600">{t('hero.title.dynamic', 'Intelligent Agent Orchestration')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10">
              {t('hero.description', 'AgentForge empowers your business with a cutting-edge Multi-Cloud, Multi-Tenant, and Multi-Agent platform. Drive innovation, enhance productivity, and scale operations with unparalleled security and control.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href={`/${params.lng}/app#contact`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-3 shadow-md hover:shadow-lg transition-shadow">
                  {t('hero.ctaDemo', 'Request a Demo')}
                </Button>
              </Link>
              <Link href={`/${params.lng}/app`}>
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold text-lg px-8 py-3 shadow-sm hover:shadow-md transition-shadow">
                  {t('hero.ctaExplore', 'Explore Platform')}
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 justify-center mt-10">
              {(t('hero.badges', { returnObjects: true, defaultValue: ['Multi-Cloud Flexibility', 'Secure Multi-Tenancy', 'Diverse Agent Ecosystem', 'Enterprise-Grade Solutions'] }) as string[]).map((badgeText, index) => (
                <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm sm:text-md font-medium border border-blue-200">
                  {[<CloudCog key="cloud" className="w-5 h-5 text-blue-600" />, <Network key="network" className="w-5 h-5 text-blue-600" />, <Zap key="zap" className="w-5 h-5 text-blue-600" />, <Building key="building" className="w-5 h-5 text-blue-600" />][index % 4]}
                  {badgeText}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-16 sm:py-24 bg-white">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-12 sm:mb-16 px-4">{t('features.title', 'Unlock Unprecedented Efficiency with AgentForge')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
            {[
              { id: 'feature1', icon: <CloudCog className="w-10 h-10 text-blue-600" />, image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_cloud_light.jpg" },
              { id: 'feature2', icon: <Network className="w-10 h-10 text-blue-600" />, image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_light.jpg" },
              { id: 'feature3', icon: <Zap className="w-10 h-10 text-blue-600" />, image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_agent_light.jpg" },
              { id: 'feature4', icon: <Code2 className="w-10 h-10 text-blue-600" />, image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_dev_light.jpg" },
              { id: 'feature5', icon: <GitBranch className="w-10 h-10 text-blue-600" />, image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_devops_light.jpg" },
              { id: 'feature6', icon: <Briefcase className="w-10 h-10 text-blue-600" />, image: "https://storage.googleapis.com/devagent-assets/landing-page/feature_enterprise_light.jpg" },
            ].map(feature => (
              <FeatureCard 
                key={feature.id}
                icon={feature.icon} 
                title={t(`features.${feature.id}.title`, 'Feature Title')} 
                desc={t(`features.${feature.id}.description`, 'Feature description explaining the benefit.')}
                image={feature.image}
              />
            ))}
          </div>
        </section>

        {/* How it Works / Enterprise Deployment */}
        <section className="py-16 sm:py-24 bg-sky-50">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-12 sm:mb-16 px-4">{t('howItWorks.title', 'Streamlined Enterprise Integration & Deployment')}</h2>
          <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto px-6 items-stretch justify-center">
            {[
              { id: 'step1', image: "https://storage.googleapis.com/devagent-assets/landing-page/step_cloud_setup_light.jpg" },
              { id: 'step2', image: "https://storage.googleapis.com/devagent-assets/landing-page/step_config_light.jpg" },
              { id: 'step3', image: "https://storage.googleapis.com/devagent-assets/landing-page/step_monitor_light.jpg" },
            ].map((step, index) => (
              <StepCard 
                key={step.id}
                step={(index + 1).toString()} 
                title={t(`howItWorks.${step.id}.title`, 'Step Title')} 
                desc={t(`howItWorks.${step.id}.description`, 'Step description detailing the process.')}
                image={step.image}
              />
            ))}
          </div>
        </section>

        {/* Benefits - Refocused */}
        <section className="py-16 sm:py-24 bg-white">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-12 sm:mb-16 px-4">{t('benefits.title', 'The AgentForge Advantage for Your Enterprise')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
            {[
              { id: 'benefit1', icon: <Users className="w-8 h-8 text-blue-600" /> },
              { id: 'benefit2', icon: <ShieldCheck className="w-8 h-8 text-blue-600" /> },
              { id: 'benefit3', icon: <Palette className="w-8 h-8 text-blue-600" /> },
              { id: 'benefit4', icon: <CloudCog className="w-8 h-8 text-blue-600" /> },
              { id: 'benefit5', icon: <Zap className="w-8 h-8 text-blue-600" /> },
              { id: 'benefit6', icon: <Briefcase className="w-8 h-8 text-blue-600" /> },
            ].map(benefit => (
              <BenefitCard 
                key={benefit.id}
                icon={benefit.icon}
                title={t(`benefits.${benefit.id}.title`, 'Benefit Title')} 
                desc={t(`benefits.${benefit.id}.description`, 'Benefit description explaining the value proposition.')} 
              />
            ))}
          </div>
        </section>

        {/* Call to Action - Enhanced */}
        <section id="contact" className="py-20 sm:py-28 flex flex-col items-center bg-blue-600 text-center px-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">{t('cta.title', 'Ready to Elevate Your Enterprise with AI?')}</h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            {t('cta.description', "Discover how AgentForge's multi-cloud, multi-tenant, and multi-agent platform can drive transformative results for your business. Let's discuss your unique challenges and tailor a solution.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <a 
              href={`mailto:sales@agentforge.ai?subject=${encodeURIComponent(t('cta.emailSubject', 'AgentForge Enterprise Demo Request'))}`} 
              className="px-8 py-3 rounded-lg bg-white text-blue-600 font-bold text-lg shadow-md hover:bg-slate-100 transition-transform hover:scale-105"
            >
              {t('cta.buttonDemo', 'Schedule Your Demo')}
            </a>
            <Link href={`/${params.lng}/docs/enterprise-overview`}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 font-bold text-lg px-8 py-3 transition-transform hover:scale-105">
                {t('cta.buttonDocs', 'Read Enterprise Docs')}
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 text-center text-slate-600 bg-slate-50 border-t border-slate-200">
          <div className="mb-3 font-semibold text-md text-slate-700">{t('footer.copyright', `AgentForge © ${currentYear}`)}</div>
          <div className="flex justify-center gap-x-6 sm:gap-x-8 gap-y-2 flex-wrap text-sm sm:text-md">
            {[
              { id: 'github', href: 'https://github.com/thefullstackagent', isExternal: true },
              { id: 'documentation', href: `/${params.lng}/docs` },
              { id: 'platformLogin', href: `/${params.lng}/app/dashboard` },
              { id: 'contactSales', href: `mailto:sales@agentforge.ai?subject=${encodeURIComponent(t('navbar.productName', 'AgentForge') + ' ' + t('footer.contactSales', 'Contact Sales'))}` },
              { id: 'privacyPolicy', href: `/${params.lng}/privacy-policy` },
              { id: 'terms', href: `/${params.lng}/terms-of-service` },
            ].map(link => (
              <a 
                key={link.id} 
                href={link.href} 
                target={link.isExternal ? '_blank' : undefined} 
                rel={link.isExternal ? 'noopener noreferrer' : undefined} 
                className="text-slate-600 hover:text-blue-600 hover:underline transition-colors"
              >
                {t(`footer.${link.id}`, link.id.charAt(0).toUpperCase() + link.id.slice(1).replace(/([A-Z])/g, ' $1').trim())}
              </a>
            ))}
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
      <div className="p-6 flex-grow flex flex-col items-start">
        <div className="mb-4 p-3 rounded-full bg-sky-100 text-blue-600">
          {icon}
        </div>
        <h3 className="font-bold text-xl sm:text-2xl mb-2 text-slate-800">{title}</h3>
        <p className="text-slate-600 text-sm sm:text-md leading-relaxed flex-grow">{desc}</p>
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
