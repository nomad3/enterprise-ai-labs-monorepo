import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useTranslation, Trans } from 'next-i18next'; // Import useTranslation and Trans
import { useRouter, usePathname } from 'next/navigation'; // NEW: For App Router

// Helper for language switcher
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const router = useRouter(); // From next/navigation
  const pathname = usePathname(); // From next/navigation

  const changeLanguage = (newLocale: string) => {
    // i18n.changeLanguage(newLocale); // This is for react-i18next state, Next.js routing handles the locale for rendering
    
    // Construct the new path with the new locale
    // Assumes current pathname is /en/some/path or /es/some/path
    // or just /some/path if it's the default locale and not prefixed
    const currentPath = pathname;
    let newPath;
    if (currentPath.startsWith('/en/') || currentPath.startsWith('/es/')) {
      newPath = `/${newLocale}${currentPath.substring(3)}`;
    } else {
      // If current path is for default locale (e.g. /about) and default is not prefixed
      // or if the app is not set up for path-based localization yet (which it should be)
      // For simplicity, assuming our setup means paths will be /en or /es always for the landing page
      // If it were just "/", then it would become "/es" or "/en"
      newPath = `/${newLocale}${currentPath === '/' ? '' : currentPath}`;
    }
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => changeLanguage('en')} className={`text-lime-300 hover:bg-lime-900/50 ${i18n.language.startsWith('en') ? 'font-bold ring-2 ring-lime-500' : ''}`}>EN</Button>
      <Button variant="ghost" size="sm" onClick={() => changeLanguage('es')} className={`text-lime-300 hover:bg-lime-900/50 ${i18n.language.startsWith('es') ? 'font-bold ring-2 ring-lime-500' : ''}`}>ES</Button>
    </div>
  );
};
