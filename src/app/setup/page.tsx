'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Stepper from '@/components/ui/Stepper';
import Particles from '@/components/Particles';

export default function SetupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (!loading && !user) {
      router.push('/');
    }
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
  }, [user, loading, router, name]);

  const handleFinish = async () => {
    console.log("🔵 [DEBUG] handleFinish triggered");
    console.log("🔵 [DEBUG] User:", user);
    console.log("🔵 [DEBUG] Name:", name);

    if (!name.trim()) {
      setError("Nama tidak boleh kosong");
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      setError("User tidak ditemukan. Silakan login ulang.");
      setIsSubmitting(false);
      console.error("🔴 [ERROR] User is null/undefined");
      return;
    }

    if (!user.uid) {
      setError("User ID tidak valid. Silakan login ulang.");
      setIsSubmitting(false);
      console.error("🔴 [ERROR] User.uid is null/undefined");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const userData = {
      name: name.trim(),
      email: user.email,
      photo: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=D4AF37&color=0F0F1B`,
      setupComplete: true,
      onboardingDate: new Date().toISOString()
    };

    console.log("🔵 [DEBUG] User data to save:", userData);

    try {
      // Test if db is available
      console.log("🔵 [DEBUG] Firestore db instance:", db);

      // Simpan ke Firestore (Permanent di Cloud) with timeout
      const docRef = doc(db, "users", user.uid);
      console.log("🔵 [DEBUG] Document reference:", docRef);

      // Add 10 second timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Operation timeout after 10 seconds")), 10000)
      );

      await Promise.race([
        setDoc(docRef, userData, { merge: true }),
        timeoutPromise
      ]);

      console.log("✅ [SUCCESS] User data saved to Firestore");

      // Tetap simpan ke localStorage buat akses cepat
      localStorage.setItem('lentera_user', JSON.stringify(userData));
      console.log("✅ [SUCCESS] User data saved to localStorage");

      // Redirect ke dashboard setelah berhasil
      setTimeout(() => {
        console.log("🔵 [DEBUG] Redirecting to /dashboard");
        router.push('/dashboard');
      }, 500);
    } catch (e: any) {
      console.error("🔴 [ERROR] Error saving user data:", e);
      console.error("🔴 [ERROR] Error details:", {
        message: e.message,
        code: e.code,
        name: e.name,
        stack: e.stack
      });

      // Fallback: save to localStorage only
      try {
        localStorage.setItem('lentera_user', JSON.stringify(userData));
        console.log("⚠️ [FALLBACK] Saved to localStorage only (cloud save failed)");
        setError("Gagal menyimpan ke cloud. Data tersimpan lokal. Silakan coba lagi nanti.");
        // Still redirect to dashboard with fallback
        setTimeout(() => {
          console.log("🔵 [DEBUG] Redirecting to /dashboard (fallback)");
          router.push('/dashboard');
        }, 1000);
      } catch (fallbackError) {
        console.error("🔴 [ERROR] Fallback also failed:", fallbackError);
        setError(`Gagal menyimpan data: ${e.message || 'Unknown error'}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!mounted) return null;

  return (
    <main style={{
      minHeight: '100vh',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px'
    }}>
      <Particles />

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '60px 40px',
        textAlign: 'center',
        zIndex: 10
      }}>
        <Stepper currentStep={step} totalSteps={3} onStepChange={setStep}>
          {step === 1 && (
            <div className="animate-fade">
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Selamat Datang!</h2>
              <p style={{ color: 'var(--secondary-text)', marginBottom: '40px' }}>
                Alhamdulillah, kamu telah bergabung dengan Lentera. Mari kita mulai perjalanan ibadahmu.
              </p>
              <button className="btn-primary" onClick={() => setStep(2)}>Lanjut</button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade">
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Siapa namamu?</h2>
              <p style={{ color: 'var(--secondary-text)', marginBottom: '30px' }}>
                Kami ingin menyapamu dengan hangat di dashboard.
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama panggilanmu..."
                autoFocus
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '18px',
                  outline: 'none',
                  textAlign: 'center',
                  marginBottom: '30px'
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  style={{ flex: 1, background: 'transparent', border: '1px solid var(--divider)', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: 700 }}
                  onClick={() => setStep(1)}
                >
                  Kembali
                </button>
                <button
                  className="btn-primary"
                  style={{ flex: 2 }}
                  disabled={!name.trim()}
                  onClick={() => setStep(3)}
                >
                  Gunakan Nama Ini
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade">
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Siap Bersinar?</h2>
              <p style={{ color: 'var(--secondary-text)', marginBottom: '40px' }}>
                Nama <strong>{name}</strong> akan muncul di dashboardmu. Kamu bisa mengubahnya nanti di setelan.
              </p>

              {error && (
                <div style={{
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  color: '#ff6b6b',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleFinish}
                style={{ width: '100%' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Memproses...' : 'Masuk ke Dashboard'}
              </button>
            </div>
          )}
        </Stepper>
      </div>

      <style jsx>{`
        .animate-fade {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
