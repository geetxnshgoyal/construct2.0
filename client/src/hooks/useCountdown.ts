import { useEffect, useState } from 'react';

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const computeRemaining = (target: Date): CountdownState => {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
};

export const useCountdown = (targetDate: string | Date) => {
  const [target] = useState(() => (targetDate instanceof Date ? targetDate : new Date(targetDate)));
  const [remaining, setRemaining] = useState<CountdownState>(() => computeRemaining(target));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(computeRemaining(target));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [target]);

  const isComplete = remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0;

  return { remaining, isComplete };
};
