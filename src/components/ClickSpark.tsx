'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

const ClickSpark = ({
  sparkColor = '#D4AF37',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  children
}: {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: string;
  extraScale?: number;
  children: React.ReactNode;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const isAnimatingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number | null>(null);
  const drawRef = useRef<((timestamp: number) => void) | null>(null);

  const easeFunc = useCallback((t: number) => {
    switch (easing) {
      case 'linear': return t;
      case 'ease-in': return t * t;
      case 'ease-in-out': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default: return t * (2 - t); // ease-out
    }
  }, [easing]);

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sparksRef.current = sparksRef.current.filter(spark => {
      const elapsed = timestamp - spark.startTime;
      if (elapsed >= duration) return false;

      const progress = elapsed / duration;
      const eased = easeFunc(progress);

      const distance = eased * sparkRadius * extraScale;
      const lineLength = sparkSize * (1 - eased);

      const x1 = spark.x + distance * Math.cos(spark.angle);
      const y1 = spark.y + distance * Math.sin(spark.angle);
      const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
      const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

      ctx.strokeStyle = sparkColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      return true;
    });

    if (sparksRef.current.length > 0) {
      animationIdRef.current = requestAnimationFrame(drawRef.current!);
    } else {
      isAnimatingRef.current = false;
    }
  }, [sparkColor, sparkSize, sparkRadius, duration, easeFunc, extraScale]);

  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    startTimeRef.current = null;
    if (drawRef.current) {
      animationIdRef.current = requestAnimationFrame(drawRef.current);
    }
  }, []);

  // Handle clicks
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: performance.now()
    }));

    sparksRef.current.push(...newSparks);
    startAnimation();
  }, [sparkCount, startAnimation]);

  // Store draw function in ref after it's defined
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // Resize canvas to match parent
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout: NodeJS.Timeout;

    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);

    resizeCanvas();

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div onClick={handleClick} aria-hidden="true" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100vh' }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        role="presentation"
        style={{
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 9999
        }}
      />
      {children}
    </div>
  );
};

export default ClickSpark;
