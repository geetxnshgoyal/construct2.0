import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

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
const FETCH_LIMIT = 500;
const ADMIN_MEMES = [
  {
    src: 'https://i.imgflip.com/30zz5g.jpg',
    alt: 'Leonardo DiCaprio cheers with a glass',
    caption: 'When the access code finally works.'
  },
  {
    src: 'https://i.imgflip.com/26am.jpg',
    alt: 'Success Kid celebrates',
    caption: 'Registrations fetched like a pro.'
  },
  {
    src: 'https://i.imgflip.com/1ur9b0.jpg',
    alt: 'Distracted Boyfriend looking at new data',
    caption: 'You vs. new submissions popping up.'
  }
] as const;

export default function Admin() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [lastUsedCode, setLastUsedCode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const theme = useTheme();
  const memeCaptionTone = theme === 'dark' ? 'text-white/60' : 'text-ink/60';

  const fetchRegistrations = async (code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError('Enter the current access code.');
      setRegistrations([]);
      return false;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/registrations?limit=${FETCH_LIMIT}`, {
        headers: {
          Authorization: `Basic ${btoa(`${ADMIN_USERNAME}:${trimmedCode}`)}`
        }
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Unable to authenticate.' }));
        throw new Error(payload.error || 'Unable to authenticate.');
      }

      const data = await response.json();
      setRegistrations(Array.isArray(data.items) ? data.items : []);
      setLastUsedCode(trimmedCode);
      setIsAuthorized(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setRegistrations([]);
      setIsAuthorized(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void fetchRegistrations(accessCode);
  };

  const handleRefresh = () => {
    if (!lastUsedCode) {
      setError('Fetch registrations first.');
      return;
    }
    void fetchRegistrations(lastUsedCode);
  };

  const handleLogout = () => {
    setAccessCode('');
    setLastUsedCode('');
    setRegistrations([]);
    setError('');
    setIsAuthorized(false);
  };

  const handleDownloadCsv = () => {
    if (registrations.length === 0) {
      setError('Nothing to export. Fetch registrations first.');
      return;
    }

    const csvHeader = [
      'Team Name',
      'Team Size',
      'Lead Name',
      'Lead Email',
      'Lead Gender',
      'Members',
      'Submitted At'
    ];

    const toCsvRow = (record: RegistrationRecord) => {
      const members = record.members
        .map((member) => {
          if (!member.name && !member.email) {
            return '';
          }
          const details = [member.name ?? '', member.email ?? '', member.gender ?? ''].filter(Boolean).join(' • ');
          return details;
        })
        .filter(Boolean)
        .join(' | ');

      return [
        record.teamName,
        record.teamSize.toString(),
        record.lead.name,
        record.lead.email,
        record.lead.gender ?? '',
        members,
        record.submittedAt ? new Date(record.submittedAt).toISOString() : ''
      ];
    };

    const csvRows = [csvHeader, ...registrations.map(toCsvRow)];
    const csvString = csvRows
      .map((row) =>
        row
          .map((value) => {
            const safeValue = value.replace(/"/g, '""');
            return `"${safeValue}"`;
          })
          .join(',')
      )
      .join('\r\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `construct-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
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

        {isAuthorized ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`mt-10 rounded-xl border p-8 backdrop-blur-xl ${
              theme === 'dark'
                ? 'border-white/10 bg-black/30 text-white'
                : 'border-ink/5 bg-white/90 text-ink shadow-lg'
            }`}
          >
            <h2 className="text-2xl font-semibold">Hello, Admin 👋</h2>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-ink/70'}`}>
              You&apos;re authenticated. Use the controls below to keep tabs on incoming registrations.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {ADMIN_MEMES.map((meme) => (
                <figure
                  key={meme.src}
                  className={`rounded-xl border p-3 ${
                    theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-ink/10 bg-white'
                  }`}
                >
                  <img src={meme.src} alt={meme.alt} className="h-40 w-full rounded-lg object-cover" />
                  <figcaption className={`mt-2 text-center text-xs uppercase tracking-[0.25em] ${memeCaptionTone}`}>
                    {meme.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </motion.div>
        ) : (
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
        )}

        {isAuthorized ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
              theme === 'dark'
                ? 'border border-white/15 text-white/80 hover:text-white disabled:border-white/10 disabled:text-white/30'
                : 'border border-ink/15 text-ink/70 hover:text-ink disabled:border-ink/10 disabled:text-ink/40'
            }`}
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
              theme === 'dark'
                ? 'border border-white/15 text-white/80 hover:text-white disabled:border-white/10 disabled:text-white/30'
                : 'border border-ink/15 text-ink/70 hover:text-ink disabled:border-ink/10 disabled:text-ink/40'
            }`}
            disabled={registrations.length === 0}
          >
            Download CSV
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-magenta/40 bg-magenta/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-magenta transition hover:bg-magenta/20"
          >
            Log out
          </button>
        </div>
        ) : null}

        {error ? (
          <div className={`mt-8 rounded-xl border p-4 text-sm ${
            theme === 'dark'
              ? 'border-magenta/40 bg-magenta/10 text-magenta'
              : 'border-red-200 bg-red-50 text-red-600'
          }`}>{error}</div>
        ) : (
          registrations.length > 0 && (
            <p className={`mt-8 text-xs uppercase tracking-[0.4em] ${
              theme === 'dark' ? 'text-white/50' : 'text-ink/40'
            }`}>
              Showing {registrations.length} registration{registrations.length === 1 ? '' : 's'} (limit {FETCH_LIMIT})
            </p>
          )
        )}

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
                className={`rounded-xl border p-6 backdrop-blur-xl ${
                  theme === 'dark'
                    ? 'border-white/10 bg-black/30'
                    : 'border-ink/5 bg-white/90 shadow-md'
                }`}
              >
                <header className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
                  theme === 'dark' ? 'text-white' : 'text-ink'
                }`}>
                  <div>
                    <h2 className="text-xl font-semibold">{registration.teamName}</h2>
                    <p className={`text-xs font-medium uppercase tracking-wide ${
                      theme === 'dark' ? 'text-white/50' : 'text-ink/50'
                    }`}>{registration.teamSize} members</p>
                  </div>
                  <div className={`text-xs font-medium uppercase tracking-wide ${
                    theme === 'dark' ? 'text-white/40' : 'text-ink/40'
                  }`}>
                    {registration.submittedAt ? new Date(registration.submittedAt).toLocaleString() : 'Pending timestamp'}
                  </div>
                </header>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className={`rounded-xl border p-4 ${
                    theme === 'dark'
                      ? 'border-white/10 bg-white/5'
                      : 'border-ink/10 bg-white'
                  }`}>
                    <h3 className={`text-sm font-medium uppercase tracking-wide ${
                      theme === 'dark' ? 'text-neon' : 'text-accent'
                    }`}>Team Lead</h3>
                    <p className={`mt-2 text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-ink'
                    }`}>{registration.lead.name}</p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-white/60' : 'text-ink/60'
                    }`}>{registration.lead.email}</p>
                    {registration.lead.gender ? (
                      <p className={`mt-1 text-xs uppercase tracking-wide ${
                        theme === 'dark' ? 'text-white/40' : 'text-ink/40'
                      }`}>{registration.lead.gender}</p>
                    ) : null}
                  </div>
                  <div className={`rounded-xl border p-4 ${
                    theme === 'dark'
                      ? 'border-white/10 bg-white/5'
                      : 'border-ink/10 bg-white'
                  }`}>
                    <h3 className={`text-sm font-medium uppercase tracking-wide ${
                      theme === 'dark' ? 'text-magenta' : 'text-accent'
                    }`}>Squadmates</h3>
                    <ul className="mt-2 space-y-3">
                      {registration.members.map((member) => (
                        <li key={member.slot}>
                          <p
                            className={`text-sm font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-ink'
                            }`}
                          >
                            {member.name || '—'}
                          </p>
                          <p
                            className={`text-xs ${
                              theme === 'dark' ? 'text-white/60' : 'text-ink/60'
                            }`}
                          >
                            {member.email || '—'}
                          </p>
                          {member.gender ? (
                            <p
                              className={`text-[0.6rem] uppercase tracking-[0.35em] ${
                                theme === 'dark' ? 'text-white/40' : 'text-ink/40'
                              }`}
                            >
                              {member.gender}
                            </p>
                          ) : null}
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
