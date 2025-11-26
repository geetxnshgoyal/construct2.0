import { useEffect } from 'react';
import { demoDaySchedule } from '../data/hackathon';

type PanelistModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function PanelistModal({ open, onClose }: PanelistModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleJumpToFinale = () => {
    const target = document.getElementById('finale');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-3xl border border-ink/15 bg-white/90 p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-ink/60">Demo lineup</p>
            <h3 className="mt-2 font-display text-2xl text-ink">Meet your panelists</h3>
            <p className="mt-1 text-sm text-ink/70">
              Demo Day hits Nov 30 (ADYPU &amp; BLR). RU campus runs on Dec 6 (tentative).
              Panels are below polish those demos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-ink transition hover:bg-ink/5"
            aria-label="Close panelist modal"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {demoDaySchedule.map((slot) => (
            <div key={slot.id} className="rounded-2xl border border-ink/10 bg-paper p-4 shadow-insetNote">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-accent/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-accent">
                  {slot.campus}
                </span>
                <span className="text-[0.7rem] uppercase tracking-[0.3em] text-ink/60">{slot.date}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink">{slot.city}</p>
              <ul className="mt-3 space-y-2 text-sm text-ink/80">
                {slot.panelists.map((panelist, idx) => (
                  <li key={`${slot.id}-${idx}`} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                    {panelist.url ? (
                      <a
                        href={panelist.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold underline decoration-dotted underline-offset-4"
                      >
                        {panelist.name}
                      </a>
                    ) : (
                      <span>{panelist.name}</span>
                    )}
                  </li>
                ))}
              </ul>
              {slot.tentative && (
                <p className="mt-2 text-[0.7rem] uppercase tracking-[0.3em] text-amber-700">
                  Tentative final timing to be confirmed
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={handleJumpToFinale}
            className="inline-flex items-center gap-2 rounded-full bg-ink text-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition hover:bg-ink/90"
          >
            Go to panel section
            <span aria-hidden="true">⟶</span>
          </button>
          <p className="text-xs text-ink/60">You can revisit this lineup anytime from the hero CTA.</p>
        </div>
      </div>
    </div>
  );
}
