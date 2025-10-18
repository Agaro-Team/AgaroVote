import { motion } from 'motion/react';
import type { Transition, Easing } from 'motion/react';
import { useEffect, useRef, useState, useMemo } from 'react';

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom' | 'left' | 'right';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: Easing | Easing[];
  onAnimationComplete?: () => void;
  stepDuration?: number;
  width?: string | number;
};

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> => {
  const keys = new Set<string>([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);

  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
};

const BlurText: React.FC<BlurTextProps> = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (t: number) => t,
  onAnimationComplete,
  stepDuration = 0.35,
  width,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(() => {
    switch (direction) {
      case 'top':
        return { filter: 'blur(10px)', opacity: 0, y: -50, x: 0 };
      case 'bottom':
        return { filter: 'blur(10px)', opacity: 0, y: 50, x: 0 };
      case 'left':
        return { filter: 'blur(10px)', opacity: 0, x: -50, y: 0 };
      case 'right':
        return { filter: 'blur(10px)', opacity: 0, x: 50, y: 0 };
      default:
        return { filter: 'blur(10px)', opacity: 0, y: -50, x: 0 };
    }
  }, [direction]);

  const defaultTo = useMemo(() => {
    const getIntermediatePosition = () => {
      switch (direction) {
        case 'top':
          return { y: 5, x: 0 };
        case 'bottom':
          return { y: -5, x: 0 };
        case 'left':
          return { x: 5, y: 0 };
        case 'right':
          return { x: -5, y: 0 };
        default:
          return { y: 5, x: 0 };
      }
    };

    const getFinalPosition = () => {
      switch (direction) {
        case 'top':
        case 'bottom':
          return { y: 0, x: 0 };
        case 'left':
        case 'right':
          return { x: 0, y: 0 };
        default:
          return { y: 0, x: 0 };
      }
    };

    return [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        ...getIntermediatePosition(),
      },
      {
        filter: 'blur(0px)',
        opacity: 1,
        ...getFinalPosition(),
      },
    ];
  }, [direction]);

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  return (
    <p
      ref={ref}
      className={`blur-text ${className}  flex-wrap`}
      style={{
        width: width,
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto',
      }}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        const spanTransition: Transition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing,
        };

        return (
          <motion.span
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            className="whitespace-nowrap"
            onAnimationComplete={
              index === elements.length - 1 ? onAnimationComplete : undefined
            }
            style={{
              display: '',
              willChange: 'transform, filter, opacity',
            }}>
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </p>
  );
};

export default BlurText;
