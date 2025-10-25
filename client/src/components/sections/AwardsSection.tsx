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
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            Awards <span className="text-neon">&</span> Student Takeaways
          </h2>
          <p className="text-base text-white/70">
            Celebrate the wins that matter — from cash prizes to launch-ready confidence and storytelling swagger.
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
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-black/30 to-transparent p-6 shadow-holo backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <div className="animate-glow-pulse absolute -top-20 right-10 h-36 w-36 rounded-full bg-neon/20 blur-2xl" />
                <div className="animate-glow-pulse absolute -bottom-24 left-6 h-44 w-44 rounded-full bg-magenta/20 blur-3xl" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.4em] text-white/60">
                {award.badge}
              </span>
              <h3 className="mt-4 font-display text-2xl text-white">{award.title}</h3>
              <ul className="mt-6 space-y-3 text-sm text-white/70">
                {award.items.map((item) => (
                  <motion.li key={item} whileHover={{ x: 8 }} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 animate-glow-pulse rounded-full bg-gradient-to-r from-neon to-magenta shadow-neon" />
                    <span className="leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
              {award.helper ? (
                <motion.p
                  whileHover={{ scale: 1.02 }}
                  className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.4em] text-white/50"
                >
                  {award.helper}
                </motion.p>
              ) : null}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
