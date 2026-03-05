'use client';

import { useRef, useEffect, useState } from 'react';

interface GooeyNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface GooeyNavProps {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: string[];
  initialActiveIndex?: number;
  onTabChange?: (id: string) => void;
}

// Helper function for random noise (used in effects, not during render)
const noise = (n = 1): number => n / 2 - Math.random() * n;

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 12,
  particleDistances = [80, 10],
  particleR = 80,
  timeVariance = 300,
  colors = ['#D4AF37', '#FF8C42', '#F4D03F'],
  initialActiveIndex = 0,
  onTabChange,
}: GooeyNavProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const getXY = (distance: number, pointIndex: number, totalPoints: number) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const makeParticles = (element: HTMLElement) => {
    const d = particleDistances;
    const r = particleR;
    element.style.setProperty('--time', `${animationTime * 2}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance);
      const particle = document.createElement('span');
      const point = document.createElement('span');

      const start = getXY(d[0], i, particleCount);
      const end = getXY(d[1] + noise(5), i, particleCount);
      const rotate = noise(r / 5);

      particle.classList.add('particle');
      particle.style.setProperty('--start-x', `${start[0]}px`);
      particle.style.setProperty('--start-y', `${start[1]}px`);
      particle.style.setProperty('--end-x', `${end[0]}px`);
      particle.style.setProperty('--end-y', `${end[1]}px`);
      particle.style.setProperty('--rotate', `${rotate}deg`);

      point.classList.add('point');
      // Use random color for particles (safe - called in event handler, not render)
      // eslint-disable-next-line react-hooks/purity
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      point.style.background = randomColor;

      particle.appendChild(point);
      element.appendChild(particle);

      setTimeout(() => {
        if (element.contains(particle)) element.removeChild(particle);
      }, t);
    }
  };

  const updatePosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const eRect = element.getBoundingClientRect();

    filterRef.current.style.left = `${eRect.left - cRect.left}px`;
    filterRef.current.style.top = `${eRect.top - cRect.top}px`;
    filterRef.current.style.width = `${eRect.width}px`;
    filterRef.current.style.height = `${eRect.height}px`;
  };

  const handleClick = (e: React.MouseEvent, index: number, id: string) => {
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    if (activeIndex === index) return;

    setActiveIndex(index);
    if (onTabChange) onTabChange(id);
    updatePosition(el);

    if (filterRef.current) {
      filterRef.current.classList.remove('active');
      void filterRef.current.offsetWidth;
      filterRef.current.classList.add('active');
      makeParticles(filterRef.current);
    }
  };

  useEffect(() => {
    const active = navRef.current?.querySelectorAll('li')[activeIndex] as HTMLElement;
    if (active) updatePosition(active);
  }, [activeIndex]);

  return (
    <div className="gooey-nav-root" ref={containerRef}>
      <style jsx>{`
        .gooey-nav-root { isolation: isolate; position: relative; }
        .nav-list { 
          display: flex; gap: 8px; list-style: none; padding: 0; margin: 0; 
          position: relative; z-index: 10; 
        }
        .nav-item { 
          cursor: pointer; border-radius: 50px; 
          transition: color 0.3s; color: var(--secondary-text); 
        }
        .nav-item.active { color: #0F0F1B; }
        .nav-link { 
          padding: 10px 24px; display: flex; align-items: center; gap: 10px; 
          font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;
        }
        
        .effect-layer { 
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
          filter: url('#goo'); pointer-events: none; z-index: 1; 
        }
        .pill { 
          position: absolute; background: var(--primary); border-radius: 50px; 
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0; 
        }
        .pill.active { opacity: 1; }
        
        @keyframes move {
          0% { transform: rotate(0deg) translate(var(--start-x), var(--start-y)); opacity: 1; }
          100% { transform: rotate(var(--rotate)) translate(var(--end-x), var(--end-y)); opacity: 0; }
        }
        .particle { position: absolute; top: 50%; left: 50%; animation: move 0.8s ease-out forwards; }
        .point { width: 14px; height: 14px; border-radius: 50%; }
      `}</style>

      {/* SVG Gooey Filter Definition (Hidden) */}
      <svg style={{ visibility: 'hidden', position: 'absolute' }} width="0" height="0">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="effect-layer">
        <span className="pill active" ref={filterRef} />
      </div>

      <ul ref={navRef} className="nav-list">
        {items.map((item, i) => (
          <li key={i} className={`nav-item ${activeIndex === i ? 'active' : ''}`} onClick={(e) => handleClick(e, i, item.id)}>
            <div className="nav-link">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GooeyNav;
