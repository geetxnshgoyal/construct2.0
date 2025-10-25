import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';

type RegistrationRecord = {
  id?: string;
  teamName: string;
  teamSize: number;
  lead: {
    name: string;
    email: string;
    gender?: string | null;
  };
  members: Array<{
    slot: number;
    name: string | null;
    email: string | null;
    gender: string | null;
  }>;
  submittedAt?: string | null;
};

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME ?? 'admin';

export default function Admin() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [theme] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

  const handleFetch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessCode.trim()) {
      setError('Enter the current access code.');
      setRegistrations([]);
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/registrations', {
        headers: {
          Authorization: `Basic ${btoa(`${ADMIN_USERNAME}:${accessCode}`)}`
        }
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Unable to authenticate.' }));
        throw new Error(payload.error || 'Unable to authenticate.');
      }

      const data = await response.json();
      setRegistrations(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative pb-24 pt-16">
      <div className="mx-auto max-w-5xl px-6">
        <motion.header initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-xs uppercase tracking-[0.6em] text-ink/40">Admin Console</p>
          <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">Monitor registrations in real-time</h1>
          <p className="mt-4 max-w-2xl text-base text-ink/70">
            Drop in the rotating access code to peek at the latest crew submissions, ordered by their arrival. We surface local fallback
            data if Firebase isn&apos;t configured so testing never blocks your flow.
          </p>
        </motion.header>

        <motion.form
          onSubmit={handleFetch}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className={`mt-10 rounded-xl border p-8 backdrop-blur-xl ${
            theme === 'dark'
              ? 'border-white/10 bg-black/30'
              : 'border-ink/5 bg-white/90 shadow-lg'
          }`}
        >
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <label className="flex flex-col gap-2 md:col-start-1">
              <span className={`text-xs font-medium uppercase tracking-wide ${
                theme === 'dark' ? 'text-white/60' : 'text-ink/60'
              }`}>Access code</span>
              <input
                type="password"
                value={accessCode}
                onChange={(event) => {
                  setAccessCode(event.target.value);
                  if (error) {
                    setError('');
                  }
                }}
                placeholder="Enter secure code"
                className={`rounded-xl border px-4 py-3 transition-colors
                  ${theme === 'dark'
                    ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10'
                    : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30'
                  } focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-neon/20' : 'focus:ring-accent/10'
                  }`}
              />
            </label>
            <div className="flex items-end">
              <p className="text-[0.6rem] uppercase tracking-[0.35em] text-ink/40">
                Username preset to <span className="text-ink/60">{ADMIN_USERNAME}</span>
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
                theme === 'dark'
                  ? 'border border-neon/40 bg-neon/20 text-white hover:bg-neon/30 disabled:border-white/20 disabled:bg-white/10 disabled:text-white/40'
                  : 'bg-accent text-white hover:bg-accent/90 disabled:bg-ink/10 disabled:text-ink/40'
              } disabled:cursor-not-allowed`}
            >
              {loading ? 'Fetching...' : 'Fetch registrations'}
            </button>
            <p className="text-xs uppercase tracking-[0.4em] text-ink/40">Protected via rotating access code</p>
          </div>
        </motion.form>

        {error ? (
          <div className="mt-8 rounded-3xl border border-magenta/40 bg-magenta/10 p-4 text-sm text-magenta">{error}</div>
        ) : null}

        {registrations.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-12 space-y-8"
          >
            {registrations.map((registration) => (
              <article
                key={registration.id || `${registration.teamName}-${registration.submittedAt}`}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-holo backdrop-blur-xl"
              >
                <header className="flex flex-col gap-3 text-ink sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{registration.teamName}</h2>
                    <p className="text-xs uppercase tracking-[0.4em] text-ink/50">{registration.teamSize} members</p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.4em] text-ink/40">
                    {registration.submittedAt ? new Date(registration.submittedAt).toLocaleString() : 'Pending timestamp'}
                  </div>
                </header>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-ink">
                    <h3 className="text-sm uppercase tracking-[0.4em] text-neon/70">Team Lead</h3>
                    <p className="mt-2 text-sm text-ink/80">{registration.lead.name}</p>
                    <p className="text-xs text-ink/60">{registration.lead.email}</p>
                    {registration.lead.gender ? (
                      <p className="text-xs uppercase tracking-[0.4em] text-ink/40">{registration.lead.gender}</p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-ink">
                    <h3 className="text-sm uppercase tracking-[0.4em] text-magenta/70">Squadmates</h3>
                    <ul className="mt-2 space-y-2 text-sm text-ink/70">
                      {registration.members.map((member) => (
                        <li key={member.slot}>
                          <p className="font-medium text-ink/80">{member.name || '—'}</p>
                          <p className="text-xs text-ink/50">{member.email || '—'}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
