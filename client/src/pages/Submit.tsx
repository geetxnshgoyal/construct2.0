import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { isSubmissionClosed } from '../utils/registrationStatus';
import SubmitClosed from './SubmitClosed';

type AccessSession = {
  leadEmail: string;
  accessCodeHash: string;
  teamName?: string | null;
};

type SubmissionForm = {
  projectName: string;
  leadEmail: string;
  deckUrl: string;
  repoUrl: string;
  demoUrl: string;
  documentationUrl: string;
  notes: string;
};

const STORAGE_KEY = 'construct-submit-access-v2';
const SUBMISSION_DEADLINE = String(import.meta.env.VITE_SUBMIT_DEADLINE || '').trim();
const SUPPORT_EMAIL = String(
  import.meta.env.VITE_SUBMIT_SUPPORT_EMAIL || import.meta.env.VITE_EVENT_SUPPORT_EMAIL || ''
).trim();

const INITIAL_FORM: SubmissionForm = {
  projectName: '',
  leadEmail: '',
  deckUrl: '',
  repoUrl: '',
  demoUrl: '',
  documentationUrl: '',
  notes: '',
};

const REQUIRED_ITEMS = [
  'Pitch deck (PDF, under 25 MB)',
  'Git repository (public access or invite the judges)',
  'Optional live demo/video link + documentation',
];

const CHECKLIST_ITEMS = [
  'Project name can differ, but lead email must match registration',
  'One submission per team — re-open only if ops resets your code',
  'Drop extra context or credentials in the notes section',
];

const normalizeEmail = (value: string) => value.trim().toLowerCase();

type UnlockResponse = {
  ok: true;
  accessCodeHash: string;
  leadEmail: string | null;
  teamName: string | null;
};

export default function Submit() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  if (isSubmissionClosed()) {
    return <SubmitClosed />;
  }

  const [unlockEmail, setUnlockEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [session, setSession] = useState<AccessSession | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const [formValues, setFormValues] = useState<SubmissionForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [successTimestamp, setSuccessTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const cachedRaw = window.localStorage.getItem(STORAGE_KEY);
      if (!cachedRaw) {
        return;
      }
      const parsed: AccessSession = JSON.parse(cachedRaw);
      if (parsed?.leadEmail && parsed?.accessCodeHash) {
        setSession(parsed);
        setIsUnlocked(true);
        setFormValues((prev) => ({
          ...prev,
          leadEmail: parsed.leadEmail,
        }));
      }
    } catch (storageError) {
      console.warn('Unable to load cached submit access:', storageError);
    }
  }, []);

  const sectionTitleTone = isDark ? 'text-white/40' : 'text-ink/40';
  const cardBase = isDark ? 'border-white/10 bg-white/5' : 'border-ink/10 bg-white/80';
  const bulletAccent = isDark ? 'bg-neon/70 ring-4 ring-neon/15' : 'bg-accent ring-4 ring-accent/20';

  const persistSession = (nextSession: AccessSession) => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    } catch (storageError) {
      console.warn('Unable to persist submit access:', storageError);
    }
  };

  const clearSession = () => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (storageError) {
      console.warn('Unable to clear cached submit access:', storageError);
    }
  };

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = normalizeEmail(unlockEmail);
    const trimmedCode = accessCode.trim();

    if (!trimmedEmail) {
      setError('Enter the lead email tied to your registration.');
      return;
    }

    if (!trimmedCode) {
      setError('Enter the submission code shared with your team.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/final-submissions/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadEmail: trimmedEmail, accessCode: trimmedCode }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Unable to verify access.' }));
        throw new Error(payload.error || 'Unable to verify access.');
      }

      const data = (await response.json()) as UnlockResponse;
      const normalizedEmail = data.leadEmail ? normalizeEmail(data.leadEmail) : trimmedEmail;

      const nextSession: AccessSession = {
        leadEmail: normalizedEmail,
        accessCodeHash: data.accessCodeHash,
        teamName: data.teamName,
      };
      setSession(nextSession);
      setIsUnlocked(true);
      persistSession(nextSession);
      setFormValues((prev) => ({
        ...prev,
        leadEmail: normalizedEmail,
      }));
      setSubmissionError('');
    } catch (unlockError) {
      console.error('Submission access verification failed', unlockError);
      setError(
        unlockError instanceof Error
          ? unlockError.message
          : 'Unable to verify access right now. Try again or ping the ops desk.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setIsUnlocked(false);
    setSession(null);
    setUnlockEmail('');
    setAccessCode('');
    setError('');
    setSubmissionError('');
    setSubmissionSuccess(false);
    setSuccessTimestamp(null);
    setFormValues(INITIAL_FORM);
    clearSession();
  };

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (submissionError) {
      setSubmissionError('');
    }
  };

  const finalPayload = useMemo(() => {
    const payload: Record<string, string> = {
      projectName: formValues.projectName.trim(),
      leadEmail: (session?.leadEmail || formValues.leadEmail).trim(),
      deckUrl: formValues.deckUrl.trim(),
      repoUrl: formValues.repoUrl.trim(),
      demoUrl: formValues.demoUrl.trim(),
      documentationUrl: formValues.documentationUrl.trim(),
      notes: formValues.notes.trim(),
    };

    if (session?.accessCodeHash) {
      payload.accessCodeHash = session.accessCodeHash;
    }

    return payload;
  }, [formValues, session]);

  const handleFinalSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) {
      setSubmissionError('Re-enter your submission code and lead email to continue.');
      setIsUnlocked(false);
      return;
    }

    setSubmitting(true);
    setSubmissionError('');

    try {
      const response = await fetch('/api/final-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Submission failed.' }));
        throw new Error(payload.error || 'Submission failed.');
      }

      setSubmissionSuccess(true);
      setSuccessTimestamp(new Date().toISOString());
    } catch (submitError) {
      console.error('Final submission failed', submitError);
      setSubmissionError(
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong. Try again or ping the ops desk.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative pb-24 pt-16">
      <div className="mx-auto max-w-5xl px-6">
        {!isUnlocked ? (
          <motion.form
            onSubmit={handleUnlock}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`mt-10 rounded-xl border p-8 backdrop-blur-xl ${
              isDark ? 'border-white/10 bg-black/30' : 'border-ink/5 bg-white/90 shadow-lg'
            }`}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={`text-xs font-medium uppercase tracking-wide ${sectionTitleTone}`}>
                  Lead email (registration)
                </span>
                <input
                  type="email"
                  value={unlockEmail}
                  onChange={(event) => {
                    setUnlockEmail(event.target.value);
                    if (error) {
                      setError('');
                    }
                  }}
                  placeholder="lead@campus.edu"
                  className={`rounded-xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10 focus:ring-neon/20'
                      : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30 focus:ring-accent/10'
                  }`}
                  autoComplete="email"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={`text-xs font-medium uppercase tracking-wide ${sectionTitleTone}`}>
                  Submission code
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
                  placeholder="Enter your team passcode"
                  className={`rounded-xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10 focus:ring-neon/20'
                      : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30 focus:ring-accent/10'
                  }`}
                  autoComplete="off"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isVerifying}
                className={`rounded-xl px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition active:scale-[0.98] disabled:cursor-not-allowed ${
                  isDark
                    ? 'border border-white/15 text-white/80 hover:text-white disabled:border-white/10 disabled:text-white/30'
                    : 'border border-ink/15 text-ink/70 hover:text-ink disabled:border-ink/10 disabled:text-ink/40'
                }`}
              >
                {isVerifying ? 'Verifying…' : 'Unlock submit desk'}
              </button>
              <p className={`text-[0.65rem] uppercase tracking-[0.4em] ${sectionTitleTone}`}>
                Code unique to each team • rotates when ops issues a fresh drop
              </p>
            </div>
            {error ? (
              <div
                className={`mt-6 rounded-xl border p-4 text-sm ${
                  isDark ? 'border-magenta/40 bg-magenta/10 text-magenta' : 'border-red-200 bg-red-50 text-red-600'
                }`}
              >
                {error}
              </div>
            ) : null}
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`relative mt-10 overflow-hidden rounded-2xl border p-8 backdrop-blur-xl ${
              isDark ? 'border-white/10 bg-black/30 text-white shadow-[0_30px_80px_rgba(8,8,15,0.45)]' : 'border-ink/5 bg-white/95 text-ink shadow-xl'
            }`}
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -top-48 left-1/2 h-72 w-[140%] -translate-x-1/2 rounded-full blur-3xl -z-10 ${
                isDark ? 'bg-neon/25' : 'bg-accent/20'
              }`}
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  {session?.teamName ? (
                    <>Hey, {session.teamName}! You&apos;re cleared for launch 🚀</>
                  ) : (
                    <>You&apos;re cleared for launch 🚀</>
                  )}
                </h2>
                <p className={`mt-2 text-sm ${isDark ? 'text-white/70' : 'text-ink/70'}`}>
                  Submit once per team. If you need to reship, use the switch button to load a new
                  passcode. Lead email is locked to your registration.
                </p>
                {SUBMISSION_DEADLINE ? (
                  <div
                    className={`mt-4 inline-flex items-center gap-3 rounded-full border px-4 py-2 text-[0.65rem] uppercase tracking-[0.3em] ${
                      isDark ? 'border-white/15 bg-white/5 text-white/70' : 'border-ink/10 bg-ink/5 text-ink/70'
                    }`}
                  >
                    <span className={`${isDark ? 'text-neon' : 'text-accent'}`}>Deadline</span>
                    <span>{SUBMISSION_DEADLINE}</span>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleReset}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                  isDark
                    ? 'border border-magenta/40 bg-magenta/15 text-magenta hover:border-magenta/60 hover:bg-magenta/25'
                    : 'border border-magenta/30 bg-magenta/10 text-magenta hover:border-magenta/60 hover:bg-magenta/20'
                }`}
              >
                Switch code
              </button>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className={`rounded-2xl border p-6 ${cardBase}`}>
                <p className={`text-xs uppercase tracking-[0.4em] ${sectionTitleTone}`}>Required</p>
                <h3 className="mt-3 text-lg font-semibold">Bundle your deliverables</h3>
                <ul className={`mt-4 space-y-3 text-sm ${isDark ? 'text-white/70' : 'text-ink/70'}`}>
                  {REQUIRED_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className={`mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full ${bulletAccent}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-2xl border p-6 ${cardBase}`}>
                <p className={`text-xs uppercase tracking-[0.4em] ${sectionTitleTone}`}>Checklist</p>
                <h3 className="mt-3 text-lg font-semibold">Keep the verification tight</h3>
                <ul className={`mt-4 space-y-3 text-sm ${isDark ? 'text-white/70' : 'text-ink/70'}`}>
                  {CHECKLIST_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className={`mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full ${bulletAccent}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className={`rounded-2xl border p-6 ${cardBase}`}>
                <p className={`text-xs uppercase tracking-[0.4em] ${sectionTitleTone}`}>Support</p>
                <p className={`mt-3 text-sm ${isDark ? 'text-white/70' : 'text-ink/70'}`}>
                  Need a reset or spotted a blocker? Drop a line to the operations desk
                  {SUPPORT_EMAIL ? (
                    <>
                      {' '}
                      at{' '}
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className={isDark ? 'text-neon hover:underline' : 'text-accent hover:underline'}
                      >
                        {SUPPORT_EMAIL}
                      </a>
                      .
                    </>
                  ) : (
                    ' through your campus coordinator or Slack channel.'
                  )}
                </p>
                <div
                  className={`mt-5 rounded-xl border border-dashed px-4 py-3 text-xs ${
                    isDark ? 'border-white/10 bg-white/5 text-white/60' : 'border-ink/15 bg-white text-ink/60'
                  }`}
                >
                  <p>
                    Tip: add links that don&apos;t need additional access so ops can verify in under 24 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-dashed border-white/10 pt-10">
              {submissionSuccess ? (
                <div
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <h3 className="text-lg font-semibold uppercase tracking-[0.3em]">Submission received</h3>
                  <p className="mt-3 text-sm">
                    Your deliverables are logged. Ops will reach out if anything looks off.
                    {successTimestamp ? ` Timestamp: ${successTimestamp}` : null}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFinalSubmission} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className={`text-xs font-medium uppercase tracking-wide ${sectionTitleTone}`}>
                        Project name
                      </span>
                      <input
                        name="projectName"
                        value={formValues.projectName}
                        onChange={handleFieldChange}
                        placeholder="What are you shipping?"
                        required
                        className={`rounded-xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
                          isDark
                            ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10 focus:ring-neon/20'
                            : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30 focus:ring-accent/10'
                        }`}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={`text-xs font-medium uppercase tracking-wide ${sectionTitleTone}`}>
                        Lead email (locked)
                      </span>
                      <input
                        name="leadEmail"
                        type="email"
                        value={formValues.leadEmail}
                        onChange={handleFieldChange}
                        placeholder="lead@campus.edu"
                        required
                        readOnly
                        className={`rounded-xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
                          isDark
                            ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10 focus:ring-neon/20'
                            : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30 focus:ring-accent/10'
                        } ${isDark ? 'opacity-70' : 'opacity-80'}`}
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className={`text-xs font-medium uppercase tracking-wide ${sectionTitleTone}`}>
                      Pitch deck URL
                    </span>
                    <input
                      name="deckUrl"
                      type="url"
                      value={formValues.deckUrl}
                      onChange={handleFieldChange}
                      placeholder="https://..."
                      required
                      className={`rounded-xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10 focus:ring-neon/20'
                          : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30 focus:ring-accent/10'
                      }`}
                    />
                  </label>
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className={`text-xs font-medium uppercase tracking-wide ${sectionTitleTone}`}>
                        Git repository URL
                      </span>
                      <input
                        name="repoUrl"
                        type="url"
                        value={formValues.repoUrl}
                        onChange={handleFieldChange}
                        placeholder="https://github.com/your-team/project"
                        required
                        className={`rounded-xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
                          isDark
                            ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10 focus:ring-neon/20'
                            : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30 focus:ring-accent/10'
                        }`}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className={`text-xs font-medium uppercase tracking-wide ${sectionTitleTone}`}>
                        Demo or video link (optional)
                      </span>
                      <input
                        name="demoUrl"
                        type="url"
                        value={formValues.demoUrl}
                        onChange={handleFieldChange}
                        placeholder="https://..."
                        className={`rounded-xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
                          isDark
                            ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10 focus:ring-neon/20'
                            : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30 focus:ring-accent/10'
                        }`}
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className={`text-xs font-medium uppercase tracking-wide ${sectionTitleTone}`}>
                      Documentation / resource link (optional)
                    </span>
                    <input
                      name="documentationUrl"
                      type="url"
                      value={formValues.documentationUrl}
                      onChange={handleFieldChange}
                      placeholder="https://docs.google.com/..."
                      className={`rounded-xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10 focus:ring-neon/20'
                          : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30 focus:ring-accent/10'
                      }`}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className={`text-xs font-medium uppercase tracking-wide ${sectionTitleTone}`}>
                      Notes for judges (optional)
                    </span>
                    <textarea
                      name="notes"
                      value={formValues.notes}
                      onChange={handleFieldChange}
                      placeholder="Context, login credentials, or anything that smoothens the review."
                      rows={4}
                      className={`rounded-2xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10 focus:ring-neon/20'
                          : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30 focus:ring-accent/10'
                      }`}
                    />
                  </label>
                  {submissionError ? (
                    <div
                      className={`rounded-xl border p-4 text-sm ${
                        isDark
                          ? 'border-magenta/40 bg-magenta/10 text-magenta'
                          : 'border-red-200 bg-red-50 text-red-600'
                      }`}
                    >
                      {submissionError}
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`rounded-xl px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] shadow-card transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed ${
                        isDark
                          ? 'border border-neon/40 bg-neon/20 text-white hover:bg-neon/30 disabled:border-white/10 disabled:bg-white/10 disabled:text-white/40'
                          : 'bg-accent text-white hover:bg-accent/90 disabled:bg-ink/10 disabled:text-ink/40'
                      }`}
                    >
                      {submitting ? 'Submitting…' : 'Submit deliverables'}
                    </button>
                    <p className={`text-[0.65rem] uppercase tracking-[0.4em] ${sectionTitleTone}`}>
                      We log every submission with your access hash for audits
                    </p>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
