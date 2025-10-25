import { type CSSProperties, useMemo } from 'react';
import { randomBetween } from '../../utils/random';

const PARTICLE_COUNT = 42;

export default function NebulaField() {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, index) => ({
      id: index,
      top: randomBetween(-10, 110),
      left: randomBetween(-5, 105),
      duration: randomBetween(18, 46),
      delay: randomBetween(-30, 8),
      scale: randomBetween(0.4, 1.6)
    }));
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[3]">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute h-2 w-2 animate-rise-loop rounded-full bg-gradient-to-br from-neon/60 via-white/75 to-magenta/60 blur-[1px] shadow-neon"
          style={{
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            transform: `scale(${particle.scale})`
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
