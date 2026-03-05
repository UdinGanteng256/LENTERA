'use client';

import React from 'react';
import { motion } from 'framer-motion';

const DonationCup = ({ fillLevel }: { fillLevel: number }) => {
  // Map fillLevel (0-100) to actual water height
  const baseHeight = 220;
  const targetY = baseHeight - (fillLevel / 100) * 180;

  return (
    <div
      className="cup-wrapper"
      role="img"
      aria-label={`Donation cup filled to ${fillLevel}%. The cup represents your accumulated good deeds through sedekah`}
      aria-live="polite"
      aria-atomic="true"
      style={{ position: 'relative', width: '220px', height: '280px' }}
    >
      <svg width="220" height="280" viewBox="0 0 200 250">
        <defs>
          <linearGradient id="water-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B6B23" />
          </linearGradient>
          
          <mask id="cup-shape-mask">
            <path d="M 40 20 L 160 20 L 145 230 Q 140 240 130 240 L 70 240 Q 60 240 55 230 L 40 20 Z" fill="white" />
          </mask>
        </defs>

        {/* Outer Glass Rim */}
        <path 
          d="M 40 20 L 160 20 L 145 230 Q 140 240 130 240 L 70 240 Q 60 240 55 230 L 40 20 Z" 
          fill="var(--glass-bg)" 
          stroke="var(--glass-border)" 
          strokeWidth="2" 
        />

        {/* Animated Liquid Section */}
        <g mask="url(#cup-shape-mask)">
          {/* Back Wave (Subtle) */}
          <motion.path
            animate={{ 
              d: [
                "M -100 0 Q -50 10 0 0 Q 50 -10 100 0 Q 150 10 200 0 Q 250 -10 300 0 V 300 H -100 Z",
                "M -100 0 Q -50 -10 0 0 Q 50 10 100 0 Q 150 -10 200 0 Q 250 10 300 0 V 300 H -100 Z",
                "M -100 0 Q -50 10 0 0 Q 50 -10 100 0 Q 150 10 200 0 Q 250 -10 300 0 V 300 H -100 Z"
              ],
              x: [-100, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            fill="#B8860B"
            opacity="0.4"
            style={{ y: targetY }}
          />
          
          {/* Main Front Wave */}
          <motion.path
            animate={{ 
              d: [
                "M -100 0 Q -50 -15 0 0 Q 50 15 100 0 Q 150 -15 200 0 Q 250 15 300 0 V 300 H -100 Z",
                "M -100 0 Q -50 15 0 0 Q 50 -15 100 0 Q 150 15 200 0 Q 250 -15 300 0 V 300 H -100 Z",
                "M -100 0 Q -50 -15 0 0 Q 50 15 100 0 Q 150 -15 200 0 Q 250 15 300 0 V 300 H -100 Z"
              ],
              x: [-80, -20]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            fill="url(#water-grad)"
            style={{ y: targetY }}
          />
        </g>

        {/* Reflection Highlight */}
        <path d="M 50 40 L 58 210" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.05" />
      </svg>
      
      {/* Decorative Bubbles */}
      <motion.div
        animate={{ y: [-10, -100], opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        style={{ position: 'absolute', bottom: '40px', left: '45%', width: '4px', height: '4px', background: 'white', borderRadius: '50%' }}
      />
    </div>
  );
};

export default DonationCup;
