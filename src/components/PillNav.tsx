'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface PillNavItem {
  id: string;
  label: string;
}

interface PillNavProps {
  items: PillNavItem[];
  activeId: string;
  onTabChange: (id: string) => void;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  ease?: string;
}

const PillNav: React.FC<PillNavProps> = ({
  items,
  activeId,
  onTabChange,
  baseColor = 'var(--primary)',
  pillColor = 'var(--glass-bg)',
  hoveredPillTextColor = '#0F0F1B',
  pillTextColor = '#FFFFFF',
  ease = 'power3.out'
}) => {
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, i) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;

        // Advanced geometry to make the circle fill the pill perfectly
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label') as HTMLElement;
        const white = pill.querySelector('.pill-label-hover') as HTMLElement;

        // Reset positions for layout update
        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h, opacity: 0 });

        tlRefs.current[i]?.kill();
        const tl = gsap.timeline({ paused: true });

        // The "Filling" animation - optimized to 0.4s for snappiness
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.4, ease, overwrite: 'auto' }, 0);

        // Label sliding up and out
        if (label) {
          tl.to(label, { y: -h, duration: 0.4, ease, overwrite: 'auto' }, 0);
        }

        // Hover label sliding in from bottom
        if (white) {
          gsap.set(white, { y: h, opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 0.4, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[i] = tl;
        });
        };

        layout();
        window.addEventListener('resize', layout);

        // Support for custom fonts
        if (document.fonts) {
        document.fonts.ready.then(layout).catch(() => {});
        }

        return () => window.removeEventListener('resize', layout);
        }, [items, ease]);

        const handleEnter = (i: number) => {
        const tl = tlRefs.current[i];
        if (!tl) return;
        activeTweenRefs.current[i]?.kill();
        activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
        duration: 0.3, // Faster hover
        ease,
        overwrite: 'auto'
        });
        };

        const handleLeave = (i: number) => {
        const tl = tlRefs.current[i];
        if (!tl) return;
        activeTweenRefs.current[i]?.kill();
        activeTweenRefs.current[i] = tl.tweenTo(0, {
        duration: 0.2, // Faster exit
        ease,
        overwrite: 'auto'
        });
        };


  return (
    <nav className="pill-nav-wrapper" aria-label="Main navigation">
      <ul className="pill-list" role="menubar">
        {items.map((item, i) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id} role="none">
              <button
                className={`pill-item ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTabChange(item.id);
                  }
                }}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={() => handleLeave(i)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}
                role="menuitem"
                style={{
                  '--pill-bg': pillColor,
                  '--pill-text': pillTextColor,
                  '--base': baseColor,
                  '--hover-text': hoveredPillTextColor
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any}
              >
                {/* The Animated Filling Circle */}
                <span
                  className="hover-circle"
                  ref={el => { circleRefs.current[i] = el; }}
                  aria-hidden="true"
                />

                {/* The Label Stack */}
                <span className="label-stack">
                  <span className="pill-label">{item.label}</span>
                  <span className="pill-label-hover">{item.label}</span>
                </span>

                {/* Active Indicator Dot */}
                {isActive && <div className="active-indicator" aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>

      <style jsx>{`
        .pill-nav-wrapper {
          background: var(--panel-bg);
          padding: 6px;
          border-radius: 50px;
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(var(--glass-blur));
        }
        .pill-list {
          display: flex;
          list-style: none;
          gap: 6px;
          padding: 0;
          margin: 0;
        }
        .pill-item {
          position: relative;
          overflow: hidden;
          height: 42px;
          padding: 0 24px;
          border-radius: 40px;
          border: none;
          background: var(--pill-bg);
          color: var(--pill-text);
          font-weight: 800;
          cursor: pointer;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border 0.3s;
        }
        .pill-item.active {
          background: var(--base);
          color: var(--hover-text);
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        }
        .label-stack {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pill-label {
          display: inline-block;
          pointer-events: none;
        }
        .pill-label-hover {
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          color: var(--hover-text);
          width: 100%;
          text-align: center;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        .hover-circle {
          position: absolute;
          left: 50%;
          background: var(--base);
          z-index: 1;
          pointer-events: none;
          border-radius: 50%;
          will-change: transform;
        }
        .active-indicator {
          position: absolute;
          bottom: 4px;
          width: 4px;
          height: 4px;
          background: var(--hover-text);
          border-radius: 50%;
          z-index: 3;
        }
        .pill-item:focus-visible {
          outline: 3px solid var(--primary);
          outline-offset: 3px;
        }
      `}</style>
    </nav >
  );
};

export default PillNav;
