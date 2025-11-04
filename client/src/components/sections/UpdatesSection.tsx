import { motion } from 'framer-motion';

export default function UpdatesSection() {
  return (
    <section id="updates" className="relative py-16">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2.5rem] border border-ink/15 bg-white/85 p-10 shadow-card"
        >
          <div className="absolute -top-12 right-10 h-24 w-24 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute -bottom-16 left-8 h-32 w-32 -rotate-6 border border-dashed border-accentAlt/25" />

          <p className="text-xs uppercase tracking-[0.4em] text-accent">Today&apos;s notice</p>
          <h2 className="mt-4 font-display text-2xl text-ink sm:text-3xl">
            Important CoNSTruct 2025 updates
          </h2>
          <div className="mt-4 rounded-2xl border border-ink/10 bg-accentAlt/15 p-4 text-sm font-semibold uppercase tracking-[0.3em] text-ink">
            Registration closes today at <span className="font-serif text-base tracking-normal text-ink">5:00 PM IST</span>
          </div>

          <div className="mt-8 space-y-4 text-base text-ink/75">
            <p>Dear Students,</p>
            <p>
              Please take note of the following important updates for CoNSTruct 2025 &mdash; Build for Impact Hackathon:
            </p>
          </div>

          <ol className="mt-6 space-y-6 text-sm text-ink/80">
            <li className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-insetNote">
              <div className="font-serif text-lg font-semibold text-ink">
                🎯 1. Hackathon Launch Session &amp; Masterclass
              </div>
              <p className="mt-3">
                🗓️ <span className="font-medium text-ink">5th Nov (Wednesday), 7:00 &ndash; 8:30 PM</span>
              </p>
              <ul className="mt-3 space-y-2">
                <li>📍 <span className="font-medium text-ink">RU Venue:</span> A314 (Mini Audi)</li>
                <li>📍 <span className="font-medium text-ink">ADYPU Venue:</span> Room 501</li>
                <li>📍 <span className="font-medium text-ink">S-Vyasa Venue:</span> Classroom 5</li>
              </ul>
              <p className="mt-3 font-medium text-ink">📝 Attendance is mandatory.</p>
            </li>

            <li className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-insetNote">
              <div className="font-serif text-lg font-semibold text-ink">
                🌐 2. Create your profile on Emergent
              </div>
              <p className="mt-3">
                All registered participants must create their profiles using the college email ID used during registration on the{' '}
                <a
                  href="https://app.emergent.sh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-accent underline underline-offset-4"
                >
                  Emergent website
                </a>
                .
              </p>
              <p className="mt-3">
                ⏰ <span className="font-medium text-ink">Deadline: 4th Nov</span>
              </p>
              <p className="mt-3">
                👉 This step is mandatory to receive the <span className="font-medium text-ink">50 participation credits</span> from Emergent.
              </p>
            </li>
          </ol>

          <p className="mt-8 text-sm font-medium text-ink/70">Stay tuned for more updates.</p>
        </motion.div>
      </div>
    </section>
  );
}
