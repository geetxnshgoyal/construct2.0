import { FormEvent, useEffect, useRef, useState } from 'react';
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

type AdminSessionInfo = {
  authenticated: boolean;
  user: {
    login: string;
    name: string | null;
    avatarUrl: string | null;
    profileUrl: string | null;
  } | null;
  methods: {
    github: boolean;
    passcode: boolean;
  };
};

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME ?? 'admin';
const FETCH_LIMIT = 500;
const ADMIN_MEMES = [
  {
    command: 'admin@construct:~$ fortune hackathon',
    output: [
      '╭────────────────────────────────────────────╮',
      '│  Keep calm and ship the demo before dawn.  │',
      '╰────────────────────────────────────────────╯'
    ]
  },
  {
    command: 'admin@construct:~$ curl https://meme.api/cli.gif',
    output: [
      'Downloading meme...',
      '██████████ 100%',
      '┌────────────────────────────┐',
      '│  ({^_^})  systems go!       │',
      '└────────────────────────────┘'
    ]
  },
  {
    command: 'admin@construct:~$ cowsay "registrations unlocked!"',
    output: [
      ' ________________',
      '< registrations unlocked! >',
      ' ----------------',
      '        \\   ^__^',
      '         \\  (oo)\\_______',
      '            (__)\\       )\\/\\',
      '                ||----w |',
      '                ||     ||'
    ]
  }
] as const;

export default function Admin() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [lastUsedCode, setLastUsedCode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<AdminSessionInfo | null>(null);
  const [authMode, setAuthMode] = useState<'session' | 'passcode' | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const hasLoadedFromSession = useRef(false);
  const theme = useTheme();
  const githubEnabled = sessionInfo?.methods.github ?? false;
  const passcodeEnabled = sessionInfo?.methods.passcode ?? true;
  const authenticatedUser = sessionInfo?.user;
  const subtleText = theme === 'dark' ? 'text-white/40' : 'text-ink/40';
  const subtleTextStrong = theme === 'dark' ? 'text-white/60' : 'text-ink/60';

  const refreshSessionInfo = async () => {
    setCheckingSession(true);
    try {
      const response = await fetch('/api/auth/session', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load session information.');
      }
      const payload: AdminSessionInfo = await response.json();
      setSessionInfo(payload);
      if (payload.authenticated) {
        setIsAuthorized(true);
        setAuthMode('session');
        if (!hasLoadedFromSession.current) {
          hasLoadedFromSession.current = true;
          void fetchRegistrations({ skipSessionCheck: true });
        }
      } else if (authMode === 'session') {
        setIsAuthorized(false);
        setAuthMode(null);
        setRegistrations([]);
      }
    } catch (err) {
      console.error('Failed to refresh session', err);
      setSessionInfo(null);
      if (authMode === 'session') {
        setIsAuthorized(false);
        setAuthMode(null);
        setRegistrations([]);
      }
    } finally {
      setCheckingSession(false);
    }
  };

  const fetchRegistrations = async ({ passcode, skipSessionCheck = false }: { passcode?: string; skipSessionCheck?: boolean } = {}) => {
    const trimmedCode = passcode?.trim();

    if (typeof passcode !== 'undefined' && !trimmedCode) {
      setError('Enter the current access code.');
      setRegistrations([]);
      return false;
    }

    if (!skipSessionCheck && typeof passcode === 'undefined' && !sessionInfo?.authenticated) {
      setError('Sign in first to view registrations.');
      setRegistrations([]);
      return false;
    }

    setLoading(true);
    setError('');

    try {
      const headers: Record<string, string> = {};
      if (trimmedCode) {
        headers.Authorization = `Basic ${btoa(`${ADMIN_USERNAME}:${trimmedCode}`)}`;
      }

      const response = await fetch(`/api/registrations?limit=${FETCH_LIMIT}`, {
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Unable to authenticate.' }));
        throw new Error(payload.error || 'Unable to authenticate.');
      }

      const data = await response.json();
      setRegistrations(Array.isArray(data.items) ? data.items : []);

      if (trimmedCode) {
        setLastUsedCode(trimmedCode);
        setAuthMode('passcode');
      } else {
        setAuthMode('session');
      }

      setIsAuthorized(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setRegistrations([]);
      if (!trimmedCode) {
        setIsAuthorized(false);
        setAuthMode(null);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshSessionInfo();
  }, []);

  const handleFetch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void fetchRegistrations({ passcode: accessCode });
  };

  const handleGithubLogin = () => {
    window.location.href = '/api/auth/github/login';
  };

  const handleRefresh = () => {
    if (authMode === 'passcode') {
      if (!lastUsedCode) {
        setError('Fetch registrations first.');
        return;
      }
      void fetchRegistrations({ passcode: lastUsedCode });
      return;
    }
    void fetchRegistrations();
  };

  const handleLogout = () => {
    if (authMode === 'session' || sessionInfo?.authenticated) {
      void fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
        .catch((err) => {
          console.error('Failed to end admin session', err);
        })
        .finally(() => {
          void refreshSessionInfo();
        });
    }

    setAccessCode('');
    setLastUsedCode('');
    setRegistrations([]);
    setError('');
    setIsAuthorized(false);
    setAuthMode(null);
    hasLoadedFromSession.current = false;
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
            {authenticatedUser ? (
              <p className={`mt-2 text-xs ${subtleText}`}>
                Signed in as{' '}
                <a
                  href={authenticatedUser.profileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className={theme === 'dark' ? 'text-neon hover:underline' : 'text-accent hover:underline'}
                >
                  {authenticatedUser.login}
                </a>
                {authenticatedUser.name ? ` (${authenticatedUser.name})` : ''}
              </p>
            ) : null}
            <div
              className={`mt-8 rounded-2xl border shadow-inner ${
                theme === 'dark'
                  ? 'border-white/10 bg-black/80 text-white/80'
                  : 'border-ink/10 bg-ink/95 text-green-200'
              }`}
            >
              <div
                className={`flex items-center gap-2 rounded-t-2xl px-4 py-2 ${
                  theme === 'dark' ? 'bg-white/10' : 'bg-ink/80'
                }`}
              >
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
                <p className="ml-4 text-xs uppercase tracking-[0.35em]">Construct Terminal</p>
              </div>
              <div className="space-y-6 px-6 py-5 font-mono text-[0.8rem]">
                {ADMIN_MEMES.map((meme) => (
                  <div key={meme.command}>
                    <p
                      className={`${
                        theme === 'dark' ? 'text-neon' : 'text-emerald-300'
                      }`}
                    >
                      {meme.command}
                    </p>
                    <pre
                      className={`mt-2 whitespace-pre ${
                        theme === 'dark' ? 'text-white/80' : 'text-green-200'
                      }`}
                    >
                      {meme.output.join('\n')}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
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
            <h2 className="text-2xl font-semibold">Authenticate to continue</h2>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-ink/70'}`}>
              Sign in with GitHub or use the rotating access code to unlock the admin console.
            </p>

            <div className="mt-8 space-y-8">
              {checkingSession ? (
                <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-ink/50'}`}>
                  Checking session status…
                </p>
              ) : (
                <>
                  {githubEnabled ? (
                    <button
                      type="button"
                      onClick={handleGithubLogin}
                      className={`w-full rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
                        theme === 'dark'
                          ? 'border border-white/15 bg-white/10 text-white hover:bg-white/15'
                          : 'border border-ink/15 bg-white text-ink hover:border-ink/30'
                      }`}
                    >
                      Continue with GitHub
                    </button>
                  ) : null}

                  {passcodeEnabled ? (
                    <form onSubmit={handleFetch} className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
                        <label className="flex flex-col gap-2 md:col-start-1">
                          <span className={`text-xs font-medium uppercase tracking-wide ${subtleTextStrong}`}>
                            Access code
                          </span>
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
                          <p className={`text-[0.6rem] uppercase tracking-[0.35em] ${subtleText}`}>
                            Username preset to <span className={subtleTextStrong}>{ADMIN_USERNAME}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                        <button
                          type="submit"
                          disabled={loading}
                          className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
                            theme === 'dark'
                              ? 'border border-neon/40 bg-neon/20 text-white hover:bg-neon/30 disabled:border-white/20 disabled:bg-white/10 disabled:text-white/40'
                              : 'bg-accent text-white hover:bg-accent/90 disabled:bg-ink/10 disabled:text-ink/40'
                          } disabled:cursor-not-allowed`}
                        >
                          {loading ? 'Verifying…' : 'Use access code'}
                        </button>
                        <p className={`text-xs uppercase tracking-[0.4em] ${subtleText}`}>
                          Protected via rotating access code
                        </p>
                      </div>
                    </form>
                  ) : (
                    <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-ink/50'}`}>
                      Passcode login is disabled. Ask the ops team to enable GitHub access.
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
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
