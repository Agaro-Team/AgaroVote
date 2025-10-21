/**
 * Timeline Component
 *
 * A modern, interactive timeline component that displays the AgaroVote voting process
 * with scroll-based animations and smooth transitions.
 *
 * Features:
 * - Scroll-triggered animations for cards and dots
 * - Alternating card layout (left/right)
 * - Animated vertical timeline with progress indicator
 * - Hover effects on timeline cards
 * - Pulse animations on timeline dots
 * - Responsive design for all screen sizes
 * - Theme-aware styling using CSS variables
 *
 * Animation Details:
 * - Cards fade in with 3D rotation effect as user scrolls
 * - Dots scale and pulse with staggered timing
 * - Vertical line grows progressively based on scroll position
 * - Arrow pseudo elements point from cards to timeline dots
 * - Alternating card layout with directional arrows
 *
 * @component
 * @returns {JSX.Element} Timeline component with voting process steps
 */

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from 'framer-motion';
import BlurText from '../../../Components/BlurText';
import { useRef } from 'react';

/**
 * Interface for timeline item data structure
 */
interface TimelineItem {
  id: number;
  title: string;
  list: {
    desc: string;
  }[];
  icon: string;
}

const Timeline = () => {
  const timelineRef = useRef(null);

  /**
   * Scroll progress tracking for the entire timeline
   * Tracks from when timeline starts entering viewport until it exits
   */
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start end', 'end start'],
  });

  /**
   * Individual scroll-based transforms for each timeline item
   * Each item has different scroll trigger points for staggered animations
   *
   * Transform Types:
   * - cardOpacity: Fade in/out based on scroll position
   * - cardY: Vertical slide animation (starts 50px below, moves to 0)
   * - cardRotateX: 3D rotation effect (starts at 45deg, rotates to 0deg)
   * - dotScale: Scale animation for timeline dots (0.5 → 1.2 → 1.1 → 1)
   * - dotOpacity: Fade in animation for dots
   * - connectorOpacity: Fade in animation for connecting lines
   */

  // Timeline Item 0 (Step 1) - Vote Registration
  const card0Opacity = useTransform(
    scrollYProgress,
    [0.1, 0.15, 0.8], // Scroll positions: 10%, 15%, 80%
    [0, 1, 1] // Opacity values: invisible → visible → visible
  );
  const card0Y = useTransform(scrollYProgress, [0.1, 0.15], [50, 0]); // Slide up 50px
  const card0RotateX = useTransform(scrollYProgress, [0.1, 0.15], [45, 0]); // 3D rotation
  const dot0Scale = useTransform(
    scrollYProgress,
    [0.1, 0.15, 0.2, 0.25], // Multiple scroll points
    [0.5, 1.2, 1.1, 1] // Scale: small → big → medium → normal
  );
  const dot0Opacity = useTransform(scrollYProgress, [0.1, 0.15], [0, 1]); // Fade in
  const connector0Opacity = useTransform(
    scrollYProgress,
    [0.1, 0.2, 0.3],
    [0, 1, 1]
  );

  // Timeline Item 1 (Step 2) - Identity Verification
  const card1Opacity = useTransform(
    scrollYProgress,
    [0.3, 0.35, 0.85], // Triggered at 30-35% scroll
    [0, 1, 1]
  );
  const card1Y = useTransform(scrollYProgress, [0.3, 0.35], [50, 0]);
  const card1RotateX = useTransform(scrollYProgress, [0.3, 0.35], [45, 0]);
  const dot1Scale = useTransform(
    scrollYProgress,
    [0.3, 0.35, 0.4, 0.45],
    [0.5, 1.2, 1.1, 1]
  );
  const dot1Opacity = useTransform(scrollYProgress, [0.3, 0.35], [0, 1]);
  const connector1Opacity = useTransform(
    scrollYProgress,
    [0.3, 0.4, 0.5],
    [0, 1, 1]
  );

  // Timeline Item 2 (Step 3) - Secure Voting
  const card2Opacity = useTransform(
    scrollYProgress,
    [0.5, 0.55, 0.9], // Triggered at 50-55% scroll
    [0, 1, 1]
  );
  const card2Y = useTransform(scrollYProgress, [0.5, 0.55], [50, 0]);
  const card2RotateX = useTransform(scrollYProgress, [0.5, 0.55], [45, 0]);
  const dot2Scale = useTransform(
    scrollYProgress,
    [0.5, 0.55, 0.6, 0.65],
    [0.5, 1.2, 1.1, 1]
  );
  const dot2Opacity = useTransform(scrollYProgress, [0.5, 0.55], [0, 1]);
  const connector2Opacity = useTransform(
    scrollYProgress,
    [0.5, 0.6, 0.7],
    [0, 1, 1]
  );

  // Timeline Item 3 (Step 4) - Transparent Results
  const card3Opacity = useTransform(
    scrollYProgress,
    [0.7, 0.75, 0.95], // Triggered at 70-75% scroll
    [0, 1, 1]
  );
  const card3Y = useTransform(scrollYProgress, [0.7, 0.75], [50, 0]);
  const card3RotateX = useTransform(scrollYProgress, [0.7, 0.75], [45, 0]);
  const dot3Scale = useTransform(
    scrollYProgress,
    [0.7, 0.75, 0.8, 0.85],
    [0.5, 1.2, 1.1, 1]
  );
  const dot3Opacity = useTransform(scrollYProgress, [0.7, 0.75], [0, 1]);

  /**
   * Timeline data array containing the 4-step voting process
   * Each item represents a step in the AgaroVote workflow
   */
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
      icon: '📝',
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
      icon: '🔐',
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
      icon: '🗳️',
    },
    {
      id: 4,
      title: 'Beyond',
      list: [
        { desc: 'zk-circuit support for whitelisting billions of addresses.' },
        {
          desc: 'SDK for developers to easily integrate AgaroVote.',
        }, {
          desc: 'AI-powered fraud detection – Automatically detect and flag suspicious voting behaviors or anomalies using on-chain and off-chain signals.',
        }, {
          desc: 'Full Account Abstraction Identity – Sign votes with your verified decentralized identity; no wallet management needed.',
        }, {
          desc: 'And many more....',
        },
      ],
      icon: '📊',
    },
  ];

  /**
   * Helper function to get the appropriate transform values for each timeline item
   * Returns the pre-calculated transform values based on the item index
   *
   * @param {number} index - The index of the timeline item (0-3)
   * @returns {Object} Object containing all transform values for the item
   */
  const getItemTransforms = (index: number) => {
    switch (index) {
      case 0:
        return {
          cardOpacity: card0Opacity,
          cardY: card0Y,
          cardRotateX: card0RotateX,
          dotScale: dot0Scale,
          dotOpacity: dot0Opacity,
          connectorOpacity: connector0Opacity,
        };
      case 1:
        return {
          cardOpacity: card1Opacity,
          cardY: card1Y,
          cardRotateX: card1RotateX,
          dotScale: dot1Scale,
          dotOpacity: dot1Opacity,
          connectorOpacity: connector1Opacity,
        };
      case 2:
        return {
          cardOpacity: card2Opacity,
          cardY: card2Y,
          cardRotateX: card2RotateX,
          dotScale: dot2Scale,
          dotOpacity: dot2Opacity,
          connectorOpacity: connector2Opacity,
        };
      case 3:
        return {
          cardOpacity: card3Opacity,
          cardY: card3Y,
          cardRotateX: card3RotateX,
          dotScale: dot3Scale,
          dotOpacity: dot3Opacity,
          connectorOpacity: 0, // Last item has no connector
        };
      default:
        return {
          cardOpacity: 1,
          cardY: 0,
          cardRotateX: 0,
          dotScale: 1,
          dotOpacity: 1,
          connectorOpacity: 0,
        };
    }
  };

  return (
    <div
      ref={timelineRef}
      className="relative pt-28 md:pt-40 py-24 px-4 md:px-10 lg:px-32 overflow-hidden ">
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <BlurText
            text="Our Road Map"
            delay={20}
            animateBy="words"
            direction="top"
            className="sm:text-3xl text-2xl font-semibold mb-6 flex items-center justify-center text-center "
          />
        </div>

        {/* Timeline */}
        <div className="relative lg:max-w-5xl lg:mx-auto px-4 ">
          {/* Timeline line (responsif) */}
          {/* Glow effect */}
          <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-0.5 h-full bg-[var(--muted)] rounded-full blur-sm" />
          {/* Main line */}
          <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-1 h-full bg-[var(--muted)] rounded-full" />

          {/* Timeline items */}
          <div className="space-y-16 ">
            <AnimatePresence mode="wait">
              {timelineData.map((item, index) => {
                const transforms = getItemTransforms(index);

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
                    className={`relative flex md:items-center items-start ${index % 2 === 0
                      ? 'md:flex-row md:mr-6 flex-row '
                      : 'md:flex-row-reverse md:ml-6 flex-row'
                      }`}>
                    {/* Card */}
                    <div
                      className={`w-full md:max-w-[50%] ${index % 2 === 0 ? 'md:pr-7' : 'md:pl-7'
                        } pl-10`}>
                      <motion.div
                        className={`relative p-6 rounded-xl bg-[var(--card)] backdrop-blur-3xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:rounded-xl timeline-arrow-left ${index % 2 === 0 ? 'md-arrow-right' : 'md-arrow-left'
                          }  `}
                        style={{
                          opacity: transforms.cardOpacity,
                          y: transforms.cardY,
                          rotateX: transforms.cardRotateX,
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
                                text={lists.desc || '-'}
                                delay={keyLists * 100}
                                animateBy="words"
                                direction="left"
                              />
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>

                    {/* Timeline Dot */}
                    <motion.div
                      className="absolute md:relative -left-2.5 md:left-auto top-1/2 -translate-y-1/2 md:-translate-y-[calc(-50%+14px)] z-10 bg-[var(--primary)] flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        scale: transforms.dotScale,
                        opacity: transforms.dotOpacity,
                      }}>
                      <motion.div
                        className="absolute inset-0.5 bg-[var(--primary)] rounded-full"
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.8, 0, 0.8],
                        }}
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
