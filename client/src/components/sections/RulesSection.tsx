import { guidelinePanels } from '../../data/hackathon';
import SectionHeading from '../ui/SectionHeading';

export default function RulesSection() {
  return (
    <section id="rules" className="border-t-2 border-ink py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Rules of the build">
          Who can team up, how credits work, what you build with, and the one post every shortlisted team has to make.
        </SectionHeading>

        <div className="mt-14 grid gap-x-12 gap-y-14 md:grid-cols-2">
          {guidelinePanels.map((panel) => (
            <div key={panel.id}>
              <h3 className="border-b-2 border-ink pb-3 font-wide text-xl font-extrabold tracking-tight">
                {panel.title}
                {panel.required ? <span className="ml-3 bg-replit px-2 py-0.5 align-middle text-sm font-bold text-navy">Required</span> : null}
              </h3>
              <ul className="mt-5 space-y-3 text-ink/80">
                {panel.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-ink" aria-hidden="true" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
