'use client';

import React from 'react';

interface GoldSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const GoldSpinner: React.FC<GoldSpinnerProps> = ({
  size = 'md',
  text = 'Memproses...',
  fullScreen = false
}) => {
  const sizeMap = {
    sm: { spinner: '40px', text: '14px' },
    md: { spinner: '60px', text: '16px' },
    lg: { spinner: '80px', text: '18px' },
    xl: { spinner: '100px', text: '20px' },
  };

  const dimensions = sizeMap[size];

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 15, 27, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        gap: '24px'
      }}>
        <GoldSpinnerInner size={dimensions.spinner} />
        <p style={{
          color: 'var(--primary)',
          fontSize: dimensions.text,
          fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '1px',
          textTransform: 'uppercase',
          margin: 0,
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          {text}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '20px'
    }}>
      <GoldSpinnerInner size={dimensions.spinner} />
      {text && (
        <p style={{
          color: 'var(--primary)',
          fontSize: dimensions.text,
          fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '1px',
          textTransform: 'uppercase',
          margin: 0,
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

const GoldSpinnerInner: React.FC<{ size: string }> = ({ size }) => {
  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size
    }}>
      {/* Outer ring */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '50%',
        border: `3px solid rgba(212, 175, 55, 0.1)`,
        borderTopColor: 'var(--primary)',
        animation: 'spin 1s linear infinite'
      }} />
      {/* Middle ring */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        right: '10%',
        bottom: '10%',
        borderRadius: '50%',
        border: `2px solid rgba(212, 175, 55, 0.2)`,
        borderRightColor: 'transparent',
        animation: 'spin 0.8s linear infinite reverse'
      }} />
      {/* Inner dot */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `calc(${size} / 5)`,
        height: `calc(${size} / 5)`,
        borderRadius: '50%',
        background: 'var(--primary)',
        boxShadow: `
          0 0 ${parseInt(size) / 8}px var(--primary),
          0 0 ${parseInt(size) / 4}px var(--primary),
          0 0 ${parseInt(size) / 2}px rgba(212, 175, 55, 0.5)
        `,
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
    </div>
  );
};

export default GoldSpinner;
