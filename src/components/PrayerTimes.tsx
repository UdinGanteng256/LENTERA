'use client';

import React, { useState, useEffect } from 'react';
import { getPrayerTimes, formatPrayerTime, PRAYER_ICONS } from '@/lib/prayerTimes';
import { useLocation } from '@/hooks/useLocation';
import { useLanguage } from '@/hooks/useLanguage';

const PrayerTimes = () => {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const { location } = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return <div className="prayer-grid-placeholder" style={{ height: '120px' }}></div>;

  // Default to Jakarta coordinates if location not available
  const lat = location?.lat || -6.2088;
  const lon = location?.lon || 106.8456;

  const schedule = getPrayerTimes(lat, lon, now);
  const { prayers, nextPrayer } = schedule;

  const prayerList = [
    { id: 'fajr', name: t('prayer.fajr'), time: formatPrayerTime(prayers.fajr), icon: PRAYER_ICONS['Subuh'] },
    { id: 'sunrise', name: t('prayer.sunrise'), time: formatPrayerTime(prayers.sunrise), icon: PRAYER_ICONS['Dhuha'] },
    { id: 'dhuhr', name: t('prayer.dhuhr'), time: formatPrayerTime(prayers.dhuhr), icon: PRAYER_ICONS['Dzuhur'] },
    { id: 'asr', name: t('prayer.asr'), time: formatPrayerTime(prayers.asr), icon: PRAYER_ICONS['Ashar'] },
    { id: 'maghrib', name: t('prayer.maghrib'), time: formatPrayerTime(prayers.maghrib), icon: PRAYER_ICONS['Maghrib'] },
    { id: 'isha', name: t('prayer.isha'), time: formatPrayerTime(prayers.isha), icon: PRAYER_ICONS['Isya'] },
  ];

  const nextPrayerKey = nextPrayer ? nextPrayer.toLowerCase() : '';

  return (
    <div className="prayer-grid">
      {prayerList.map((sholat) => {
        const isNext = sholat.id === nextPrayerKey;
        return (
          <div key={sholat.id} className={`prayer-card ${isNext ? 'active' : ''}`}>
            <span className="icon">{sholat.icon}</span>
            <span className="name">{sholat.name}</span>
            <span className="time">{sholat.time}</span>
            {isNext && <div className="badge">{t('prayer.next')}</div>}
          </div>
        );
      })}

      <style jsx>{`
        .prayer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 16px;
          width: 100%;
          max-width: 1100px;
        }
        .prayer-card {
          background: var(--panel-bg);
          backdrop-filter: blur(var(--glass-blur));
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          transition: all 0.3s ease;
        }
        .prayer-card.active {
          border-color: var(--primary);
          background: var(--panel-bg);
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
          transform: translateY(-5px);
        }
        .icon { font-size: 28px; margin-bottom: 4px; }
        .name { font-size: 12px; font-weight: 600; color: var(--secondary-text); text-transform: uppercase; }
        .time { font-size: 20px; font-weight: 800; color: var(--primary-text); }
        .badge {
          position: absolute; top: -10px;
          background: var(--primary); color: #0F0F1B;
          font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default PrayerTimes;
