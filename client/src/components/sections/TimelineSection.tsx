import { timeline, weeklyMilestones, type PhaseKey } from '../../data/hackathon';
import SectionHeading from '../ui/SectionHeading';

const phaseSwatch: Record<PhaseKey, string> = {
  ideathon: 'bg-replit',
  build: 'bg-nst',
  ship: 'bg-ink'
};

export default function TimelineSection() {
  return (
    <section id="timeline" className="border-t-2 border-ink py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Three phases, five weeks">
          An ideathon open to everyone, a build sprint for the top 300, then shipping to real users and showing it off. All deadlines
          are 11:59 PM IST.
        </SectionHeading>

        <ol className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-10">
          {timeline.map((phase, index) => (
            <li key={phase.id}>
              <div className={`h-3 ${phaseSwatch[phase.id]}`} aria-hidden="true" />
              <p className="mt-5 font-pixel text-base text-ink/60">Phase {index + 1}</p>
              <h3 className="mt-1 font-wide text-2xl font-extrabold tracking-tight">{phase.title}</h3>
              <p className="mt-1 text-ink/70">
                {phase.dates}. {phase.who}.
              </p>
              <dl className="mt-6 divide-y divide-rule border-y border-rule">
                {phase.entries.map((entry) => (
                  <div key={entry.text} className="grid grid-cols-[5.5rem_1fr] gap-3 py-3 text-[0.95rem]">
                    <dt className="font-semibold">{entry.date}</dt>
                    <dd className="leading-snug text-ink/80">{entry.text}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>

        <h3 className="mt-20 font-wide text-2xl font-extrabold tracking-tight">Weekly milestones</h3>
        <p className="mt-2 text-ink/70">Each week ends with one milestone to hit, and something to show for it.</p>
        <div className="mt-6 overflow-x-auto border-2 border-ink">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-band text-white">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Week</th>
                <th scope="col" className="px-5 py-3 font-semibold">Dates</th>
                <th scope="col" className="px-5 py-3 font-semibold">Milestone</th>
                <th scope="col" className="px-5 py-3 font-semibold">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule bg-surface">
              {weeklyMilestones.map((week) => (
                <tr key={week.week}>
                  <th scope="row" className="whitespace-nowrap px-5 py-4 font-bold">
                    {week.week}: {week.name}
                  </th>
                  <td className="whitespace-nowrap px-5 py-4 text-ink/70">{week.dates}</td>
                  <td className="px-5 py-4">{week.milestone}</td>
                  <td className="px-5 py-4 text-ink/70">{week.proof}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
