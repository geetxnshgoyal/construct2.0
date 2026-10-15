import { prizes, takeaways } from '../../data/hackathon';
import SectionHeading from '../ui/SectionHeading';

export default function PrizesSection() {
  return (
    <section id="prizes" className="border-t-2 border-ink py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Prizes and what you take home" />

        <div className="mt-14 grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <ul className="border-t-2 border-ink">
              {prizes.map((prize) => (
                <li key={prize.name} className="grid grid-cols-[1fr_auto] items-baseline gap-6 border-b border-rule py-5">
                  <span className="text-lg font-bold">{prize.name}</span>
                  <span className="font-pixel text-3xl sm:text-4xl">{prize.amount}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink/60">Prize amounts are still to be confirmed.</p>
            <ul className="mt-8 space-y-2 text-ink/80">
              <li>Replit credits: $20 for each of the top 300, with more for the top 50 builders.</li>
              <li>Certificates for every team that makes a final submission.</li>
            </ul>
          </div>

          <div className="bg-band p-8 text-white sm:p-10">
            <h3 className="font-wide text-2xl font-extrabold tracking-tight">By Nov 20, you’ll have</h3>
            <ul className="mt-6 space-y-4">
              {takeaways.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-white/80">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-replit" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
