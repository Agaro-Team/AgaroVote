import { dashboardDark, dashboardLight } from '../../../Assets';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { CustomButton } from '../../../Components/Button';
import { useRef, useMemo } from 'react';
import BlurText from '../../../Components/BlurText';
import { useTheme } from '../../../lib/theme-provider';

const MainContent = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  const dashboardExample = useMemo(
    () => (resolvedTheme === 'dark' ? dashboardDark : dashboardLight),
    [resolvedTheme]
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Smoothing agar animasi tidak "patah"
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    mass: 0.8,
  });

  const translateY = useTransform(smoothScroll, [0, 1], ['0%', '100%']);
  const glowOpacity = useTransform(smoothScroll, [0, 0.5, 1], [1, 1.3, 1.6]);

  return (
    <div
      ref={sectionRef}
      className="relative h-full px-4 md:px-32 overflow-hidden z-0 will-change-transform">
      {/* Gradient overlay background */}
      <div
        className="absolute inset-0 h-full w-full pointer-events-none z-20 rounded-lg"
        style={{
          background:
            'linear-gradient(to top, var(--gradient-from) 0%, var(--gradient-via) 50%, transparent 95%)',
        }}
      />

      <div className="flex flex-col items-center pt-24 xl:pt-40">
        {/* Header */}
        <BlurText
          text="Yield with Your Voice, Powered by Web3"
          delay={20}
          animateBy="words"
          direction="top"
          className="text-3xl lg:text-4xl font-semibold mb-6 text-center flex items-center justify-center"
        />

        {/* Description */}
        <BlurText
          text="Enhances traditional voting systems by integrating Web3 technology, adding transparency, security, and value without replacing existing processes. By leveraging blockchain, AgaroVote ensures that every vote remains verifiable and tamper-proof, while maintaining the familiar structure and accessibility of current voting platforms."
          delay={20}
          animateBy="words"
          direction="top"
          className="text-md font-light mb-6 text-center w-full lg:w-[60%] flex items-center justify-center"
        />

        {/* Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}>
          <CustomButton
            label="Get Started"
            className="mb-5"
            onClick={() =>
              window.open('https://agaro-app.ardial.tech', '_blank')
            }
          />
        </motion.div>

        {/* Dashboard Preview */}
        <div className="relative w-full flex justify-center overflow-visible mt-6">
          {/* Glow behind image */}
          <motion.div
            className="absolute rounded-3xl"
            style={{
              y: translateY,
              opacity: glowOpacity,
              width: '60%',
              height: '60%',
              background:
                'radial-gradient(circle at center, var(--light-glow) 0%, transparent 70%)',
              filter: 'blur(70px)',
              zIndex: 0,
              willChange: 'transform, opacity',
            }}
          />

          {/* Dashboard image */}
          <motion.img
            initial={{ y: 200, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.7 }}
            className="relative z-10 rounded-2xl shadow-xl"
            style={{
              y: translateY,
              filter: 'drop-shadow(0 0 10px var(--light-glow))',
              willChange: 'transform',
            }}
            src={dashboardExample}
            alt="Dashboard Preview"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
