'use client';

import { useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';

interface CircularTextProps {
  text?: string;
  spinDuration?: number;
  onHover?: 'speedUp' | 'slowDown' | 'none';
  className?: string;
}

const CircularText = ({ text = "LENTERA • RAMADHAN • KAREEM • ", spinDuration = 20, onHover = 'speedUp', className = '' }: CircularTextProps) => {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation = useMotionValue(0);

  useEffect(() => {
    controls.start({
      rotate: 360,
      transition: {
        rotate: {
          repeat: Infinity,
          duration: spinDuration,
          ease: "linear"
        }
      }
    });
  }, [spinDuration, controls]);

  const handleHoverStart = () => {
    if (onHover === 'speedUp') {
      controls.start({
        rotate: rotation.get() + 360,
        transition: {
          rotate: {
            repeat: Infinity,
            duration: spinDuration / 4,
            ease: "linear"
          }
        }
      });
    }
  };

  const handleHoverEnd = () => {
    controls.start({
      rotate: rotation.get() + 360,
      transition: {
        rotate: {
          repeat: Infinity,
          duration: spinDuration,
          ease: "linear"
        }
      }
    });
  };

  return (
    <motion.div
      className={`circular-text-wrapper ${className}`}
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '64px', // Smaller size
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'transform'
      }}
      animate={controls}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      {/* Render letters in circular pattern */}
      {letters.map((letter: string, i: number) => {
        const rotationDeg = (360 / letters.length) * i;
        return (
          <span
            key={i}
            className="absolute inline-block font-black"
            style={{
              position: 'absolute',
              height: '32px', // Half of 64px
              transform: `rotate(${rotationDeg}deg)`,
              transformOrigin: 'center bottom',
              top: '0',
              fontSize: '6px', // Smaller font
              textTransform: 'uppercase',
              color: 'var(--primary)',
              whiteSpace: 'nowrap'
            }}
          >
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
};

export default CircularText;
