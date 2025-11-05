import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export default function SubmitClosed() {
  const theme = useTheme();
  const isDark = theme === 'dark';

  const cardTone = isDark
    ? 'border-white/15 bg-white/10 text-white'
    : 'border-ink/10 bg-white text-ink';

  return (
    <section className="relative flex min-h-[60vh] items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-xl rounded-3xl border px-8 py-10 text-center shadow-xl ${cardTone}`}
      >
        <p className="text-xs uppercase tracking-[0.4em] opacity-70">Submissions Closed</p>
        <h1 className="mt-5 font-display text-3xl sm:text-4xl">Final hand-ins are offline.</h1>
        <p className="mt-4 text-sm sm:text-base opacity-80">
          We&apos;re reviewing decks and demos with the judges. Look out for showcase stage details in
          your inbox.
        </p>
        <Link
          to="/"
          className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition ${
            isDark
              ? 'border border-white/20 text-white hover:bg-white/10'
              : 'border border-ink/15 text-ink hover:bg-ink/5'
          }`}
        >
          Go to home
        </Link>
      </motion.div>
    </section>
  );
}
