import type { CSSProperties } from 'react';

// Light mode only: a few tetrominoes drop down the hero's side gutters.
const CELL = 7;

const shapes = {
  I: [[0, 0], [0, 1], [0, 2], [0, 3]],
  O: [[0, 0], [1, 0], [0, 1], [1, 1]],
  T: [[0, 0], [1, 0], [2, 0], [1, 1]],
  L: [[0, 0], [0, 1], [0, 2], [1, 2]]
} as const;

// Negative delays start each block partway down, so the gutters are never empty.
const blocks: Array<{ shape: keyof typeof shapes; left: string; color: string; duration: string; delay: string; wideOnly?: boolean }> = [
  { shape: 'I', left: '1.2%', color: 'text-replit', duration: '19s', delay: '-4s' },
  { shape: 'T', left: '94.5%', color: 'text-nst', duration: '23s', delay: '-12s' },
  { shape: 'O', left: '3.5%', color: 'text-white/60', duration: '29s', delay: '-21s', wideOnly: true },
  { shape: 'L', left: '97%', color: 'text-replit', duration: '26s', delay: '-2s', wideOnly: true }
];

export default function FallingBlocks() {
  return (
    <div className="light-only pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {blocks.map((block) => {
        const cells = shapes[block.shape];
        const width = Math.max(...cells.map(([x]) => x)) + 1;
        const height = Math.max(...cells.map(([, y]) => y)) + 1;
        return (
          <svg
            key={`${block.shape}-${block.left}`}
            viewBox={`0 0 ${width * CELL} ${height * CELL}`}
            width={width * CELL}
            height={height * CELL}
            shapeRendering="crispEdges"
            className={`block-fall absolute ${block.color} ${block.wideOnly ? 'hidden sm:block' : ''}`}
            style={{ left: block.left, animationDelay: block.delay, '--fall-duration': block.duration } as CSSProperties}
          >
            {cells.map(([x, y]) => (
              <rect key={`${x}-${y}`} x={x * CELL + 0.5} y={y * CELL + 0.5} width={CELL - 1} height={CELL - 1} fill="currentColor" />
            ))}
          </svg>
        );
      })}
    </div>
  );
}
