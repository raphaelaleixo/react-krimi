import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations } from '../i18n/translations';

interface I18nContextValue {
  lang: 'en' | 'pt_br';
  setLang: (lang: 'en' | 'pt_br') => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<'en' | 'pt_br'>('en');

  const t = useCallback(
    (key: string) => {
      if (lang === 'en') return key;
      return translations[key] || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
