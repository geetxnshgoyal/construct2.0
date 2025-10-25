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

export default function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);

  const handleFetch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/registrations', {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`
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
          <p className="text-xs uppercase tracking-[0.6em] text-white/40">Admin Console</p>
          <h1 className="mt-4 font-display text-4xl text-white sm:text-5xl">Monitor registrations in real-time</h1>
          <p className="mt-4 max-w-2xl text-base text-white/70">
            Enter the shared admin credentials to peek at the latest crew submissions, ordered by their arrival. We surface local fallback
            data if Firebase isn&apos;t configured so testing never blocks your flow.
          </p>
        </motion.header>

        <motion.form
          onSubmit={handleFetch}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-10 rounded-3xl border border-white/10 bg-black/60 p-8 shadow-holo backdrop-blur-xl"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="uppercase tracking-[0.4em] text-white/50">Admin username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="uppercase tracking-[0.4em] text-white/50">Admin password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon focus:outline-none"
              />
            </label>
          </div>
          <div className="mt-8 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full border border-neon bg-neon/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-neon transition hover:-translate-y-1 hover:bg-neon/30 disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-white/10 disabled:text-white/40"
            >
              {loading ? 'Fetching...' : 'Fetch registrations'}
            </button>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Protected via Basic Auth</p>
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
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{registration.teamName}</h2>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">{registration.teamSize} members</p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.4em] text-white/40">
                    {registration.submittedAt ? new Date(registration.submittedAt).toLocaleString() : 'Pending timestamp'}
                  </div>
                </header>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <h3 className="text-sm uppercase tracking-[0.4em] text-neon/70">Team Lead</h3>
                    <p className="mt-2 text-sm text-white/80">{registration.lead.name}</p>
                    <p className="text-xs text-white/60">{registration.lead.email}</p>
                    {registration.lead.gender ? (
                      <p className="text-xs uppercase tracking-[0.4em] text-white/40">{registration.lead.gender}</p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <h3 className="text-sm uppercase tracking-[0.4em] text-magenta/70">Squadmates</h3>
                    <ul className="mt-2 space-y-2 text-sm text-white/70">
                      {registration.members.map((member) => (
                        <li key={member.slot}>
                          <p className="font-medium text-white/80">{member.name || '—'}</p>
                          <p className="text-xs text-white/50">{member.email || '—'}</p>
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
