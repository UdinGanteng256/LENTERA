'use client';

import React, { useState } from 'react';
import { surahs } from '@/data/surahs';

interface VideoItem {
  id: number;
  title: string;
  speaker: string;
  duration: string;
  thumbnail: string;
  videoId?: string;
}

const kultumVideos: VideoItem[] = [
  { id: 1, title: "Kultum: Keutamaan Puasa di Bulan Ramadhan", speaker: "Ustadz Ahmad Syafi'i", duration: "15:30", thumbnail: "https://img.youtube.com/vi/gUH8_51vDqY/mqdefault.jpg", videoId: "gUH8_51vDqY" },
  { id: 2, title: "Kultum: Tadarus Al-Qur'an dengan Khatam", speaker: "Ustadzah Siti Mariam", duration: "12:45", thumbnail: "https://img.youtube.com/vi/8jJk8vZqKqE/mqdefault.jpg", videoId: "8jJk8vZqKqE" },
  { id: 3, title: "Kultum: Sedekah dan Kebaikan di Ramadhan", speaker: "Ustadz Abdul Somad", duration: "18:20", thumbnail: "https://img.youtube.com/vi/W6_ZIs_sk8M/mqdefault.jpg", videoId: "W6_ZIs_sk8M" },
  { id: 4, title: "Kultum: Akhlak Mulia di Bulan Suci", speaker: "Ustadz Felix Siauw", duration: "16:10", thumbnail: "https://img.youtube.com/vi/pYv_id8X8nM/mqdefault.jpg", videoId: "pYv_id8X8nM" },
  { id: 5, title: "Kultum: Doa-doa dalam Puasa", speaker: "Ustadz Ma'ruf Amin", duration: "14:55", thumbnail: "https://img.youtube.com/vi/M7XMDZ99S7o/mqdefault.jpg", videoId: "M7XMDZ99S7o" },
  { id: 6, title: "Kultum: Lailatul Qadr dan Cara Mencarinya", speaker: "Ustadz Bilal Hasan", duration: "20:15", thumbnail: "https://img.youtube.com/vi/7_v6_Xsh_Zw/mqdefault.jpg", videoId: "7_v6_Xsh_Zw" },
];

export default function QuranCeramahTabs() {
  const [activeTab, setActiveTab] = useState<'alquran' | 'ceramah'>('alquran');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKultumVideo, setSelectedKultumVideo] = useState<string | null>(null);

  const filteredSurahs = surahs.filter(surah =>
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTabSwitch = () => {
    // This will trigger the staggered animation
  };

  return (
    <div className="quran-ceramah-container">
      {/* Tab Headers */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'alquran' ? 'active' : ''}`}
          onClick={() => { setActiveTab('alquran'); handleTabSwitch(); }}
        >
          Al-Qur&apos;an
        </button>
        <button
          className={`tab-btn ${activeTab === 'ceramah' ? 'active' : ''}`}
          onClick={() => { setActiveTab('ceramah'); handleTabSwitch(); }}
        >
          Ceramah
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'alquran' && (
          <div className="animate-staggered">
            {/* Search Bar */}
            <div style={{ marginBottom: '30px' }}>
              <input
                type="text"
                placeholder="Cari nama surat atau terjemahan..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Surah Grid */}
            <div className="surah-grid">
              {filteredSurahs.map((surah, index) => (
                <div
                  key={surah.id}
                  className="surah-card glass-card staggered-item"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="surah-num">{surah.id}</div>
                  <div className="surah-info">
                    <h4>{surah.name}</h4>
                    <p>{surah.meaning} • {surah.verses} Ayat</p>
                  </div>
                  <div className="surah-arabic" style={{ fontFamily: 'Amiri, serif' }}>{surah.arabic}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ceramah' && (
          <div className="animate-staggered">
            {selectedKultumVideo ? (
              <div className="kultum-player-section">
                <button 
                  className="back-btn" 
                  onClick={() => setSelectedKultumVideo(null)}
                >
                  ← Kembali ke Daftar Kultum
                </button>
                <div className="kultum-video-player">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${selectedKultumVideo}?autoplay=1`}
                    title="Kultum Player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '16px' }}
                  ></iframe>
                </div>
              </div>
            ) : (
              <>
                <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600 }}>
                  Kultum Hari Ini
                </h3>
                <div className="ceramah-grid">
                  {kultumVideos.map((video, index) => (
                    <div
                      key={video.id}
                      className="video-card glass-card staggered-item"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => video.videoId && setSelectedKultumVideo(video.videoId)}
                    >
                      <div className="video-thumbnail">
                        {video.thumbnail ? (
                          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <span className="play-btn">▶</span>
                          </div>
                        ) : (
                          <span className="play-btn">▶</span>
                        )}
                      </div>
                      <div className="video-info">
                        <h4>{video.title}</h4>
                        <p>{video.speaker}</p>
                        <span className="duration">{video.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .quran-ceramah-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .tabs-header {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid var(--divider);
          padding-bottom: 16px;
        }

        .tab-btn {
          padding: 12px 32px;
          border: none;
          background: transparent;
          color: var(--secondary-text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 12px 12px 0 0;
          transition: all 0.3s ease;
        }

        .tab-btn:hover {
          color: var(--primary);
          background: rgba(212, 175, 55, 0.05);
        }

        .tab-btn.active {
          color: var(--primary);
          background: rgba(212, 175, 55, 0.1);
          border-bottom: 2px solid var(--primary);
        }

        .tab-content {
          min-height: 500px;
        }

        /* Search Input */
        .search-input {
          width: 100%;
          max-width: 500px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--divider);
          padding: 14px 20px;
          border-radius: 12px;
          color: var(--primary-text);
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          border-color: var(--primary);
        }

        .search-input::placeholder {
          color: var(--secondary-text);
        }

        /* Staggered Animation */
        @keyframes staggeredFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .animate-staggered .staggered-item {
          animation: staggeredFadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        /* Surah Grid */
        .surah-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .surah-card {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .surah-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.15);
        }

        .surah-num {
          width: 48px;
          height: 48px;
          background: rgba(212, 175, 55, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-weight: 800;
          font-size: 16px;
          flex-shrink: 0;
        }

        .surah-info {
          flex: 1;
          min-width: 0;
        }

        .surah-info h4 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .surah-info p {
          font-size: 12px;
          color: var(--secondary-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .surah-arabic {
          font-size: 24px;
          color: var(--primary);
          line-height: 1;
          flex-shrink: 0;
        }

        /* Ceramah Grid */
        .ceramah-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .video-card {
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .video-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.15);
        }

        .video-thumbnail {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .play-btn {
          width: 56px;
          height: 56px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--on-primary);
          transition: transform 0.3s ease;
        }

        .video-card:hover .play-btn {
          transform: scale(1.1);
        }

        .video-info {
          padding: 16px;
        }

        .video-info h4 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .video-info p {
          font-size: 12px;
          color: var(--secondary-text);
          margin-bottom: 8px;
        }

        .duration {
          display: inline-block;
          background: rgba(212, 175, 55, 0.1);
          color: var(--primary);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        /* Kultum Player */
        .kultum-player-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .back-btn {
          align-self: flex-start;
          padding: 10px 20px;
          background: rgba(212, 175, 55, 0.1);
          color: var(--primary);
          border: 1px solid var(--primary);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(212, 175, 55, 0.2);
        }

        .kultum-video-player {
          width: 100%;
          height: 500px;
          background: #000;
          border-radius: 16px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
