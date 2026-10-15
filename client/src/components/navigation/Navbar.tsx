import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';

const navLinks = [
  { label: 'Tracks', href: '/#tracks' },
  { label: 'Timeline', href: '/#timeline' },
  { label: 'Judging', href: '/#judging' },
  { label: 'Rules', href: '/#rules' },
  { label: 'Prizes', href: '/#prizes' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className="fixed top-0 z-50 w-full border-b-2 border-ink bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="CoNSTruct 2.0 home">
          <img src="/assets/logos/construct-2-logo.png" alt="CoNSTruct 2.0" className="h-6 w-auto sm:h-7" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} className="text-[0.95rem] font-semibold text-ink/70 transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
          <Link to="/#submit" className="bg-replit px-4 py-2 text-[0.95rem] font-bold text-navy transition-colors hover:bg-rust hover:text-white">
            Pitch by Oct 22
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center border-2 border-ink"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <span className="flex flex-col gap-1">
            <span className={`block h-0.5 w-5 bg-ink transition-transform ${isOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 bg-ink ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-ink transition-transform ${isOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
          </span>
          </button>
        </div>
      </div>

      {isOpen && (
        <nav id="mobile-menu" className="border-t-2 border-ink bg-paper px-4 pb-4 md:hidden" aria-label="Main">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} className="block border-b border-rule py-3 text-lg font-semibold text-ink">
              {link.label}
            </Link>
          ))}
          <Link to="/#submit" className="mt-4 block bg-replit px-4 py-3 text-center text-lg font-bold text-navy">
            Pitch by Oct 22
          </Link>
        </nav>
      )}
    </header>
  );
}
