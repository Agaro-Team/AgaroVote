import { Element } from 'react-scroll';
import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

import MainContent from './Content/MainContent';
import FAQ from './Content/FAQ';
import HowItWorks from './Content/HowItWorks';
import KeyOfFeature from './Content/KeyOfFeature';
import Timeline from './Content/Timeline';

const MainPage = () => {
  // Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
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
