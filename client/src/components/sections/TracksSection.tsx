import { tracks } from '../../data/hackathon';
import SectionHeading from '../ui/SectionHeading';

const trackStyle = ['bg-replit text-navy', 'bg-nstDeep text-white'];
const trackMuted = ['text-navy/80', 'text-white/80'];

export default function TracksSection() {
  return (
    <section id="tracks" className="border-t-2 border-navy py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Two tracks">
          Start something new, or level up a product you already own. Either way, it gets built and deployed on Replit.
        </SectionHeading>

        <div className="mt-14 grid md:grid-cols-2">
          {tracks.map((track, index) => (
            <article key={track.id} className={`flex flex-col p-8 sm:p-10 ${trackStyle[index]}`}>
              <p className="font-pixel text-xl">{track.badge}</p>
              <h3 className="mt-6 font-wide text-4xl font-extrabold tracking-tight sm:text-5xl">{track.title}</h3>
              <p className="mt-5 max-w-sm text-lg leading-relaxed">{track.description}</p>
              <p className={`mt-auto max-w-sm pt-10 text-sm ${trackMuted[index]}`}>{track.judgedOn}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
