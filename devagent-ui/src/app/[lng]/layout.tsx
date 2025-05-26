import nextI18NextConfig from '../../../next-i18next.config.js';
import { I18NProviderClient } from '../i18n-provider-client';
import { AuthProvider } from '../contexts/AuthContext';
import initTranslations from '../i18n';

const i18nNamespaces = ['common']; // Define namespaces here or pass as needed

// This function helps Next.js to know which languages are supported
// and generate static paths for them if you're using SSG.
export async function generateStaticParams() {
  return nextI18NextConfig.i18n.locales.map((lng: string) => ({ lng }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  const { resources } = await initTranslations(params.lng, i18nNamespaces);
  // The html and body tags, lang, dir attributes are handled by the root layout (app/layout.tsx)
  return (
    <I18NProviderClient locale={params.lng} namespaces={i18nNamespaces} resources={resources}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </I18NProviderClient>
  );
} 