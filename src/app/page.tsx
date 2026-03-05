'use client';

import React from 'react';
import SunCycle from '@/components/SunCycle';
import Particles from '@/components/Particles';
import TextPressure from '@/components/TextPressure';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export default function LandingPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/setup');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-40px',
          left: 0,
          background: 'var(--primary)',
          color: '#0F0F1B',
          padding: '8px 16px',
          zIndex: 10000,
          transition: 'top 0.3s',
          fontWeight: 700,
        }}
        onFocus={(e) => {
          e.currentTarget.style.top = '0';
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = '-40px';
        }}
      >
        Skip to main content
      </a>

      <main id="main-content" style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'default',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Immersive Background Layers */}
      <Particles />
      <SunCycle />

      {/* Cinematic Content Layer */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        zIndex: 10,
        width: '100%',
        padding: '40px 20px'
      }}>
        {/* Interactive Hero Title */}
        <div style={{ 
          width: '100%', 
          maxWidth: '800px', 
          height: 'clamp(120px, 25vh, 200px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <TextPressure 
            text="LENTERA"
            textColor="#D4AF37"
            minFontSize={80}
            flex={true}
            width={true}
            weight={true}
            italic={true}
            scale={true}
          />
        </div>

        <p className="animate-fade" style={{ 
          fontSize: 'clamp(18px, 4vw, 24px)', 
          color: 'var(--secondary-text)', 
          letterSpacing: '4px', 
          opacity: 0.8, 
          maxWidth: '800px', 
          marginTop: '40px',
          fontWeight: 500,
          textTransform: 'uppercase'
        }}>
          Terangi Hati, Sempurnakan Ibadah di Bulan Suci
        </p>
        
        <button
          className="btn-primary animate-fade"
          onClick={handleGoogleLogin}
          aria-label="Sign in with Google to access Lentera"
          style={{
            marginTop: '80px',
            fontSize: '20px',
            padding: '20px 60px',
            boxShadow: '0 0 50px rgba(212, 175, 55, 0.4)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 800,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          Masuk ke Lentera
        </button>
      </div>

      {/* Floating Elements / Decors - Removed Scroll indicator */}

      <style jsx>{`
        .animate-fade {
          animation: fadeIn 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
      </main>

      <style>{`
        .skip-link:focus {
          outline: 3px solid var(--primary);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}
