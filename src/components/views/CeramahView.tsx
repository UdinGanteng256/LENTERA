'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { getFallbackVideos, YouTubeVideo } from '@/lib/youtube';

// Specific video IDs from the provided URLs
const FEATURED_VIDEO_IDS = [
  'vKDsPLCvWwo', // New Live stream
  'bNY8a2BB5Gc', // Live stream from YouTube Live
  'E_mw-OfdY0E', // Video from YouTube - CNN Playlist
  'akGJra0vGhI', // Additional live stream
  'ZfNs8A3fMcc', // Makkah Live - Ka'bah
];

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="skeleton-grid">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="skeleton-card glass-card">
        <div className="skeleton-thumbnail"></div>
        <div className="skeleton-info">
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>
      </div>
    ))}
  </div>
);

// Optimized Video Card Component with memo
const VideoCard = memo(({ video, isSelected, onClick }: { 
  video: YouTubeVideo; 
  isSelected: boolean; 
  onClick: (id: string) => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={`channel-card glass-card ${isSelected ? 'active' : ''}`}
      onClick={() => onClick(video.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(video.id)}
      aria-label={`Play ${video.title}`}
    >
      <div className="thumb-container">
        {!imageLoaded && <div className="image-placeholder"></div>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
        {video.isLive && (
          <div className="live-badge">
            🔴 LIVE
          </div>
        )}
        <div className="cat-tag">{video.category}</div>
      </div>
      <div className="card-info">
        <h4 dangerouslySetInnerHTML={{ __html: video.title }}></h4>
        <p>{video.channelTitle}</p>
      </div>
    </div>
  );
});

VideoCard.displayName = 'VideoCard';

const CeramahView = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [liveVideos, setLiveVideos] = useState<YouTubeVideo[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'live'>('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch videos by IDs - memoized to prevent recreation
  const fetchVideosByIds = useCallback(async (ids: string[], key: string): Promise<YouTubeVideo[]> => {
    try {
      const axios = (await import('axios')).default;
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/videos',
        {
          params: {
            part: 'snippet',
            id: ids.join(','),
            key
          }
        }
      );
      return response.data.items.map((item: {
        id: string;
        snippet: {
          title: string;
          channelTitle: string;
          thumbnails: {
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
          };
          publishedAt: string;
        };
      }) => ({
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        isLive: false,
        category: 'CERAMAH'
      }));
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let idleCallbackId: number | null = null;

    const fetchVideos = async () => {
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      const fallbackVideos = getFallbackVideos();

      // Use fallback immediately for faster initial render
      if (!apiKey) {
        if (isMounted) {
          // Use requestIdleCallback for non-critical updates (with fallback for Safari)
          const scheduleIdleTask = window.requestIdleCallback || ((cb: IdleRequestCallback) => setTimeout(cb, 1));
          idleCallbackId = scheduleIdleTask(() => {
            setVideos(fallbackVideos);
            const live = fallbackVideos.filter(v => v.isLive);
            setLiveVideos(live);
            if (live.length > 0) {
              setSelectedId(live[0].id);
            } else if (fallbackVideos.length > 0) {
              setSelectedId(fallbackVideos[0].id);
            }
            setLoading(false);
          });
        }
        return;
      }

      try {
        // Fetch videos from featured IDs
        const featuredVideos = await fetchVideosByIds(FEATURED_VIDEO_IDS, apiKey);

        if (!isMounted) return;

        // Filter videos from last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const filteredVideos = featuredVideos.filter((v: YouTubeVideo) =>
          new Date(v.publishedAt) >= threeMonthsAgo
        );

        // Separate live and regular videos
        const live = filteredVideos.filter((v: YouTubeVideo) => v.isLive);
        const regular = filteredVideos.filter((v: YouTubeVideo) => !v.isLive);

        // Use requestIdleCallback for non-critical state updates (with fallback for Safari)
        const scheduleIdleTask = window.requestIdleCallback || ((cb: IdleRequestCallback) => setTimeout(cb, 1));
        idleCallbackId = scheduleIdleTask(() => {
          if (isMounted) {
            setVideos(regular);
            setLiveVideos(live);

            // Select first live video or first video
            if (live.length > 0) {
              setSelectedId(live[0].id);
            } else if (filteredVideos.length > 0) {
              setSelectedId(filteredVideos[0].id);
            }
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('Error fetching YouTube videos:', err);
        if (isMounted) {
          setError('Gagal memuat video. Menggunakan data fallback.');
          const scheduleIdleTask = window.requestIdleCallback || ((cb: IdleRequestCallback) => setTimeout(cb, 1));
          idleCallbackId = scheduleIdleTask(() => {
            setVideos(fallbackVideos);
            setLiveVideos(fallbackVideos.filter(v => v.isLive));
            setSelectedId(fallbackVideos[0]?.id || '');
            setLoading(false);
          });
        }
      }
    };

    fetchVideos();

    return () => {
      isMounted = false;
      if (idleCallbackId !== null) {
        const cancelIdleTask = window.cancelIdleCallback || ((id: number) => clearTimeout(id));
        cancelIdleTask(idleCallbackId);
      }
    };
  }, [fetchVideosByIds]);

  const selectedVideo = useMemo(() => 
    [...liveVideos, ...videos].find(v => v.id === selectedId),
    [liveVideos, videos, selectedId]
  );

  const displayVideos = useMemo(() => 
    activeTab === 'live' ? liveVideos : videos,
    [activeTab, liveVideos, videos]
  );

  const handleTabChange = useCallback((tab: 'all' | 'live') => {
    setActiveTab(tab);
  }, []);

  const handleVideoSelect = useCallback((id: string) => {
    setSelectedId(id);
    // Scroll to top smoothly when selecting a video
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="ceramah-container animate-fade">
      {/* Media Player Utama - Lazy loaded iframe */}
      <div className="main-player-wrapper glass-card">
        {selectedId ? (
          <>
            <div className="video-placeholder" style={{ display: selectedId ? 'none' : 'flex' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '15px', color: 'var(--secondary-text)' }}>Memuat video...</p>
            </div>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedId}?autoplay=1&rel=0&modestbranding=1`}
              title="Lentera TV"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              style={{ 
                borderRadius: '16px',
                display: selectedId ? 'block' : 'none'
              }}
            ></iframe>
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', borderRadius: '16px' }}>
            <p style={{ width: '100%', textAlign: 'center', color: 'var(--secondary-text)' }}>Memilih video...</p>
          </div>
        )}
      </div>

      {/* Media Info - Only render when video is selected */}
      {selectedVideo && (
        <div className="media-info glass-card animate-fade">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="pulse-dot" style={{ background: selectedVideo.isLive ? '#FF4D4D' : '#D4AF37' }}></div>
            <div>
              <h3 style={{ fontSize: '20px' }} dangerouslySetInnerHTML={{ __html: selectedVideo.title }}></h3>
              <p style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>
                {selectedVideo.channelTitle} {selectedVideo.isLive && '• 🔴 LIVE'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message glass-card" style={{ padding: '15px 20px', marginBottom: '20px', borderLeft: '4px solid #FF4D4D' }}>
          <p style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>{error}</p>
        </div>
      )}

      {/* Tab Headers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '40px 0 20px' }}>
        <h3 style={{ fontSize: '22px' }}>
          {activeTab === 'live' ? '🔴 Live Streaming' : 'Kajian Ramadhan Terbaru'}
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleTabChange('all')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'all' ? 'var(--primary)' : 'var(--panel-bg)',
              color: activeTab === 'all' ? '#0F0F1B' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            aria-pressed={activeTab === 'all'}
          >
            Semua
          </button>
          <button
            onClick={() => handleTabChange('live')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'live' ? 'var(--primary)' : 'var(--panel-bg)',
              color: activeTab === 'live' ? '#0F0F1B' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            aria-pressed={activeTab === 'live'}
          >
            🔴 Live
          </button>
        </div>
      </div>

      {/* Video Grid with Skeleton Loader */}
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="channel-grid">
          {displayVideos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              isSelected={selectedId === v.id}
              onClick={handleVideoSelect}
            />
          ))}
          {displayVideos.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--secondary-text)' }}>
              Tidak ada video yang ditemukan.
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .ceramah-container { max-width: 1100px; margin: 0 auto; padding-bottom: 50px; }
        .main-player-wrapper {
          height: 480px;
          background: #000;
          padding: 6px;
          margin-bottom: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          position: relative;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          overflow: hidden;
        }
        .video-placeholder {
          position: absolute;
          top: 6px;
          left: 6px;
          right: 6px;
          bottom: 6px;
          background: #000;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          z-index: 1;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--glass-border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .media-info { padding: 20px 30px; margin-bottom: 30px; border: 1px solid var(--glass-border); background: var(--panel-bg); border-radius: 16px; }
        .pulse-dot {
          width: 12px; height: 12px; border-radius: 50%;
          box-shadow: 0 0 15px currentColor; animation: pulse 2s infinite;
        }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        .channel-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .channel-card { padding: 8px; cursor: pointer; transition: 0.3s; border: 1px solid var(--glass-border); border-radius: 12px; }
        .channel-card:hover { transform: translateY(-5px); border-color: var(--primary); }
        .channel-card.active { border-color: var(--primary); background: var(--panel-bg); }

        .thumb-container { position: relative; border-radius: 8px; overflow: hidden; height: 120px; background: var(--panel-bg); }
        .image-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, var(--glass-bg) 25%, var(--panel-bg) 50%, var(--glass-bg) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .live-badge {
          position: absolute; top: 8px; left: 8px;
          background: #FF4D4D; color: white;
          padding: 3px 8px; border-radius: 4px; font-size: 9px; font-weight: 800;
          animation: pulse 2s infinite;
          z-index: 2;
        }
        .cat-tag {
          position: absolute; top: 8px; right: 8px;
          background: var(--primary); color: #0F0F1B;
          padding: 3px 8px; border-radius: 4px; font-size: 9px; font-weight: 800;
          z-index: 2;
        }
        .card-info { margin-top: 12px; }
        .card-info h4 { font-size: 13px; margin-bottom: 4px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .card-info p { font-size: 11px; color: var(--secondary-text); }

        /* Skeleton Loader Styles */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .skeleton-card { padding: 8px; border-radius: 12px; }
        .skeleton-thumbnail {
          height: 120px;
          border-radius: 8px;
          background: linear-gradient(90deg, var(--glass-bg) 25%, var(--panel-bg) 50%, var(--glass-bg) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-info { margin-top: 12px; }
        .skeleton-title {
          height: 14px;
          border-radius: 4px;
          background: linear-gradient(90deg, var(--glass-bg) 25%, var(--panel-bg) 50%, var(--glass-bg) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          margin-bottom: 6px;
        }
        .skeleton-subtitle {
          height: 10px;
          width: 60%;
          border-radius: 4px;
          background: linear-gradient(90deg, var(--glass-bg) 25%, var(--panel-bg) 50%, var(--glass-bg) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default CeramahView;
