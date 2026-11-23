import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ThemeId,
  StudioThemeDefinition,
  THEME_STORAGE_KEY,
  getStoredThemeId,
  getThemeDefinition,
  applyThemeToDocument,
} from '../lib/themeConfig';

interface ThemeContextValue {
  themeId: ThemeId;
  theme: StudioThemeDefinition;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'sejong',
  theme: getThemeDefinition('sejong'),
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const initial = getStoredThemeId();
    applyThemeToDocument(initial);
    return initial;
  });

  useEffect(() => {
    applyThemeToDocument(themeId);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {
      // ignore storage errors
    }
  }, [themeId]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const next = getThemeDefinition(e.newValue).id;
        setThemeId(next);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    const valid = getThemeDefinition(id).id;
    applyThemeToDocument(valid);
    setThemeId(valid);
  }, []);

  const theme = getThemeDefinition(themeId);

  return (
    <ThemeContext.Provider value={{ themeId, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
