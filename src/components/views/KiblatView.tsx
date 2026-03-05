'use client';

import React, { useEffect, useState } from 'react';
import { useLocation } from '@/hooks/useLocation';

const KAABA_COORDS = { lat: 21.4225, lon: 39.8262 };

const KiblatView = () => {
  const { location, city } = useLocation();
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState(0);

  // Calculate Qibla Bearing
  useEffect(() => {
    if (location) {
      const lat1 = location.lat * Math.PI / 180;
      const lon1 = location.lon * Math.PI / 180;
      const lat2 = KAABA_COORDS.lat * Math.PI / 180;
      const lon2 = KAABA_COORDS.lon * Math.PI / 180;

      const y = Math.sin(lon2 - lon1);
      const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lon2 - lon1);

      let bearing = Math.atan2(y, x) * 180 / Math.PI;
      bearing = (bearing + 360) % 360;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQiblaAngle(bearing);
    }
  }, [location]);

  // Listen to Device Orientation (Magnetic North)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOrientation = (e: any) => {
      if (e.webkitCompassHeading) {
        // iOS support
        setDeviceHeading(e.webkitCompassHeading);
      } else if (e.alpha) {
        // Android/General support
        setDeviceHeading(360 - e.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  return (
    <div className="kiblat-container animate-fade">
      {/* Mobile Notification */}
      <div className="glass-card mobile-alert">
        <span>📱</span>
        <p>Buka LENTERA di Smartphone Anda untuk akurasi arah Kiblat yang lebih presisi (GPS & Kompas Sensor).</p>
      </div>

      <div className="compass-container">
        {/* Outer Compass Dial (Rotates with device) */}
        <div className="compass-dial glass-card" style={{ transform: `rotate(${-deviceHeading}deg)` }}>
          <div className="cardinal-point n">N</div>
          <div className="cardinal-point s">S</div>
          <div className="cardinal-point e">E</div>
          <div className="cardinal-point w">W</div>

          {/* Kaaba Marker (Fixed position relative to North) */}
          {qiblaAngle !== null && (
            <div className="kiblat-pointer" style={{ transform: `rotate(${qiblaAngle}deg)` }}>
              <div className="kaaba-icon">🕋</div>
              <div className="pointer-line"></div>
            </div>
          )}
        </div>

        {/* Center Needle (Stays pointing to Qibla relative to screen) */}
        <div className="needle-base"></div>
      </div>

      <div style={{ marginTop: '60px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '28px', color: 'var(--primary)', fontWeight: 800 }}>
          {qiblaAngle ? qiblaAngle.toFixed(1) : '--'}°
        </h3>
        <p style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>
          Derajat dari Utara ke Barat di {city}
        </p>
        <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.5 }}>
          Pastikan perangkat Anda memiliki sensor kompas aktif.
        </p>
      </div>

      <style jsx>{`
        .kiblat-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        .compass-container {
          position: relative;
          width: 320px;
          height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .compass-dial {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          position: relative;
          border: 2px solid var(--glass-border);
          transition: transform 0.2s ease-out;
        }
        .cardinal-point {
          position: absolute;
          font-weight: 900;
          font-size: 18px;
          color: var(--secondary-text);
        }
        .n { top: 15px; left: 50%; transform: translateX(-50%); color: #FF4D4D; }
        .s { bottom: 15px; left: 50%; transform: translateX(-50%); }
        .e { right: 15px; top: 50%; transform: translateY(-50%); }
        .w { left: 15px; top: 50%; transform: translateY(-50%); }

        .kiblat-pointer {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.5s ease;
        }
        .kaaba-icon {
          margin-top: 40px;
          font-size: 32px;
          filter: drop-shadow(0 0 10px var(--primary));
          z-index: 5;
        }
        .pointer-line {
          width: 4px;
          height: 60px;
          background: var(--primary);
          border-radius: 2px;
          box-shadow: 0 0 15px var(--primary);
        }
        .needle-base {
          position: absolute;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          z-index: 10;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default KiblatView;
