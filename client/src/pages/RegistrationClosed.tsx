import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export default function RegistrationClosed() {
  const theme = useTheme();
  const isDark = theme === 'dark';

  const backdropTone = isDark ? 'bg-black/80 text-white' : 'bg-paper/95 text-ink';
  const dialogTone = isDark
    ? 'border-white/15 bg-white/10 text-white'
    : 'border-ink/10 bg-white text-ink';
  const accentTone = isDark ? 'text-white/60' : 'text-ink/60';
  const buttonTone = isDark
    ? 'border border-white/20 bg-white/10 text-white hover:bg-white/15'
    : 'border border-ink/15 text-ink hover:bg-ink/5';

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      <div className="absolute inset-0">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-accent/10" />
      </div>
      <div className={`absolute inset-0 ${backdropTone} backdrop-blur-md`} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 flex w-full max-w-xl flex-col items-center gap-6 text-center"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className={`w-full rounded-3xl border px-8 py-10 shadow-xl ${dialogTone}`}
        >
          <p className={`text-xs uppercase tracking-[0.5em] ${accentTone}`}>
            Registrations Closed
          </p>
          <h1 className="mt-5 font-display text-3xl sm:text-4xl">See you at kickoff.</h1>
          <p className="mt-4 text-sm sm:text-base opacity-80">
            Pods are already locked in and teams are gearing up for launch. Check your inbox for
            logistics and schedules. Spectators can follow highlights on our socials.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition ${buttonTone}`}
            >
              Go to home
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
