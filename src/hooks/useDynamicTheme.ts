'use client';

import { useState, useEffect } from 'react';
import { getPrayerTimes, Prayer as AdhanPrayer } from '@/lib/prayerTimes';

export type ThemeName = 'dawn' | 'day' | 'afternoon' | 'sunset' | 'maghrib' | 'night' | 'midnight';
export type Prayer = typeof AdhanPrayer[keyof typeof AdhanPrayer];

export interface ThemeState {
  theme: ThemeName;
  currentPrayer: Prayer | null;
  nextPrayer: Prayer | null;
  timeToNextPrayer: number | null;
}

export const useDynamicTheme = (latitude?: number, longitude?: number) => {
  const [state, setState] = useState<ThemeState>({
    theme: 'night',
    currentPrayer: null,
    nextPrayer: null,
    timeToNextPrayer: null,
  });

  useEffect(() => {
    // Default coordinates for Jakarta if not provided
    const lat = latitude || -6.2088;
    const lon = longitude || 106.8456;

    const updateTheme = () => {
      const now = new Date();
      const schedule = getPrayerTimes(lat, lon, now);
      const { prayers, nextPrayer, timeToNextPrayer } = schedule;

      // Determine current prayer
      let currentPrayer: Prayer | null = null;
      const prayerTimes = [
        { prayer: AdhanPrayer.Fajr as Prayer, time: prayers.fajr.getTime() },
        { prayer: AdhanPrayer.Sunrise as Prayer, time: prayers.sunrise.getTime() },
        { prayer: AdhanPrayer.Dhuhr as Prayer, time: prayers.dhuhr.getTime() },
        { prayer: AdhanPrayer.Asr as Prayer, time: prayers.asr.getTime() },
        { prayer: AdhanPrayer.Maghrib as Prayer, time: prayers.maghrib.getTime() },
        { prayer: AdhanPrayer.Isha as Prayer, time: prayers.isha.getTime() },
      ];

      const nowTime = now.getTime();
      for (let i = prayerTimes.length - 1; i >= 0; i--) {
        if (nowTime >= prayerTimes[i].time) {
          currentPrayer = prayerTimes[i].prayer;
          break;
        }
      }

      // Determine theme based on time
      let newTheme: ThemeName = 'night';
      const hour = now.getHours();

      if (hour >= 4 && hour < 6) {
        newTheme = 'dawn';
      } else if (hour >= 6 && hour < 12) {
        newTheme = 'day';
      } else if (hour >= 12 && hour < 15) {
        newTheme = 'afternoon';
      } else if (hour >= 15 && hour < 18) {
        newTheme = 'sunset';
      } else if (hour >= 18 && hour < 19) {
        newTheme = 'maghrib';
      } else if (hour >= 19 && hour < 23) {
        newTheme = 'night';
      } else {
        newTheme = 'midnight';
      }

      setState({
        theme: newTheme,
        currentPrayer,
        nextPrayer,
        timeToNextPrayer,
      });

      // Apply theme class to document
      document.body.className = `theme-${newTheme}`;
      document.documentElement.setAttribute('data-theme', newTheme);
    };

    updateTheme();
    const timer = setInterval(updateTheme, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, [latitude, longitude]);

  return state;
};
