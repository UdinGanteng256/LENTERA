/**
 * Lentera AI - Groq SDK Integration
 * 
 * Using Groq's LPU Inference Engine for fast, contextual
 * Quran and Islamic recommendations
 */

import Groq from 'groq-sdk';
import {
  SYSTEM_PROMPT,
  generateRecommendationPrompt,
  AIContext,
  getVersesForMood,
  getVersesForPrayer,
} from '@/lib/aiPrompts';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true, // For client-side usage (consider server-side only for prod)
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  verses?: Array<{
    surah: string;
    ayat: number;
    terjemahan: string;
    konteks: string;
  }>;
  prayerRecommendation?: string;
}

/**
 * Chat with Lentera AI using Groq
 */
export async function chatWithLenteraAI(
  messages: ChatMessage[],
  context?: AIContext
): Promise<AIResponse> {
  try {
    // Build enhanced system prompt with context
    let systemPrompt = SYSTEM_PROMPT;

    if (context) {
      const contextPrompt = generateRecommendationPrompt(context);
      systemPrompt = `${SYSTEM_PROMPT}\n\n${contextPrompt}`;
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.95,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content || '';

    // Parse response for verses (if AI includes them in structured format)
    const verses = parseVersesFromResponse(response);

    return {
      text: response,
      verses,
    };
  } catch (error) {
    console.error('Lentera AI Error:', error);
    throw new Error('Gagal terhubung dengan Lentera AI');
  }
}

/**
 * Get quick verse recommendation based on mood
 * Uses pre-curated list for instant response, then enhances with AI
 */
export async function getMoodRecommendation(
  mood: string,
  currentPrayer?: string
): Promise<AIResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const preCuratedVerses = getVersesForMood(mood as any);

  const prompt = `User sedang merasa ${mood}. ${currentPrayer ? `Saat ini waktu ${currentPrayer}.` : ''
    }
  
  Berikan rekomendasi ayat yang menenangkan dengan struktur:
  1. Sapaan hangat
  2. 1-2 ayat rekomendasi
  3. Penjelasan singkat
  4. Doa singkat`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 512,
    });

    const response = completion.choices[0]?.message?.content || '';

    return {
      text: response,
      verses: preCuratedVerses.map(v => ({
        surah: v.surah,
        ayat: v.ayat,
        terjemahan: '',
        konteks: v.konteks,
      })),
    };
  } catch {
    // Fallback to pre-curated only
    return {
      text: `Berikut ayat yang bisa menenangkan hatimu...\n\n${preCuratedVerses.map(v => `• ${v.surah}:${v.ayat} - ${v.konteks}`).join('\n')
        }`,
      verses: preCuratedVerses.map(v => ({
        surah: v.surah,
        ayat: v.ayat,
        terjemahan: '',
        konteks: v.konteks,
      })),
    };
  }
}

/**
 * Get prayer-time specific recommendation
 */
export async function getPrayerTimeRecommendation(
  prayer: string
): Promise<AIResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const preCuratedVerses = getVersesForPrayer(prayer as any);

  const prayerNames: Record<string, string> = {
    subuh: 'Subuh',
    dhuha: 'Dhuha',
    dzuhur: 'Dzuhur',
    ashar: 'Ashar',
    maghrib: 'Maghrib',
    isya: 'Isya',
    tahajjud: 'Tahajjud',
  };

  const prompt = `Saat ini waktu ${prayerNames[prayer] || prayer}. 
  Berikan keutamaan dan amalan yang bisa dikerjakan di waktu ini, 
  beserta 1-2 ayat pendukung.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 512,
    });

    const response = completion.choices[0]?.message?.content || '';

    return {
      text: response,
      verses: preCuratedVerses.map(v => ({
        surah: v.surah,
        ayat: v.ayat,
        terjemahan: '',
        konteks: v.tema,
      })),
    };
  } catch {
    return {
      text: `Keutamaan waktu ${prayerNames[prayer] || prayer}...\n\n${preCuratedVerses.map(v => `• ${v.surah}:${v.ayat} - ${v.tema}`).join('\n')
        }`,
      verses: preCuratedVerses.map(v => ({
        surah: v.surah,
        ayat: v.ayat,
        terjemahan: '',
        konteks: v.tema,
      })),
    };
  }
}

/**
 * Parse verses from AI response (simple regex-based)
 */
function parseVersesFromResponse(response: string): AIResponse['verses'] {
  const verses: AIResponse['verses'] = [];

  // Match patterns like "Al-Baqarah:255" or "QS. Al-Ikhlas:1"
  const versePattern = /(QS\.?\s*)?([A-Za-z\-'\s]+)[:\s](\d+)/gi;
  const matches = [...response.matchAll(versePattern)];

  matches.forEach(match => {
    verses.push({
      surah: match[2].trim(),
      ayat: parseInt(match[3]),
      terjemahan: '',
      konteks: '',
    });
  });

  return verses.length > 0 ? verses : undefined;
}

/**
 * Streaming chat response (for real-time typing effect)
 */
export async function* streamChatWithLenteraAI(
  messages: ChatMessage[],
  context?: AIContext
): AsyncGenerator<string> {
  let systemPrompt = SYSTEM_PROMPT;

  if (context) {
    systemPrompt = `${SYSTEM_PROMPT}\n\n${generateRecommendationPrompt(context)}`;
  }

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1024,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield content;
    }
  }
}
