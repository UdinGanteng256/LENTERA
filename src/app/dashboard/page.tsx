'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import PrayerTimes from '@/components/PrayerTimes';
import QuickActions from '@/components/QuickActions';
import KindnessHub from '@/components/KindnessHub';
import AIChat from '@/components/AIChat';
import KiblatView from '@/components/views/KiblatView';
import LenteraSky from '@/components/LenteraSky';
import SunCycle from '@/components/SunCycle';
import SunDonationPath from '@/components/SunDonationPath';
import DonationCup from '@/components/DonationCup';
import Confetti from '@/components/Confetti';
import LanguageToggle from '@/components/LanguageToggle';
import { useTranslation } from '@/contexts/TranslationContext';
import PillNav from '@/components/PillNav';
import PrayerReminder from '@/components/PrayerReminder';
import ShinyText from '@/components/ShinyText';
import CircularText from '@/components/CircularText';
import ClickSpark from '@/components/ClickSpark';
import LanguageToggle from '@/components/LanguageToggle';
import { useLocation } from '@/hooks/useLocation';
import { useLanguage } from '@/hooks/useLanguage';

import { useAuth } from '@/components/Providers';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Lazy load heavy view components with custom loading states
const QuranView = lazy(() => import('@/components/views/QuranView'));
const CeramahView = lazy(() => import('@/components/views/CeramahView'));
const SettingsView = lazy(() => import('@/components/views/SettingsView'));
const PledgeView = lazy(() => import('@/components/views/PledgeView'));

// Loading skeleton component
const ViewSkeleton = () => (
  <div className="view-skeleton">
    <div className="skeleton-header"></div>
    <div className="skeleton-content">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('beranda');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [kindnessTrigger, setKindnessTrigger] = useState(0);
  const [waterLevel, setWaterLevel] = useState(20);
  const [userData, setUserData] = useState<{ name: string, photo: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewTransitioning, setViewTransitioning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load User Data & Progress from Firestore with optimization
  useEffect(() => {
    const loadProgress = async () => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              name: data.name || firebaseUser.displayName || 'Sahabat',
              photo: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'S')}&background=D4AF37&color=0F0F1B`
            });
            if (data.waterLevel) setWaterLevel(data.waterLevel);
          }
        } catch (e) {
          console.error("Error fetching progress:", e);
        }
      }
    };
    if (!authLoading) loadProgress();
  }, [firebaseUser, authLoading]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && menuRef.current) {
        const focusableElements = menuRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleDonate = async () => {
    const newLevel = Math.min(waterLevel + 20, 100);
    const reachedMilestone = newLevel >= 100 && waterLevel < 100;
    
    setWaterLevel(newLevel);
    setKindnessTrigger(prev => prev + 1);

    if (reachedMilestone) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }

    if (firebaseUser) {
      try {
        await updateDoc(doc(db, "users", firebaseUser.uid), {
          waterLevel: newLevel
        });
      } catch (e) { console.error(e); }
    }

    window.open('https://fatihgateng01.myr.id', '_blank');
  };

  const { city } = useLocation();

  const handleLogin = () => {
    window.location.href = '/setup';
  };

  // Optimized tab change with transition
  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === activeTab) return;
    
    setViewTransitioning(true);
    // Small delay for smooth transition
    setTimeout(() => {
      setActiveTab(tabId);
      // Reset transition state after content loads
      setTimeout(() => setViewTransitioning(false), 300);
    }, 150);
  }, [activeTab]);

  const menuItems = [
    { id: 'beranda', label: t('nav.home') },
    { id: 'alquran', label: t('nav.quran') },
    { id: 'kiblat', label: t('nav.qibla') },
    { id: 'ceramah', label: t('nav.lectures') },
    { id: 'komitmen', label: t('nav.pledge') },
    { id: 'settings', label: t('nav.settings') },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'beranda':
        return (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 5vw, 48px)' }}>
            {/* 1. Prayer & Sun Cycle Section */}
            <section className="glass-card" style={{ 
              padding: 'clamp(20px, 5vw, 48px)',
              maxWidth: '1240px',
              width: '100%',
              margin: '0 auto'
            }}>
              <SunDonationPath />
              <div style={{ marginTop: '30px' }}>
                <PrayerTimes />
              </div>
            </section>

            {/* 2. Stats & Quick Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(300px, 100%, 1fr), 1.2fr))',
              gap: 'clamp(20px, 4vw, 32px)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 4vw, 32px)' }}>
                <QuickActions onTabChange={setActiveTab} />
              </div>
              <section className="glass-card" style={{ padding: 'clamp(20px, 5vw, 48px)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>{t('donation.title')}</h3>
                <DonationCup fillLevel={waterLevel} />
                <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginTop: '20px' }}>{t('donation.subtitle')}</p>
              </section>
            </div>

            {/* 3. Donation Selection */}
            <section className="glass-card" style={{ padding: 'clamp(40px, 8vw, 80px) 20px', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, color: 'var(--primary)', marginBottom: '40px' }}>{t('dashboard.ignite_kindness')}</h2>
              <KindnessHub onDonate={handleDonate} />
            </section>
          </div>
        );
      case 'alquran':
        return (
          <Suspense fallback={<ViewSkeleton />}>
            <QuranView />
          </Suspense>
        );
      case 'kiblat': return <KiblatView />;
      case 'ceramah':
        return (
          <Suspense fallback={<ViewSkeleton />}>
            <CeramahView />
          </Suspense>
        );
      case 'komitmen':
        return (
          <Suspense fallback={<ViewSkeleton />}>
            <PledgeView />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<ViewSkeleton />}>
            <SettingsView />
          </Suspense>
        );
      default: return null;
    }
  };

  return (
    <ClickSpark
      sparkColor="#FFFFFF"
      sparkCount={6}
      sparkRadius={12}
      duration={300}
      extraScale={1.0}
    >
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

        <div id="main-content" style={{ minHeight: '100vh', background: 'var(--background)', color: 'white', overflowX: 'hidden' }}>
        <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        <LenteraSky trigger={kindnessTrigger} />
        <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
        <PrayerReminder />

        {/* Sync Sun Background */}
        <SunCycle />

        {/* TOP NAVIGATION BAR (PillNav Style) */}
        <header style={{
          position: 'fixed', top: 0, left: 0, width: '100%',
          padding: '20px 40px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', zIndex: 1000,
          background: 'var(--panel-bg)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
            <div style={{ transform: 'scale(0.55)' }}>
              <CircularText text="LENTERA • RAMADHAN • KAREEM • " spinDuration={15} />
            </div>
            <ShinyText text="LENTERA" color="#D4AF37" shineColor="#FFFFFF" speed={3} className="font-primary" style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '2px' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden-mobile">
              <PillNav items={menuItems} activeId={activeTab} onTabChange={handleTabChange} />
            </div>

            {/* Mobile Menu Button - Hidden on desktop */}
            <div className="show-only-mobile">
              <button
                ref={menuButtonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  color: 'var(--primary)',
                  fontSize: '18px',
                }}
              >
                {isMenuOpen ? '✕' : '☰'}
              </button>
            </div>

            {firebaseUser ? (
              <div
                className="glass-card"
                style={{ padding: '6px 18px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--primary)' }}
                aria-label={`User profile: ${firebaseUser.displayName}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'S')}&background=D4AF37&color=0F0F1B`}
                  alt={`Profile picture of ${firebaseUser.displayName}`}
                  style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                  loading="lazy"
                />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{firebaseUser.displayName?.split(' ')[0]}</span>
              </div>
            ) : (
              <button
                className="btn-primary"
                onClick={handleLogin}
                aria-label="Sign in with Google"
                style={{ padding: '10px 24px', fontSize: '13px' }}
              >
                Login Google
              </button>
            )}
            <LanguageToggle />
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              aria-hidden="true"
              onClick={() => {
                setIsMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 998,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(2px)',
              }}
            />
            <div
              id="mobile-menu"
              ref={menuRef}
              role="menu"
              aria-label="Mobile navigation menu"
              aria-labelledby="mobile-menu-button"
              style={{
                position: 'fixed',
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 999,
                background: 'var(--panel-bg)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                minWidth: '280px',
                maxWidth: 'calc(100vw - 40px)',
              }}
            >
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleTabChange(item.id);
                      setIsMenuOpen(false);
                      menuButtonRef.current?.focus();
                    }}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      width: '100%',
                      padding: '16px 18px',
                      background: isActive ? 'var(--primary)' : 'transparent',
                      border: 'none',
                      borderRadius: '10px',
                      color: isActive ? '#0F0F1B' : 'var(--secondary-text)',
                      fontSize: '14px',
                      fontWeight: isActive ? 700 : 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minHeight: '48px',
                    }}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span aria-hidden="true" style={{ fontSize: '12px' }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <main style={{ padding: '120px 20px 60px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <header style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            gap: '20px'
          }}>
            <div>
              <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800 }}>{t('dashboard.welcome')}, {userData ? userData.name.split(' ')[0] : t('dashboard.companion')}</h2>
              <p style={{ color: 'var(--secondary-text)' }}>📍 {city} &bull; {t('dashboard.tagline')}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <LanguageToggle />
              <button
                className="btn-primary"
                onClick={() => setIsChatOpen(true)}
                aria-label="Open AI chat assistant"
                style={{ boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)' }}
              >
                <span aria-hidden="true">✦</span> {t('dashboard.ask_ai')}
              </button>
            </div>
          </header>
          
          {/* Content with transition */}
          <div className={`content-wrapper ${viewTransitioning ? 'transitioning' : ''}`}>
            {renderContent()}
          </div>
        </main>

        <footer style={{ textAlign: 'center', padding: '60px', opacity: 0.2, fontSize: '12px' }}>
          &copy; 2026 LENTERA &bull; Amanah, Energi, Niat
        </footer>

        <style jsx>{`
          .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
          .hidden-mobile { display: block; }
          .show-only-mobile { display: none; }
          @media (max-width: 1024px) {
            .hidden-mobile { display: none; }
            .show-only-mobile { display: block; }
          }
          .skip-link:focus {
            outline: 3px solid var(--primary);
            outline-offset: 2px;
          }
          
          /* Content transition */
          .content-wrapper {
            transition: opacity 0.3s ease, transform 0.3s ease;
          }
          .content-wrapper.transitioning {
            opacity: 0.5;
            transform: translateY(10px);
          }
          
          /* View Skeleton */
          .view-skeleton {
            max-width: 1100px;
            margin: 0 auto;
            padding: 20px;
          }
          .skeleton-header {
            height: 40px;
            border-radius: 8px;
            margin-bottom: 30px;
            background: linear-gradient(90deg, var(--glass-bg) 25%, var(--panel-bg) 50%, var(--glass-bg) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          .skeleton-content {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .skeleton-line {
            height: 60px;
            border-radius: 12px;
            background: linear-gradient(90deg, var(--glass-bg) 25%, var(--panel-bg) 50%, var(--glass-bg) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          .skeleton-line.short {
            width: 60%;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
      </>
    </ClickSpark>
  );
}
