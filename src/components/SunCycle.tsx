'use client';

import React, { useEffect, useState } from 'react';

const SunCycle = () => {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    // Update every hour since position is hourly based now
    const timer = setInterval(() => setNow(new Date()), 3600000); 
    return () => clearInterval(timer);
  }, []);

  const getSunPosition = () => {
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hour * 60 + minutes;

    // Movement Range: Subuh (04:00) to Isya (19:30)
    const start = 4 * 60;
    const end = 19.5 * 60;
    const isVisible = totalMinutes >= start && totalMinutes <= end;
    const isDay = hour >= 6 && hour < 18;

    if (!isVisible) return { x: -100, y: 500, type: 'none' };

    // Quadratic Bezier Formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    // P₀=(50, 400), P₁=(500, 50), P₂=(950, 400) - Matches the path's "M 50 400 Q 500 50 950 400"
    const t = progress;
    const x = (1 - t) ** 2 * 50 + 2 * (1 - t) * t * 500 + t ** 2 * 950;
    const y = (1 - t) ** 2 * 400 + 2 * (1 - t) * t * 50 + t ** 2 * 400;

    return { x, y, type: isDay ? 'sun' : 'moon' };
  };

  const { x, y, type } = getSunPosition();

  // Render placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="sun-cycle-absolute" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path
            d="M 50 400 Q 500 50 950 400"
            stroke="var(--glass-border)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
        <style jsx>{`
          .sun-cycle-absolute {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 0;
            pointer-events: none;
            opacity: 0.6;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="sun-cycle-absolute" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {/* Simple Guide Line */}
        <path
          d="M 50 400 Q 500 50 950 400"
          stroke="rgba(212, 175, 55, 0.05)"
          strokeWidth="1"
          fill="none"
        />

        {/* Animated Body */}
        {type !== 'none' && (
          <g style={{ transform: `translate(${x}px, ${y}px)`, transition: 'all 1s linear' }}>
            <circle r="25" fill={type === 'sun' ? '#FFF' : '#DDD'} style={{ filter: `drop-shadow(0 0 30px ${type === 'sun' ? 'var(--primary)' : '#FFF'})` }} />
            {type === 'sun' && <circle r="40" fill="var(--primary)" opacity="0.1" />}
          </g>
        )}
      </svg>
      <style jsx>{`
        .sun-cycle-absolute {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: 0;
          pointer-events: none;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default SunCycle;
