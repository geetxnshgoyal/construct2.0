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
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Crew guidelines & workshop kit</h2>
          <p className="text-base text-ink/70">
            Keep the chaos productive: here’s how teams stay aligned, what tools we recommend, and what goes into each dropbox.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {guidelinePanels.map((panel, index) => (
            <motion.article
              key={panel.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-120px' }}
              whileHover={{ y: -6, rotate: index % 2 === 0 ? 1.2 : -1.2 }}
              transition={{ duration: 0.7, delay: index * 0.05 }}
              className="relative overflow-hidden rounded-3xl border border-ink/15 bg-white/85 p-6 shadow-card"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-ink">
                {panel.badge}
              </span>
              <h3 className="mt-4 font-display text-2xl text-ink">{panel.title}</h3>
              <ul className="mt-6 space-y-3 text-sm text-ink/75">
                {panel.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-ink" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
