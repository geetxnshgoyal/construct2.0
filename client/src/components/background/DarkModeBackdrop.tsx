import { motion } from 'framer-motion';
import ConstructingRigs from './ConstructingRigs';

const PARTICLE_COUNT = 48;

export default function DarkModeBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-b from-midnight via-cosmos to-midnight">
      <div className="absolute inset-0">
        <div className="animate-pulse-glow absolute -top-1/3 left-1/5 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-neon/30 via-magenta/20 to-transparent blur-[160px]" />
        <div className="animate-floaty absolute -bottom-1/2 right-1/4 h-[45rem] w-[45rem] rounded-full bg-gradient-to-bl from-sunset/35 via-magenta/20 to-transparent blur-[180px]" />
      </div>

      <svg className="absolute inset-0 h-full w-full opacity-30" role="presentation">
        <defs>
          <radialGradient id="grid-glow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(0,245,255,0.18)" />
            <stop offset="60%" stopColor="rgba(0,245,255,0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-glow)" />
      </svg>

      <NightSkyParticles count={PARTICLE_COUNT} />
      <ConstructingRigs />
    </div>
  );
}

type ParticleProps = {
  count: number;
};

function NightSkyParticles({ count }: ParticleProps) {
  const items = Array.from({ length: count }).map((_, index) => {
    const size = Math.random() * 2 + 1;
    const duration = Math.random() * 8 + 12;
    const delay = Math.random() * 10;
    const horizontal = Math.random() * 4 + 2;
    const top = Math.random() * 100;
    const left = Math.random() * 100;

    return { id: index, size, duration, delay, horizontal, top, left };
  });

  return (
    <>
      {items.map((item) => (
        <motion.span
          key={item.id}
          className="absolute rounded-full bg-white/90 shadow-neon"
          style={{
            width: `${item.size}px`,
            height: `${item.size}px`,
            top: `${item.top}%`,
            left: `${item.left}%`,
            filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.35))'
          }}
          animate={{
            x: [0, item.horizontal, 0, -item.horizontal, 0],
            y: [0, -12, -4, -12, 0],
            opacity: [0.4, 0.8, 0.5, 0.8, 0.4]
          }}
          transition={{
            repeat: Infinity,
            duration: item.duration,
            ease: 'easeInOut',
            delay: item.delay
          }}
        />
      ))}
    </>
  );
}
