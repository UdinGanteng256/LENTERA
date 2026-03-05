'use client';

import React, { useEffect, useState } from 'react';

interface Lantern {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

const LenteraSky = ({ trigger }: { trigger: number }) => {
  const [lanterns, setLanterns] = useState<Lantern[]>([]);

  useEffect(() => {
    if (trigger > 0) {
      // Add 5 new lanterns whenever trigger increases
      const newLanterns = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 4 + Math.random() * 4
      }));

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanterns(prev => [...prev, ...newLanterns]);

      // Cleanup after 10 seconds
      setTimeout(() => {
        setLanterns(prev => prev.filter(l => !newLanterns.find(nl => nl.id === l.id)));
      }, 10000);
    }
  }, [trigger]);

  return (
    <div className="sky-overlay" aria-hidden="true">
      {lanterns.map(l => (
        <div
          key={l.id}
          className="flying-lantern"
          aria-hidden="true"
          style={{
            left: `${l.left}%`,
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.duration}s`
          }}
        >
          🏮
        </div>
      ))}

      <style jsx>{`
        .sky-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 999;
          overflow: hidden;
        }
        .flying-lantern {
          position: absolute;
          bottom: -50px;
          font-size: 24px;
          filter: drop-shadow(0 0 10px var(--primary));
          opacity: 0;
          animation: flyUp linear forwards;
        }
        @keyframes flyUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(20deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LenteraSky;
