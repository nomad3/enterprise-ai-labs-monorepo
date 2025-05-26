'use client';

import { I18nextProvider } from 'react-i18next';
import initTranslations from './i18n'; // Path relative to devagent-ui/src/app/
import { createInstance } from 'i18next';

export function I18NProviderClient({
  children,
  locale,
  namespaces = ['common'] // Default namespaces
}: {
  children: React.ReactNode;
  locale: string;
  namespaces?: string[];
}) {
  // Initialize i18next instance for the client side
  const instance = createInstance();
  initTranslations(locale, namespaces, instance); // initTranslations is async, but we don't await here in the provider's sync constructor.
                                                 // i18next handles this internally; instance will be ready once translations load.

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
} 