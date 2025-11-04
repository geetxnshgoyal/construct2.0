import { PropsWithChildren, useEffect, useState } from 'react';
import Navbar from './navigation/Navbar';
import Footer from './navigation/Footer';
import { useTheme } from '../hooks/useTheme';

const ANNOUNCEMENT_STORAGE_KEY = 'construct.emergent.announcement.dismissed';

export default function Layout({ children }: PropsWithChildren) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const mutedTextClass = isDark ? 'text-white/80' : 'text-ink/80';
  const primaryTextClass = isDark ? 'text-white' : 'text-ink';
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const dismissed = window.sessionStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) === 'true';
    setShowAnnouncement(!dismissed);
  }, []);

  const handleDismiss = () => {
    setShowAnnouncement(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, 'true');
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-b from-midnight via-cosmos to-midnight text-white' : 'bg-paper text-ink'}`}>
      <div className={`fixed inset-0 pointer-events-none ${isDark ? 'bg-grid-dark' : 'bg-grid-light'} opacity-30`} />
      <div className="relative flex min-h-screen flex-col">
        {showAnnouncement ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <button
              type="button"
              aria-label="Dismiss Emergent profile reminder"
              onClick={handleDismiss}
              className="absolute inset-0 bg-black/50"
            />
            <div
              className={`relative w-full max-w-lg rounded-3xl border px-6 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:px-8 sm:py-7 ${
                isDark ? 'border-white/10 bg-black/85 text-white' : 'border-ink/10 bg-white text-ink'
              }`}
            >
              <button
                type="button"
                onClick={handleDismiss}
                className={`absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold uppercase tracking-[0.2em] transition ${
                  isDark ? 'border-white/15 text-white/60 hover:bg-white/10 hover:text-white' : 'border-ink/15 text-ink/60 hover:bg-ink/5 hover:text-ink'
                }`}
              >
                ×
              </button>
              <div className="space-y-3 text-sm sm:text-base">
                <p className={`font-semibold sm:text-lg ${primaryTextClass}`}>
                  <span role="img" aria-hidden="true" className="mr-2">
                    🌐
                  </span>
                  Create Your Profile on{' '}
                  <a
                    href="https://app.emergent.sh/"
                    target="_blank"
                    rel="noreferrer"
                    className={isDark ? 'text-neon hover:underline' : 'text-blue-600 hover:underline'}
                  >
                    Emergent Website
                  </a>
                </p>
                <p className={`text-sm leading-relaxed sm:text-base ${mutedTextClass}`}>
                  All registered participants must create their profiles using the{' '}
                  <strong className={primaryTextClass}>college email ID</strong> used during registration.
                </p>
                <p className={`flex items-start gap-2 text-sm sm:text-base ${mutedTextClass}`}>
                  <span role="img" aria-hidden="true">
                    🗓️
                  </span>
                  <span>
                    <strong>Deadline:</strong> 4th Nov
                  </span>
                </p>
                <p className={`flex items-start gap-2 text-sm font-semibold sm:text-base ${primaryTextClass}`}>
                  <span role="img" aria-hidden="true">
                    👉
                  </span>
                  <span>
                    This step is <strong>mandatory</strong> to receive the <strong>50 participation credits</strong> from Emergent.
                  </span>
                </p>
              </div>
            </div>
          </div>
        ) : null}
        <Navbar />
        <main className="flex-1 pt-16 sm:pt-20 lg:pt-24">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
