import { partners } from '../../data/hackathon';
import PixelEdge from '../ui/PixelEdge';

export default function PartnersSection() {
  return (
    <section id="partners" className="mt-8">
      <PixelEdge direction="up" />
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-12">
          <h2 className="text-lg font-semibold text-white/70">Brought to you by</h2>
          <ul className="mt-8 grid grid-cols-1 items-center gap-10 sm:grid-cols-3">
            {partners.map((partner) => (
              <li key={partner.id} className="flex h-16 items-center">
                <img src={partner.image} alt={partner.name} className={`partner-logo w-auto ${partner.imageClass}`} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
