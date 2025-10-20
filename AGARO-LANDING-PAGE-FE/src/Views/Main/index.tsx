import { Element } from 'react-scroll';
import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

import MainContent from './Content/MainContent';
import FAQ from './Content/FAQ';
import HowItWorks from './Content/HowItWorks';
import KeyOfFeature from './Content/KeyOfFeature';
import Timeline from './Content/Timeline';

const MainPage = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!lenisRef.current) {
      const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
      lenisRef.current = lenis;
    }

    let frame: number;
    const raf = (time: number) => {
      lenisRef.current?.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative">
      <Element name="overview" className="relative z-0">
        <MainContent />
      </Element>
      <Element name="how-it-work" className="relative z-10">
        <HowItWorks />
      </Element>
      <Element name="features" className="relative z-10">
        <KeyOfFeature />
      </Element>
      <Element name="time-line" className="relative z-10">
        <Timeline />
      </Element>
      <Element name="FAQ" className="relative z-10">
        <FAQ />
      </Element>
    </div>
  );
};

export default MainPage;
