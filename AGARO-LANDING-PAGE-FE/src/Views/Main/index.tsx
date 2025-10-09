import { Element } from 'react-scroll';
import MainContent from './Content/MainContent';
import SecondContent from './Content/SecondContent';
import Lenis from '@studio-freight/lenis';
import { useEffect } from 'react';
import FAQ from './Content/FAQ';

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
      <Element name="main" className="relative z-0">
        <MainContent />
      </Element>
      <Element name="second" className="relative z-10">
        <SecondContent />
      </Element>
      <Element name="third" className="relative z-10">
        <FAQ />
      </Element>
    </div>
  );
};

export default MainPage;
