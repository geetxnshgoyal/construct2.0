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
import PixelEdge from '../components/ui/PixelEdge';

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
      <PixelEdge top="paper" bottom="alt" seed={1} />
      <TracksSection />
      <PixelEdge top="alt" bottom="paper" seed={2} />
      <TimelineSection />
      <PixelEdge top="paper" bottom="alt" seed={4} />
      <JudgingSection />
      <PixelEdge top="alt" bottom="paper" seed={5} />
      <RulesSection />
      <PixelEdge top="paper" bottom="alt" seed={6} />
      <PrizesSection />
      <PartnersSection />
    </>
  );
}
