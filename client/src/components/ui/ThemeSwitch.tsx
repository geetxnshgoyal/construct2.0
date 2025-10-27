import { useEffect, useState } from 'react';
import { Theme } from '../../hooks/useTheme';

const storageKey = 'construct-theme';
const modeKey = 'construct-theme-mode';

const readSystemTheme = (): Theme => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  return prefersDark.matches ? 'dark' : 'light';
};

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new CustomEvent<Theme>('construct-theme-change', { detail: theme }));
};

const getInitialMode = (): 'system' | 'custom' => {
  if (typeof window === 'undefined') return 'system';
  return (window.localStorage.getItem(modeKey) as 'system' | 'custom') || 'system';
};

const getInitialTheme = (mode: 'system' | 'custom'): Theme => {
  if (typeof window === 'undefined') return 'light';
  if (mode === 'custom') {
    const stored = window.localStorage.getItem(storageKey) as Theme | null;
    if (stored) return stored;
  }
  return readSystemTheme();
};

export default function ThemeSwitch() {
  const [mode, setMode] = useState<'system' | 'custom'>(() => getInitialMode());
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme(getInitialMode()));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(modeKey, mode);

    if (mode === 'system') {
      window.localStorage.removeItem(storageKey);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

      const syncTheme = (matches: boolean) => {
        const nextTheme: Theme = matches ? 'dark' : 'light';
        setTheme(nextTheme);
        applyTheme(nextTheme);
      };

      syncTheme(prefersDark.matches);
      const listener = (event: MediaQueryListEvent) => syncTheme(event.matches);
      prefersDark.addEventListener('change', listener);
      return () => prefersDark.removeEventListener('change', listener);
    }

    window.localStorage.setItem(storageKey, theme);
    applyTheme(theme);
  }, [mode, theme]);

  const isDark = theme === 'dark';

  const handleToggleTheme = () => {
    setMode('custom');
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(storageKey, next);
      applyTheme(next);
      return next;
    });
  };

  const handleSystemMode = () => {
    setMode('system');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleSystemMode}
        className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
          mode === 'system'
            ? 'border-ink bg-accent text-white'
            : 'border-ink/10 bg-white text-ink hover:border-accent hover:text-accent'
        }`}
      >
        System
      </button>
      <button
        type="button"
        onClick={handleToggleTheme}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
          isDark
            ? 'border-neon/60 bg-white/10 text-neon hover:border-white/80'
            : 'border-ink/10 bg-white text-ink hover:border-accent hover:text-accent'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? <span className="text-xl">🌙</span> : <span className="text-xl">☾</span>}
      </button>
    </div>
  );
}
