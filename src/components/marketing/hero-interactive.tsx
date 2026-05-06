'use client';

import { useEffect, useRef } from 'react';

export function HeroSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x, ry = y;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const loop = () => {
      rx += (x - rx) * 0.05;
      ry += (y - ry) * 0.05;
      if (ref.current) {
        ref.current.style.background = `radial-gradient(700px circle at ${rx}px ${ry}px, rgba(255,91,4,0.07) 0%, transparent 60%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'none',
      }}
    />
  );
}

export function HeroBgBlobs() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Animated blobs */}
      <div
        className="blob-1"
        style={{
          position: 'absolute',
          top: '5%',
          left: '15%',
          width: 700,
          height: 500,
          borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
          background: 'rgba(255,91,4,0.13)',
          filter: 'blur(90px)',
        }}
      />
      <div
        className="blob-2"
        style={{
          position: 'absolute',
          top: '30%',
          right: '5%',
          width: 550,
          height: 400,
          borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%',
          background: 'rgba(124,58,237,0.09)',
          filter: 'blur(100px)',
        }}
      />
      <div
        className="blob-3"
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '40%',
          width: 450,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(255,91,4,0.07)',
          filter: 'blur(80px)',
        }}
      />
      {/* Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(10,10,11,0.6) 100%)',
        }}
      />
    </div>
  );
}
