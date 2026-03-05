/**
 * Smart Alerts - Notifikasi Adzan Presisi
 * 
 * Sistem notifikasi untuk waktu sholat dengan multiple alerts:
 * - 15 menit sebelum
 * - 10 menit sebelum
 * - 5 menit sebelum
 * - Waktu sholat tiba
 */

import { Prayer as AdhanPrayer, PrayerSchedule, PRAYER_NAMES } from '@/lib/prayerTimes';

export type Prayer = typeof AdhanPrayer[keyof typeof AdhanPrayer];
export type AlertType = 'preparation' | 'reminder' | 'imminent' | 'prayer_time';

export interface AlertConfig {
  type: AlertType;
  minutesBefore: number;
  title: string;
  message: (prayerName: string) => string;
  icon: string;
  sound: string;
}

export interface ScheduledAlert {
  id: string;
  prayer: Prayer;
  alertTime: Date;
  config: AlertConfig;
  triggered: boolean;
}

/**
 * Alert configurations for each notification type
 */
export const ALERT_CONFIGS: Record<AlertType, AlertConfig> = {
  preparation: {
    type: 'preparation',
    minutesBefore: 15,
    title: 'Persiapan Sholat',
    message: (prayerName) => `Waktu ${prayerName} akan tiba dalam 15 menit. Persiapkan diri Anda untuk beribadah.`,
    icon: '🕌',
    sound: 'gentle',
  },
  reminder: {
    type: 'reminder',
    minutesBefore: 10,
    title: 'Pengingat Sholat',
    message: (prayerName) => `Jangan lupa, sholat ${prayerName} tinggal 10 menit lagi.`,
    icon: '⏰',
    sound: 'reminder',
  },
  imminent: {
    type: 'imminent',
    minutesBefore: 5,
    title: 'Waktu Hampir Tiba',
    message: (prayerName) => `Sholat ${prayerName} dalam 5 menit. Segerakan berwudhu.`,
    icon: '🤲',
    sound: 'urgent',
  },
  prayer_time: {
    type: 'prayer_time',
    minutesBefore: 0,
    title: 'Waktu Sholat Tiba',
    message: (prayerName) => `Waktu sholat ${prayerName} telah tiba. Mari sholat!`,
    icon: '📿',
    sound: 'adhan',
  },
};

/**
 * Schedule alerts for all prayers in a day
 */
export function scheduleDailyAlerts(schedule: PrayerSchedule): ScheduledAlert[] {
  const alerts: ScheduledAlert[] = [];
  const { prayers } = schedule;

  // Generate alerts for each prayer
  (Object.keys(ALERT_CONFIGS) as AlertType[]).forEach(alertType => {
    const config = ALERT_CONFIGS[alertType];

    (Object.keys(prayers) as Array<keyof typeof prayers>).forEach(prayerKey => {
      const prayerTime = prayers[prayerKey];
      const prayer = prayerKey as string;

      // Skip sunrise and none
      if (!prayerTime || prayerKey === 'sunrise') return;

      const alertTime = new Date(prayerTime.getTime() - (config.minutesBefore * 60 * 1000));

      alerts.push({
        id: `${prayerKey}-${alertType}`,
        prayer: prayer as Prayer,
        alertTime,
        config,
        triggered: false,
      });
    });
  });

  // Sort by alert time
  return alerts.sort((a, b) => a.alertTime.getTime() - b.alertTime.getTime());
}

/**
 * Get alerts that should be triggered now
 * Only returns alerts that occurred in the last 5 minutes to avoid spamming past alerts
 */
export function getDueAlerts(alerts: ScheduledAlert[]): ScheduledAlert[] {
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  
  return alerts.filter(alert => 
    !alert.triggered && 
    alert.alertTime.getTime() <= now && 
    alert.alertTime.getTime() > fiveMinutesAgo
  );
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser tidak mendukung notifikasi');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Send browser notification
 */
export function sendNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (Notification.permission !== 'granted') {
    return null;
  }

  try {
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
    return null;
  }
}

/**
 * Play alert sound
 */
export function playAlertSound(sound: string): void {
  // In production, replace with actual sound files
  const soundUrls: Record<string, string> = {
    gentle: '/sounds/gentle.mp3',
    reminder: '/sounds/reminder.mp3',
    urgent: '/sounds/urgent.mp3',
    adhan: '/sounds/adhan.mp3',
  };

  const audio = new Audio(soundUrls[sound] || soundUrls.gentle);
  audio.volume = 0.5;
  audio.play().catch(e => console.log('Audio play failed:', e));
}

/**
 * Format alert message for display
 */
export function formatAlertMessage(config: AlertConfig, prayer: string): string {
  const prayerName = PRAYER_NAMES[prayer as keyof typeof PRAYER_NAMES] || 'Sholat';
  return config.message(prayerName);
}

/**
 * Check if alert system is supported
 */
export function isAlertSystemSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Store alert preferences in localStorage
 */
export interface AlertPreferences {
  enabled: boolean;
  alerts: {
    preparation: boolean;
    reminder: boolean;
    imminent: boolean;
    prayer_time: boolean;
  };
  soundEnabled: boolean;
  volume: number;
}

const DEFAULT_PREFERENCES: AlertPreferences = {
  enabled: true,
  alerts: {
    preparation: true,
    reminder: true,
    imminent: true,
    prayer_time: true,
  },
  soundEnabled: true,
  volume: 0.5,
};

export function getAlertPreferences(): AlertPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem('lentera_alert_preferences');
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load alert preferences:', error);
  }

  return DEFAULT_PREFERENCES;
}

export function saveAlertPreferences(preferences: AlertPreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('lentera_alert_preferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save alert preferences:', error);
  }
}
