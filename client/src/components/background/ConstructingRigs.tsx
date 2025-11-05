import { motion } from 'framer-motion';
import { memo } from 'react';

type RigProps = {
  delay: number;
  opacity: number;
  scale: number;
  position: { top: string; left: string };
};

const rigs: RigProps[] = [
  {
    delay: 0,
    opacity: 0.6,
    scale: 1,
    position: { top: '18%', left: '12%' }
  },
  {
    delay: 2.5,
    opacity: 0.4,
    scale: 0.8,
    position: { top: '62%', left: '72%' }
  },
  {
    delay: 4.2,
    opacity: 0.45,
    scale: 1.2,
    position: { top: '46%', left: '48%' }
  }
];

function ConstructingRigs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {rigs.map((rig, index) => (
        <motion.div
          key={`rig-${index}`}
          className="absolute will-change-transform"
          style={{ top: rig.position.top, left: rig.position.left, transform: `scale(${rig.scale})`, opacity: rig.opacity }}
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut', delay: rig.delay, repeatType: 'mirror' }}
        >
          <motion.svg
            width="380"
            height="320"
            viewBox="0 0 380 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-neon/50"
          >
            <motion.g 
              animate={{ opacity: [0.4, 0.8, 0.4] }} 
              transition={{ repeat: Infinity, duration: 6, delay: rig.delay, repeatType: 'mirror' }}
            >
              <path
                d="M12 280L96 40L284 40L368 280L12 280Z"
                stroke="url(#rigStroke)"
                strokeWidth="2"
                strokeDasharray="10 12"
                strokeLinecap="round"
              />
              <motion.path
                d="M96 40L188 12L284 40"
                stroke="rgba(0,245,255,0.4)"
                strokeWidth="2"
                strokeDasharray="6 10"
                animate={{ strokeDashoffset: [0, -120] }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear', delay: rig.delay }}
              />
              <motion.path
                d="M132 132H248"
                stroke="rgba(255,0,127,0.4)"
                strokeWidth="2"
                strokeDasharray="2 16"
                animate={{ strokeDashoffset: [0, -80] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear', delay: rig.delay + 0.8 }}
              />
              <motion.circle
                cx="188"
                cy="200"
                r="36"
                stroke="rgba(0,245,255,0.5)"
                strokeWidth="2"
                strokeDasharray="6 12"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 16, ease: 'linear', delay: rig.delay + 1.2 }}
              />
              <motion.line
                x1="188"
                y1="168"
                x2="188"
                y2="232"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2"
                strokeDasharray="4 16"
                animate={{ strokeDashoffset: [0, -120] }}
                transition={{ repeat: Infinity, duration: 7, ease: 'linear', delay: rig.delay + 0.4 }}
              />
              <motion.rect
                x="62"
                y="216"
                width="80"
                height="36"
                rx="6"
                stroke="rgba(0,245,255,0.4)"
                strokeWidth="2"
                strokeDasharray="8 12"
                animate={{ strokeDashoffset: [0, -90] }}
                transition={{ repeat: Infinity, duration: 9, ease: 'linear', delay: rig.delay + 1.6 }}
              />
              <motion.rect
                x="232"
                y="216"
                width="80"
                height="36"
                rx="6"
                stroke="rgba(255,0,127,0.4)"
                strokeWidth="2"
                strokeDasharray="8 12"
                animate={{ strokeDashoffset: [0, 90] }}
                transition={{ repeat: Infinity, duration: 9, ease: 'linear', delay: rig.delay + 1.1, repeatType: 'loop' }}
              />
            </motion.g>
            <defs>
              <linearGradient id={`rigStroke-${index}`} x1="12" y1="280" x2="368" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgba(0,245,255,0.1)" />
                <stop offset="0.5" stopColor="rgba(255,0,127,0.35)" />
                <stop offset="1" stopColor="rgba(0,245,255,0.1)" />
              </linearGradient>
            </defs>
          </motion.svg>
        </motion.div>
      ))}
    </div>
  );
}

export default memo(ConstructingRigs);
