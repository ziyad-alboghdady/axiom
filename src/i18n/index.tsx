import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppLanguage = "en" | "tr";

const STORAGE_KEY = "axiom_language";

interface I18nContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  tx: (english: string, turkish: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!mounted) return;
      if (stored === "en" || stored === "tr") {
        setLanguageState(stored);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const nextLanguage: AppLanguage = prev === "en" ? "tr" : "en";
      AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
      return nextLanguage;
    });
  }, []);

  const tx = useCallback(
    (english: string, turkish: string) => (language === "tr" ? turkish : english),
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, tx }),
    [language, setLanguage, toggleLanguage, tx]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
