import { Link } from 'react-router-dom';

export default function RegistrationClosed() {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-20">
        <p className="font-pixel text-lg text-replit">Pitches due Oct 22</p>
        <h1 className="mt-4 font-wide text-[clamp(2.25rem,6vw,3.5rem)] font-extrabold leading-[1.05] tracking-tight">
          Pitch submissions open at kickoff
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
          The Replit Slides template and the link to submit your pitch are shared at kickoff on Oct 16. Pitches close on Oct 22 at
          11:59 PM IST.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/#submit" className="bg-replit px-5 py-3 font-bold text-navy transition-colors hover:bg-white">
            See what to submit
          </Link>
          <Link to="/#rules" className="border-2 border-white/40 px-5 py-3 font-bold text-white transition-colors hover:border-white">
            Read the rules
          </Link>
        </div>
      </div>
    </section>
  );
}
