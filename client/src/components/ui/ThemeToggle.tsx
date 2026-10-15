import { useEffect } from 'react';
import { THEME_STORAGE_KEY, useTheme, type Theme } from '../../hooks/useTheme';

const GRID = 8;
const cells = Array.from({ length: GRID * GRID }, (_, index) => ({ x: index % GRID, y: Math.floor(index / GRID) }));

// Crescent: inside one circle, outside an offset one.
const moon = cells.filter(({ x, y }) => {
  const cx = x + 0.5;
  const cy = y + 0.5;
  return Math.hypot(cx - 4, cy - 4) <= 3.6 && Math.hypot(cx - 5.8, cy - 2.6) > 2.9;
});

const sunRays = ['3,0', '4,0', '0,3', '0,4', '7,3', '7,4', '3,7', '4,7', '1,1', '6,1', '1,6', '6,6'];
const sun = cells.filter(({ x, y }) => {
  const core = x >= 2 && x <= 5 && y >= 2 && y <= 5 && !((x === 2 || x === 5) && (y === 2 || y === 5));
  return core || sunRays.includes(`${x},${y}`);
});

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new CustomEvent('construct-theme-change', { detail: theme }));
};

const readStored = (): Theme | null => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
};

export default function ThemeToggle() {
  const theme = useTheme();
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  // Follow the system setting until the visitor picks a theme themselves.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (!readStored()) applyTheme(event.matches ? 'dark' : 'light');
    };
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const toggle = () => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage blocked: the toggle still works for this visit.
    }
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <svg viewBox={`0 0 ${GRID} ${GRID}`} className="h-4 w-4" shapeRendering="crispEdges" aria-hidden="true">
        {(theme === 'dark' ? sun : moon).map(({ x, y }) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
        ))}
      </svg>
    </button>
  );
}
