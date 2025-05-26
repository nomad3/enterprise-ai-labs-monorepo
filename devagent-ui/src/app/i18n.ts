import { createInstance, i18n as I18NextInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import nextI18NextConfig from '../../next-i18next.config.js';

export default async function initTranslations(
  locale: string,
  namespaces: string[] = ['common'],
  instance?: I18NextInstance,
  resources?: any
) {
  const i18nextInstance = instance || createInstance();

  await i18nextInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) =>
      import(`../../public/locales/${language}/${namespace}.json`)
    ))
    .init({
      lng: locale,
      fallbackLng: nextI18NextConfig.i18n.defaultLocale,
      supportedLngs: nextI18NextConfig.i18n.locales,
      defaultNS: namespaces[0],
      fallbackNS: namespaces[0],
      ns: namespaces,
      // debug: process.env.NODE_ENV === 'development',
      resources,
      // preload: resources ? [] : nextI18NextConfig.i18n.locales // Preload all languages if no specific resources are passed
    });

  return {
    i18n: i18nextInstance,
    resources: i18nextInstance.services.resourceStore.data,
    t: i18nextInstance.t,
  };
} 