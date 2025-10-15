import { dashboardDark, dashboardLight } from '../../../Assets';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CustomButton } from '../../../Components/Button';
import { useRef } from 'react';
import BlurText from '../../../Components/BlurText';
import { useTheme } from '../../../lib/theme-provider';

const MainContent = () => {
  const sectionRef = useRef(null);
  const { resolvedTheme } = useTheme();

  const dashboardExample =
    resolvedTheme === 'dark' ? dashboardDark : dashboardLight;

  // Scroll progress
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Move image down as scrolling
  const translateY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  // Optional subtle glow intensity while scrolling (slightly increases glow as you scroll)
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.3, 1.6]);

  return (
    <div
      ref={sectionRef}
      className="relative h-full px-4 md:px-32 overflow-hidden z-0">
      {/* Gradient overlay background */}
      <div
        className="absolute inset-0 h-full w-full pointer-events-none z-20 rounded-lg"
        style={{
          background:
            'linear-gradient(to top, var(--gradient-from) 0%, var(--gradient-via) 70%, transparent 95%)',
        }}
      />

      <div className="flex flex-col items-center pt-24 xl:pt-40 ">
        {/* Header */}
        <BlurText
          text="Your Voice, Verified with Web3 Transparency"
          delay={20}
          animateBy="words"
          direction="top"
          className="text-3xl lg:text-4xl font-semibold mb-6 flex items-center justify-center text-center w-full 2xl:w-1/2"
        />

        {/* Description */}
        <BlurText
          text="Traditional voting systems often rely on central authorities, making them vulnerable to manipulation. AgaroVote redefines voting with blockchain - secure, transparent, and accessible to everyone."
          delay={20}
          animateBy="words"
          direction="top"
          className="text-md font-light mb-6 xl:mx-64 flex items-center justify-center text-center"
        />

        {/* Button */}
        <motion.div
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 1.5,
            ease: 'backInOut',
            delay: 0.6,
          }}
          // whileHover={{ scale: 1.05 }}
          // whileTap={{ scale: 0.7 }}
        >
          <CustomButton label="Get Started" className="mb-5" />
        </motion.div>

        {/* Dashboard Preview */}
        <div className="relative w-full flex justify-center overflow-visible mt-6">
          {/* Glow layer behind the image */}
          <motion.div
            className="absolute rounded-3xl blur-3xl"
            style={{
              y: translateY,
              opacity: glowOpacity,
              width: '60%',
              height: '60%',
              background:
                'radial-gradient(circle at center, var(--light-glow) 0%, transparent 70%)',
              zIndex: 0,
            }}
          />

          {/* Image with glow filter */}
          <motion.img
            initial={{ y: 200, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'circOut', delay: 0.8 }}
            className="relative z-10 rounded-2xl shadow-xl"
            style={{
              y: translateY,
              filter: 'drop-shadow(0 0 10px var(--light-glow))',
            }}
            src={dashboardExample}
            alt="Dashboard Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
