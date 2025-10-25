import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import ExperienceTicker from '../components/sections/ExperienceTicker';
import StructureSection from '../components/sections/StructureSection';
import GuidelinesSection from '../components/sections/GuidelinesSection';
import AwardsSection from '../components/sections/AwardsSection';
import PartnersSection from '../components/sections/PartnersSection';
import CallToAction from '../components/sections/CallToAction';

const hashTargets = new Set(['about', 'structure', 'guidelines', 'awards', 'partners']);

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }
    const id = location.hash.replace('#', '');
    if (!hashTargets.has(id)) {
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  return (
    <>
      <HeroSection />
      <ExperienceTicker />
      <section id="about" className="relative py-24">
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10"
          initial={{ opacity: 0, scaleY: 0.8 }}
          whileInView={{ opacity: 0.35, scaleY: 1 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-plasma/10 via-transparent to-magenta/10" />
        </motion.div>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h2 className="font-display text-3xl text-white sm:text-4xl">
                Overview
              </h2>
              <p className="mt-6 text-base text-white/70">
                The Build for Impact Hackathon is a month-long product + AI journey designed to move you from idea to MVP, with continuous guidance,
                masterclasses, and checkpoints.
              </p>
              <p className="mt-4 text-base text-white/70">
                Your squad will co-create with mentors, ship faster with AI tools, and vibe with nightly sessions that keep the energy high.
                Expect launch rehearsals, Product Hunt superfans, and a launch runway for every team.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-holo backdrop-blur-xl"
            >
              <motion.div whileHover={{ y: -6 }} className="rounded-2xl border border-white/10 bg-black/40 p-6 transition">
                <h3 className="text-sm uppercase tracking-[0.4em] text-white/60">Hosted Harmonics</h3>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  <motion.li whileHover={{ x: 6 }}>Immersive masterclasses, nightly jams, critiques inside a neon studio.</motion.li>
                  <motion.li whileHover={{ x: 6 }}>Dedicated expert feedback sessions and 50 Emergent credits to co-build smarter solutions.</motion.li>
                  <motion.li whileHover={{ x: 6 }}>Soft-launch bar, Product Hunt rehearsals, and spotlight features for standout teams.</motion.li>
                </ul>
              </motion.div>
              <motion.div whileHover={{ y: -6 }} className="rounded-2xl border border-white/10 bg-black/40 p-6 transition">
                <h3 className="text-sm uppercase tracking-[0.4em] text-white/60">What you&apos;ll leave with</h3>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  <motion.li whileHover={{ x: 6 }}>Launch-ready MVP crafted with real user insight.</motion.li>
                  <motion.li whileHover={{ x: 6 }}>Product & AI frameworks embedded into your crew&apos;s muscle memory.</motion.li>
                  <motion.li whileHover={{ x: 6 }}>A hype reel of stories, design artefacts, and traction to show the world.</motion.li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      <StructureSection />
      <GuidelinesSection />
      <AwardsSection />
      <PartnersSection />
      <CallToAction />
    </>
  );
}
