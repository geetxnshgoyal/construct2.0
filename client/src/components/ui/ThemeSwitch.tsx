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
    document.body.classList.toggle('bg-white', theme === 'light');
    document.body.classList.toggle('text-slate-900', theme === 'light');
    document.body.classList.toggle('bg-cosmos', theme === 'dark');
    document.body.classList.toggle('text-white', theme === 'dark');
    localStorage.setItem(storageKey, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-neon/70 hover:text-neon"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <span className="text-xl">🌙</span>
      ) : (
        <span className="text-xl">🌞</span>
      )}
    </button>
  );
}
