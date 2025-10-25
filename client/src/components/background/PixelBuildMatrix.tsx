import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

type PixelBuildMatrixProps = {
  variant: 'light' | 'dark';
};

type Pixel = {
  id: number;
  top: number;
  left: number;
  delay: number;
};

const ROWS = 6;
const COLS = 10;

const generatePixels = (): Pixel[] => {
  const pixels: Pixel[] = [];
  let id = 0;
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const baseTop = 18 + row * 10;
      const baseLeft = 10 + col * 9;
      const jitterSeed = Math.sin((row + 1) * (col + 2) * 12.345);
      const jitterX = (jitterSeed % 1) * 4 - 2;
      const jitterY = ((Math.cos((row + 3) * (col + 5) * 7.89) % 1) * 4) - 2;
      const top = baseTop + jitterY;
      const left = baseLeft + jitterX;
      const delay = (row + col * 0.35) * 0.14;
      pixels.push({ id, top, left, delay });
      id += 1;
    }
  }

  return pixels.sort((a, b) => a.delay - b.delay);
};

export default function PixelBuildMatrix({ variant }: PixelBuildMatrixProps) {
  const [showMatrix, setShowMatrix] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 640));

  useEffect(() => {
    const handleResize = () => {
      setShowMatrix(window.innerWidth >= 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!showMatrix) {
    return null;
  }

  const pixels = useMemo(() => generatePixels(), []);
  const size = variant === 'dark' ? 16 : 12;
  const color =
    variant === 'dark'
      ? 'linear-gradient(135deg, rgba(0,245,255,0.45), rgba(255,0,127,0.25))'
      : 'linear-gradient(135deg, rgba(255,112,67,0.35), rgba(90,168,151,0.25))';
  const glow = variant === 'dark' ? '0 0 14px rgba(0,245,255,0.35)' : '0 0 10px rgba(0,0,0,0.06)';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pixels.map((pixel) => (
        <motion.span
          key={pixel.id}
          className="absolute"
          style={{
            top: `${pixel.top}%`,
            left: `${pixel.left}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: color,
            boxShadow: glow,
            borderRadius: variant === 'dark' ? '4px' : '3px'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 1, 1], opacity: [0, 0.8, 0.6, 0.7] }}
          transition={{ delay: pixel.delay, duration: 1.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
