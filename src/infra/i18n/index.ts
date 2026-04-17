import type { InitOptions } from 'i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { HttpBackendOptions } from 'i18next-http-backend';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import Environment from '@/Environment';

const options: InitOptions<HttpBackendOptions> = {
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  lng: 'pt',
  fallbackLng: 'pt',
  debug: Environment.env === 'development' && process.env.NODE_ENV !== 'test',
  interpolation: {
    escapeValue: false,
  },
  load: 'languageOnly',
};

/* istanbul ignore if -- @preserve */
if (process.env.NODE_ENV !== 'test') {
  i18n.use(Backend).use(LanguageDetector);
}

i18n.use(initReactI18next).init(options);

i18n.loadNamespaces(['validators']);

export default i18n;
