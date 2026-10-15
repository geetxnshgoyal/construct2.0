import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import FunnelSection from '../components/sections/FunnelSection';
import TracksSection from '../components/sections/TracksSection';
import TimelineSection from '../components/sections/TimelineSection';
import JudgingSection from '../components/sections/JudgingSection';
import RulesSection from '../components/sections/RulesSection';
import PrizesSection from '../components/sections/PrizesSection';
import PartnersSection from '../components/sections/PartnersSection';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }
    const element = document.getElementById(location.hash.slice(1));
    if (element) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }, [location.hash]);

  return (
    <>
      <HeroSection />
      <FunnelSection />
      <TracksSection />
      <TimelineSection />
      <JudgingSection />
      <RulesSection />
      <PrizesSection />
      <PartnersSection />
    </>
  );
}
