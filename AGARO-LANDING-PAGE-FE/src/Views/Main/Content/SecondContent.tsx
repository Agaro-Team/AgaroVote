import { motion } from 'motion/react';
import { fadeInUpBlur, staggerContainer } from '../../../Animation/variant';

const SecondContent = () => {
  const text =
    'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aspernatur placeat fugiat numquam enim, tempora aut molestiae ea corporis expedita!';
  return (
    <div className="h-screen flex items-center justify-center bg-fuchsia-400">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="text-lg leading-relaxed">
        {text.split(' ').map((word, index) => (
          <motion.span
            key={index}
            variants={fadeInUpBlur}
            className="inline-block mr-1">
            {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default SecondContent;
