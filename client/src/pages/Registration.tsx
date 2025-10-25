import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

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
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [lead, setLead] = useState<MemberField>({ name: '', email: '', gender: '' });
  const [members, setMembers] = useState<MemberField[]>(() => Array.from({ length: 4 }, () => ({ name: '', email: '', gender: '' })));
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [theme] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

  const requiredMembers = useMemo(() => Math.max(0, teamSize - 1), [teamSize]);

  useEffect(() => {
    setMembers((prev) =>
      prev.map((member, index) => (index < requiredMembers ? member : { name: '', email: '', gender: '' }))
    );
  }, [requiredMembers]);

  const resetForm = () => {
    setTeamName('');
    setTeamSize(1);
    setLead({ name: '', email: '', gender: '' });
    setMembers(Array.from({ length: 4 }, () => ({ name: '', email: '', gender: '' })));
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
      members: filteredMembers
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmissionState('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload())
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
          className={`relative overflow-hidden rounded-[2rem] p-8 sm:p-10 backdrop-blur-xl
            ${theme === 'dark' 
              ? 'border border-white/10 bg-black/30 text-white' 
              : 'border border-ink/5 bg-white/80 text-ink shadow-lg'
            }`}
        >
          <div className={`absolute inset-0 -z-10 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-neon/10 via-transparent to-magenta/10'
              : 'bg-gradient-to-br from-accent/5 via-transparent to-magenta/5'
          }`} />
          {submissionState === 'success' ? (
            <div className={`mb-8 rounded-xl border p-4 text-center text-sm ${
              theme === 'dark'
                ? 'border-neon/40 bg-neon/10 text-neon'
                : 'border-green-200 bg-green-50 text-green-600'
            }`}>
              Team locked in! Check your email soon for onboarding rituals.
            </div>
          ) : null}
          {submissionState === 'error' ? (
            <div className={`mb-8 rounded-xl border p-4 text-sm ${
              theme === 'dark'
                ? 'border-magenta/40 bg-magenta/10 text-magenta'
                : 'border-red-200 bg-red-50 text-red-600'
            }`}>
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-6">
            <label className="flex flex-col gap-2">
              <span className={`text-xs font-medium uppercase tracking-wide ${
                theme === 'dark' ? 'text-white/60' : 'text-ink/60'
              }`}>
                Team Name <span className="text-red-500">*</span>
              </span>
              <input
                required
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="e.g. Product Mavericks"
                className={`rounded-xl border px-4 py-3 transition-colors
                  ${theme === 'dark'
                    ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-neon/50 focus:bg-white/10'
                    : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30'
                  } focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-neon/20' : 'focus:ring-accent/10'
                  }`}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={`text-xs font-medium uppercase tracking-wide ${
                theme === 'dark' ? 'text-white/60' : 'text-ink/60'
              }`}>
                Team Size <span className="text-red-500">*</span>
              </span>
              <select
                value={teamSize}
                onChange={(event) => setTeamSize(Number.parseInt(event.target.value, 10))}
                className={`rounded-xl border px-4 py-3 transition-colors
                  ${theme === 'dark'
                    ? 'border-white/10 bg-white/5 text-white focus:border-neon/50 focus:bg-white/10'
                    : 'border-ink/10 bg-white text-ink focus:border-accent/30'
                  } focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-neon/20' : 'focus:ring-accent/10'
                  }`}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value} className="bg-white text-ink">
                    {value} member{value === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="mt-10 space-y-4 rounded-3xl border border-ink/10 bg-white/70 p-6">
            <legend className="px-2 text-sm uppercase tracking-[0.4em] text-ink/60">Team Lead *</legend>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="uppercase tracking-[0.4em] text-ink/50">Name *</span>
                <input
                  required
                  value={lead.name}
                  onChange={(event) => setLead((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Team leader name"
                  className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-ink placeholder:text-ink/40 focus:border-neon focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="uppercase tracking-[0.4em] text-ink/50">College Email *</span>
                <input
                  required
                  type="email"
                  value={lead.email}
                  onChange={(event) => setLead((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="name@college.edu.in"
                  className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-ink placeholder:text-ink/40 focus:border-neon focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm md:col-span-2 md:max-w-xs">
                <span className="uppercase tracking-[0.4em] text-ink/50">Gender *</span>
                <select
                  required
                  value={lead.gender}
                  onChange={(event) => setLead((prev) => ({ ...prev, gender: event.target.value }))}
                  className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-ink focus:border-neon focus:outline-none"
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
                <fieldset key={slotNumber} className="space-y-4 rounded-3xl border border-ink/10 bg-white/70 p-6">
                  <legend className="px-2 text-sm uppercase tracking-[0.4em] text-ink/60">
                    Team Member #{slotNumber} *
                  </legend>
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="uppercase tracking-[0.4em] text-ink/50">Name *</span>
                      <input
                        value={member.name}
                        onChange={(event) => handleMemberChange(index, 'name', event.target.value)}
                        placeholder="Teammate name"
                        className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-ink placeholder:text-ink/40 focus:border-neon focus:outline-none"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="uppercase tracking-[0.4em] text-ink/50">College Email *</span>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(event) => handleMemberChange(index, 'email', event.target.value)}
                        placeholder="name@college.edu.in"
                        className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-ink placeholder:text-ink/40 focus:border-neon focus:outline-none"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm md:col-span-2 md:max-w-xs">
                      <span className="uppercase tracking-[0.4em] text-ink/50">Gender *</span>
                      <select
                        value={member.gender}
                        onChange={(event) => handleMemberChange(index, 'gender', event.target.value)}
                        className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-ink focus:border-neon focus:outline-none"
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
              disabled={submissionState === 'submitting'}
              className={`w-full rounded-xl px-6 py-4 text-sm font-semibold shadow-sm transition-all active:scale-[0.98] ${
                theme === 'dark'
                  ? 'border border-neon/40 bg-neon/20 text-white hover:bg-neon/30 disabled:border-white/20 disabled:bg-white/10 disabled:text-white/40'
                  : 'bg-accent text-white hover:bg-accent/90 disabled:bg-ink/10 disabled:text-ink/40'
              } disabled:cursor-not-allowed`}
            >
              {submissionState === 'submitting' ? 'Submitting...' : 'Submit Registration'}
            </button>
            <p className={`text-xs font-medium ${
              theme === 'dark' ? 'text-white/40' : 'text-ink/50'
            }`}>
              Expect a confirmation email within 24 hours
            </p>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
