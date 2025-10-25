import { motion } from 'framer-motion';
import { timeline } from '../../data/hackathon';

export default function StructureSection() {
  return (
    <section id="structure" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-16 max-w-3xl space-y-4"
        >
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            Hackathon <span className="text-neon">Structure</span> & Timeline
          </h2>
          <p className="text-base text-white/70">
            Two luminous phases keep your squad in flow. We alternate deep work, sonic breaks, and intimate guidance sessions so you never
            lose the cozy-but-electric momentum.
          </p>
        </motion.div>
        <div className="grid gap-10 lg:grid-cols-2">
          {timeline.map((phase, index) => (
            <motion.article
              key={phase.id}
              initial={{ opacity: 0, y: 60, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-150px' }}
              whileHover={{ y: -8, rotateX: 0, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
              transition={{ duration: 0.9, delay: index * 0.1, type: 'spring', stiffness: 60 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/50 p-6 shadow-holo backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <div className="animate-glow-pulse absolute -top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-neon/30" />
                <div className="animate-glow-pulse absolute -bottom-1/3 right-0 h-32 w-32 rounded-full bg-magenta/20 blur-3xl" />
              </div>
              <div className="absolute -top-6 left-6 inline-flex items-center rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-xs uppercase tracking-[0.4em] text-neon/80">
                {phase.phase}
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <div>
                  <h3 className="font-display text-2xl text-white">{phase.title}</h3>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/50">{phase.duration}</p>
                </div>
                <ul className="space-y-4 text-sm text-white/70">
                  {phase.bullets.map((bullet) => (
                    <motion.li
                      key={bullet.label}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="rounded-2xl border border-white/5 bg-white/5 p-4 shadow-inner transition"
                    >
                      <p className="text-xs uppercase tracking-[0.4em] text-neon/70">{bullet.label}</p>
                      <ul className="mt-2 space-y-1.5">
                        {bullet.items.map((item) => (
                          <motion.li
                            key={item}
                            whileHover={{ x: 4 }}
                            className="leading-relaxed text-white/80"
                          >
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-r from-neon/20 via-transparent to-magenta/20 p-8 text-center text-sm text-white/70"
        >
          Top-performing teams unlock continued expert support, Product Hunt amplification, and community spotlights from NST, TPF &
          Emergent.
        </motion.div>
      </div>
    </section>
  );
}
