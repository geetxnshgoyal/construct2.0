import { rubric, rubricStages, submissions } from '../../data/hackathon';
import SectionHeading from '../ui/SectionHeading';

// One square per 5 points, so a 40-point weight is eight squares.
function WeightCell({ weight }: { weight: string }) {
  const points = Number.parseInt(weight, 10);
  if (Number.isNaN(points)) {
    return <span className="text-ink/40">Not scored</span>;
  }
  return (
    <span className="flex flex-col items-start gap-1.5">
      <span className="font-pixel text-xl tabular-nums">{weight}</span>
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: points / 5 }, (_, index) => (
          <span key={index} className="h-2 w-2 bg-replit" />
        ))}
      </span>
    </span>
  );
}

export default function JudgingSection() {
  return (
    <section id="judging" className="sky-page bg-alt py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div id="submit" />
        <SectionHeading title="What to submit">
          Three submissions, each scored out of 100 by NST faculty, industry mentors, and Replit representatives.
        </SectionHeading>

        <ol className="mt-12 grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
          {submissions.map((stage) => (
            <li key={stage.id} className="bg-surface p-6 sm:p-8">
              <h3 className="font-wide text-2xl font-extrabold tracking-tight">{stage.stage}</h3>
              <p className="mt-1 font-semibold text-rustText">Due {stage.deadline}</p>
              <ul className="mt-6 space-y-2.5 text-[0.95rem] text-ink/80">
                {stage.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-ink" aria-hidden="true" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <div className="mt-24">
          <SectionHeading title="How it’s judged">
            The same six criteria run through every stage. Their weight shifts from the idea to the shipped product.
          </SectionHeading>
        </div>

        <div className="mt-12 overflow-x-auto border-2 border-ink bg-surface">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-band text-white">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Criterion</th>
                {rubricStages.map((stage) => (
                  <th key={stage} scope="col" className="w-36 px-5 py-3 font-semibold">
                    {stage}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {rubric.map((row) => (
                <tr key={row.criterion}>
                  <th scope="row" className="px-5 py-4 align-top font-normal">
                    <span className="block font-bold">{row.criterion}</span>
                    <span className="mt-0.5 block text-sm text-ink/70">{row.description}</span>
                  </th>
                  {row.weights.map((weight, index) => (
                    <td key={rubricStages[index]} className="px-5 py-4 align-top">
                      <WeightCell weight={weight} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-6 text-sm leading-relaxed text-ink/70 md:grid-cols-3">
          <p>
            <span className="font-bold text-ink">Ideathon.</span> Every pitch is scored by at least two judges, and campuses get seats
            in proportion to their submissions. Execution Quality here means the feasibility of your 3-week plan. Track B is judged on
            what you will add.
          </p>
          <p>
            <span className="font-bold text-ink">Checkpoint.</span> Judges open your deployed link and read your progress update. A
            build that doesn’t load on Replit isn’t eligible.
          </p>
          <p>
            <span className="font-bold text-ink">Final.</span> Campus rounds pick each campus’s finalists, and the Grand Finale ranks
            them across campuses.
          </p>
        </div>
      </div>
    </section>
  );
}
