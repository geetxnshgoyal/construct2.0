import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-band text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <img src="/assets/logos/construct-2-logo.png" alt="CoNSTruct 2.0" className="h-7 w-auto" />
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Build for Impact, a Product x AI hackathon by Newton School of Technology, powered by Replit. Oct 16 to Nov 20, 2026.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-white/60 md:items-end">
          <Link to="/admin" className="font-semibold text-white/70 transition-colors hover:text-white">
            Admin console
          </Link>
          <span>© 2026 CoNSTruct</span>
        </div>
      </div>
    </footer>
  );
}
