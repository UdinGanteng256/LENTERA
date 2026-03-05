/**
 * YouTube API Integration for LENTERA
 * Fetch videos from specific Islamic channels
 */

import axios from 'axios';

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  isLive: boolean;
  category: string;
}

// Channel IDs from the provided URLs
export const CERAMAH_CHANNELS = [
  {
    id: 'UC8vOr9_RY6_Z9X-sh_Zw', // Note: Need to extract actual channel ID
    name: 'Live Streaming Kajian',
    handle: '@live',
    type: 'live'
  },
  {
    id: 'UCzQUP1qoWDoEbmsQxvhjxus', // Hanan Attaki official channel ID
    name: 'Hanan Attaki',
    handle: '@HananAttaki',
    type: 'ceramah'
  },
  {
    id: 'UCjRJfHnAm8B6IqX8vOr9_RY', // Abdul Somad official channel ID
    name: 'Abdul Somad Official',
    handle: '@ustadzabdulsomadofficial',
    type: 'ceramah'
  }
];

/**
 * Get videos from specific channels (last 3 months)
 */
export async function getChannelVideos(
  channelIds: string[],
  apiKey: string,
  maxResults: number = 20
): Promise<YouTubeVideo[]> {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const allVideos: YouTubeVideo[] = [];

  for (const channelId of channelIds) {
    try {
      // First, get the latest videos from the channel
      const searchResponse = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            part: 'snippet',
            channelId: channelId,
            type: 'video',
            videoEmbeddable: 'true',
            maxResults: maxResults / channelIds.length,
            order: 'date',
            publishedAfter: threeMonthsAgo.toISOString(),
            key: apiKey
          }
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const videos: YouTubeVideo[] = searchResponse.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        isLive: false,
        category: 'CERAMAH'
      }));

      allVideos.push(...videos);
    } catch (error) {
      console.error(`Error fetching videos from channel ${channelId}:`, error);
    }
  }

  // Sort by published date (newest first)
  return allVideos.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Check for live streams
 */
export async function getLiveStreams(
  channelIds: string[],
  apiKey: string
): Promise<YouTubeVideo[]> {
  const liveVideos: YouTubeVideo[] = [];

  for (const channelId of channelIds) {
    try {
      const searchResponse = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            part: 'snippet',
            channelId: channelId,
            eventType: 'live',
            type: 'video',
            videoEmbeddable: 'true',
            maxResults: 5,
            key: apiKey
          }
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const videos: YouTubeVideo[] = searchResponse.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        isLive: true,
        category: 'LIVE 🔴'
      }));

      liveVideos.push(...videos);
    } catch (error) {
      console.error(`Error fetching live streams from channel ${channelId}:`, error);
    }
  }

  return liveVideos;
}

/**
 * Get videos by video IDs (for hardcoded live stream)
 */
export async function getVideosByIds(
  videoIds: string[],
  apiKey: string
): Promise<YouTubeVideo[]> {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'snippet,liveStreamingDetails',
          id: videoIds.join(','),
          key: apiKey
        }
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data.items.map((item: any) => {
      const isLive = !!item.liveStreamingDetails?.actualEndTime;
      
      return {
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        isLive: isLive,
        category: isLive ? 'LIVE 🔴' : 'CERAMAH'
      };
    });
  } catch (error) {
    console.error('Error fetching videos by IDs:', error);
    return [];
  }
}

/**
 * Fallback videos when API key is not available
 */
export function getFallbackVideos(): YouTubeVideo[] {
  return [
    // Live Makkah - Ka'bah
    {
      id: 'ZfNs8A3fMcc',
      title: '🕋 Makkah Live - Ka\'bah (Live Streaming)',
      channelTitle: 'Makkah Live',
      thumbnail: 'https://img.youtube.com/vi/ZfNs8A3fMcc/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      isLive: true,
      category: 'LIVE 🔴'
    },
    // Al Jazeera Live - News
    {
      id: 'gCNeDWCI0vo',
      title: '📰 Al Jazeera Live - Breaking News',
      channelTitle: 'Al Jazeera English',
      thumbnail: 'https://img.youtube.com/vi/gCNeDWCI0vo/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      isLive: true,
      category: 'LIVE 🔴'
    },
    // Ust. Adi Hidayat - Murottal
    {
      id: 'xkPPPcYnRO4',
      title: '📖 Murottal Al-Quran - Ust. Adi Hidayat',
      channelTitle: 'Adi Hidayat Official',
      thumbnail: 'https://img.youtube.com/vi/xkPPPcYnRO4/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      isLive: false,
      category: 'MUROTTAL'
    },
    {
      id: 'm97SDRxy8GM',
      title: '📖 Murottal Merdu - Ust. Adi Hidayat',
      channelTitle: 'Adi Hidayat Official',
      thumbnail: 'https://img.youtube.com/vi/m97SDRxy8GM/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      isLive: false,
      category: 'MUROTTAL'
    },
    {
      id: 'TiRobhG3vKc',
      title: '🎤 Kajian Islam - Ust. Adi Hidayat',
      channelTitle: 'Adi Hidayat Official',
      thumbnail: 'https://img.youtube.com/vi/TiRobhG3vKc/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      isLive: false,
      category: 'CERAMAH'
    },
    // Ust. Khalid Basalamah
    {
      id: 'VAFHmxuhUhs',
      title: '🎤 Fiqih Praktis - Ust. Khalid Basalamah',
      channelTitle: 'Khalid Basalamah Official',
      thumbnail: 'https://img.youtube.com/vi/VAFHmxuhUhs/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      isLive: false,
      category: 'CERAMAH'
    }
  ];
}

/**
 * Extract channel ID from YouTube handle/URL
 * Note: This requires YouTube Data API v3 or manual lookup
 */
export function extractChannelIdFromUrl(url: string): string | null {
  // Handle different YouTube URL formats
  const patterns = [
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
