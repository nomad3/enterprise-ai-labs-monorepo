'use client';

import React, { useEffect, useState } from 'react';
import { I18nextProvider, useSSR } from 'react-i18next';
import initTranslations from './i18n'; // Path relative to devagent-ui/src/app/
import { createInstance, i18n as I18NextInstance } from 'i18next';

export function I18NProviderClient({
  children,
  locale,
  namespaces = ['common'],
  resources
}: {
  children: React.ReactNode;
  locale: string;
  namespaces?: string[];
  resources?: any; // Passed from server component
}) {
  const [i18n, setI18n] = useState<I18NextInstance | null>(null);

  useEffect(() => {
    const instance = createInstance();
    initTranslations(locale, namespaces, instance, resources)
      .then(() => {
        setI18n(instance);
      })
      .catch(error => {
        console.error("Failed to initialize i18next in I18NProviderClient:", error);
        // Fallback or error handling: try to initialize without preloaded resources
        // This is a simple fallback, consider a more robust error handling strategy
        initTranslations(locale, namespaces, instance).then(() => setI18n(instance));
      });
  }, [locale, namespaces, resources]);

  if (!i18n) {
    // You might want to render a loading state here
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
} 