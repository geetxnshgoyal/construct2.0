import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CallToAction() {
  return (
    <section className="relative pb-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
          className="relative overflow-hidden rounded-[3rem] border border-neon/40 bg-black/60 p-12 text-center shadow-[0_40px_140px_rgba(255,0,127,0.2)] backdrop-blur-2xl"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-neon/10 via-transparent to-magenta/10" />
          <motion.div
            className="pointer-events-none absolute -top-24 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-neon/20 blur-3xl"
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 8 }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-28 right-16 h-52 w-52 rounded-full bg-magenta/20 blur-3xl"
            animate={{ opacity: [0.2, 0.7, 0.2], scale: [1.1, 0.9, 1.1] }}
            transition={{ repeat: Infinity, duration: 10 }}
          />
          <motion.div
            className="pointer-events-none absolute inset-12 rounded-[2.5rem] border border-white/10"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ repeat: Infinity, duration: 6 }}
          />
          <p className="text-xs uppercase tracking-[0.6em] text-white/50">Limited pods available</p>
          <h2 className="mt-4 font-display text-3xl text-white sm:text-4xl">
            Ready to build the craziest MVP your campus has seen?
          </h2>
          <p className="mt-4 text-base text-white/70">
            Lock your seat, warm up your squad, and bring the energy. We&apos;re installing the cosmic launch pads for you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full border border-neon bg-neon/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-neon transition hover:-translate-y-1 hover:bg-neon/30"
            >
              Register now
            </Link>
            <Link
              to="/admin"
              className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white/70 transition hover:-translate-y-1 hover:border-white/40 hover:text-white"
            >
              Admin console
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
