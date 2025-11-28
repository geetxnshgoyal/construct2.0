import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

export default function CallToAction() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const cardClasses = isDark
    ? 'border-rose-500/40 bg-rose-500/10 text-rose-100'
    : 'border-rose-200 bg-rose-50 text-rose-700';
  const accentTone = isDark ? 'text-rose-300' : 'text-rose-600';

  return (
    <section className="relative pb-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
          className={`relative overflow-hidden rounded-[3rem] border p-12 text-center shadow-card ${cardClasses}`}
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(225,94,131,0.15),transparent_72%)]" />
          <p className={`text-xs uppercase tracking-[0.6em] ${accentTone}`}>Finale bulletin</p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">
            Demo Day is this month.
          </h2>
          <p className="mt-4 text-base opacity-85">
            ADYPU and BLR go live on Nov 30. RU campus runs on Dec 6. Demo Day slots are reserved for top teams
            only—watch your inbox for room assignments, arrival windows, and AV checks.
          </p>
          <p className={`mt-6 text-sm uppercase tracking-[0.3em] ${accentTone}`}>
            Panel lineup is posted below tighten your pitches and polish those demos.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
