import { motion } from 'framer-motion';
import { partners } from '../../data/hackathon';

export default function PartnersSection() {
  return (
    <section id="partners" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-16 max-w-3xl space-y-4"
        >
          <h2 className="font-display text-3xl text-ink sm:text-4xl">
            People backing the madness
          </h2>
          <p className="text-base text-ink/70">
            Communities who love messy prototypes, honest feedback and student-led launches.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.7 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              whileHover={{ y: -6, scale: 1.02, rotate: partner.id === 'tpf' ? 1.5 : -1.5 }}
              className="group relative flex h-40 items-center justify-center overflow-hidden rounded-3xl border border-ink/15 bg-white/90 p-6 shadow-card transition hover:-translate-y-1"
            >
              <motion.img
                src={partner.image}
                alt={partner.name}
                className="max-h-16 object-contain transition group-hover:scale-105"
                whileHover={{ rotate: index % 2 === 0 ? -2 : 2 }}
              />
              <motion.div
                className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/10 via-transparent to-seafoam/20 opacity-0 transition group-hover:opacity-100"
                animate={{ opacity: [0, 0.35, 0] }}
                transition={{ repeat: Infinity, duration: 10, delay: index * 0.4 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
