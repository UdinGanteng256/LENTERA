'use client';

import React, { useEffect, useState, useMemo } from 'react';

const PRAYER_TIMES = [
  { name: 'Subuh', time: '04:42', minutes: 4 * 60 + 42 },
  { name: 'Dzuhur', time: '12:05', minutes: 12 * 60 + 5 },
  { name: 'Ashar', time: '15:12', minutes: 15 * 60 + 12 },
  { name: 'Maghrib', time: '18:10', minutes: 18 * 60 + 10 },
  { name: 'Isya', time: '19:19', minutes: 19 * 60 + 19 },
];

// Memoized Bezier calculation (static function outside component)
const getBezierXY = (t: number): { x: number; y: number } => {
  // Quadratic Bezier: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
  const x = (1 - t) ** 2 * 50 + 2 * (1 - t) * t * 500 + t ** 2 * 950;
  const y = (1 - t) ** 2 * 130 + 2 * (1 - t) * t * (-50) + t ** 2 * 130;
  return { x, y };
};

// Memoized prayer points calculation
const calculatePrayerPoints = () => {
  const startMin = PRAYER_TIMES[0].minutes;
  const endMin = PRAYER_TIMES[4].minutes;
  const totalDuration = endMin - startMin;

  return PRAYER_TIMES.map(prayer => ({
    ...prayer,
    t: (prayer.minutes - startMin) / totalDuration,
    position: getBezierXY((prayer.minutes - startMin) / totalDuration)
  }));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PRAYER_POINTS = calculatePrayerPoints();

const SunDonationPath = () => {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date()); // Lazy init

  // Throttled update using requestAnimationFrame for smooth 60fps
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    let animationFrameId: number;
    let lastUpdate = 0;

    const updateTime = () => {
      const now = performance.now();
      // Update at most every 100ms for clock (not every frame)
      if (now - lastUpdate >= 100) {
        setNow(new Date());
        lastUpdate = now;
      }
      animationFrameId = requestAnimationFrame(updateTime);
    };

    animationFrameId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const currentMinutes = useMemo(() => {
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  }, [now]);

  const startMin = PRAYER_TIMES[0].minutes;
  const endMin = PRAYER_TIMES[4].minutes;
  const totalDuration = endMin - startMin;

  const progress = useMemo(() => {
    return Math.max(0, Math.min(1, (currentMinutes - startMin) / totalDuration));
  }, [currentMinutes, startMin, totalDuration]);

  const sunPos = useMemo(() => {
    return getBezierXY(progress);
  }, [progress]);

  const nextPrayer = useMemo(() => {
    return PRAYER_TIMES.find(p => p.minutes > currentMinutes) || PRAYER_TIMES[0];
  }, [currentMinutes]);

  const isNearPrayer = Math.abs(nextPrayer.minutes - currentMinutes) <= 10;

  if (!mounted) return <div className="sun-path-wrapper" style={{ height: '300px', opacity: 0 }} />;

  return (
    <div className="sun-path-wrapper">
      <div className={`realtime-clock ${isNearPrayer ? 'glowing-gold' : ''}`}>
        <span className="time-text">{now.toLocaleTimeString('id-ID', { hour12: false })}</span>
        {isNearPrayer && <span className="next-info pulse">Menuju {nextPrayer.name}</span>}
      </div>

      <div className="arc-container">
        <svg width="100%" height="180" viewBox="0 0 1000 180" preserveAspectRatio="xMidYMid meet">
          {/* Main Arc Path */}
          <path
            d="M 50 130 Q 500 -50 950 130"
            stroke="rgba(212, 175, 55, 0.15)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,8"
          />

          {/* Prayer Points Exactly on Path */}
          {PRAYER_TIMES.map((p) => {
            const t = (p.minutes - startMin) / totalDuration;
            const { x, y } = getBezierXY(t);
            const isPassed = currentMinutes >= p.minutes;

            return (
              <g key={p.name}>
                <circle
                  cx={x} cy={y} r="8"
                  fill={isPassed ? "var(--primary)" : "#1A1A2E"}
                  stroke="var(--primary)"
                  strokeWidth="2"
                  className={isNearPrayer && nextPrayer.name === p.name ? 'active-point' : ''}
                />
                <text x={x} y={y + 30} textAnchor="middle" fill={isPassed ? "var(--primary)" : "var(--secondary-text)"} fontSize="14" fontWeight="700">
                  {p.name}
                </text>
                <text x={x} y={y + 48} textAnchor="middle" fill="var(--secondary-text)" fontSize="11" opacity="0.6">
                  {p.time}
                </text>
              </g>
            );
          })}

          {/* The Sun */}
          <g style={{ transform: `translate(${sunPos.x}px, ${sunPos.y}px)` }} className="sun-group">
            <circle r="20" fill="white" className="sun-core" />
            <circle r="35" fill="var(--primary)" opacity="0.2" className="sun-glow" />
          </g>
        </svg>
      </div>

      <style jsx>{`
        .sun-path-wrapper { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .realtime-clock { text-align: center; transition: 0.5s; margin-bottom: 20px; }
        .time-text { font-size: 72px; font-weight: 900; letter-spacing: -2px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .glowing-gold .time-text { 
          color: var(--primary); 
          text-shadow: 0 0 40px rgba(212, 175, 55, 0.6);
        }
        .next-info { display: block; font-size: 14px; letter-spacing: 3px; color: var(--primary); font-weight: 800; text-transform: uppercase; }
        .arc-container { width: 100%; max-width: 900px; position: relative; }
        .sun-group { transition: transform 1s linear; }
        .sun-core { filter: drop-shadow(0 0 10px var(--primary)); }
        .sun-glow { animation: pulseGlow 2s infinite alternate; }
        @keyframes pulseGlow { from { opacity: 0.1; r: 30; } to { opacity: 0.3; r: 45; } }
        .active-point { animation: pointPulse 1s infinite; }
        @keyframes pointPulse { 0% { r: 8; } 50% { r: 12; opacity: 0.5; } 100% { r: 8; } }
        .pulse { animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default SunDonationPath;
