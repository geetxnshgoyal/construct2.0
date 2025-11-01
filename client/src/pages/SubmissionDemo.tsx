import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

type SubmissionState = 'idle' | 'submitting' | 'success';

type SubmissionPayload = {
  leadEmail: string;
  projectName: string;
  githubUrl: string;
  demoUrl: string;
  summary: string;
  problemTrack: string;
  additionalNotes: string;
};

const DEMO_TRACKS = [
  'Climate & Sustainability',
  'Community & Public Good',
  'Future of Learning',
  'Healthcare & Wellness',
  'Open Innovation'
];

const buildInitialPayload = (): SubmissionPayload => ({
  leadEmail: '',
  projectName: '',
  githubUrl: '',
  demoUrl: '',
  summary: '',
  problemTrack: '',
  additionalNotes: ''
});

export default function SubmissionDemo() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [payload, setPayload] = useState<SubmissionPayload>(() => buildInitialPayload());
  const [state, setState] = useState<SubmissionState>('idle');

  const labelTone = useMemo(
    () =>
      `text-xs font-semibold uppercase tracking-[0.35em] ${
        isDark ? 'text-white/60' : 'text-ink/60'
      }`,
    [isDark]
  );

  const inputClass = useMemo(
    () =>
      `w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
        isDark
          ? 'border-white/10 bg-white/10 text-white placeholder:text-white/40 focus:border-neon/40 focus:ring-neon/20'
          : 'border-ink/10 bg-white text-ink placeholder:text-ink/40 focus:border-accent/30 focus:ring-accent/10'
      }`,
    [isDark]
  );

  const handleChange = (field: keyof SubmissionPayload, value: string) => {
    setPayload((prev) => ({ ...prev, [field]: value }));
    setState('idle');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setState('submitting');

    // Simulate async handling so the UI can be demoed without a backend hook-up.
    setTimeout(() => {
      setState('success');
    }, 600);
  };

  const resetForm = () => {
    setPayload(buildInitialPayload());
    setState('idle');
  };

  return (
    <section className="relative pb-24 pt-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6">
        <header className="text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] ${
              isDark ? 'bg-white/10 text-neon/80' : 'bg-accent/10 text-accent'
            }`}
          >
            Submission Demo
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5 text-3xl font-semibold sm:text-4xl"
          >
            Show us what you shipped ✨
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mx-auto mt-4 max-w-2xl text-sm sm:text-base ${
              isDark ? 'text-white/60' : 'text-ink/70'
            }`}
          >
            This page is wired as a <strong>front-end prototype</strong> so your team can practice the final hand-off.
            Hook the submit action to your chosen API endpoint, then swap the simulated delay for a real network call.
          </motion.p>
        </header>

        <div
          className={`relative overflow-hidden rounded-3xl border ${
            isDark ? 'border-white/10 bg-black/60' : 'border-ink/10 bg-white'
          }`}
        >
          <div
            className={`absolute inset-0 -z-10 bg-gradient-to-br ${
              isDark ? 'from-neon/10 via-transparent to-magenta/10' : 'from-accent/5 via-transparent to-magenta/5'
            }`}
          />
          <form className="space-y-10 p-8 sm:p-10" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={labelTone}>Lead Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={payload.leadEmail}
                  placeholder="lead@campus.edu.in"
                  onChange={(event) => handleChange('leadEmail', event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelTone}>Project Name</span>
                <input
                  required
                  value={payload.projectName}
                  placeholder="Give your product a bold title"
                  onChange={(event) => handleChange('projectName', event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={labelTone}>GitHub Repository</span>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/org/project"
                  value={payload.githubUrl}
                  onChange={(event) => handleChange('githubUrl', event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelTone}>Demo Link</span>
                <input
                  type="url"
                  placeholder="https://youtu.be/..."
                  value={payload.demoUrl}
                  onChange={(event) => handleChange('demoUrl', event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className={labelTone}>Problem Track</span>
              <select
                required
                value={payload.problemTrack}
                onChange={(event) => handleChange('problemTrack', event.target.value)}
                className={inputClass}
              >
                <option value="" disabled className="bg-white text-ink">
                  Pick the challenge you tackled
                </option>
                {DEMO_TRACKS.map((track) => (
                  <option key={track} value={track} className="bg-white text-ink">
                    {track}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelTone}>Ship Summary</span>
              <textarea
                required
                rows={5}
                maxLength={1500}
                className={`${inputClass} resize-y`}
                placeholder="In 3-5 sentences, highlight the problem, solution, and impact you're chasing."
                value={payload.summary}
                onChange={(event) => handleChange('summary', event.target.value)}
              />
              <span className={`text-xs ${isDark ? 'text-white/40' : 'text-ink/50'}`}>
                {payload.summary.length} / 1500 characters
              </span>
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelTone}>Notes to the Jury</span>
              <textarea
                rows={4}
                className={`${inputClass} resize-y`}
                placeholder="Drop product hunt draft links, test credentials, or anything judges should keep in mind."
                value={payload.additionalNotes}
                onChange={(event) => handleChange('additionalNotes', event.target.value)}
              />
            </label>

            <div
              className={`rounded-2xl border px-5 py-4 text-sm ${
                isDark ? 'border-white/15 bg-white/5 text-white/70' : 'border-ink/10 bg-slate-50 text-ink/70'
              }`}
            >
              <strong className="font-semibold">Need uploads?</strong> Swap this block with your storage picker (Firebase
              Storage, UploadThing, etc.). For the demo, simply paste shareable links in the fields above.
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
                <span className={isDark ? 'text-white/50' : 'text-ink/50'}>Status:</span>
                <span
                  className={`font-semibold ${
                    state === 'success'
                      ? isDark
                        ? 'text-emerald-300'
                        : 'text-emerald-600'
                      : state === 'submitting'
                        ? isDark
                          ? 'text-neon/80'
                          : 'text-accent'
                        : isDark
                          ? 'text-white/60'
                          : 'text-ink/60'
                  }`}
                >
                  {state === 'success' ? 'Ready to ship' : state === 'submitting' ? 'Packaging upload…' : 'Drafting'}
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    isDark
                      ? 'border border-white/20 text-white hover:bg-white/10'
                      : 'border border-ink/15 text-ink hover:border-ink/30'
                  }`}
                  onClick={resetForm}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={state === 'submitting'}
                  className={`rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    isDark
                      ? 'border border-neon/40 bg-neon/20 text-white hover:bg-neon/30 disabled:border-white/20 disabled:bg-white/10 disabled:text-white/40'
                      : 'bg-accent text-white hover:bg-accent/90 disabled:bg-ink/10 disabled:text-ink/40'
                  }`}
                >
                  {state === 'submitting' ? 'Submitting…' : 'Submit Project'}
                </button>
              </div>
            </div>

            {state === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  isDark ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                }`}
              >
                Demo submission captured. Plug this UI into your backend or serverless function to make it production-ready.
              </motion.div>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
