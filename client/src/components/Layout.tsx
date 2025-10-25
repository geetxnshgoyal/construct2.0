import { PropsWithChildren, useEffect, useState } from 'react';
import Navbar from './navigation/Navbar';
import Footer from './navigation/Footer';
import LightBackdrop from './background/LightBackdrop';
import DarkModeBackdrop from './background/DarkModeBackdrop';

type Theme = 'light' | 'dark';

export default function Layout({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'light';
    const current = document.documentElement.dataset.theme as Theme | undefined;
    return current ?? 'light';
  });

  useEffect(() => {
    const handler = (event: Event) => {
      const next = (event as CustomEvent<Theme>).detail;
      if (next) {
        setTheme(next);
      }
    };

    window.addEventListener('construct-theme-change', handler as EventListener);

    const initial = document.documentElement.dataset.theme as Theme | undefined;
    if (initial) {
      setTheme(initial);
    }

    return () => {
      window.removeEventListener('construct-theme-change', handler as EventListener);
    };
  }, []);

  const isDark = theme === 'dark';

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-cosmos text-white' : 'bg-paper text-ink'}`}>
      {isDark ? <DarkModeBackdrop /> : <LightBackdrop />}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-24 lg:pt-28">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
