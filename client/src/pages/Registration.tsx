import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { isRegistrationClosed } from '../utils/registrationStatus';
import RegistrationClosed from './RegistrationClosed';

type BatchOption = 'Batch 2023' | 'Batch 2024' | 'Batch 2025';
const CAMPUS_DOMAIN_SUFFIXES = {
  'NST-RU': 'rishihood.edu.in',
  'NST-ADYPU': 'adypu.edu.in',
  'NST-Svyasa': 'svyasa-sas.edu.in',
} as const;
const CAMPUSES = Object.keys(CAMPUS_DOMAIN_SUFFIXES) as Array<keyof typeof CAMPUS_DOMAIN_SUFFIXES>;
const ALL_BATCHES: BatchOption[] = ['Batch 2023', 'Batch 2024', 'Batch 2025'];
const CAMPUS_BATCH_MAP: Record<keyof typeof CAMPUS_DOMAIN_SUFFIXES, BatchOption[]> = {
  'NST-RU': ['Batch 2023', 'Batch 2024', 'Batch 2025'],
  'NST-ADYPU': ['Batch 2024', 'Batch 2025'],
  'NST-Svyasa': ['Batch 2025'],
};
const ALLOWED_EMAIL_DOMAINS: string[] = Object.values(CAMPUS_DOMAIN_SUFFIXES);
const buildDomainPattern = (suffix: string) => `(?:[a-z0-9-]+\\.)*${suffix.replace(/\./g, '\\.')}`;
const ALLOWED_DOMAINS_PATTERN = ALLOWED_EMAIL_DOMAINS.map((suffix) => buildDomainPattern(suffix)).join('|');
const EDU_EMAIL_PATTERN = new RegExp(`^[^\\s@]+@(${ALLOWED_DOMAINS_PATTERN})$`, 'i');

const matchesSuffix = (domain: string, suffix: string) => domain === suffix || domain.endsWith(`.${suffix}`);

const matchesAllowedDomain = (domain: string) => ALLOWED_EMAIL_DOMAINS.some((suffix) => matchesSuffix(domain, suffix));

const matchesCampusEmail = (email: string, campusValue: typeof CAMPUSES[number] | undefined) => {
  if (!campusValue) return false;
  const suffix = CAMPUS_DOMAIN_SUFFIXES[campusValue];
  const domain = email.split('@')[1] ?? '';
  return matchesSuffix(domain, suffix);
};

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
  const registrationClosed = isRegistrationClosed();
  if (registrationClosed) {
    return <RegistrationClosed />;
  }
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [lead, setLead] = useState<MemberField>({ name: '', email: '', gender: '' });
  const [members, setMembers] = useState<MemberField[]>(() => Array.from({ length: 4 }, () => ({ name: '', email: '', gender: '' })));
  const [honeypot, setHoneypot] = useState('');
  const [campus, setCampus] = useState('');
  const [batch, setBatch] = useState('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
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
  const availableBatches = useMemo(() => (campus ? CAMPUS_BATCH_MAP[campus as typeof CAMPUSES[number]] ?? [] : []), [campus]);
  const selectedDomain = campus ? CAMPUS_DOMAIN_SUFFIXES[campus as keyof typeof CAMPUS_DOMAIN_SUFFIXES] : undefined;
  const emailPlaceholder = selectedDomain ? `name@${selectedDomain}` : 'name@rishihood.edu.in';

  useEffect(() => {
    setMembers((prev) =>
      prev.map((member, index) => (index < requiredMembers ? member : { name: '', email: '', gender: '' }))
    );
  }, [requiredMembers]);

  useEffect(() => {
    if (batch && !availableBatches.includes(batch as (typeof availableBatches)[number])) {
      setBatch('');
    }
  }, [batch, availableBatches]);

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
    setCampus('');
    setBatch('');
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
      honeypot,
      campus,
      batch
    };
  };

  const validateEmails = (payload: ReturnType<typeof buildPayload>) => {
    if (!CAMPUSES.includes(payload.campus as typeof CAMPUSES[number])) {
      return 'Select your NST campus from the list.';
    }

    if (!ALL_BATCHES.includes(payload.batch as BatchOption)) {
      return 'Select your batch year from the list.';
    }

    if (!CAMPUS_BATCH_MAP[payload.campus as typeof CAMPUSES[number]]?.includes(payload.batch as BatchOption)) {
      return 'Choose the batch assigned to your campus.';
    }

    const seen = new Set<string>();
    const normalize = (value: string) => value.trim().toLowerCase();

    const checkEmail = (email: string, label: string) => {
      const trimmed = email.trim();
      if (!trimmed) {
        return `${label} email is required.`;
      }
      if (!EDU_EMAIL_PATTERN.test(trimmed)) {
        return `${label} must use the official student email for your campus.`;
      }
      const normalized = normalize(trimmed);
      const domain = normalized.split('@')[1] ?? '';
      if (!matchesAllowedDomain(domain)) {
        return `${label} email domain is not recognised. Use your campus account.`;
      }
      if (!matchesCampusEmail(trimmed, payload.campus as typeof CAMPUSES[number])) {
        const suffix = CAMPUS_DOMAIN_SUFFIXES[payload.campus as keyof typeof CAMPUS_DOMAIN_SUFFIXES];
        return `${label} email must match the ${payload.campus} domain (@${suffix}).`;
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
    setShowSuccess(false);

     if (registrationClosed) {
       setSubmissionState('error');
       setErrorMessage('Registrations are closed.');
       window.scrollTo({ top: 0, behavior: 'smooth' });
       return;
     }

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
      setShowSuccess(true);
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmissionState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Try again in a moment.');
    }
  };

  return (
    <section className="relative pb-24 pt-16">
      {showSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-6 text-center shadow-xl ${
              isDark ? 'bg-black/80 text-white' : 'bg-white text-ink'
            }`}
          >
            <h2 className="text-xl font-semibold">Registration received!</h2>
            <p className="mt-3 text-sm opacity-80">
              You&apos;re all set. Check your inbox for next steps from the organizing team.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className={`mt-6 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                isDark
                  ? 'border border-white/20 text-white hover:bg-white/10'
                  : 'border border-ink/15 text-ink hover:border-ink/30'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
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
          <p className="mt-4 text-sm text-ink/80 sm:text-base">
            Heads up: every team needs to sign up on the Emergent website and be present at the official launch session to keep their slot locked. Registration closes today, so wrap up your details now.
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
          {registrationClosed ? (
            <div
              className={`mb-8 rounded-xl border p-4 text-sm ${
                isDark
                  ? 'border-magenta/40 bg-magenta/10 text-magenta'
                  : 'border-red-200 bg-red-50 text-red-600'
              }`}
            >
              Registrations are now closed. Thanks for your interest!
            </div>
          ) : null}
          <p className={`mb-6 text-xs font-medium uppercase tracking-[0.3em] ${isDark ? 'text-white/50' : 'text-ink/50'}`}>
            {campus && selectedDomain
              ? `Use your official ${campus} student email (e.g. name@${selectedDomain}).`
              : 'Select your campus and use your official student email.'}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={labelAccent}>
                Campus <span className="text-red-500">*</span>
              </span>
              <select
                value={campus}
                onChange={(event) => setCampus(event.target.value)}
                className={selectBase}
                required
              >
                <option value="" disabled className="bg-white text-ink">
                  Select campus
                </option>
                {CAMPUSES.map((value) => (
                  <option key={value} value={value} className="bg-white text-ink">
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelAccent}>
                Batch <span className="text-red-500">*</span>
              </span>
              <select
                value={batch}
                onChange={(event) => setBatch(event.target.value)}
                className={selectBase}
                required
                disabled={!campus}
              >
                <option value="" disabled className="bg-white text-ink">
                  Select batch
                </option>
                {availableBatches.map((value) => (
                  <option key={value} value={value} className="bg-white text-ink">
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <hr className={`my-8 border-dashed ${isDark ? 'border-white/15' : 'border-ink/15'}`} />
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
              Team locked in! Onboarding resources unlock at kickoff.
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
                placeholder={emailPlaceholder}
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
                        placeholder={emailPlaceholder}
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
              disabled={
                registrationClosed ||
                submissionState === 'submitting' ||
                (Boolean(recaptchaSiteKey) && !recaptchaReady)
              }
              className={`w-full rounded-xl px-6 py-4 text-sm font-semibold shadow-sm transition-all active:scale-[0.98] ${accentButton} disabled:cursor-not-allowed`}
            >
              {registrationClosed ? 'Registrations Closed' : submissionState === 'submitting' ? 'Submitting...' : 'Submit Registration'}
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
