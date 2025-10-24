/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Timeline Component (Optimized)
 *
 * - Modern scroll-based roadmap timeline for AgaroVote
 * - Smooth scroll-triggered animation with Framer Motion
 * - Responsive alternating layout (left/right)
 * - Pulse dot animation & blurred card glow
 *
 * @component
 */

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useRef } from 'react';
import BlurText from '../../../Components/BlurText';

interface TimelineItem {
  id: number;
  title: string;
  list: { desc: string }[];
}

const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: 'Q4 2025',
    list: [
      { desc: 'MVP on Sepolia Testnet.' },
      { desc: 'Synthetic reward for every vote.' },
      { desc: 'Whitelisted address with MerkleTree.' },
      { desc: 'Data integrity powered by blockchain.' },
    ],
  },
  {
    id: 2,
    title: 'Q1 2026',
    list: [
      { desc: 'MVP on Ethereum.' },
      { desc: 'Data availability with IPFS.' },
      { desc: 'Vote with Multi-token support.' },
      { desc: 'Node service RPC dedicated for Agaro.' },
    ],
  },
  {
    id: 3,
    title: 'Q2 2026',
    list: [
      { desc: 'Multi-chain support.' },
      { desc: 'Platform fee integration.' },
      { desc: 'Fee-less vote with EIP-4337 (Account Abstraction).' },
      { desc: 'Customizable reward token.' },
      { desc: 'Customizable reward style.' },
    ],
  },
  {
    id: 4,
    title: 'Beyond',
    list: [
      { desc: 'zk-circuit support for whitelisting billions of addresses.' },
      { desc: 'SDK for developers to easily integrate AgaroVote.' },
      {
        desc: 'AI-powered fraud detection – Detect & flag suspicious behaviors using on-chain/off-chain data.',
      },
      {
        desc: 'Full Account Abstraction Identity – Sign votes with verified decentralized identity.',
      },
      { desc: 'And many more...' },
    ],
  },
];

const Timeline = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of entire timeline
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start end', 'end start'],
  });

  // Generate motion transforms dynamically for each item
  const transforms = timelineData.map((_, i) => {
    const base = 0.2 * i; // offset
    return {
      cardOpacity: useTransform(scrollYProgress, [base, base + 0.1], [0, 1]),
      cardY: useTransform(scrollYProgress, [base, base + 0.1], [50, 0]),
      cardRotateX: useTransform(scrollYProgress, [base, base + 0.1], [45, 0]),
      dotScale: useTransform(
        scrollYProgress,
        [base, base + 0.05, base + 0.1],
        [0.5, 1.2, 1]
      ),
      dotOpacity: useTransform(scrollYProgress, [base, base + 0.1], [0, 1]),
    };
  });

  return (
    <div
      ref={timelineRef}
      className="relative pt-28 md:pt-40 py-24 px-4 md:px-10 lg:px-32 overflow-hidden">
      <div className="relative z-10">
        <div className="text-center mb-16">
          <BlurText
            text="Our Road Map"
            delay={20}
            animateBy="words"
            direction="top"
            className="sm:text-3xl text-2xl font-semibold mb-6 flex justify-center"
          />
        </div>

        <div className="relative lg:max-w-5xl lg:mx-auto px-4">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-1 h-full bg-[var(--muted)] rounded-full" />
          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-0.5 h-full bg-[var(--muted)] rounded-full blur-sm" />

          <div className="space-y-16">
            <AnimatePresence mode="wait">
              {timelineData.map((item, index) => {
                const t = transforms[index];
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.2,
                      ease: 'easeOut',
                    }}
                    viewport={{ once: true, amount: 0.3 }}
                    className={`relative flex md:items-center ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}>
                    {/* Card */}
                    <div
                      className={`w-full md:max-w-[50%] md:-mt-4 ${
                        isEven ? 'md:pr-7 pl-10' : 'md:pl-7 pl-10'
                      }`}>
                      {/* Glow effect */}
                      <motion.div
                        className="absolute rounded-3xl"
                        style={{
                          width: '40%',
                          height: '30%',
                          background:
                            'radial-gradient(circle at center, var(--light-glow) 0%, transparent 70%)',
                          filter: 'blur(70px)',
                          zIndex: 0,
                          bottom: '30%',
                          opacity: t.cardOpacity,
                        }}
                      />

                      <motion.div
                        className={`p-6 rounded-xl bg-[var(--card)] backdrop-blur-xl relative overflow-visible
                        timeline-arrow-left
                        md:${
                          isEven
                            ? 'timeline-arrow-right'
                            : 'timeline-arrow-left'
                        }
                      `}
                        style={{
                          opacity: t.cardOpacity,
                          y: t.cardY,
                          rotateX: t.cardRotateX,
                        }}>
                        <BlurText
                          text={item.title}
                          delay={2}
                          animateBy="words"
                          direction="left"
                          width="100%"
                          className="text-2xl font-semibold mb-3 text-card-foreground"
                        />
                        <ul className="text-muted-foreground leading-relaxed list-disc ml-5 text-sm">
                          {item.list.map((lists, keyLists) => (
                            <li key={keyLists}>
                              <BlurText
                                text={lists.desc}
                                delay={keyLists * 100}
                                animateBy="words"
                                direction="left"
                              />
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>

                    {/* Dot */}
                    <motion.div
                      className="absolute md:relative -left-2.5 md:left-auto top-1/2 -translate-y-1/2 z-10 bg-[var(--primary)] flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        scale: t.dotScale,
                        opacity: t.dotOpacity,
                      }}>
                      <motion.div
                        className="absolute inset-0.5 bg-[var(--primary)] rounded-full"
                        animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
