import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#111315',
        paper: '#f8f5ec',
        ink: '#1d1a16',
        accent: '#ff7043',
        accentAlt: '#ffd166',
        seafoam: '#5aa897',
        sky: '#6ea8fe'
      },
      fontFamily: {
        sans: ['"Work Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Permanent Marker"', '"Work Sans"', 'cursive'],
        note: ['"Shadows Into Light"', 'cursive']
      },
      animation: {
        marquee: 'marquee 24s linear infinite',
        wiggle: 'wiggle 3s ease-in-out infinite',
        scribble: 'scribble 12s linear infinite',
        floatNote: 'floatNote 8s ease-in-out infinite',
        bounceSlow: 'bounceSlow 6s ease-in-out infinite'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1.5deg)' },
          '50%': { transform: 'rotate(1.5deg)' }
        },
        scribble: {
          '0%': { strokeDashoffset: 16 },
          '100%': { strokeDashoffset: 0 }
        },
        floatNote: {
          '0%, 100%': { transform: 'translateY(-12px) rotate(-1deg)' },
          '50%': { transform: 'translateY(6px) rotate(2deg)' }
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      boxShadow: {
        card: '6px 6px 0 rgba(0,0,0,0.15)',
        insetNote: 'inset 0 0 0 1px rgba(0,0,0,0.08)'
      },
      backgroundImage: {
        notebook:
          'linear-gradient(transparent 95%, rgba(0,0,0,0.08) 96%), repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 160px)',
        tape: 'linear-gradient(120deg, rgba(255,223,186,0.6) 0%, rgba(255,223,186,0) 60%)'
      }
    }
  },
  plugins: []
};

export default config;
