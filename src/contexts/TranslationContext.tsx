'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'id' | 'en';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.quran': 'Al-Quran',
    'nav.ceramah': 'Ceramah',
    'nav.lectures': 'Ceramah',
    'nav.kiblat': 'Kiblat',
    'nav.qibla': 'Kiblat',
    'nav.pledge': 'Komitmen',
    'nav.settings': 'Setelan',
    
    // Home/Dashboard
    'dashboard.welcome': 'Assalammualaikum',
    'dashboard.companion': 'Sahabat',
    'dashboard.tagline': 'Menuju Berkah Ramadan',
    'dashboard.ask_ai': 'Tanya AI',
    'home.greeting': 'Assalamualaikum',
    'home.welcome': 'Selamat datang di LENTERA',
    'home.subtitle': 'Temani ibadah Ramadanmu dengan lebih khusyuk',
    
    // Prayer Times
    'prayer.next': 'Sholat Berikutnya',
    'prayer.time': 'Waktu',
    'prayer.fajr': 'Subuh',
    'prayer.sunrise': 'Dhuha',
    'prayer.dhuhr': 'Dzuhur',
    'prayer.asr': 'Ashar',
    'prayer.maghrib': 'Maghrib',
    'prayer.isha': 'Isya',
    
    // Quick Actions
    'action.quran': 'Baca Quran',
    'action.ceramah': 'Tonton Ceramah',
    'action.kiblat': 'Arah Kiblat',
    'action.ai': 'Tanya AI',
    'action.zakat': 'Zakat Fitrah',
    'action.zakat_sub': 'Tunaikan kewajiban Anda',
    'action.mosque': 'Daftar Masjid',
    'action.mosque_sub': 'Cari masjid terdekat',
    'action.kultum': 'Kultum Hari Ini',
    'action.kultum_sub': 'Nasihat bermakna',
    'action.qibla': 'Kiblat',
    'action.qibla_sub': 'Arah sholat tepat',
    
    // Donation
    'donation.title': 'Gelas Kebaikan',
    'donation.subtitle': 'Setiap tetes sedekahmu via Mayar mengisi gelas ini.',
    'donation.button': 'Nyalakan Kebaikan',
    'donation.packages': 'Pilih Paket Donasi',
    'dashboard.ignite_kindness': 'Nyalakan Kebaikan',
    
    // Quran
    'quran.search': 'Cari surat (contoh: Al-Baqarah)...',
    'quran.results': 'hasil',
    'quran.loading': 'Memuat Cahaya Al-Qur\'an...',
    'quran.play': 'Putar Satu Surat',
    'quran.play_full': 'Putar Satu Surat',
    'quran.stop': 'Berhenti Murottal',
    'quran.stop_full': 'Berhenti Murottal',
    'quran.back': 'Kembali',
    'quran.verses': 'Ayat',
    
    // AI Chat
    'ai.title': 'Lentera AI',
    'ai.placeholder': 'Tanyakan tentang Al-Qur\'an, ibadah, atau curhat...',
    'ai.suggested': '💡 Coba tanya ini:',
    'ai.send': '🚀',
    'ai.initial_greeting': 'Assalamualaikum! Saya Lentera AI. Ada yang bisa saya bantu untuk menemani ibadahmu hari ini?',
    'ai.prayer_time': 'Waktu',
    
    // Settings
    'settings.title': 'Pengaturan LENTERA',
    'settings.language': 'Bahasa',
    'settings.theme': 'Tema',
    'settings.notifications': 'Notifikasi',
    'settings.theme_sync': 'Sinkronisasi Tema Otomatis',
    'settings.theme_desc': 'Warna aplikasi berubah sesuai waktu langit di lokasi Anda.',
    'settings.lang_title': 'Bahasa Konten',
    'settings.lang_desc': 'Pilih bahasa untuk Al-Qur\'an dan Ceramah.',
    'settings.notif_title': 'Notifikasi Waktu Sholat',
    'settings.notif_desc': 'Terima pengingat 15, 10, dan 5 menit sebelum adzan.',
    'settings.gps_title': 'Akurasi GPS Tinggi',
    'settings.gps_desc': 'Ubah sensor perangkat untuk perhitungan Kiblat yang presisi.',
    
    // Common
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.retry': 'Coba Lagi',
    'common.close': 'Tutup',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    
    // Milestones
    'milestone.confetti': '🎉 Alhamdulillah! Gelas kebaikan penuh!',
    'milestone.keepgoing': 'Teruslah berbuat kebaikan!',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.quran': 'Quran',
    'nav.ceramah': 'Lectures',
    'nav.lectures': 'Lectures',
    'nav.kiblat': 'Qibla',
    'nav.qibla': 'Qibla',
    'nav.pledge': 'Pledge',
    'nav.settings': 'Settings',
    
    // Home/Dashboard
    'dashboard.welcome': 'Peace be upon you',
    'dashboard.companion': 'Friend',
    'dashboard.tagline': 'Towards Ramadan Blessing',
    'dashboard.ask_ai': 'Ask AI',
    'home.greeting': 'Assalamualaikum',
    'home.welcome': 'Welcome to LENTERA',
    'home.subtitle': 'Enhance your Ramadan worship with tranquility',
    
    // Prayer Times
    'prayer.next': 'Next Prayer',
    'prayer.time': 'Time',
    'prayer.fajr': 'Fajr',
    'prayer.sunrise': 'Dhuha',
    'prayer.dhuhr': 'Dhuhr',
    'prayer.asr': 'Asr',
    'prayer.maghrib': 'Maghrib',
    'prayer.isha': 'Isha',
    
    // Quick Actions
    'action.quran': 'Read Quran',
    'action.ceramah': 'Watch Lectures',
    'action.kiblat': 'Qibla Direction',
    'action.ai': 'Ask AI',
    'action.zakat': 'Zakat Fitrah',
    'action.zakat_sub': 'Fulfill your obligation',
    'action.mosque': 'Mosque List',
    'action.mosque_sub': 'Find nearest mosque',
    'action.kultum': 'Daily Lecture',
    'action.kultum_sub': 'Meaningful advice',
    'action.qibla': 'Qibla',
    'action.qibla_sub': 'Accurate prayer direction',
    
    // Donation
    'donation.title': 'Cup of Kindness',
    'donation.subtitle': 'Every drop of your charity via Mayar fills this cup.',
    'donation.button': 'Light Up Kindness',
    'donation.packages': 'Choose Donation Package',
    'dashboard.ignite_kindness': 'Ignite Kindness',
    
    // Quran
    'quran.search': 'Search surah (e.g., Al-Baqarah)...',
    'quran.results': 'results',
    'quran.loading': 'Loading Light of the Quran...',
    'quran.play': 'Play Full Surah',
    'quran.play_full': 'Play Full Surah',
    'quran.stop': 'Stop Recitation',
    'quran.stop_full': 'Stop Recitation',
    'quran.back': 'Back',
    'quran.verses': 'Verses',
    
    // AI Chat
    'ai.title': 'Lentera AI',
    'ai.placeholder': 'Ask about Quran, worship, or share your feelings...',
    'ai.suggested': '💡 Try asking:',
    'ai.send': '🚀',
    'ai.initial_greeting': 'Assalamualaikum! I am Lentera AI. How can I help enhance your worship today?',
    'ai.prayer_time': 'Time',
    
    // Settings
    'settings.title': 'LENTERA Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.notifications': 'Notifications',
    'settings.theme_sync': 'Auto Theme Sync',
    'settings.theme_desc': 'App colors change based on the sky at your location.',
    'settings.lang_title': 'Content Language',
    'settings.lang_desc': 'Choose language for Al-Quran and Lectures.',
    'settings.notif_title': 'Prayer Time Notifications',
    'settings.notif_desc': 'Receive reminders 15, 10, and 5 minutes before adhan.',
    'settings.gps_title': 'High Precision GPS',
    'settings.gps_desc': 'Use device sensors for precise Qibla calculation.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Try Again',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    
    // Milestones
    'milestone.confetti': '🎉 Alhamdulillah! Cup of kindness is full!',
    'milestone.keepgoing': 'Keep doing good deeds!',
  },
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    const saved = localStorage.getItem('lentera_language') as Language;
    if (saved && (saved === 'id' || saved === 'en')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lentera_language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
