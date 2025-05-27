import { I18NProviderClient } from '../i18n-provider-client';
import { AuthProvider } from '../contexts/AuthContext';

export default function LocaleLayout({
  children,
  params: { lng }
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    <I18NProviderClient locale={lng}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </I18NProviderClient>
  );
} 