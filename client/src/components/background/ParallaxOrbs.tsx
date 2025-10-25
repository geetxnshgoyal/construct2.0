import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { randomBetween } from '../../utils/random';

const ORB_COUNT = 6;

export default function ParallaxOrbs() {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const smoothX = useSpring(pointerX, { stiffness: 60, damping: 12 });
  const smoothY = useSpring(pointerY, { stiffness: 60, damping: 12 });

  const rotateX = useTransform(smoothY, (value) => value * -0.45);
  const rotateY = useTransform(smoothX, (value) => value * 0.45);

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      const normalizedX = (event.clientX / innerWidth - 0.5) * 24;
      const normalizedY = (event.clientY / innerHeight - 0.5) * 24;
      pointerX.set(normalizedX);
      pointerY.set(normalizedY);
    };

    window.addEventListener('pointermove', updatePointer, { passive: true });
    return () => window.removeEventListener('pointermove', updatePointer);
  }, [pointerX, pointerY]);

  const orbs = useMemo(
    () =>
      Array.from({ length: ORB_COUNT }).map((_, index) => ({
        id: index,
        size: randomBetween(120, 240),
        x: randomBetween(-45, 45),
        y: randomBetween(-30, 30),
        hue: randomBetween(180, 330),
        speed: randomBetween(12, 26)
      })),
    []
  );

  return (
    <motion.div
      aria-hidden
      style={{ rotateX, rotateY }}
      className="pointer-events-none fixed inset-0 z-[2]"
    >
      {orbs.map((orb) => (
        <motion.span
          key={orb.id}
          className="absolute rounded-full blur-3xl opacity-70 mix-blend-screen"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            top: `calc(50% + ${orb.y}%)`,
            left: `calc(50% + ${orb.x}%)`,
            background: `radial-gradient(circle at 30% 30%, hsla(${orb.hue}, 100%, 70%, 0.6), transparent 75%)`
          }}
          animate={{ scale: [0.8, 1.2, 0.85], opacity: [0.4, 0.7, 0.5] }}
          transition={{ repeat: Infinity, duration: orb.speed, ease: 'easeInOut' }}
        />
      ))}
    </motion.div>
  );
}
