import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const STORAGE_KEY = 'construct-masterclass-popup-2024-11-15';

export default function MasterclassPopup() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [shouldRender, setShouldRender] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dismiss = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.localStorage.getItem(STORAGE_KEY)) {
      return;
    }

    setShouldRender(true);
    const timer = window.setTimeout(() => setIsOpen(true), 1000);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dismiss]);

  if (!shouldRender) {
    return null;
  }

  const badgeTone = isDark ? 'bg-white/15 text-white/70' : 'bg-ink/10 text-ink/70';
  const panelTone = isDark
    ? 'border-white/15 bg-gradient-to-br from-midnight/95 via-midnight/90 to-cosmos/95 text-white'
    : 'border-ink/10 bg-gradient-to-br from-white via-white to-paper text-ink';
  const primaryButtonTone = isDark
    ? 'bg-white text-midnight hover:bg-white/90'
    : 'bg-midnight text-white hover:bg-midnight/90';
  const secondaryButtonTone = isDark
    ? 'text-white/80 hover:text-white'
    : 'text-ink/70 hover:text-ink';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`relative w-full max-w-lg rounded-3xl border px-8 py-10 shadow-2xl ${panelTone}`}
          >
            <button
              type="button"
              aria-label="Dismiss masterclass announcement"
              onClick={dismiss}
              className="absolute right-4 top-4 rounded-full p-2 text-xl text-current opacity-60 transition hover:opacity-100"
            >
              &times;
            </button>
            <p className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${badgeTone}`}>
              Masterclass
            </p>
            <h2 className="mt-6 font-display text-3xl">November 15 - 9-10 PM</h2>
            <p className="mt-3 text-base opacity-80">
              Lock in for an intimate build session featuring{' '}
              <a
                href="https://www.linkedin.com/in/kevinwilliamdavid/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline decoration-dotted underline-offset-4"
                onClick={dismiss}
              >
                Kevin William David
              </a>
              . Fresh playbooks, live Q&amp;A, and zero fluff.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://www.linkedin.com/in/kevinwilliamdavid/"
                target="_blank"
                rel="noreferrer"
                onClick={dismiss}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition ${primaryButtonTone}`}
              >
                Meet the speaker
              </a>
              <button
                type="button"
                onClick={dismiss}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition ${secondaryButtonTone}`}
              >
                Not now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
