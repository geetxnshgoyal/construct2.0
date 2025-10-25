import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import ThemeSwitch from '../ui/ThemeSwitch';

const navLinks = [
  { label: 'About', href: '/#about' },
  { label: 'Structure', href: '/#structure' },
  { label: 'Guidelines', href: '/#guidelines' },
  { label: 'Awards', href: '/#awards' },
  { label: 'Partners', href: '/#partners' }
];

type Theme = 'dark' | 'light';

const readTheme = (): Theme => {
  if (typeof document === 'undefined') return 'dark';
  const theme = document.documentElement.dataset.theme;
  return theme === 'light' ? 'light' : 'dark';
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => readTheme());
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      if (detail === 'dark' || detail === 'light') {
        setTheme(detail);
      }
    };

    setTheme(readTheme());
    window.addEventListener('construct-theme-change', handleThemeChange as EventListener);
    return () => window.removeEventListener('construct-theme-change', handleThemeChange as EventListener);
  }, []);

  const isDark = theme === 'dark';

  const navLinkClass = useMemo(
    () =>
      `text-sm font-medium uppercase tracking-[0.3em] transition ${
        isDark ? 'text-white/60 hover:text-white' : 'text-ink/60 hover:text-ink'
      }`,
    [isDark]
  );

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-300 ${
        isDark ? 'border-white/10 bg-black/70' : 'border-ink/10 bg-white/90'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <motion.div whileHover={{ scale: 1.04 }}>
          <Link
            to="/"
            className={`group relative flex items-center gap-3 text-lg font-bold tracking-wide transition-all ${
              isDark ? 'text-white hover:text-neon' : 'text-ink hover:text-accent'
            }`}
          >
            <span className="flex items-center">
              <img
                src="/assets/logos/construct-logo.svg"
                alt="CoNSTruct logo"
                className="h-9 w-auto"
              />
            </span>
          </Link>
        </motion.div>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} to={link.href} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/register"
            className={`rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] shadow-card transition hover:-translate-y-0.5 ${
              isDark ? 'border border-neon/40 bg-neon/20 text-white hover:bg-neon/30' : 'border border-ink bg-accent text-white'
            }`}
          >
            Register
          </Link>
          <ThemeSwitch />
        </nav>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative flex h-12 w-12 items-center justify-center rounded-full border md:hidden transition ${
            isDark ? 'border-white/20 bg-white/10 text-white' : 'border-ink/15 bg-white text-ink'
          }`}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <div className="flex flex-col gap-1.5">
            <span className="h-0.5 w-6 bg-current transition-all" />
            <span className="h-0.5 w-4 bg-current transition-all" />
            <span className="h-0.5 w-5 bg-current transition-all" />
          </div>
        </button>
      </div>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      <div
        className={`fixed inset-x-0 top-[72px] z-50 transform transition-all duration-300 md:hidden ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`mx-4 rounded-xl border shadow-lg ${
            isDark 
              ? 'border-white/10 bg-black/90 backdrop-blur-xl' 
              : 'border-ink/10 bg-white/95 backdrop-blur-md'
          }`}
        >
          <div className={`p-4 flex items-center justify-between border-b ${
            isDark ? 'border-white/10' : 'border-ink/10'
          }`}>
            <span className={`text-xs font-medium uppercase tracking-[0.3em] ${
              isDark ? 'text-white/60' : 'text-ink/60'
            }`}>Menu</span>
            <ThemeSwitch />
          </div>
          <nav className="p-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2.5 text-base font-medium rounded-lg transition-colors ${
                    isDark 
                      ? 'text-white/80 hover:bg-white/10 hover:text-white' 
                      : 'text-ink/80 hover:bg-ink/5 hover:text-ink'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className={`mt-3 text-center rounded-xl px-4 py-3 text-base font-semibold shadow-sm transition-all active:scale-[0.98] ${
                  isDark 
                    ? 'bg-neon/20 text-white hover:bg-neon/30 border border-neon/40' 
                    : 'bg-accent text-white hover:bg-accent/90'
                }`}
              >
                Register Now
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
