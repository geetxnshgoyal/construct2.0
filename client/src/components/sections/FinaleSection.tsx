import { motion } from 'framer-motion';
import { demoDaySchedule } from '../../data/hackathon';

export default function FinaleSection() {
  return (
    <section id="finale" className="relative py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.7 }}
          className="mb-8 max-w-3xl space-y-3"
        >
          <p className="text-xs uppercase tracking-[0.5em] text-ink/60">Final stretch</p>
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Demo Day lands this month</h2>
          <p className="text-base text-ink/70">
            We&apos;re in finale mode: ADYPU and BLR are live on Nov 30. RU campus follows on Dec 6 (tentative).
            Top teams take the stage only—lock your decks, polish demos, and meet the panelists below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.7 }}
          className="mb-10 rounded-3xl border border-ink/15 bg-white/80 p-6 shadow-card"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-accent">
              Ending soon
            </span>
            <p className="text-sm text-ink/70">
              Final submissions, pitch decks, and room assignments will be shared with every pod via email and Discord.
            </p>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-ink/80 md:grid-cols-3">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-paper px-3 py-2 shadow-insetNote">Nov 30 · ADYPU</span>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-paper px-3 py-2 shadow-insetNote">Nov 30 · BLR</span>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-paper px-3 py-2 shadow-insetNote">Dec 6 · RU (tentative)</span>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {demoDaySchedule.map((slot, index) => (
            <motion.article
              key={slot.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              whileHover={{ y: -6, rotate: index % 2 === 0 ? -1.2 : 1.2 }}
              transition={{ duration: 0.7, delay: index * 0.05 }}
              className="rounded-3xl border border-ink/15 bg-white/85 p-6 shadow-card"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-ink">
                  {slot.campus}
                </span>
                {slot.tentative ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-amber-700">
                    Tentative
                  </span>
                ) : (
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-accent">
                    Live
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm uppercase tracking-[0.3em] text-ink/60">{slot.date}</p>
                <p className="text-xl font-semibold text-ink">{slot.city}</p>
              </div>
              <div className="mt-4 rounded-2xl border border-ink/10 bg-paper p-4 shadow-insetNote">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Panel</p>
                <ul className="mt-2 space-y-2 text-sm text-ink/80">
                  {slot.panelists.map((panelist, idx) => (
                    <li key={`${slot.id}-${idx}`} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                      {panelist.url ? (
                        <a
                          href={panelist.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold underline decoration-dotted underline-offset-4"
                        >
                          {panelist.name}
                        </a>
                      ) : (
                        <span>{panelist.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
