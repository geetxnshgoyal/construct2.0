import { motion } from 'framer-motion';

const experiences = [
  'Cosmic Demo Nights',
  'Product Hunt Showdown',
  'AI Augmented Sprint Rooms',
  'Neon Retrospectives',
  'Launch Strategy Labs',
  'Deep Work Soundscapes'
];

export default function ExperienceTicker() {
  const reversed = [...experiences].reverse();

  return (
    <div className="relative overflow-hidden border-y border-ink/10 bg-white/70 py-6 shadow-[0_12px_0_rgba(0,0,0,0.05)]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ repeat: Infinity, duration: 12 }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-ink/10 to-transparent"
      />
      <div className="flex flex-col gap-4">
        <div className="flex animate-marquee items-center gap-12 whitespace-nowrap text-sm uppercase tracking-[0.4em] text-ink/50">
          {Array.from({ length: 2 }).map((_, loopIndex) => (
            <span key={loopIndex} className="flex items-center gap-12">
              {experiences.map((experience) => (
                <motion.span
                  key={`${experience}-${loopIndex}`}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className="flex items-center gap-3 transition"
                >
                  <span>{experience}</span>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                    className="text-accent"
                  >
                    ✺
                  </motion.span>
                </motion.span>
              ))}
            </span>
          ))}
        </div>
        <div className="flex animate-[marquee_28s_linear_infinite_reverse] items-center gap-12 whitespace-nowrap text-xs uppercase tracking-[0.4em] text-ink/30">
          {Array.from({ length: 2 }).map((_, loopIndex) => (
            <span key={`reverse-${loopIndex}`} className="flex items-center gap-10">
              {reversed.map((experience) => (
                <motion.span
                  key={`${experience}-reverse-${loopIndex}`}
                  whileHover={{ scale: 1.1, y: 3 }}
                  className="flex items-center gap-2 transition"
                >
                  <motion.span
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                  >
                    ⭕
                  </motion.span>
                  <span>{experience}</span>
                </motion.span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-paper via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-paper via-transparent to-transparent" />
    </div>
  );
}
