// A stepped "pixel skyline" where two sections meet.
// `down`: the upper section's colour hangs into the lower one.
// `up`: the lower section's colour rises into the upper one.
const STEPS = [2, 1, 1, 0, 1, 2, 3, 2, 1, 1, 2, 1, 0, 0, 1, 2, 2, 3, 2, 1, 0, 1, 1, 2];

export type Tone = 'paper' | 'alt' | 'band';

const toneBg: Record<Tone, string> = {
  paper: 'bg-paper sky-page',
  alt: 'bg-alt sky-page',
  band: 'bg-band sky-band'
};

const toneBlock: Record<Tone, string> = {
  paper: 'bg-paper',
  alt: 'bg-alt',
  band: 'bg-band'
};

type PixelEdgeProps = {
  top: Tone;
  bottom: Tone;
  direction?: 'down' | 'up';
  // Shifts the step pattern so neighbouring joins don't repeat.
  seed?: number;
};

export default function PixelEdge({ top, bottom, direction = 'down', seed = 0 }: PixelEdgeProps) {
  const blocks = Array.from({ length: 160 }, (_, index) => STEPS[(index + seed * 7) % STEPS.length]);
  const down = direction === 'down';

  return (
    <div
      aria-hidden="true"
      className={`flex h-12 overflow-hidden ${down ? `items-start ${toneBg[bottom]}` : `items-end ${toneBg[top]}`}`}
    >
      {blocks.map((height, index) => (
        <span key={index} className={`w-4 shrink-0 ${toneBlock[down ? top : bottom]}`} style={{ height: `${height * 16}px` }} />
      ))}
    </div>
  );
}
