import { useEffect, useState } from 'react';
import BlurText from '../../../Components/BlurText';
import { example1 } from '../../../Assets';
import { motion } from 'motion/react';

const dataFeature = [
  {
    id: 1,
    feature: 'Secure',
    Title: 'Blockchain-Powered Voting Security',
    Desc: 'Every vote is encrypted and recorded on the blockchain, ensuring results cannot be altered or tampered with by any third party.',
    image: example1,
    iconTitle: '🔐',
  },
  {
    id: 2,
    feature: 'Transparent',
    Title: 'Fully Transparent Voting Results',
    Desc: 'All participants can verify the voting outcome in real time without compromising privacy, thanks to AgaroVote’s public verification system.',
    image: example1,
    iconTitle: '📊',
  },
  {
    id: 3,
    feature: 'Decentralized',
    Title: 'Decentralized Digital Identity',
    Desc: 'Each voter owns a unique and secure digital identity that operates independently of any central authority, preserving the integrity of the voting process.',
    image: example1,
    iconTitle: '🪪',
  },
  {
    id: 4,
    feature: 'Real-Time',
    Title: 'Live Analytics and Insights',
    Desc: 'Monitor participation, voting trends, and live results in real time with dynamic charts and insightful data visualizations.',
    image: example1,
    iconTitle: '📈',
  },
];

const KeyOfFeature = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const duration = 6000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % dataFeature.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [activeIndex, duration]);

  const handleFeatureClick = (index: number) => {
    setActiveIndex(index);
  };

  const activeItem = dataFeature[activeIndex];

  return (
    <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden ">
      <BlurText
        text="Core Features of AgaroVote"
        delay={20}
        animateBy="words"
        direction="bottom"
        className="text-3xl lg:text-4xl font-semibold mb-6 flex items-center justify-center text-center w-full 2xl:w-1/2"
      />
      <div className="md:max-w-5xl xl:max-w-6xl mx-5 ">
        <div className="bg-muted/50 flex flex-col md:flex-row gap-2  md:gap-1 mb-2">
          {dataFeature.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <>
                <div
                  key={item.id}
                  onClick={() => handleFeatureClick(index)}
                  className={`relative flex gap-3 rounded-xl overflow-hidden transition-all duration-700 ease-in-out
                ${isActive ? 'flex-[1]' : 'flex-[0.6]'}
                bg-[var(--muted)] px-3 py-4`}>
                  {isActive && (
                    <div
                      key={`anim-${activeIndex}`}
                      className="absolute top-0 left-0 h-full w-full bg-[var(--card)] animate-slide-ltr"
                    />
                  )}

                  <div className="relative z-10 text-base lg:text-md xl:text-lg flex items-center justify-center gap-x-1 lg:gap-x-2">
                    <div>{item.iconTitle}</div>
                    <div>{item.feature}</div>
                  </div>
                </div>

                {/* CONTENT MOBILE VER */}
                {isActive && (
                  <div className="md:hidden bg-[var(--card)] rounded-b-2xl  -mt-4 relative">
                    <motion.div
                      key={`text-${activeIndex}`}
                      className="flex-1 p-10 "
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.5, ease: 'linear' }}>
                      <BlurText
                        text={activeItem.Title}
                        delay={2}
                        animateBy="words"
                        direction="left"
                        width="100%"
                        className="text-xl md:text-2xl font-bold mb-2 text-foreground"
                      />
                      <BlurText
                        text={activeItem.Desc}
                        delay={2}
                        animateBy="words"
                        direction="left"
                        width="100%"
                        className="text-muted-foreground text-base leading-relaxed font-light"
                      />
                    </motion.div>

                    <motion.div
                      key={`image-${activeIndex}`}
                      className="flex-1 relative"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.7, ease: 'linear' }}>
                      <motion.img
                        src={activeItem.image}
                        alt={activeItem.Title}
                        className=""
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                      />
                    </motion.div>
                  </div>
                )}
              </>
            );
          })}
        </div>

        {/* CONTENT DEKSTOP VER */}
        <div className="hidden md:flex bg-[var(--card)] backdrop-blur-3xl rounded-xl h-[500px] 2xl:h-[60dvh] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:rounded-xl">
          <motion.div
            key={`text-${activeIndex}`}
            className="flex-1 px-20 py-24 lg:px-32  "
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5, ease: 'linear' }}>
            <BlurText
              text={activeItem.Title}
              delay={2}
              animateBy="words"
              direction="left"
              width="100%"
              className="text-4xl font-bold mb-6 text-foreground text-start"
            />

            <BlurText
              text={activeItem.Desc}
              delay={2}
              animateBy="words"
              width="100%"
              direction="left"
              className="text-muted-foreground text-lg font-light animate-fade-in text-start"
            />
          </motion.div>

          <motion.div
            key={`image-${activeIndex}`}
            className="flex-1 relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.8, ease: 'linear' }}>
            <motion.img
              src={activeItem.image}
              alt={activeItem.Title}
              className="absolute bottom-0 right-0 w-full max-w-md object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default KeyOfFeature;
