'use client';

import React, { useEffect, useRef } from 'react';

// Particle factory function (avoiding class syntax for Turbopack compatibility)
interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  update: (canvasWidth: number, canvasHeight: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

const createParticle = (canvasWidth: number, canvasHeight: number): Particle => ({
  x: Math.random() * canvasWidth,
  y: Math.random() * canvasHeight,
  size: Math.random() * 2 + 0.1,
  speedX: Math.random() * 0.5 - 0.25,
  speedY: Math.random() * 0.5 - 0.25,
  opacity: Math.random() * 0.5 + 0.1,
  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x > canvasWidth) this.x = 0;
    if (this.x < 0) this.x = canvasWidth;
    if (this.y > canvasHeight) this.y = 0;
    if (this.y < 0) this.y = canvasHeight;
  },
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
});

const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];

    // Capture canvas dimensions to avoid null issues in Particle class
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
    };

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < 100; i++) {
        particles.push(createParticle(canvasWidth, canvasHeight));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update(canvasWidth, canvasHeight);
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      role="presentation"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
        display: 'block',
      }}
    />
  );
};

export default Particles;
