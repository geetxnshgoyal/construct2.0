import SectionHeading from '../ui/SectionHeading';

const steps = [
  { figure: '2500+', title: 'Everyone pitches', detail: 'Any NST student, any campus. Pitches due Oct 22.' },
  { figure: '300', title: 'The top 300 build', detail: '$20 in Replit credits each, from Oct 26.' },
  { figure: '50', title: 'The top 50 level up', detail: 'Extra credits for the strongest builds after the Nov 4 checkpoint.' },
  { figure: 'Finalists', title: 'Campus rounds', detail: 'Each campus picks its finalists, Nov 13 to 19.' },
  { figure: 'Winners', title: 'Grand Finale', detail: 'Finalists from every campus demo live on Nov 20.' }
];

export default function FunnelSection() {
  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Everyone pitches. The best builds go all the way.">
          New in 2.0: entry is through an ideathon. Like 1.0, it’s about building right, not just fast: real problems, real users, and
          a product people can actually use.
        </SectionHeading>

        <ol className="mt-14 space-y-2">
          {steps.map((step, index) => (
            <li
              key={step.figure}
              className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-6 ${
                index === steps.length - 1 ? 'bg-replit text-navy' : 'bg-navy text-white'
              }`}
              style={{ marginLeft: `min(${index * 7}%, ${index * 4}rem)` }}
            >
              <span className="font-pixel text-3xl sm:w-64 sm:shrink-0 sm:text-4xl">{step.figure}</span>
              <span>
                <span className="font-bold">{step.title}.</span>{' '}
                <span className={index === steps.length - 1 ? 'text-navy/80' : 'text-white/70'}>{step.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
