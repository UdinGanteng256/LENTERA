'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getPrayerTimes } from '@/lib/prayerTimes';
import {
  scheduleDailyAlerts,
  getDueAlerts,
  requestNotificationPermission,
  sendNotification,
  playAlertSound,
  formatAlertMessage,
  getAlertPreferences,
  AlertPreferences,
} from '@/lib/smartAlerts';
import { useLocation } from '@/hooks/useLocation';

const EID_DATE = new Date('2026-03-20T00:00:00');

interface AlertNotification {
  id: string;
  title: string;
  message: string;
  icon: string;
  type: 'prayer' | 'zakat' | 'reminder';
  timestamp: Date;
}

const PrayerReminder = () => {
  const { location } = useLocation();
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [zakatReminder, setZakatReminder] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const triggeredAlertsRef = useRef<Set<string>>(new Set());

  // Request notification permission on mount and load preferences
  useEffect(() => {
    let isMounted = true;
    
    requestNotificationPermission().then(granted => {
      if (isMounted) setPermissionGranted(granted);
    });
    
    // Load preferences outside of the promise chain
    const prefs = getAlertPreferences();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isMounted) setPreferences(prefs);
    
    return () => { isMounted = false; };
  }, []);

  // Check for due alerts
  useEffect(() => {
    if (!location || !preferences?.enabled) return;

    const checkAlerts = () => {
      const schedule = getPrayerTimes(location.lat, location.lon);
      const alerts = scheduleDailyAlerts(schedule);
      const dueAlerts = getDueAlerts(alerts);

      dueAlerts.forEach(alert => {
        if (triggeredAlertsRef.current.has(alert.id)) return;

        if (preferences.alerts[alert.config.type]) {
          const message = formatAlertMessage(alert.config, alert.prayer);

          // Mark as triggered immediately
          triggeredAlertsRef.current.add(alert.id);

          // Add to in-app notifications
          const notification: AlertNotification = {
            id: alert.id,
            title: alert.config.title,
            message,
            icon: alert.config.icon,
            type: 'prayer',
            timestamp: new Date(),
          };

          setNotifications(prev => {
            // Avoid duplicates
            if (prev.some(n => n.id === alert.id)) return prev;
            return [...prev, notification];
          });

          // Send browser notification
          if (permissionGranted) {
            sendNotification(alert.config.title, {
              body: message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            });

            // Play sound
            if (preferences.soundEnabled) {
              playAlertSound(alert.config.sound);
            }
          }
        }
      });
    };

    const timer = setInterval(checkAlerts, 10000); // Check every 10 seconds
    checkAlerts();

    return () => clearInterval(timer);
  }, [location, preferences, permissionGranted]);

  // Zakat reminder logic
  useEffect(() => {
    const checkZakat = () => {
      const now = new Date();
      const timeDiff = EID_DATE.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysLeft <= 7 && daysLeft > 0) {
        setZakatReminder(`📦 Pengingat: Idulfitri tinggal ${daysLeft} hari lagi. Jangan lupa tunaikan Zakat Fitrah!`);
      } else if (daysLeft === 0) {
        setZakatReminder(`❗ Hari terakhir menunaikan Zakat Fitrah sebelum Sholat Id!`);
      }
    };

    checkZakat();
    const zakatTimer = setInterval(checkZakat, 60000);
    return () => clearInterval(zakatTimer);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  if (notifications.length === 0 && !zakatReminder) return null;

  return (
    <div className="reminder-container">
      {zakatReminder && (
        <div className="banner zakat-banner">
          <span>{zakatReminder}</span>
          <button onClick={() => setZakatReminder(null)}>×</button>
        </div>
      )}

      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="banner prayer-banner"
          style={{
            top: `${80 + (index * 70)}px`,
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <div className="banner-content">
            <span className="banner-icon">{notification.icon}</span>
            <div className="banner-text">
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </div>
          </div>
          <button onClick={() => dismissNotification(notification.id)}>×</button>
        </div>
      ))}

      {notifications.length > 1 && (
        <button className="dismiss-all" onClick={dismissAll}>
          Tutup Semua
        </button>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .reminder-container {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 90%;
          max-width: 500px;
          pointer-events: none;
        }
        .banner {
          padding: 16px 20px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          font-size: 13px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.6);
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(12px);
          pointer-events: auto;
          position: relative;
        }
        .banner-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .banner-icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        .banner-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .banner-text strong {
          font-size: 14px;
          color: inherit;
        }
        .banner-text p {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
          font-weight: 500;
        }
        .prayer-banner {
          background: rgba(212, 175, 55, 0.95);
          color: #0F0F1B;
          border: 1px solid rgba(212, 175, 55, 0.5);
        }
        .zakat-banner {
          background: rgba(255, 77, 77, 0.95);
          color: white;
          border: 1px solid rgba(255, 77, 77, 0.5);
          top: 20px !important;
        }
        .banner button {
          background: rgba(255,255,255,0.2);
          border: none;
          color: inherit;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .banner button:hover {
          background: rgba(255,255,255,0.3);
        }
        .dismiss-all {
          align-self: center;
          margin-top: 8px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          pointer-events: auto;
          backdrop-filter: blur(8px);
          transition: all 0.2s;
        }
        .dismiss-all:hover {
          background: rgba(255,255,255,0.2);
        }
        @keyframes slideIn {
          from { 
            transform: translateY(-100px) scale(0.9); 
            opacity: 0; 
          }
          to { 
            transform: translateY(0) scale(1); 
            opacity: 1; 
          }
        }
      ` }} />
    </div>
  );
};

export default PrayerReminder;
