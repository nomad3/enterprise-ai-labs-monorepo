'use client'; // Ensure this is present if not already
// Trigger CI build (if this comment was part of the original, keep it)

// All existing imports should be here, ensure these are complete and correct:
import { useState } from 'react'; // Keep if used, though currentYear doesn't need it directly for LandingPage
import { Toaster } from '@/app/components/ui/toaster';
import { Rocket, ShieldCheck, Code2, GitBranch, Zap, Briefcase, CloudCog, Network } from 'lucide-react';
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
    let newPath;
    if (currentPath.startsWith('/en/') || currentPath.startsWith('/es/')) {
      newPath = `/${newLocale}${currentPath.substring(3)}`;
    } else {
      newPath = `/${newLocale}${currentPath === '/' ? '' : currentPath}`;
    }
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => changeLanguage('en')} className={`text-blue-600 hover:bg-blue-100 ${i18n.language.startsWith('en') ? 'font-bold ring-2 ring-blue-500' : ''}`}>EN</Button>
      <Button variant="ghost" size="sm" onClick={() => changeLanguage('es')} className={`text-blue-600 hover:bg-blue-100 ${i18n.language.startsWith('es') ? 'font-bold ring-2 ring-blue-500' : ''}`}>ES</Button>
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
      <div className="min-h-screen flex flex-col bg-white text-slate-800">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-6 bg-white/90 shadow-md sticky top-0 z-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Rocket className="w-7 h-7 text-blue-600" />
            {t('navbar.productName')}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href={`/${params.lng}/app`}>
              <button className="px-4 py-2 rounded-md text-slate-700 font-medium hover:bg-slate-100 transition">{t('navbar.login')}</button>
            </Link>
            <Link href={`/${params.lng}/app`}>
              <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">{t('navbar.signUp')}</button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center flex-1 text-center px-4 py-20 overflow-hidden bg-slate-50">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://storage.googleapis.com/devagent-assets/landing-page/hero_multi_agent_step2.jpg"
              alt={t('hero.altBg')}
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
          <div className="relative z-10">
            <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
              AgentForge: Enterprise-Grade AI Orchestration for <span className="text-blue-600">Strategic Automation</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-10 max-w-4xl mx-auto">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href={`/${params.lng}/app`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl px-10 py-6 shadow-blue-500/30 hover:shadow-blue-600/50">{t('hero.ctaDemo')}</Button>
              </Link>
              <Link href={`/${params.lng}/app`}>
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold text-lg px-10 py-6 hover:border-blue-700">{t('hero.ctaExplore')}</Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center items-center mt-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-md font-medium border border-blue-300/50"><CloudCog className="w-5 h-5 text-blue-600" /> {t('hero.badgeCloud')}</span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-md font-medium border border-blue-300/50"><ShieldCheck className="w-5 h-5 text-blue-600" /> {t('hero.badgeGovernance')}</span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-md font-medium border border-blue-300/50"><Zap className="w-5 h-5 text-blue-600" /> {t('hero.badgeInnovation')}</span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-md font-medium border border-blue-300/50"><Briefcase className="w-5 h-5 text-blue-600" /> {t('hero.badgeImpact')}</span>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-white">
          <h2 className="text-4xl font-bold text-center text-slate-800 mb-16">{t('features.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto px-6">
            <FeatureCard
              icon={<CloudCog className="w-10 h-10 text-blue-600" />}
              title={t('features.card1.title')}
              desc={t('features.card1.description')}
              image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_cloud.jpg"
            />
            <FeatureCard
              icon={<Network className="w-10 h-10 text-blue-600" />}
              title={t('features.card2.title')}
              desc={t('features.card2.description')}
              image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_devops_howitworks_step1.jpg"
            />
            <FeatureCard
              icon={<Zap className="w-10 h-10 text-blue-600" />}
              title={t('features.card3.title')}
              desc={t('features.card3.description')}
              image="https://storage.googleapis.com/devagent-assets/landing-page/hero_multi_agent_step2.jpg"
            />
            <FeatureCard
              icon={<Code2 className="w-10 h-10 text-blue-600" />}
              title={t('features.card4.title')}
              desc={t('features.card4.description')}
              image="https://storage.googleapis.com/devagent-assets/landing-page/feature_software_delivery.jpg"
            />
            <FeatureCard
              icon={<GitBranch className="w-10 h-10 text-blue-600" />}
              title={t('features.card5.title')}
              desc={t('features.card5.description')}
              image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_devops_howitworks_step1.jpg"
            />
            <FeatureCard
              icon={<Briefcase className="w-10 h-10 text-blue-600" />}
              title={t('features.card6.title')}
              desc={t('features.card6.description')}
              image="https://storage.googleapis.com/devagent-assets/landing-page/feature_custom_solutions_step3.jpg"
            />
          </div>
        </section>

        {/* How it Works / Enterprise Deployment */}
        <section className="relative py-20 bg-slate-100 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_devops_howitworks_step1.jpg"
              alt={t('howItWorks.altBg')}
              fill
              className="object-cover opacity-10"
            />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-center text-slate-800 mb-16">{t('howItWorks.title')}</h2>
            <div className="flex flex-col md:flex-row gap-10 max-w-6xl mx-auto px-6 items-stretch justify-center">
              <StepCard
                step="1"
                title={t('howItWorks.step1.title')}
                desc={t('howItWorks.step1.description')}
                image="https://storage.googleapis.com/devagent-assets/landing-page/feature_multi_tenant_devops_howitworks_step1.jpg"
              />
              <StepCard
                step="2"
                title={t('howItWorks.step2.title')}
                desc={t('howItWorks.step2.description')}
                image="https://storage.googleapis.com/devagent-assets/landing-page/hero_multi_agent_step2.jpg"
              />
              <StepCard
                step="3"
                title={t('howItWorks.step3.title')}
                desc={t('howItWorks.step3.description')}
                image="https://storage.googleapis.com/devagent-assets/landing-page/feature_custom_solutions_step3.jpg"
              />
            </div>
          </div>
        </section>

        {/* Benefits - Refocused */}
        <section className="py-20 bg-white">
          <h2 className="text-4xl font-bold text-center text-slate-800 mb-16">{t('benefits.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto px-6">
            <BenefitCard
              title={t('benefits.card1.title')}
              desc={t('benefits.card1.description')}
            />
            <BenefitCard
              title={t('benefits.card2.title')}
              desc={t('benefits.card2.description')}
            />
            <BenefitCard
              title={t('benefits.card3.title')}
              desc={t('benefits.card3.description')}
            />
            <BenefitCard
              title={t('benefits.card4.title')}
              desc={t('benefits.card4.description')}
            />
            <BenefitCard
              title={t('benefits.card5.title')}
              desc={t('benefits.card5.description')}
            />
            <BenefitCard
              title={t('benefits.card6.title')}
              desc={t('benefits.card6.description')}
            />
          </div>
        </section>

        {/* Call to Action - Enhanced */}
        <section id="contact" className="py-24 flex flex-col items-center bg-blue-600 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">{t('cta.title')}</h2>
          <p className="text-xl text-blue-100/90 mb-10 max-w-3xl">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <a href={`mailto:sales@agentforge.ai?subject=${encodeURIComponent(t('cta.buttonBriefing'))}`} className="px-10 py-4 rounded-lg bg-white text-blue-700 font-bold text-xl shadow-xl hover:bg-slate-100 transition-transform hover:scale-105 shadow-slate-500/40">
              {t('cta.buttonBriefing')}
            </a>
            <Link href={`/${params.lng}/docs/enterprise-overview`}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-500 hover:text-white font-bold text-xl px-10 py-4 transition-transform hover:scale-105 hover:border-white">
                {t('cta.buttonDeck')}
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer - Updated to full light theme */}
        <footer className="py-10 text-center text-slate-600 bg-slate-50 border-t border-slate-200 mt-auto">
          <div className="mb-3 font-semibold text-lg text-slate-700">{t('footer.copyright', { year: currentYear })}</div>
          <div className="flex justify-center gap-x-8 gap-y-2 flex-wrap text-md">
            <a href="https://github.com/thefullstackagent" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 transition-colors">{t('footer.github')}</a>
            <a href={`/${params.lng}/docs`} className="text-slate-600 hover:text-blue-600 transition-colors">{t('footer.documentation')}</a>
            <Link href={`/${params.lng}/app/dashboard`} className="text-slate-600 hover:text-blue-600 transition-colors">{t('footer.platformLogin')}</Link>
            <a href={`mailto:sales@agentforge.ai?subject=${encodeURIComponent(t('navbar.productName') + ' ' + t('footer.contactSales'))}`} className="text-slate-600 hover:text-blue-600 transition-colors">{t('footer.contactSales')}</a>
            <a href={`/${params.lng}/privacy-policy`} className="text-slate-600 hover:text-blue-600 transition-colors">{t('footer.privacyPolicy')}</a>
            <a href={`/${params.lng}/terms-of-service`} className="text-slate-600 hover:text-blue-600 transition-colors">{t('footer.terms')}</a>
          </div>
        </footer>
      </div>
    </>
  );
}

// FeatureCard, StepCard, BenefitCard components - THESE SHOULD BE CORRECT AS PER PREVIOUS GOOD VERSION
function FeatureCard({ icon, title, desc, image }: { icon: React.ReactNode; title: string; desc: string; image: string }) {
  const { t } = useTranslation('common');
  return (
    <div className="group flex flex-col items-center bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-blue-500/20 transition-shadow duration-300 border border-slate-200">
      <div className="relative w-full h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-8 flex flex-col items-center w-full">
        <div className="mb-5 p-3 rounded-full bg-blue-100">{icon}</div>
        <h3 className="font-bold text-2xl mb-3 text-slate-800 text-center">{title}</h3>
        <p className="text-slate-600 text-md leading-relaxed text-center">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ step, title, desc, image }: { step: string; title: string; desc: string; image: string }) {
  const { t } = useTranslation('common');
  return (
    <div className="group flex flex-col items-center bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-blue-500/20 transition-shadow duration-300 border border-slate-200 flex-1">
      <div className="relative w-full h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-8 flex flex-col items-center w-full text-center">
        <div className="mb-4 text-blue-600 font-bold text-lg bg-blue-100 px-4 py-2 rounded-full self-center">
          {t('howItWorks.stepLabel', 'Step {{stepNumber}}', { stepNumber: step })}
        </div>
        <h3 className="font-bold text-2xl mb-3 text-slate-800">{title}</h3>
        <p className="text-slate-600 text-md leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function BenefitCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 border border-slate-200 text-center">
      <h3 className="font-bold text-2xl mb-4 text-slate-800">{title}</h3>
      <p className="text-slate-600 text-md leading-relaxed">{desc}</p>
    </div>
  );
}
