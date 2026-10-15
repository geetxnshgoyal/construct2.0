import type { CSSProperties } from 'react';

// A few larger plus-shaped stars that blink in the hero, dark mode only.
// Kept to the gutters and empty corners so they never sit on content.
const stars = [
  { top: '4%', left: '74%', size: 10, duration: '4.2s', delay: '0s', color: 'text-white' },
  { top: '18%', left: '95%', size: 14, duration: '5.6s', delay: '1.1s', color: 'text-white' },
  { top: '36%', left: '62%', size: 8, duration: '3.4s', delay: '2.3s', color: 'text-replit' },
  { top: '52%', left: '1.5%', size: 8, duration: '4.8s', delay: '0.6s', color: 'text-white' },
  { top: '64%', left: '97%', size: 10, duration: '6.1s', delay: '1.8s', color: 'text-nst' },
  { top: '86%', left: '2%', size: 10, duration: '5.2s', delay: '3s', color: 'text-white' }
];

export default function PixelTwinkles() {
  return (
    <div className="dark-only pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {stars.map((star) => (
        <svg
          key={`${star.top}-${star.left}`}
          viewBox="0 0 5 5"
          shapeRendering="crispEdges"
          className={`twinkle absolute ${star.color}`}
          style={
            {
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              '--twinkle-duration': star.duration
            } as CSSProperties
          }
        >
          <rect x="2" y="0" width="1" height="5" fill="currentColor" />
          <rect x="0" y="2" width="5" height="1" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
