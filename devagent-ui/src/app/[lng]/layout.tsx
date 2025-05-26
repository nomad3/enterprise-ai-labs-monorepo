import { i18n } from '../../../next-i18next.config'; // Adjust path as needed
import LayoutClient from '../layout-client'; // Assuming this is still relevant
import { AuthProvider } from '../contexts/AuthContext'; // Assuming this is still relevant

// This function helps Next.js to know which languages are supported
// and generate static paths for them if you're using SSG.
export async function generateStaticParams() {
  return i18n.locales.map((lng) => ({ lng }));
}

export default function LocaleLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    // The html and body tags are usually in the root layout.
    // This layout component will be nested within the root layout.
    // We pass lng down or components can use useTranslation to get it.
    // The critical part is that the URL has /en/ or /es/
    // and that next.config.js and next-i18next.config.js are set up.
    <AuthProvider> {/* Assuming AuthProvider is still needed here */}
      <LayoutClient>{children}</LayoutClient> {/* Assuming LayoutClient is still needed here */}
    </AuthProvider>
  );
} 