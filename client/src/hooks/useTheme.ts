import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const readTheme = (): Theme => {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
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
