import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'construct-masterclass-popup-2024-11-15';
const POSTER_ASSET_PATH = '/assets/masterclass-popup.jpeg';

export default function MasterclassPopup() {
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
            className="relative w-full max-w-2xl overflow-hidden rounded-[32px] shadow-2xl"
          >
            <button
              type="button"
              aria-label="Dismiss masterclass announcement"
              onClick={dismiss}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-2xl text-white transition hover:bg-black/90"
            >
              &times;
            </button>
            <img
              src={POSTER_ASSET_PATH}
              alt="Construct masterclass announcement for November 15, 9-10 PM"
              className="block h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
