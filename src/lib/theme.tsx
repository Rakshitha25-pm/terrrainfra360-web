/**
 * ThemeProvider — global light / dark mode for TerraInfra360.
 *
 *   • Persists the choice in localStorage (`tf360_theme`).
 *   • Reflects on the <html> element via `data-theme="light" | "dark"` so
 *     CSS rules in `index.css` can override the dark-mode Tailwind classes
 *     used throughout the codebase.
 *   • Exposes a `useTheme()` hook returning `{ theme, toggle }`.
 *
 * The dark theme is the default — switching to light flips background,
 * card surfaces, borders and text colours to a clean off-white palette,
 * while the orange brand colour stays put for contrast.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type ThemeMode = 'dark' | 'light';

interface ThemeCtx {
  theme: ThemeMode;
  toggle: () => void;
  setTheme: (t: ThemeMode) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);
const STORAGE_KEY = 'tf360_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Theme toggle removed: the site is permanently dark. Forcing 'dark' here
  // also overwrites any previously-saved 'light' preference on first load.
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try { return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
  });

  // Reflect on <html> so CSS overrides + Tailwind dark variants kick in.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    try { window.localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }, [theme]);

  const value = useMemo<ThemeCtx>(() => ({
    theme,
    toggle: () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
    setTheme: setThemeState,
  }), [theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
