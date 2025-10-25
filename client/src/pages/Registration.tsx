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
          <p className="text-xs uppercase tracking-[0.6em] text-white/40">Registration</p>
          <h1 className="mt-4 font-display text-4xl text-white sm:text-5xl">
            Register for Co<span className="text-neon">NST</span>ruct 2025
          </h1>
          <p className="mt-6 text-base text-white/70">
            Ship your team details so we can activate Emergent workspaces, assemble collaboration pods, and prep checkpoints ahead of the
            Build for Impact sprint.
          </p>
        </motion.header>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/60 p-10 shadow-[0_40px_120px_rgba(0,245,255,0.12)] backdrop-blur-2xl"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-neon/10 via-transparent to-magenta/10" />
          {submissionState === 'success' ? (
            <div className="mb-8 rounded-2xl border border-neon/40 bg-neon/10 p-4 text-center text-sm text-neon">
              Team locked in! Check your email soon for onboarding rituals.
            </div>
          ) : null}
          {submissionState === 'error' ? (
            <div className="mb-8 rounded-2xl border border-magenta/40 bg-magenta/10 p-4 text-sm text-magenta">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-6">
            <label className="flex flex-col gap-2 text-sm">
              <span className="uppercase tracking-[0.4em] text-white/50">Team Name *</span>
              <input
                required
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="e.g. Product Mavericks"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="uppercase tracking-[0.4em] text-white/50">Team Size *</span>
              <select
                value={teamSize}
                onChange={(event) => setTeamSize(Number.parseInt(event.target.value, 10))}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-neon focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value} className="bg-cosmos text-white">
                    {value} member{value === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="mt-10 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
            <legend className="px-2 text-sm uppercase tracking-[0.4em] text-white/60">Team Lead *</legend>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="uppercase tracking-[0.4em] text-white/50">Name *</span>
                <input
                  required
                  value={lead.name}
                  onChange={(event) => setLead((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Team leader name"
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="uppercase tracking-[0.4em] text-white/50">College Email *</span>
                <input
                  required
                  type="email"
                  value={lead.email}
                  onChange={(event) => setLead((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="name@college.edu.in"
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm md:col-span-2 md:max-w-xs">
                <span className="uppercase tracking-[0.4em] text-white/50">Gender *</span>
                <select
                  required
                  value={lead.gender}
                  onChange={(event) => setLead((prev) => ({ ...prev, gender: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-neon focus:outline-none"
                >
                  <option value="" className="bg-cosmos text-white">
                    Select gender
                  </option>
                  {genders.map((option) => (
                    <option key={option.value} value={option.value} className="bg-cosmos text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          <div className="mt-10 space-y-8">
            {members.map((member, index) => {
              const slotNumber = index + 1;
              const required = index < requiredMembers;

              return (
                <fieldset key={slotNumber} className={`space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 transition ${required ? 'opacity-100' : 'opacity-60'}`}>
                  <legend className="px-2 text-sm uppercase tracking-[0.4em] text-white/60">
                    Team Member #{slotNumber} {required ? '(Required)' : '(Optional)'}
                  </legend>
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="uppercase tracking-[0.4em] text-white/50">Name {required ? '*' : ''}</span>
                      <input
                        value={member.name}
                        onChange={(event) => handleMemberChange(index, 'name', event.target.value)}
                        placeholder="Teammate name"
                        className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon focus:outline-none"
                        required={required}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="uppercase tracking-[0.4em] text-white/50">College Email {required ? '*' : ''}</span>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(event) => handleMemberChange(index, 'email', event.target.value)}
                        placeholder="name@college.edu.in"
                        className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-neon focus:outline-none"
                        required={required}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm md:col-span-2 md:max-w-xs">
                      <span className="uppercase tracking-[0.4em] text-white/50">Gender {required ? '*' : ''}</span>
                      <select
                        value={member.gender}
                        onChange={(event) => handleMemberChange(index, 'gender', event.target.value)}
                        className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-neon focus:outline-none"
                        required={required}
                      >
                        <option value="" className="bg-cosmos text-white">
                          Select gender
                        </option>
                        {genders.map((option) => (
                          <option key={option.value} value={option.value} className="bg-cosmos text-white">
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
              className="w-full rounded-full border border-neon bg-neon/20 px-6 py-4 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-neon transition hover:-translate-y-1 hover:bg-neon/30 disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-white/10 disabled:text-white/40"
            >
              {submissionState === 'submitting' ? 'Transmitting…' : 'Submit registration'}
            </button>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">
              Expect a confirmation email within 24 hours
            </p>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
