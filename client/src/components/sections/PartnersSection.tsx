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
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            Sponsors <span className="text-magenta">& Partners</span>
          </h2>
          <p className="text-base text-white/70">
            Backed by leading communities who live and breathe product development and fearless execution.
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
              whileHover={{ y: -6, scale: 1.03, rotate: partner.id === 'tpf' ? 1 : -1 }}
              className="group relative flex h-40 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-holo backdrop-blur-xl transition hover:border-neon/40 hover:bg-neon/10"
            >
              <motion.img
                src={partner.image}
                alt={partner.name}
                className="max-h-16 object-contain transition group-hover:scale-110"
                whileHover={{ filter: 'drop-shadow(0px 0px 12px rgba(0,245,255,0.6))' }}
              />
              <motion.div
                className="absolute inset-0 -z-10 bg-gradient-to-br from-white/10 via-transparent to-neon/20 opacity-0 transition group-hover:opacity-100"
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ repeat: Infinity, duration: 10, delay: index * 0.4 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
