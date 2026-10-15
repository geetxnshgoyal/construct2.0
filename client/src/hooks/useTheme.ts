import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

// Read by the inline script in index.html before first paint.
export const THEME_STORAGE_KEY = 'construct2-theme';

const readTheme = (): Theme => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => readTheme());

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      if (detail === 'dark' || detail === 'light') {
        setTheme(detail);
        return;
      }
      setTheme(readTheme());
    };

    setTheme(readTheme());
    window.addEventListener('construct-theme-change', handleThemeChange as EventListener);
    return () => window.removeEventListener('construct-theme-change', handleThemeChange as EventListener);
  }, []);

  return theme;
};
