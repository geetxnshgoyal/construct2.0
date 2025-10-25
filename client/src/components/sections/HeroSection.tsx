import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { eventMeta, highlights } from '../../data/hackathon';
import { useCountdown } from '../../hooks/useCountdown';

const COUNTDOWN_TARGET = '2025-11-05T09:00:00+05:30';

export default function HeroSection() {
  const { remaining, isComplete } = useCountdown(COUNTDOWN_TARGET);

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
            <p className="font-display text-2xl text-ink">coNSTruct 2025</p>
            <h1 className="text-balance font-display text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-[3.6rem]">
              Build something real with a room full of scrappy makers.
            </h1>
            <p className="text-lg text-ink/80">
              Forget the spotless AI glow. This is a month of scribbled canvases, midnight prototyping, pizza boxes, and shipping with heart.
              {` ${eventMeta.heroQuote}`} Bring your notebooks, sticky tapes, and stubborn ideas.
            </p>
            <p className="text-sm uppercase tracking-[0.35em] text-ink/60">
              {eventMeta.duration} · {eventMeta.location}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/register"
              className="flex items-center justify-between rounded-3xl border border-ink/80 bg-accent px-6 py-4 text-left text-white transition hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(0,0,0,0.25)]"
            >
              <div>
                <span className="text-[0.7rem] uppercase tracking-[0.5em] text-white/80">Register now</span>
                <p className="mt-1 text-xl font-semibold">Lock in your team</p>
              </div>
              <span className="text-2xl">↗</span>
            </Link>
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
                <h3 className="font-display text-sm text-ink">{highlight.title}</h3>
                <p className="text-sm text-ink/80">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-1 flex-col gap-8">
          <div className="relative rounded-[2.5rem] border border-ink/20 bg-white/80 p-6">
            <div className="absolute -top-6 left-8 inline-flex rotate-[-4deg] items-center gap-2 rounded-full bg-accentAlt px-3 py-1 font-display text-xs uppercase tracking-[0.4em] text-ink shadow-card">
              Countdown board
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              {Object.entries(remaining).map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-ink/10 bg-paper p-4 text-center shadow-insetNote">
                  <p className="font-display text-2xl text-ink">{value.toString().padStart(2, '0')}</p>
                  <p className="mt-2 text-[0.7rem] uppercase tracking-[0.4em] text-ink/60">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-ink/40 bg-paper/60 p-4 text-sm text-ink/70">
              {isComplete
                ? 'Hackathon is live — see you in the project war room!'
                : 'Pin this date: bring your builds, your chaos, your friends. Submissions open soon.'}
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
