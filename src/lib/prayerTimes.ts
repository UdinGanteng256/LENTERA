import {
  CalculationMethod,
  Prayer,
  Coordinates,
  Qibla,
  Madhab,
  PrayerTimes as AdhanPrayerTimes,
} from 'adhan';

// Re-export Prayer enum for use in other modules
export { Prayer, Madhab };

export interface PrayerTime {
  name: string;
  time: Date;
  isNext?: boolean;
}

export interface PrayerSchedule {
  date: Date;
  prayers: {
    fajr: Date;
    sunrise: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextPrayer: any; // Using any to avoid complex type from adhan library
  timeToNextPrayer: number | null; // seconds
}

/**
 * Get prayer times for a specific date and location
 * Uses Adhan library for accurate calculations based on GPS coordinates
 */
export function getPrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): PrayerSchedule {
  const coordinates = new Coordinates(latitude, longitude);

  // Use Muslim World League method (common in Indonesia)
  // Can be adjusted based on user preference
  const params = CalculationMethod.MuslimWorldLeague();
  params.madhab = Madhab.Shafi; // Shafi'i is common in Indonesia

  const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);

  const nextPrayer = prayerTimes.nextPrayer();
  const timeToNextPrayer = nextPrayer
    ? Math.floor((prayerTimes.timeForPrayer(nextPrayer)!.getTime() - Date.now()) / 1000)
    : null;

  return {
    date,
    prayers: {
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
    },
    nextPrayer,
    timeToNextPrayer,
  };
}

/**
 * Calculate Qibla direction from given coordinates
 * @returns Qibla direction in degrees (0-360)
 */
export function getQiblaDirection(latitude: number, longitude: number): number {
  const coordinates = new Coordinates(latitude, longitude);
  return Qibla(coordinates);
}

/**
 * Get current prayer based on time
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCurrentPrayer(schedule: PrayerSchedule): any {
  const now = Date.now();
  const { prayers } = schedule;

  if (now < prayers.fajr.getTime()) return Prayer.Fajr;
  if (now < prayers.sunrise.getTime()) return Prayer.Sunrise;
  if (now < prayers.dhuhr.getTime()) return Prayer.Dhuhr;
  if (now < prayers.asr.getTime()) return Prayer.Asr;
  if (now < prayers.maghrib.getTime()) return Prayer.Maghrib;
  if (now < prayers.isha.getTime()) return Prayer.Maghrib;
  return Prayer.Isha;
}

/**
 * Format prayer time to HH:mm format
 */
export function formatPrayerTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Get time remaining until next prayer in human readable format
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Saat ini';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}j ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}d`;
  }
  return `${secs}d`;
}

/**
 * Prayer name mapping for display
 */
export const PRAYER_NAMES: Record<string, string | null> = {
  Fajr: 'Subuh',
  Sunrise: 'Dhuha',
  Dhuhr: 'Dzuhur',
  Asr: 'Ashar',
  Maghrib: 'Maghrib',
  Isha: 'Isya',
  None: null,
};

/**
 * Prayer icons for UI
 */
export const PRAYER_ICONS: Record<string, string> = {
  Subuh: '🌙',
  Dhuha: '☀️',
  Dzuhur: '☀️',
  Ashar: '⛅',
  Maghrib: '🌅',
  Isya: '🌃',
  Tahajjud: '✨',
};
