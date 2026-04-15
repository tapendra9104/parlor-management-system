/**
 * ============================================
 * SalonFlow — i18n Context (Internationalization)
 * ============================================
 * Gap #11: Multi-language support (English + Hindi)
 */

import { createContext, useContext, useState, useCallback } from 'react';
import en from './en.json';
import hi from './hi.json';

const translations = { en, hi };

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('salonflow-locale') || 'en';
  });

  const changeLocale = useCallback((newLocale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
      localStorage.setItem('salonflow-locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  /**
   * Translation function.
   * Usage: t('nav.home') → "Home" or "होम"
   * Supports nested keys with dot notation.
   */
  const t = useCallback((key, fallback) => {
    const keys = key.split('.');
    let value = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English, then to the key itself
        let fallbackValue = translations['en'];
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            return fallback || key;
          }
        }
        return typeof fallbackValue === 'string' ? fallbackValue : (fallback || key);
      }
    }

    return typeof value === 'string' ? value : (fallback || key);
  }, [locale]);

  const availableLocales = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  ];

  return (
    <I18nContext.Provider value={{ locale, changeLocale, t, availableLocales }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default I18nContext;
