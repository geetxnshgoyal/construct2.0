import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

type RegistrationRecord = {
  id?: string;
  teamName: string;
  teamSize: number;
  campus?: string | null;
  batch?: string | null;
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

type AccessCodeEntry = {
  leadEmail: string;
  accessCodeHash: string;
  teamName?: string;
  campus?: string;
  batch?: string;
  generatedAt?: string;
};

type TeamSubmission = {
  id?: string;
  projectName: string | null;
  teamName: string | null;
  leadEmail: string | null;
  deckUrl: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
  documentationUrl: string | null;
  notes: string | null;
  submittedAt: string | null;
  accessHash?: string | null;
  registration?: {
    teamName?: string | null;
    campus?: string | null;
    batch?: string | null;
    teamSize?: number | null;
    submittedAt?: string | null;
    lead?: {
      name?: string | null;
      email?: string | null;
    } | null;
  } | null;
};

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME ?? 'admin';
const FETCH_LIMIT = 200; // Reduced from 500 for faster loading
const ADMIN_MEMES = [
  {
    command: 'admin@construct:~$ fortune hackathon',
    output: [
      '╭────────────────────────────────────────────╮',
      '│  Keep calm and ship the demo before dawn.  │',
      '╰────────────────────────────────────────────╯',
    ],
  },
  {
    command: 'admin@construct:~$ curl https://meme.api/cli.gif',
    output: [
      'Downloading meme...',
      '██████████ 100%',
      '┌────────────────────────────┐',
      '│  ({^_^})  systems go!       │',
      '└────────────────────────────┘',
    ],
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
      '                ||     ||',
    ],
  },
] as const;

export default function Admin() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCodeEntry[]>([]);
  const [finalSubmissions, setFinalSubmissions] = useState<TeamSubmission[]>([]);
  const [lastUsedCode, setLastUsedCode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const theme = useTheme();
  const subtleText = theme === 'dark' ? 'text-white/40' : 'text-ink/40';
  const subtleTextStrong = theme === 'dark' ? 'text-white/60' : 'text-ink/60';

  // Memoize access code lookup map for performance
  const accessCodeMap = useMemo(() => {
    const map = new Map<string, AccessCodeEntry>();
    accessCodes.forEach(entry => {
      map.set(entry.leadEmail.toLowerCase().trim(), entry);
    });
    return map;
  }, [accessCodes]);

  // Helper to find access code for a team
  const getAccessCodeForTeam = (leadEmail: string): AccessCodeEntry | undefined => {
    return accessCodeMap.get(leadEmail.toLowerCase().trim());
  };

  const fetchAdminData = async (passcode: string) => {
    const trimmed = passcode.trim();
    if (!trimmed) {
      setError('Enter the current access code.');
      setRegistrations([]);
      setFinalSubmissions([]);
      return false;
    }

    setLoading(true);
    setError('');

    try {
      const authHeader = `Basic ${btoa(`${ADMIN_USERNAME}:${trimmed}`)}`;
      const headers = { Authorization: authHeader };

      // Fetch access codes from the JSON file (public endpoint)
      const accessCodesPromise = fetch('/data/submission-access.json')
        .then(res => res.ok ? res.json() : [])
        .catch(() => []);

      const [registrationsResponse, submissionsResponse, accessCodesData] = await Promise.all([
        fetch(`/api/registrations?limit=${FETCH_LIMIT}`, { headers }),
        fetch(`/api/final-submissions?limit=${FETCH_LIMIT}`, { headers }),
        accessCodesPromise,
      ]);

      if (!registrationsResponse.ok) {
        const payload = await registrationsResponse.json().catch(() => ({ error: 'Unable to authenticate.' }));
        throw new Error(payload.error || 'Unable to authenticate.');
      }

      if (!submissionsResponse.ok) {
        const payload = await submissionsResponse.json().catch(() => ({ error: 'Unable to load final submissions.' }));
        throw new Error(payload.error || 'Unable to load final submissions.');
      }

      const registrationsPayload = await registrationsResponse.json();
      const submissionsPayload = await submissionsResponse.json();

      setRegistrations(Array.isArray(registrationsPayload.items) ? registrationsPayload.items : []);
      setFinalSubmissions(Array.isArray(submissionsPayload.items) ? submissionsPayload.items : []);
      setAccessCodes(Array.isArray(accessCodesData) ? accessCodesData : []);
      setLastUsedCode(trimmed);
      setIsAuthorized(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setRegistrations([]);
      setFinalSubmissions([]);
      setAccessCodes([]);
      setIsAuthorized(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void fetchAdminData(accessCode);
  };

  const handleRefresh = () => {
    if (!lastUsedCode) {
      setError('Fetch admin data first.');
      return;
    }
    void fetchAdminData(lastUsedCode);
  };

  const handleLogout = () => {
    setAccessCode('');
    setLastUsedCode('');
    setRegistrations([]);
    setFinalSubmissions([]);
    setAccessCodes([]);
    setError('');
    setIsAuthorized(false);
  };

  const handleDownloadRegistrationsCsv = () => {
    if (registrations.length === 0) {
      setError('Nothing to export. Fetch admin data first.');
      return;
    }

    const csvHeader = [
      'Team Name',
      'Campus',
      'Batch',
      'Team Size',
      'Lead Name',
      'Lead Email',
      'Lead Gender',
      'Members',
      'Submitted At',
    ];

    const toCsvRow = (record: RegistrationRecord) => {
      const members = record.members
        .map((member) => {
          if (!member.name && !member.email) {
            return '';
          }
          const details = [member.name ?? '', member.email ?? '', member.gender ?? '']
            .filter(Boolean)
            .join(' • ');
          return details;
        })
        .filter(Boolean)
        .join(' | ');

      return [
        record.teamName,
        record.campus ?? '',
        record.batch ?? '',
        record.teamSize.toString(),
        record.lead.name,
        record.lead.email,
        record.lead.gender ?? '',
        members,
        record.submittedAt ? new Date(record.submittedAt).toISOString() : '',
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
          <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">Monitor registrations & final deliverables</h1>
          <p className="mt-4 max-w-2xl text-base text-ink/70">
            Drop in the rotating access code to peek at the latest crew submissions and their final drop-off links. We surface local fallback
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
              You&apos;re authenticated. Use the controls below to keep tabs on incoming registrations and final deliverables.
            </p>
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
                    <p className={`${theme === 'dark' ? 'text-neon' : 'text-emerald-300'}`}>{meme.command}</p>
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
                <span className={`text-xs font-medium uppercase tracking-wide ${subtleTextStrong}`}>Access code</span>
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
                    ${
                      theme === 'dark'
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
                {loading ? 'Verifying…' : 'Use access code'}
              </button>
              <p className={`text-xs uppercase tracking-[0.4em] ${subtleText}`}>
                Protected via rotating access code
              </p>
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
              onClick={handleDownloadRegistrationsCsv}
              className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                theme === 'dark'
                  ? 'border border-white/15 text-white/80 hover:text-white disabled:border-white/10 disabled:text-white/30'
                  : 'border border-ink/15 text-ink/70 hover:text-ink disabled:border-ink/10 disabled:text-ink/40'
              }`}
              disabled={registrations.length === 0}
            >
              Download registrations CSV
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
            {registrations.map((registration) => {
              const teamAccessCode = getAccessCodeForTeam(registration.lead.email);
              
              return (
              <article
                key={registration.id || `${registration.teamName}-${registration.submittedAt}`}
                className={`rounded-xl border p-6 backdrop-blur-xl ${
                  theme === 'dark'
                    ? 'border-white/10 bg-black/30'
                    : 'border-ink/5 bg-white/90 shadow-md'
                }`}
              >
                <header className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
                  theme === 'dark' ? 'text-white' : 'text-ink'
                }`}>
                  <div>
                    <h2 className="text-xl font-semibold">{registration.teamName}</h2>
                    <p className={`text-xs font-medium uppercase tracking-wide ${
                      theme === 'dark' ? 'text-white/50' : 'text-ink/50'
                    }`}>
                      {registration.teamSize} members • {registration.campus ?? 'Campus N/A'} • {registration.batch ?? 'Batch N/A'}
                    </p>
                  </div>
                  <div className={`text-xs font-medium uppercase tracking-wide ${
                    theme === 'dark' ? 'text-white/40' : 'text-ink/40'
                  }`}>
                    {registration.submittedAt ? new Date(registration.submittedAt).toLocaleString() : 'Pending timestamp'}
                  </div>
                </header>

                {teamAccessCode && (
                  <div className={`mt-4 rounded-lg border p-4 ${
                    theme === 'dark'
                      ? 'border-neon/30 bg-neon/10'
                      : 'border-accent/30 bg-accent/5'
                  }`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${
                          theme === 'dark' ? 'text-neon/80' : 'text-accent/80'
                        }`}>
                          Submission Access Code
                        </p>
                        <p className={`mt-1 font-mono text-lg font-bold ${
                          theme === 'dark' ? 'text-neon' : 'text-accent'
                        }`}>
                          {teamAccessCode.accessCodeHash.substring(0, 12).toUpperCase()}...
                        </p>
                        <p className={`mt-1 text-xs ${
                          theme === 'dark' ? 'text-white/60' : 'text-ink/60'
                        }`}>
                          Hash: {teamAccessCode.accessCodeHash}
                        </p>
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-ink/50'}`}>
                        {teamAccessCode.generatedAt ? (
                          <span>Generated: {new Date(teamAccessCode.generatedAt).toLocaleDateString()}</span>
                        ) : (
                          <span>Code assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!teamAccessCode && (
                  <div className={`mt-4 rounded-lg border border-dashed p-3 text-center ${
                    theme === 'dark'
                      ? 'border-white/20 bg-white/5 text-white/50'
                      : 'border-ink/20 bg-gray-50 text-ink/50'
                  }`}>
                    <p className="text-xs font-medium uppercase tracking-wide">
                      ⚠️ No submission code assigned yet
                    </p>
                  </div>
                )}

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
                              className={`text-[0.65rem] uppercase tracking-[0.3em] ${
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
              );
            })}
          </motion.div>
        ) : null}

        {isAuthorized ? (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-16"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-ink'} sm:text-3xl`}>
                  Final submissions desk
                </h2>
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-white/60' : 'text-ink/60'}`}>
                  Review the shipped artefacts, verify access, and follow up with teams if anything locks behind a wall.
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.35em] ${
                  theme === 'dark' ? 'border border-white/10 text-white/60' : 'border border-ink/10 text-ink/60'
                }`}
              >
                <span className={theme === 'dark' ? 'text-neon' : 'text-accent'}>Captured</span>
                <span>{finalSubmissions.length}</span>
              </div>
            </div>

            {finalSubmissions.length === 0 ? (
              <div
                className={`mt-8 rounded-xl border border-dashed p-6 text-sm ${
                  theme === 'dark'
                    ? 'border-white/15 bg-white/5 text-white/60'
                    : 'border-ink/10 bg-white text-ink/60'
                }`}
              >
                No final deliverables yet. Once teams submit, their links and notes will appear here instantly.
              </div>
            ) : (
              <div className="mt-10 space-y-8">
                {finalSubmissions.map((submission) => {
                  const submissionKey =
                    submission.id ||
                    `${submission.teamName || submission.projectName || 'submission'}-${submission.submittedAt || 'pending'}`;
                  const timestamp = submission.submittedAt
                    ? new Date(submission.submittedAt).toLocaleString()
                    : 'Timestamp pending';
                  const resources = [
                    { label: 'Pitch deck', url: submission.deckUrl },
                    { label: 'Git repo', url: submission.repoUrl },
                    { label: 'Demo', url: submission.demoUrl },
                    { label: 'Docs', url: submission.documentationUrl },
                  ].filter((item) => item.url);
                  const meta = [
                    submission.leadEmail || submission.registration?.lead?.email
                      ? `Lead: ${submission.leadEmail || submission.registration?.lead?.email}`
                      : null,
                    submission.registration?.campus ? `Campus: ${submission.registration.campus}` : null,
                    submission.registration?.batch ? `Batch: ${submission.registration.batch}` : null,
                    submission.registration?.teamSize ? `Registered size: ${submission.registration.teamSize}` : null,
                    submission.accessHash ? `Access hash: ${submission.accessHash}` : null,
                  ].filter(Boolean);

                  return (
                    <article
                      key={submissionKey}
                      className={`rounded-xl border p-6 backdrop-blur-xl ${
                        theme === 'dark'
                          ? 'border-white/10 bg-black/30 text-white'
                          : 'border-ink/5 bg-white/90 text-ink shadow-md'
                      }`}
                    >
                      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {submission.projectName || submission.teamName || 'Untitled project'}
                          </h3>
                          <p
                            className={`text-xs font-medium uppercase tracking-wide ${
                              theme === 'dark' ? 'text-white/50' : 'text-ink/50'
                            }`}
                          >
                            {submission.teamName ? `Team ${submission.teamName}` : 'Team name unavailable'} • {timestamp}
                          </p>
                        </div>
                        {meta.length > 0 ? (
                          <ul className={`space-y-1 text-xs ${theme === 'dark' ? 'text-white/60' : 'text-ink/60'}`}>
                            {meta.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : null}
                      </header>
                      {resources.length > 0 ? (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {resources.map((resource) => (
                            <a
                              key={`${submissionKey}-${resource.label}`}
                              href={resource.url ?? undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                                theme === 'dark'
                                  ? 'border border-white/15 text-white/80 hover:border-white/30 hover:text-white'
                                  : 'border border-ink/15 text-ink/80 hover:border-ink/30 hover:text-ink'
                              }`}
                            >
                              {resource.label}
                              <span className="text-[0.7rem]">↗</span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className={`mt-6 text-sm ${theme === 'dark' ? 'text-white/60' : 'text-ink/60'}`}>
                          No links attached. Follow up with the team for access details.
                        </p>
                      )}
                      {submission.notes ? (
                        <div
                          className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
                            theme === 'dark'
                              ? 'border-white/10 bg-white/5 text-white/70'
                              : 'border-ink/10 bg-white text-ink/80'
                          }`}
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.3em]">Notes for judges</p>
                          <p className="mt-2 leading-relaxed">{submission.notes}</p>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </motion.section>
        ) : null}
      </div>
    </section>
  );
}
