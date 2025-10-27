import { motion } from 'framer-motion';
import { awards } from '../../data/hackathon';

export default function AwardsSection() {
  return (
    <section id="awards" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-16 max-w-3xl space-y-4"
        >
          <h2 className="font-display text-3xl text-ink sm:text-4xl">
            Awards, shoutouts & what you take home
          </h2>
          <p className="text-base text-ink/70">
            We’re big on celebrating actual progress: loud applause, cash prizes, and support to keep shipping after demo day.
          </p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-2">
          {awards.map((award, index) => (
            <motion.article
              key={award.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-120px' }}
              whileHover={{ y: -8, scale: 1.01, rotate: index % 2 === 0 ? -1.2 : 1.2 }}
              transition={{ duration: 0.7, delay: index * 0.05 }}
              className="relative overflow-hidden rounded-3xl border border-ink/15 bg-white/85 p-6 shadow-card"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-accentAlt/60 px-3 py-1 text-xs uppercase tracking-[0.4em] text-ink">
                {award.badge}
              </span>
              <h3 className="mt-4 font-serif text-2xl font-semibold text-ink">{award.title}</h3>
              <ul className="mt-6 space-y-3 text-sm text-ink/75">
                {award.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-ink" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              {award.helper ? (
                <p className="mt-6 rounded-2xl border border-dashed border-ink/30 bg-paper p-4 text-xs uppercase tracking-[0.4em] text-ink/60">
                  {award.helper}
                </p>
              ) : null}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
