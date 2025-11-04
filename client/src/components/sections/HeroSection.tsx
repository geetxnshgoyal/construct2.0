import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { eventMeta, highlights } from '../../data/hackathon';
import { isRegistrationClosed } from '../../utils/registrationStatus';
import { useCountdown } from '../../hooks/useCountdown';
import { useTheme } from '../../hooks/useTheme';

const COUNTDOWN_TARGET = '2025-11-05T19:00:00+05:30';

export default function HeroSection() {
  const { remaining, isComplete } = useCountdown(COUNTDOWN_TARGET);
  const registrationClosed = isRegistrationClosed();
  const theme = useTheme();
  const isDark = theme === 'dark';

  const closedCardPrimary = isDark
    ? 'border-white/15 bg-white/[0.08] text-white'
    : 'border-rose-100 bg-rose-50 text-rose-700';
  const closedCardSecondary = isDark
    ? 'border-white/15 bg-white/[0.05] text-white/85'
    : 'border-rose-100 bg-rose-50 text-rose-700';
  const openCardPrimary = isDark
    ? 'border-accent/40 bg-accent/15 text-white'
    : 'border-accent/30 bg-accent/10 text-ink';
  const openCardSecondary = isDark
    ? 'border-accent/30 bg-accent/12 text-white'
    : 'border-accent/20 bg-accent/15 text-ink';
  const accentPillTone = registrationClosed
    ? (isDark ? 'text-white/70' : 'text-rose-500')
    : (isDark ? 'text-accent/90' : 'text-accent');
  const statusCardPrimary = registrationClosed ? closedCardPrimary : openCardPrimary;
  const statusCardSecondary = registrationClosed ? closedCardSecondary : openCardSecondary;
  const primaryCtaClass = `inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
    isDark ? 'bg-accent text-white hover:bg-accent/80' : 'bg-accent text-white hover:bg-accent/90'
  }`;
  const secondaryCtaClass = `inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
    isDark ? 'border border-white/30 text-white hover:bg-white/10' : 'border border-ink/15 text-ink hover:bg-ink/5'
  }`;

  return (
    <section id="top" className="relative pb-24 pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-12 left-6 h-40 w-40 rotate-6 bg-accent/10" />
        <div className="absolute top-16 right-8 h-32 w-32 -rotate-3 bg-accentAlt/30 blur-[2px]" />
        <div className="absolute bottom-10 left-1/3 h-36 w-60 -rotate-2 border-2 border-dashed border-ink/20" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col gap-10">
          <div className="inline-flex items-center gap-4 rounded-full border border-ink/10 bg-white/70 px-5 py-2 text-xs uppercase tracking-[0.4em] text-ink/70">
            Product x Community Hackathon · {eventMeta.timeframe}
          </div>
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logos/construct-logo.svg"
                alt="coNSTruct"
                className="h-9 w-auto drop-shadow-sm"
              />
              <span className="font-serif text-xl tracking-[0.3em] text-ink/80">2025</span>
            </div>
            <h1 className="text-balance font-display text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-[3.6rem]">
              Build something real with a room full of scrappy makers.
            </h1>
            <p className="text-lg text-ink/80">
              Forget the spotless AI glow. This is a month of scribbled canvases, midnight prototyping, pizza boxes, and shipping with heart.
              {` ${eventMeta.heroQuote}`} Bring your notebooks, sticky tapes, and stubborn ideas.
            </p>
            <div className={`mt-5 rounded-[2.5rem] px-7 py-6 text-left shadow-sm ${statusCardPrimary}`}>
              <div className="space-y-2">
                <p className={`font-semibold uppercase tracking-[0.2em] ${accentPillTone}`}>
                  {registrationClosed ? 'Registrations closed' : 'Registrations now open'}
                </p>
                <p>
                  {registrationClosed
                    ? 'Pods are locked. Watch your inbox for kickoff logistics and session check-in details.'
                    : 'Form your squad and lock in your pod before slots fill up. Team leads submit one registration for the crew.'}
                </p>
                {!registrationClosed && (
                  <Link to="/register" className={primaryCtaClass}>
                    Start registration
                    <span className="ml-2 text-lg" aria-hidden="true">
                      ⟶
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className={`flex items-center justify-between rounded-[2.5rem] px-7 py-5 text-left shadow-sm ${statusCardSecondary}`}>
              <div>
                <span className={`text-[0.7rem] uppercase tracking-[0.5em] ${accentPillTone}`}>
                  {registrationClosed ? 'Registrations closed' : 'Now accepting teams'}
                </span>
                <p className="mt-1 text-xl font-semibold">
                  {registrationClosed ? 'See you at kickoff' : 'Register your team'}
                </p>
              </div>
              {registrationClosed ? (
                <span className={`text-xl ${accentPillTone}`}>✕</span>
              ) : (
                <Link to="/register" className={secondaryCtaClass}>
                  Apply
                  <span className="ml-2 text-lg" aria-hidden="true">
                    ⟶
                  </span>
                </Link>
              )}
            </div>
            <a
              href="#structure"
              className="flex items-center justify-between rounded-3xl border border-ink/20 bg-white/70 px-6 py-4 text-left transition hover:-translate-y-1 hover:rotate-1"
            >
              <div>
                <span className="text-[0.7rem] uppercase tracking-[0.5em] text-ink/60">How it runs</span>
                <p className="mt-1 text-xl font-semibold text-ink">See the timeline</p>
              </div>
              <span className="text-2xl text-ink/60">⟶</span>
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/80 p-4 transition hover:-translate-y-1 hover:-rotate-1"
              >
                <h3 className="font-serif text-base font-semibold text-ink">{highlight.title}</h3>
                <p className="text-sm text-ink/80">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-1 flex-col gap-8">
          <div className="relative rounded-[2.5rem] border border-ink/20 bg-white/80 p-6">
            <div className="absolute -top-6 left-8 inline-flex rotate-[-2deg] items-center gap-2 rounded-full bg-accentAlt px-4 py-1 font-serif text-xs font-semibold uppercase tracking-[0.25em] text-ink/90 shadow-card">
              Countdown board
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              {Object.entries(remaining).map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-ink/10 bg-paper p-4 text-center shadow-insetNote">
                  <p className="font-serif text-2xl font-semibold text-ink">{value.toString().padStart(2, '0')}</p>
                  <p className="mt-2 text-[0.7rem] uppercase tracking-[0.4em] text-ink/60">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-ink/40 bg-paper/60 p-4 text-sm text-ink/80">
              {isComplete ? (
                <div className="space-y-2">
                  <p className="font-medium text-ink">Launch session is live — head to your campus venue now.</p>
                  <p className="text-rose-600 font-semibold">Attendance is mandatory.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-medium text-ink">
                    Hackathon Launch Session &amp; Masterclass • 5 Nov (Wednesday), 7:00 – 8:30 PM.
                  </p>
                  <ul className="space-y-2 text-sm text-ink/80">
                    <li>📍 RU Venue: A314 (Mini Audi)</li>
                    <li>📍 ADYPU Venue: Room 501</li>
                    <li>📍 S-Vyasa Venue: Classroom 5</li>
                  </ul>
                  <p className="text-rose-600 font-semibold">Attendance is mandatory.</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative rounded-[2rem] border border-ink/10 bg-white/70 p-6">
            <div className="absolute -top-6 right-6 rotate-6 rounded-full bg-seafoam px-4 py-2 font-note text-lg text-white shadow-card">
              ₹50,000 prize pool
            </div>
            <ul className="space-y-3 text-sm text-ink/80">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-ink" />
                Hackathon Champion · ₹25,000
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-ink" />
                People’s Choice · ₹15,000
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-ink" />
                Best Freshers Team · ₹10,000
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-ink" />
                Workshop merch, mentor hours, and launch audits
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
