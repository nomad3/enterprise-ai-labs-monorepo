import nextI18NextConfig from '../../../next-i18next.config.js';
import { I18NProviderClient } from '../i18n-provider-client';
import { AuthProvider } from '../contexts/AuthContext';

// This function helps Next.js to know which languages are supported
// and generate static paths for them if you're using SSG.
export async function generateStaticParams() {
  return nextI18NextConfig.i18n.locales.map((lng: string) => ({ lng }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  // The html and body tags, lang, dir attributes are handled by the root layout (app/layout.tsx)
  return (
    <I18NProviderClient locale={params.lng}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </I18NProviderClient>
  );
} 