'use client';

import React, { useState, useEffect } from 'react';
import { handleMayarPayment } from '@/lib/mayarPayment';
import GoldSpinner from '@/components/GoldSpinner';

interface KindnessHubProps {
  onDonate?: () => void;
  onDonationSuccess?: (amount: number) => void;
}

interface DonationState {
  isLoading: boolean;
  packageId: number | null;
}

const KindnessHub: React.FC<KindnessHubProps> = ({ onDonate, onDonationSuccess }) => {
  const [donationState, setDonationState] = useState<DonationState>({
    isLoading: false,
    packageId: null
  });

  const donationOptions = [
    { id: 1, title: 'Paket Takjil', amount: 10000, icon: '🍲', linkId: 'paket-takjil' },
    { id: 2, title: 'Iftar Berjamaah', amount: 35000, icon: '🍚', linkId: 'iftar-berjamaah' },
    { id: 4, title: 'Traktir Mie Ayam', amount: 76000, icon: '🍜', linkId: 'mie-ayam' },
    { id: 3, title: 'Mushaf Al-Quran', amount: 100000, icon: '📖', linkId: 'mushaf-quran' },
  ];

  // Listen for global payment events
  useEffect(() => {
    const handlePaymentStart = () => {
      setDonationState(prev => ({ ...prev, isLoading: true }));
    };

    const handlePaymentEnd = () => {
      setDonationState(prev => ({ ...prev, isLoading: false, packageId: null }));
    };

    const handlePaymentComplete = (event: CustomEvent) => {
      const { status } = event.detail;

      if (status === 'success') {
        setDonationState(prev => ({ ...prev, isLoading: false, packageId: null }));
        onDonationSuccess?.(donationOptions.find(p => p.id === donationState.packageId)?.amount || 0);
      } else if (status === 'failed' || status === 'cancelled') {
        setDonationState(prev => ({ ...prev, isLoading: false, packageId: null }));
      }
    };

    window.addEventListener('mayar-payment-start', handlePaymentStart as EventListener);
    window.addEventListener('mayar-payment-end', handlePaymentEnd as EventListener);
    window.addEventListener('mayar-payment-complete', handlePaymentComplete as EventListener);

    return () => {
      window.removeEventListener('mayar-payment-start', handlePaymentStart as EventListener);
      window.removeEventListener('mayar-payment-end', handlePaymentEnd as EventListener);
      window.removeEventListener('mayar-payment-complete', handlePaymentComplete as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donationState.packageId, onDonationSuccess]);

  const handleDonate = async (packageId: number, linkId: string, amount: number) => {
    if (donationState.isLoading) return;

    setDonationState({ isLoading: true, packageId });

    // Optional: trigger parent callback
    onDonate?.();

    const result = await handleMayarPayment(amount, {
      paymentLinkId: linkId,
      metadata: {
        packageId: String(packageId),
        source: 'kindness-hub',
      },
      onSuccess: (paymentId) => {
        console.log('Payment successful:', paymentId);
      },
      onFailed: (error) => {
        console.error('Payment failed:', error);
        alert(`Payment gagal: ${error}. Silakan coba lagi.`);
      },
      onCancelled: () => {
        console.log('Payment cancelled by user');
      },
    });

    if (!result.success) {
      setDonationState({ isLoading: false, packageId: null });
    }
    // Success state will be handled by event listener
  };

  return (
    <div className="kindness-grid" style={{ position: 'relative' }}>
      {donationState.isLoading && (
        <GoldSpinner
          size="md"
          text={`Memproses donasi ${donationOptions.find(p => p.id === donationState.packageId)?.title}...`}
          fullScreen
        />
      )}

      {donationOptions.map((opt) => {
        const isLoading = donationState.isLoading && donationState.packageId === opt.id;
        return (
          <div
            key={opt.id}
            className={`kindness-card glass-card ${isLoading ? 'disabled' : ''}`}
            style={{
              padding: '40px 30px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.5 : 1,
              pointerEvents: isLoading ? 'none' : 'auto',
              filter: isLoading ? 'blur(2px)' : 'none'
            }}
          >
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>{opt.icon}</span>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>{opt.title}</h3>
            <p style={{
              color: 'var(--primary)',
              fontWeight: 800,
              fontSize: 'clamp(18px, 3vw, 24px)',
              margin: '0 0 24px 0',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              {opt.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
            </p>
            <button
              onClick={() => handleDonate(opt.id, opt.linkId, opt.amount)}
              disabled={isLoading}
              className="btn-primary"
              style={{
                marginTop: '20px',
                width: '100%',
                justifyContent: 'center',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                position: 'relative'
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderTopColor: '#0F0F1B',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Memproses...
                </span>
              ) : (
                'Pilih Paket'
              )}
            </button>
          </div>
        );
      })}

      <style jsx>{`
        .kindness-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(clamp(260px, 100%, 320px), 1fr));
          gap: 24px;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }
        .kindness-card {
          transition: all 0.3s ease;
        }
        .kindness-card:not(.disabled):hover {
          transform: translateY(-8px);
          border-color: var(--primary);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
        }
        .kindness-card.disabled {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default KindnessHub;
