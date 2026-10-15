// A stepped "pixel stair" edge between a navy band and the page.
// `direction="down"` hangs off the bottom of a navy band; `"up"` rises into the top of one.
const STEPS = [2, 1, 1, 0, 1, 2, 3, 2, 1, 1, 2, 1, 0, 0, 1, 2, 2, 3, 2, 1, 0, 1, 1, 2];

type PixelEdgeProps = {
  direction: 'down' | 'up';
  className?: string;
};

export default function PixelEdge({ direction, className = '' }: PixelEdgeProps) {
  const blocks = Array.from({ length: 160 }, (_, index) => STEPS[index % STEPS.length]);

  return (
    <div
      aria-hidden="true"
      className={`flex h-12 overflow-hidden ${direction === 'down' ? 'items-start' : 'items-end'} ${className}`}
    >
      {blocks.map((height, index) => (
        <span key={index} className="w-4 shrink-0 bg-navy" style={{ height: `${height * 16}px` }} />
      ))}
    </div>
  );
}
