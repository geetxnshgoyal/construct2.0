import { motion } from 'framer-motion';
import { useState } from 'react';
import { eventMeta, highlights } from '../../data/hackathon';
import { useTheme } from '../../hooks/useTheme';
import PanelistModal from '../PanelistModal';

export default function HeroSection() {
  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const theme = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware styling
  const badgeBg = isDark ? 'border-white/20 bg-white/10 text-white/80' : 'border-ink/10 bg-white/70 text-ink/70';
  const headingColor = isDark ? 'text-white' : 'text-ink';
  const subTextColor = isDark ? 'text-white/80' : 'text-ink/80';
  const cardBg = isDark ? 'border-white/20 bg-white/10' : 'border-ink/10 bg-white/80';
  const cardTextColor = isDark ? 'text-white' : 'text-ink';
  const cardSubTextColor = isDark ? 'text-white/80' : 'text-ink/80';

  const panelCtaClass = `inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${isDark ? 'bg-accent text-white hover:bg-accent/80' : 'bg-ink text-white hover:bg-ink/90'
    }`;
  const panelGhostClass = `inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${isDark ? 'border border-white/30 text-white hover:bg-white/10' : 'border border-ink/15 text-ink hover:bg-ink/5'
    }`;
  const linkCardClass = isDark
    ? 'border-white/20 bg-white/10 hover:-translate-y-1 hover:rotate-1'
    : 'border-ink/20 bg-white/70 hover:-translate-y-1 hover:rotate-1';

  return (
    <section id="top" className="relative pb-12 sm:pb-16 lg:pb-24 pt-8 sm:pt-12 lg:pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-12 left-6 h-40 w-40 rotate-6 bg-accent/10" />
        <div className="absolute top-16 right-8 h-32 w-32 -rotate-3 bg-accentAlt/30 blur-[2px]" />
        <div className={`absolute bottom-10 left-1/3 h-36 w-60 -rotate-2 border-2 border-dashed ${isDark ? 'border-white/20' : 'border-ink/20'}`} />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:gap-12 lg:gap-16 px-6 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col gap-10">
          <div className={`inline-flex items-center gap-4 rounded-full border px-5 py-2 text-xs uppercase tracking-[0.4em] ${badgeBg}`}>
            Product x Community Hackathon · {eventMeta.timeframe}
          </div>
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logos/construct-logo.svg"
                alt="coNSTruct"
                className="h-9 w-auto drop-shadow-sm"
              />
              <span className={`font-serif text-xl tracking-[0.3em] ${isDark ? 'text-white/80' : 'text-ink/80'}`}>2025</span>
            </div>
            <h1 className={`text-balance font-display text-4xl leading-[1.05] sm:text-5xl lg:text-[3.6rem] ${headingColor}`}>
              Build something real with a room full of scrappy makers.
            </h1>
            <p className={`text-lg ${subTextColor}`}>
              Forget the spotless AI glow. This is a month of scribbled canvases, midnight prototyping, pizza boxes, and shipping with heart.
              {` ${eventMeta.heroQuote}`} Bring your notebooks, sticky tapes, and stubborn ideas.
            </p>

            {/* Results Announcement Banner */}
            <div className={`mt-5 rounded-[2.5rem] px-7 py-6 text-left shadow-sm border ${isDark ? 'border-accent/30 bg-accent/10' : 'border-accent/20 bg-accent/5'}`}>
              <div className="space-y-2">
                <p className={`font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-accent' : 'text-accent'}`}>
                  Results at 7:00 PM IST
                </p>
                <p className={isDark ? 'text-white/90' : 'text-ink/80'}>
                  The winners of CoNSTruct 2025 will be announced today at 7:00 PM IST. Stay tuned!
                </p>
                <a href="#results" className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${isDark ? 'bg-accent text-white hover:bg-accent/80' : 'bg-accent text-white hover:bg-accent/90'
                  }`}>
                  See Countdown
                  <span className="ml-2 text-lg" aria-hidden="true">⟶</span>
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <a
              href="#results"
              className={`flex items-center justify-between rounded-3xl border px-6 py-4 text-left transition ${linkCardClass}`}
            >
              <div>
                <span className={`text-[0.7rem] uppercase tracking-[0.5em] ${isDark ? 'text-white/60' : 'text-ink/60'}`}>Winners</span>
                <p className={`mt-1 text-xl font-semibold ${cardTextColor}`}>See the champions</p>
              </div>
              <span className={`text-2xl ${isDark ? 'text-white/60' : 'text-ink/60'}`}>⟶</span>
            </a>
            <a
              href="#structure"
              className={`flex items-center justify-between rounded-3xl border px-6 py-4 text-left transition ${linkCardClass}`}
            >
              <div>
                <span className={`text-[0.7rem] uppercase tracking-[0.5em] ${isDark ? 'text-white/60' : 'text-ink/60'}`}>How it ran</span>
                <p className={`mt-1 text-xl font-semibold ${cardTextColor}`}>See the timeline</p>
              </div>
              <span className={`text-2xl ${isDark ? 'text-white/60' : 'text-ink/60'}`}>⟶</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setIsPanelModalOpen(true)} className={panelCtaClass}>
              Meet your panelists
              <span className="ml-2 text-lg" aria-hidden="true">⟶</span>
            </button>
            {/* Jump to lineup removed - hackathon completed */}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                key={highlight.title}
                className={`flex flex-col gap-3 rounded-2xl border p-4 transition hover:-translate-y-1 hover:-rotate-1 ${cardBg}`}
              >
                <h3 className={`font-serif text-base font-semibold ${cardTextColor}`}>{highlight.title}</h3>
                <p className={`text-sm ${cardSubTextColor}`}>{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-1 flex-col gap-8">
          <div className={`relative rounded-[2rem] border p-6 ${cardBg}`}>
            <div className="absolute -top-6 right-6 rotate-6 rounded-full bg-seafoam px-4 py-2 font-note text-lg text-white shadow-card">
              ₹50,000 prize pool
            </div>
            <ul className={`space-y-3 text-sm ${cardSubTextColor}`}>
              <li className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${isDark ? 'bg-white' : 'bg-ink'}`} />
                Hackathon Champion · ₹25,000
              </li>
              <li className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${isDark ? 'bg-white' : 'bg-ink'}`} />
                People's Choice · ₹15,000
              </li>
              <li className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${isDark ? 'bg-white' : 'bg-ink'}`} />
                Best Freshers Team · ₹10,000
              </li>
              <li className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${isDark ? 'bg-white' : 'bg-ink'}`} />
                Workshop merch, mentor hours, and launch audits
              </li>
            </ul>
          </div>
        </aside>

      </div>
      <PanelistModal open={isPanelModalOpen} onClose={() => setIsPanelModalOpen(false)} />
    </section>
  );
}
