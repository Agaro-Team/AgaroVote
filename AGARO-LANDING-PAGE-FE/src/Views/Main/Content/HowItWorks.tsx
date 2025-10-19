import BlurText from '../../../Components/BlurText';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

const HowItWorks = () => {
  const dataStep = [
    {
      id: 1,
      title: 'Connect Wallet',
      desc: 'Sign in using your crypto wallet.',
    },
    {
      id: 2,
      title: 'Choose Proposal',
      desc: 'Browse active voting pools.',
    },
    {
      id: 3,
      title: 'Cast Your Vote',
      desc: 'Select your choice securely.',
    },
    {
      id: 4,
      title: 'Earn Reward',
      desc: 'Receive incentives via synthetic staking.',
    },
  ];

  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.25,
  });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  return (
    <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center pt-28 xl:pt-40 ">
        {/* Judul */}
        <BlurText
          text="How It Works"
          delay={10}
          animateBy="letters"
          direction="bottom"
          className="sm:text-3xl text-2xl font-semibold mb-6 flex items-center justify-center "
        />
        <BlurText
          text="Every vote is securely encrypted, recorded on blockchain, and impossible to manipulate - ensuring full transparency and trust."
          delay={10}
          animateBy="words"
          direction="bottom"
          className="text-md font-light mb-6 w-[80%] flex items-center justify-center text-center"
        />
      </div>

      {/* STEP */}
      <div className="relative grid grid-cols-2 md:grid-cols-4 w-full lg:w-[80%] xl:w-[70%] gap-10 md:gap-0 pb-24 xl:pb-40 ">
        {dataStep.map((item, index) => {
          return (
            <motion.div
              ref={ref}
              key={item.id}
              className="relative flex flex-col items-center text-center p-4 h-full min-h-[200px] gap-y-2"
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 60, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.6,
                    delay: index * 0.2,
                    ease: [0.25, 0.1, 0.25, 1],
                  },
                },
              }}>
              {index < dataStep.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.3,
                    ease: 'easeOut',
                  }}
                  className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[3px] bg-[var(--primary)] origin-left opacity-50"
                />
              )}

              {/* Lingkaran step */}
              <motion.div
                className="bg-[var(--primary)] rounded-full w-14 md:w-16 h-14 md:h-16 flex items-center justify-center text-white text-xl font-bold mb-3 relative z-10"
                style={{
                  filter: 'drop-shadow(0 0 10px var(--light-glow))',
                }}
                variants={{
                  hidden: { scale: 0, rotate: 90 },
                  visible: {
                    scale: 1,
                    rotate: 0,
                    transition: { type: 'spring', stiffness: 120 },
                  },
                }}>
                {item.id}
              </motion.div>

              {/* Judul */}
              <motion.div
                className="text-[16px] font-bold"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.3 + index * 0.2 },
                  },
                }}>
                {item.title}
              </motion.div>

              {/* Deskripsi */}
              <motion.div
                className="text-[13px] max-w-[180px] leading-snug break-words text-muted-foreground font-medium"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.4 + index * 0.2 },
                  },
                }}>
                {item.desc}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* <div className="flex gap-x-10 justify-center h-auto mt-10 mb-10 ">
        {DataContent.map((item, index) => (
          <div
            key={index}
            className="relative z-10 px-8 py-5 rounded-xl border shadow-[0_4px_30px_rgba(0,0,0,0.1)] w-1/4 overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300"
            style={{ borderColor: 'var(--border)' }}>
            <div className="relative z-10">
              <p
                className="text-lg font-semibold mb-5"
                style={{ color: 'var(--primary)' }}>
                {item.title}
              </p>
              <p className="text-md font-semibold text-[var(--foreground)]">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div> */}

      {/* <div className="flex flex-col items-center justify-center ">
        <BlurText
          text="Choose the voting mode that fits your community’s needs."
          delay={10}
          animateBy="letters"
          direction="bottom"
          className="text-2xl font-medium mx-6 text-center"
        />
      </div> */}
    </div>
  );
};

export default HowItWorks;
