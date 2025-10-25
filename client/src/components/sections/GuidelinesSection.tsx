import { motion } from 'framer-motion';
import { guidelinePanels } from '../../data/hackathon';

export default function GuidelinesSection() {
  return (
    <section id="guidelines" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-16 max-w-3xl space-y-4"
        >
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            Team Guidelines <span className="text-magenta">& Support Stack</span>
          </h2>
          <p className="text-base text-white/70">
            Set your crew up for success with clear expectations, recommended tools, and a crystal submission checklist.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {guidelinePanels.map((panel, index) => (
            <motion.article
              key={panel.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-120px' }}
              whileHover={{ y: -6, rotate: index % 2 === 0 ? 1 : -1 }}
              transition={{ duration: 0.7, delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 shadow-holo backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 md:group-hover:opacity-100">
                <div className="animate-orbit-slow absolute -top-24 -right-24 h-48 w-48 rounded-full border border-neon/20" />
                <div className="animate-orbit-fast absolute -bottom-32 -left-10 h-56 w-56 rounded-full border border-magenta/10" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.4em] text-white/60">
                {panel.badge}
              </span>
              <h3 className="mt-4 font-display text-2xl text-white">{panel.title}</h3>
              <ul className="mt-6 space-y-3 text-sm text-white/70">
                {panel.items.map((item) => (
                  <motion.li key={item} whileHover={{ x: 6 }} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 animate-glow-pulse rounded-full bg-gradient-to-r from-neon to-magenta shadow-neon" />
                    <span className="leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
