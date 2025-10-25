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
          <h2 className="font-display text-3xl text-ink sm:text-4xl">
            How the hackathon runs
          </h2>
          <p className="text-base text-ink/70">
            Two scrappy phases with weekly check-ins, honest critique circles, and just enough structure to keep your team sprinting.
          </p>
        </motion.div>
        <div className="grid gap-10 lg:grid-cols-2">
          {timeline.map((phase, index) => (
            <motion.article
              key={phase.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-150px' }}
              whileHover={{ y: -6, rotate: index % 2 === 0 ? -1.2 : 1.2 }}
              transition={{ duration: 0.8, delay: index * 0.08 }}
              className="relative rounded-3xl border border-ink/15 bg-white/80 p-6 shadow-card"
            >
              <div className="absolute -top-6 left-6 inline-flex rotate-[-3deg] items-center rounded-full bg-accentAlt px-4 py-1 font-display text-xs uppercase tracking-[0.4em] text-ink shadow-card">
                {phase.phase}
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <div>
                  <h3 className="font-display text-2xl text-ink">{phase.title}</h3>
                  <p className="text-sm uppercase tracking-[0.3em] text-ink/50">{phase.duration}</p>
                </div>
                <ul className="space-y-4 text-sm text-ink/80">
                  {phase.bullets.map((bullet) => (
                    <li key={bullet.label} className="rounded-2xl border border-ink/10 bg-paper p-4 shadow-insetNote">
                      <p className="font-display text-xs uppercase tracking-[0.4em] text-accent">{bullet.label}</p>
                      <ul className="mt-2 space-y-1.5">
                        {bullet.items.map((item) => (
                          <li key={item} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </li>
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
          className="mt-16 rounded-3xl border border-dashed border-ink/30 bg-white/70 p-8 text-center text-sm text-ink/70 shadow-card"
        >
          Top teams get post-event mentorship, launch runways, and a spotlight with our community partners.
        </motion.div>
      </div>
    </section>
  );
}
