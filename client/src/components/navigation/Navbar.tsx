import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import ThemeSwitch from '../ui/ThemeSwitch';

const navLinks = [
  { label: 'About', href: '/#about' },
  { label: 'Structure', href: '/#structure' },
  { label: 'Guidelines', href: '/#guidelines' },
  { label: 'Awards', href: '/#awards' },
  { label: 'Partners', href: '/#partners' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className="fixed top-0 z-20 w-full border-b border-ink/10 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <motion.div whileHover={{ scale: 1.04 }}>
          <Link
            to="/"
            className="group relative flex items-center gap-3 text-lg font-bold tracking-wide text-ink transition-all hover:text-accent"
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
            <NavLink
              key={link.href}
              to={link.href}
              className="text-sm font-medium uppercase tracking-[0.3em] text-ink/60 transition hover:text-ink"
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/register"
            className="rounded-full border border-ink bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-card transition hover:-translate-y-0.5"
          >
            Register
          </Link>
          <ThemeSwitch />
        </nav>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 bg-white text-ink md:hidden"
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
      <div
        className={`md:hidden ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} transition`}
      >
        <div className="mx-4 mb-4 rounded-3xl border border-ink/10 bg-white/95 p-6 shadow-card">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.5em] text-ink/50">Navigate</span>
            <ThemeSwitch />
          </div>
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className="text-lg font-semibold text-ink/80 transition hover:text-accent"
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/register"
              className="mt-2 inline-flex items-center justify-center rounded-full border border-ink bg-accent px-4 py-2 text-base font-semibold text-white shadow-card transition hover:shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
            >
              Reserve Your Crew
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
