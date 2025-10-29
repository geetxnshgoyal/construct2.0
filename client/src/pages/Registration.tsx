import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

const EDU_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.edu\.in$/i;
const BLOCKED_EMAIL_DOMAINS = new Set(['test.edu.in']);

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other / Prefer to self-describe' }
];

type MemberField = {
  name: string;
  email: string;
  gender: string;
};

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

export default function Registration() {
  const recaptchaSiteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string) || '';
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [lead, setLead] = useState<MemberField>({ name: '', email: '', gender: '' });
  const [members, setMembers] = useState<MemberField[]>(() => Array.from({ length: 4 }, () => ({ name: '', email: '', gender: '' })));
  const [honeypot, setHoneypot] = useState('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaReady, setRecaptchaReady] = useState(() => !recaptchaSiteKey);
  const theme = useTheme();
  const isDark = theme === 'dark';

  const labelAccent = `text-xs font-medium uppercase tracking-wide ${isDark ? 'text-white/60' : 'text-ink/60'}`;
  const subLabel = `uppercase tracking-[0.4em] text-sm ${isDark ? 'text-white/50' : 'text-ink/50'}`;
  const inputBase = `rounded-xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
    isDark
      ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10 focus:ring-neon/20'
      : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30 focus:ring-accent/10'
  }`;
  const selectBase = `rounded-xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
    isDark
      ? 'border-white/10 bg-white/5 text-white focus:border-neon/50 focus:bg-white/10 focus:ring-neon/20'
      : 'border-ink/10 bg-white text-ink focus:border-accent/30 focus:ring-accent/10'
  }`;
  const fieldsetClass = `space-y-4 rounded-3xl border p-6 ${isDark ? 'border-white/10 bg-white/5' : 'border-ink/10 bg-white/70'}`;
  const legendTone = `px-2 text-sm uppercase tracking-[0.4em] ${isDark ? 'text-white/60' : 'text-ink/60'}`;
  const accentButton = isDark
    ? 'border border-neon/40 bg-neon/20 text-white hover:bg-neon/30 disabled:border-white/20 disabled:bg-white/10 disabled:text-white/40'
    : 'bg-accent text-white hover:bg-accent/90 disabled:bg-ink/10 disabled:text-ink/40';

  const requiredMembers = useMemo(() => Math.max(0, teamSize - 1), [teamSize]);

  useEffect(() => {
    setMembers((prev) =>
      prev.map((member, index) => (index < requiredMembers ? member : { name: '', email: '', gender: '' }))
    );
  }, [requiredMembers]);

  useEffect(() => {
    if (!recaptchaSiteKey || typeof window === 'undefined') {
      return;
    }

    if (window.grecaptcha) {
      setRecaptchaReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-recaptcha-v3="true"]');
    if (existing) {
      const handleExistingLoad = () => setRecaptchaReady(true);
      existing.addEventListener('load', handleExistingLoad);
      return () => existing.removeEventListener('load', handleExistingLoad);
    }

    const script = document.createElement('script');
    script.dataset.recaptchaV3 = 'true';
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setRecaptchaReady(true);
    script.onerror = () => setRecaptchaReady(false);
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [recaptchaSiteKey]);

  const resetForm = () => {
    setTeamName('');
    setTeamSize(1);
    setLead({ name: '', email: '', gender: '' });
    setMembers(Array.from({ length: 4 }, () => ({ name: '', email: '', gender: '' })));
    setHoneypot('');
  };

  const handleMemberChange = (index: number, field: keyof MemberField, value: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const buildPayload = () => {
    const filteredMembers = members
      .map((member, index) => ({ ...member, slot: index + 1 }))
      .filter((member, index) => index < requiredMembers || member.name || member.email || member.gender)
      .map(({ name, email, gender }) => ({ name, email, gender }));

    return {
      teamName,
      teamSize,
      lead,
      members: filteredMembers,
      honeypot
    };
  };

  const validateEmails = (payload: ReturnType<typeof buildPayload>) => {
    const seen = new Set<string>();
    const normalize = (value: string) => value.trim().toLowerCase();

    const checkEmail = (email: string, label: string) => {
      const trimmed = email.trim();
      if (!trimmed) {
        return `${label} email is required.`;
      }
      if (!EDU_EMAIL_PATTERN.test(trimmed)) {
        return `${label} must use a college email ending with .edu.in.`;
      }
      const normalized = normalize(trimmed);
      const domain = normalized.split('@')[1] ?? '';
      if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
        return `${label} email domain is not allowed. Please use your official college email.`;
      }
      if (seen.has(normalized)) {
        return `Duplicate email detected for ${label}. Every teammate needs a unique address.`;
      }
      seen.add(normalized);
      return null;
    };

    const leadResult = checkEmail(payload.lead.email, 'Team lead');
    if (leadResult) {
      return leadResult;
    }

    for (let index = 0; index < payload.members.length; index += 1) {
      const member = payload.members[index];
      if (!member.email?.trim()) {
        // Optional members may be left blank; required ones have native validation.
        continue;
      }
      const memberResult = checkEmail(member.email, `Squadmate ${index + 1}`);
      if (memberResult) {
        return memberResult;
      }
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = buildPayload();
    const validationError = validateEmails(payload);
    if (validationError) {
      setSubmissionState('error');
      setErrorMessage(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmissionState('submitting');
    setErrorMessage('');

    try {
      let recaptchaToken: string | null = null;
      if (recaptchaSiteKey) {
        recaptchaToken = await new Promise<string>((resolve, reject) => {
          const grecaptcha = window.grecaptcha;
          if (!grecaptcha) {
            reject(new Error('Verification unavailable. Refresh and try again.'));
            return;
          }
          grecaptcha.ready(() => {
            grecaptcha
              .execute(recaptchaSiteKey, { action: 'registration' })
              .then(resolve)
              .catch(() => reject(new Error('Verification failed. Refresh and try again.')));
          });
        });
      }

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          ...(recaptchaToken ? { recaptchaToken } : {})
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Submission failed. Try again.' }));
        throw new Error(payload.error || 'Submission failed. Try again.');
      }

      setSubmissionState('success');
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmissionState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Try again in a moment.');
    }
  };

  return (
    <section className="relative pb-24 pt-16">
      <div className="mx-auto max-w-4xl px-6">
        <motion.header
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <p className="text-xs uppercase tracking-[0.6em] text-ink/40">Registration</p>
          <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
            Register for Co<span className="text-neon">NST</span>ruct 2025
          </h1>
          <p className="mt-6 text-base text-ink/70">
            Ship your team details so we can activate Emergent workspaces, assemble collaboration pods, and prep checkpoints ahead of the
            Build for Impact sprint.
          </p>
        </motion.header>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className={`relative overflow-hidden rounded-[2rem] p-8 sm:p-10 backdrop-blur-xl ${
            isDark ? 'border border-white/10 bg-black/30 text-white' : 'border border-ink/5 bg-white/80 text-ink shadow-lg'
          }`}
        >
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
            <label htmlFor="team-website">Team website</label>
            <input
              id="team-website"
              name="team-website"
              autoComplete="off"
              tabIndex={-1}
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              className="hidden"
            />
          </div>
          <div
            className={`absolute inset-0 -z-10 ${
              isDark ? 'bg-gradient-to-br from-neon/10 via-transparent to-magenta/10' : 'bg-gradient-to-br from-accent/5 via-transparent to-magenta/5'
            }`}
          />
          {submissionState === 'success' ? (
            <div
              className={`mb-8 rounded-xl border p-4 text-center text-sm ${
                isDark
                  ? 'border-neon/40 bg-neon/10 text-neon'
                  : 'border-green-200 bg-green-50 text-green-600'
              }`}
            >
              Team locked in! Onboarding resources unlock inside the Emergent workspace at kickoff.
            </div>
          ) : null}
          {submissionState === 'error' ? (
            <div className={`mb-8 rounded-xl border p-4 text-sm ${
              isDark
                ? 'border-magenta/40 bg-magenta/10 text-magenta'
                : 'border-red-200 bg-red-50 text-red-600'
            }`}>
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-6">
            <label className="flex flex-col gap-2">
              <span className={labelAccent}>
                Team Name <span className="text-red-500">*</span>
              </span>
              <input
                required
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="e.g. Product Mavericks"
                className={inputBase}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelAccent}>
                Team Size <span className="text-red-500">*</span>
              </span>
              <select
                value={teamSize}
                onChange={(event) => setTeamSize(Number.parseInt(event.target.value, 10))}
                className={selectBase}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value} className="bg-white text-ink">
                    {value} member{value === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className={`mt-10 ${fieldsetClass}`}>
            <legend className={legendTone}>Team Lead *</legend>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className={subLabel}>Name *</span>
                <input
                  required
                  value={lead.name}
                  onChange={(event) => setLead((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Team leader name"
                  className={inputBase}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className={subLabel}>College Email *</span>
                <input
                  required
                  type="email"
                  value={lead.email}
                  onChange={(event) => setLead((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="name@college.edu.in"
                  className={inputBase}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm md:col-span-2 md:max-w-xs">
                <span className={subLabel}>Gender *</span>
                <select
                  required
                  value={lead.gender}
                  onChange={(event) => setLead((prev) => ({ ...prev, gender: event.target.value }))}
                  className={selectBase}
                >
                  <option value="" className="bg-white text-ink">
                    Select gender
                  </option>
                  {genders.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white text-ink">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          <div className="mt-10 space-y-8">
            {members.slice(0, requiredMembers).map((member, index) => {
              const slotNumber = index + 1;

              return (
                <fieldset key={slotNumber} className={fieldsetClass}>
                  <legend className={legendTone}>
                    Team Member #{slotNumber} *
                  </legend>
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm">
                      <span className={subLabel}>Name *</span>
                      <input
                        value={member.name}
                        onChange={(event) => handleMemberChange(index, 'name', event.target.value)}
                        placeholder="Teammate name"
                        className={inputBase}
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                      <span className={subLabel}>College Email *</span>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(event) => handleMemberChange(index, 'email', event.target.value)}
                        placeholder="name@college.edu.in"
                        className={inputBase}
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm md:col-span-2 md:max-w-xs">
                      <span className={subLabel}>Gender *</span>
                      <select
                        value={member.gender}
                        onChange={(event) => handleMemberChange(index, 'gender', event.target.value)}
                        className={selectBase}
                        required
                      >
                        <option value="" className="bg-white text-ink">
                          Select gender
                        </option>
                        {genders.map((option) => (
                          <option key={option.value} value={option.value} className="bg-white text-ink">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </fieldset>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-center gap-3">
            <button
              type="submit"
              disabled={submissionState === 'submitting' || (Boolean(recaptchaSiteKey) && !recaptchaReady)}
              className={`w-full rounded-xl px-6 py-4 text-sm font-semibold shadow-sm transition-all active:scale-[0.98] ${accentButton} disabled:cursor-not-allowed`}
            >
              {submissionState === 'submitting' ? 'Submitting...' : 'Submit Registration'}
            </button>
            <p className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-ink/50'}`}>
              Expect a confirmation email within 24 hours
            </p>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
