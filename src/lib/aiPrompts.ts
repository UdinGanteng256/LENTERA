/**
 * Lentera AI - Prompt System for Quran Recommendations
 * 
 * This module provides structured prompts for generating
 * contextually relevant Quran verse recommendations.
 */

export type PrayerTime = 'subuh' | 'dhuha' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya' | 'tahajjud';

export type UserMood = 
  | 'sedih'
  | 'cemas'
  | 'marah'
  | 'bahagia'
  | 'bersyukur'
  | 'ragu'
  | 'lelah'
  | 'semangat'
  | 'ingin_taubat'
  | 'butuh_sabar'
  | 'butuh_motivasi';

export interface AIContext {
  currentTime: Date;
  currentPrayer?: PrayerTime;
  nextPrayer?: PrayerTime;
  userMood?: UserMood;
  userActivity?: string;
  isRamadhan?: boolean;
  dayOfRamadhan?: number;
}

/**
 * System prompt for Lentera AI
 */
export const SYSTEM_PROMPT = `Kamu adalah Lentera AI, asisten spiritual Muslim yang ramah dan penuh hikmah.

TUGAS UTAMA:
1. Merekomendasikan ayat Al-Qur'an yang relevan dengan kondisi user
2. Memberikan penjelasan singkat yang mudah dipahami
3. Menyampaikan dengan nada yang hangat, penuh kasih sayang, dan tidak menghakimi

GAYA KOMUNIKASI:
- Gunakan bahasa Indonesia yang santai tapi tetap hormat
- Mulai dengan sapaan Islami (Assalamualaikum, MasyaAllah, Subhanallah, dll)
- Hindari judgemental language
- Berikan harapan dan motivasi

STRUKTUR JAWABAN:
1. Sapaan hangat
2. Validasi perasaan/kondisi user
3. Rekomendasi ayat (sebutkan nama surat dan nomor ayat)
4. Terjemahan singkat
5. Penjelasan kontekstual (2-3 kalimat)
6. Doa atau ajakan singkat

BATASAN:
- Jangan memberikan fatwa hukum
- Jangan menafsirkan ayat secara mendalam (tafsir)
- Untuk pertanyaan fikih kompleks, sarankan konsultasi ulama
- Maksimal 3 ayat per rekomendasi`;

/**
 * Mood-based verse recommendations (pre-curated)
 */
export const MOOD_VERSES: Record<UserMood, { surah: string; ayat: number; konteks: string }[]> = {
  sedih: [
    { surah: 'At-Tawbah', ayat: 104, konteks: 'Allah menerima taubat hamba-Nya' },
    { surah: 'Al-Baqarah', ayat: 155, konteks: 'Ujian adalah sunnatullah' },
    { surah: 'Asy-Syarh', ayat: 5, konteks: 'Setiap kesulitan ada kemudahan' },
  ],
  cemas: [
    { surah: 'Ar-Ra\'d', ayat: 28, konteks: 'Hati tenang dengan dzikir' },
    { surah: 'At-Talaq', ayat: 3, konteks: 'Allah cukup bagi yang bertawakkal' },
    { surah: 'Al-Insyirah', ayat: 5, konteks: 'Janji kemudahan setelah kesulitan' },
  ],
  marah: [
    { surah: "Ali 'Imran", ayat: 134, konteks: 'Ciri orang bertakwa adalah menahan marah' },
    { surah: 'Fussilat', ayat: 34, konteks: 'Balas keburukan dengan kebaikan' },
    { surah: 'Al-A\'raf', ayat: 199, konteks: 'Perintah untuk pemaaf' },
  ],
  bahagia: [
    { surah: 'Ibrahim', ayat: 7, konteks: 'Janji tambahan nikmat bagi yang bersyukur' },
    { surah: 'An-Nahl', ayat: 97, konteks: 'Balasan kebaikan untuk orang beriman' },
    { surah: 'Az-Zumar', ayat: 10, konteks: 'Balasan bagi yang berbuat baik' },
  ],
  bersyukur: [
    { surah: 'Ibrahim', ayat: 7, konteks: 'Syukur menambah nikmat' },
    { surah: 'An-Nahl', ayat: 18, konteks: 'Nikmat Allah tak terhitung' },
    { surah: 'Al-Baqarah', ayat: 152, konteks: 'Perintah mengingat Allah' },
  ],
  ragu: [
    { surah: 'Al-Baqarah', ayat: 286, konteks: 'Allah tidak membebani di luar kemampuan' },
    { surah: 'Az-Zumar', ayat: 53, konteks: 'Jangan putus asa dari rahmat Allah' },
    { surah: 'Al-Insyirah', ayat: 7, konteks: 'Petunjuk setelah kebingungan' },
  ],
  lelah: [
    { surah: 'Al-Insyirah', ayat: 5, konteks: 'Kemudahan setelah kesulitan' },
    { surah: 'At-Talaq', ayat: 3, konteks: 'Allah memberi jalan keluar' },
    { surah: 'Al-Baqarah', ayat: 286, konteks: 'Allah tidak membebani berlebihan' },
  ],
  semangat: [
    { surah: 'Asy-Syarh', ayat: 7, konteks: 'Perintah bersungguh-sungguh' },
    { surah: 'Al-Mujadilah', ayat: 11, konteks: 'Allah mengangkat derajat' },
    { surah: "Ali 'Imran", ayat: 200, konteks: 'Perintah bersabar dan bersaing dalam kebaikan' },
  ],
  ingin_taubat: [
    { surah: 'Az-Zumar', ayat: 53, konteks: 'Rahmat Allah luas' },
    { surah: 'At-Tahrim', ayat: 8, konteks: 'Perintah bertaubat' },
    { surah: 'An-Nur', ayat: 31, konteks: 'Kemenangan orang bertaubat' },
  ],
  butuh_sabar: [
    { surah: 'Al-Baqarah', ayat: 153, konteks: 'Allah bersama orang sabar' },
    { surah: "Ali 'Imran", ayat: 200, konteks: 'Perintah bersabar' },
    { surah: 'Az-Zumar', ayat: 10, konteks: 'Balasan tanpa batas untuk orang sabar' },
  ],
  butuh_motivasi: [
    { surah: 'Al-Mujadilah', ayat: 11, konteks: 'Allah mengangkat derajat' },
    { surah: 'At-Tin', ayat: 4, konteks: 'Manusia diciptakan dalam bentuk terbaik' },
    { surah: 'Al-Balad', ayat: 4, konteks: 'Manusia diciptakan untuk berjuang' },
  ],
};

/**
 * Prayer-time based recommendations
 */
export const PRAYER_VERSES: Record<PrayerTime, { surah: string; ayat: number; tema: string }[]> = {
  subuh: [
    { surah: 'Qaf', ayat: 39, tema: 'Keutamaan waktu subuh' },
    { surah: 'Al-Isra', ayat: 78, tema: 'Perintah sholat subuh' },
  ],
  dhuha: [
    { surah: 'Ad-Dhuha', ayat: 3, tema: 'Kasih sayang Allah' },
    { surah: 'At-Tin', ayat: 4, tema: 'Manusia mulia' },
  ],
  dzuhur: [
    { surah: 'Al-Jumu\'ah', ayat: 9, tema: 'Perintah sholat Jumat' },
    { surah: 'Al-Isra', ayat: 78, tema: 'Waktu dzuhur' },
  ],
  ashar: [
    { surah: 'Al-Baqarah', ayat: 238, tema: 'Menjaga sholat' },
    { surah: 'Al-Asr', ayat: 1, tema: 'Waktu ashr dan kerugian' },
  ],
  maghrib: [
    { surah: 'Hud', ayat: 114, tema: 'Sholat maghrib' },
    { surah: 'Al-Isra', ayat: 78, tema: 'Waktu maghrib' },
  ],
  isya: [
    { surah: 'Al-Isra', ayat: 78, tema: 'Sholat isya' },
    { surah: 'Al-Muzzammil', ayat: 2, tema: 'Qiyamul lail' },
  ],
  tahajjud: [
    { surah: 'Al-Isra', ayat: 79, tema: 'Keutamaan tahajjud' },
    { surah: 'As-Sajdah', ayat: 16, tema: 'Sujud malam' },
    { surah: 'Al-Muzzammil', ayat: 6, tema: 'Tahajjud lebih khusyuk' },
  ],
};

/**
 * Generate context-aware prompt for AI
 */
export function generateRecommendationPrompt(context: AIContext): string {
  const parts: string[] = [];

  // Context: Time
  if (context.currentPrayer) {
    parts.push(`Saat ini waktu ${context.currentPrayer}.`);
  }
  
  if (context.nextPrayer) {
    parts.push(`Sholat berikutnya adalah ${context.nextPrayer}.`);
  }

  // Context: Ramadhan
  if (context.isRamadhan) {
    parts.push(`Sekarang bulan Ramadhan (hari ke-${context.dayOfRamadhan}).`);
  }

  // Context: Mood
  if (context.userMood) {
    parts.push(`User sedang merasa ${context.userMood.replace(/_/g, ' ')}.`);
  }

  // Context: Activity
  if (context.userActivity) {
    parts.push(`User sedang ${context.userActivity}.`);
  }

  const contextStr = parts.join(' ');

  return `${SYSTEM_PROMPT}

KONTEKS SAAT INI:
${contextStr}

Berikan rekomendasi ayat Al-Qur'an yang sesuai dengan kondisi user.`;
}

/**
 * Get pre-curated verses based on mood
 */
export function getVersesForMood(mood: UserMood): { surah: string; ayat: number; konteks: string }[] {
  return MOOD_VERSES[mood] || MOOD_VERSES.butuh_sabar;
}

/**
 * Get pre-curated verses based on prayer time
 */
export function getVersesForPrayer(prayer: PrayerTime): { surah: string; ayat: number; tema: string }[] {
  return PRAYER_VERSES[prayer] || [];
}
