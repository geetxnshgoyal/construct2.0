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
        sky: '#6ea8fe',
        cosmos: '#050714',
        neon: '#00f5ff',
        magenta: '#ff007f',
        sunset: '#ff7a00',
        plasma: '#5a8bff',
        ember: '#ffae00',
        midnight: '#020412'
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
        bounceSlow: 'bounceSlow 6s ease-in-out infinite',
        'slow-spin': 'spin 14s linear infinite',
        'pulse-glow': 'pulseGlow 6s ease-in-out infinite',
        floaty: 'floaty 12s ease-in-out infinite',
        'orbit-slow': 'orbit 28s linear infinite',
        'orbit-fast': 'orbit 18s linear infinite',
        'glow-pulse': 'glowPulse 5s ease-in-out infinite',
        'float-slow': 'floatSlow 16s ease-in-out infinite',
        'rise-loop': 'rise 14s ease-in-out infinite'
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
          '0%': { strokeDashoffset: '16' },
          '100%': { strokeDashoffset: '0' }
        },
        floatNote: {
          '0%, 100%': { transform: 'translateY(-12px) rotate(-1deg)' },
          '50%': { transform: 'translateY(6px) rotate(2deg)' }
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.45', filter: 'blur(18px)' },
          '50%': { opacity: '0.85', filter: 'blur(12px)' }
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(-6px) rotate(-1deg)' },
          '50%': { transform: 'translateY(6px) rotate(1deg)' }
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', filter: 'blur(20px)' },
          '50%': { opacity: '1', filter: 'blur(10px)' }
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(-12px)' },
          '50%': { transform: 'translateY(12px)' }
        },
        rise: {
          '0%': { transform: 'translateY(18px)', opacity: '0.2' },
          '50%': { transform: 'translateY(-8px)', opacity: '0.7' },
          '100%': { transform: 'translateY(18px)', opacity: '0.2' }
        }
        
      },
      boxShadow: {
        card: '6px 6px 0 rgba(0,0,0,0.15)',
        insetNote: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
        holo: '0 20px 60px rgba(0, 245, 255, 0.15)',
        neon: '0 0 30px rgba(255, 0, 127, 0.4)',
        plasma: '0 40px 90px rgba(90, 139, 255, 0.3)'
      },
      backgroundImage: {
        notebook:
          'linear-gradient(transparent 95%, rgba(0,0,0,0.08) 96%), repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 160px)',
        tape: 'linear-gradient(120deg, rgba(255,223,186,0.6) 0%, rgba(255,223,186,0) 60%)',
        cosmic:
          'radial-gradient(circle at 20% 20%, rgba(255, 122, 0, 0.08), transparent 55%), radial-gradient(circle at 80% 10%, rgba(0, 245, 255, 0.2), transparent 60%), radial-gradient(circle at 50% 90%, rgba(255, 0, 127, 0.1), transparent 55%)',
        grid:
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};

export default config;
