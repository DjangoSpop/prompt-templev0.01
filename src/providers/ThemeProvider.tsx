'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'light' | 'dark' | undefined;
  resolvedTheme: 'light' | 'dark' | undefined;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  systemTheme: undefined,
  resolvedTheme: undefined,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'prompt-temple-theme',
  attribute = 'class',
  enableSystem: _enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | undefined>(undefined);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | undefined>(undefined);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    updateSystemTheme();
    mediaQuery.addEventListener('change', updateSystemTheme);

    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored) {
      setThemeState(stored);
    }
  }, [storageKey]);

  useEffect(() => {
    const resolved = theme === 'system' ? systemTheme : theme;
    setResolvedTheme(resolved);

    if (!resolved) return;

    const root = document.documentElement;

    if (disableTransitionOnChange) {
      root.style.setProperty('--disable-transitions', '1');
    }

    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    } else {
      root.setAttribute(attribute, resolved);
    }

    if (disableTransitionOnChange) {
      // Force a repaint
      getComputedStyle(root).getPropertyValue('--disable-transitions');
      root.style.removeProperty('--disable-transitions');
    }
  }, [theme, systemTheme, attribute, disableTransitionOnChange]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const value = {
    theme,
    setTheme,
    systemTheme,
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
