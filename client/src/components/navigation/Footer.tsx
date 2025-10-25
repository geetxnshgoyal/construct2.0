import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/40">CoNSTruct 2025</p>
          <p className="mt-2 max-w-md text-sm text-white/60">
            Crafted by Newton School of Technology x The Product Folks x Emergent. React-infused for builders who refuse boring.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <Link
            to="/admin"
            className="text-sm font-semibold uppercase tracking-[0.4em] text-white/40 transition hover:text-neon"
          >
            Admin Console
          </Link>
          <span className="text-xs uppercase tracking-[0.4em] text-white/30">
            © {currentYear} CoNSTruct Collective
          </span>
        </div>
      </div>
    </footer>
  );
}
