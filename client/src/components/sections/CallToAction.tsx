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
          className="relative overflow-hidden rounded-[3rem] border border-ink/20 bg-white/85 p-12 text-center shadow-card"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(255,209,102,0.25),transparent_70%)]" />
          <p className="text-xs uppercase tracking-[0.6em] text-ink/60">Limited pods available</p>
          <h2 className="mt-4 font-display text-3xl text-ink sm:text-4xl">
            Ready to build the craziest MVP your campus has seen?
          </h2>
          <p className="mt-4 text-base text-ink/75">
            Seats are moving fast. Grab your notebooks, power adapters, caffeine stash, and hit register before the board fills up.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full border border-ink bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-card transition hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,0.2)]"
            >
              Register now
            </Link>
            <Link
              to="/admin"
              className="rounded-full border border-ink/20 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-ink/70 transition hover:-translate-y-1 hover:-rotate-1"
            >
              Admin console
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
