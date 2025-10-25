import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const storageKey = 'construct-theme';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(storageKey) as Theme | null;
  if (stored) return stored;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<Theme>('construct-theme-change', { detail: theme }));
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
        isDark
          ? 'border-neon/60 bg-white/10 text-neon hover:border-white/80'
          : 'border-ink/10 bg-white text-ink hover:border-accent hover:text-accent'
      }`}
      aria-label="Toggle theme"
    >
      {isDark ? <span className="text-xl">🌙</span> : <span className="text-xl">☾</span>}
    </button>
  );
}
