'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface QuranReaderProps {
  surah: { nomor: number; namaLatin: string; nama: string };
  onBack: () => void;
}

const QuranReader: React.FC<QuranReaderProps> = ({ surah, onBack }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [isFullSurahPlaying, setIsFullSurahPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const playQueueRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Cancel previous fetch if component re-renders quickly
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Stop any playing audio on surah change
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
    setIsFullSurahPlaying(false);
    playQueueRef.current = 0;

    fetch(`https://equran.id/api/v2/surat/${surah.nomor}`, {
      signal: abortControllerRef.current.signal,
    })
      .then(res => res.json())
      .then(resData => {
        if (isMountedRef.current) {
          setData(resData.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
        }
        if (isMountedRef.current) {
          setLoading(false);
        }
      });

    return () => {
      isMountedRef.current = false;
      // Cleanup on unmount or surah change
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, [surah.nomor]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
      audioRef.current = null;
    }
    setPlayingId(null);
    setIsFullSurahPlaying(false);
    playQueueRef.current = 0;
  }, []);

  const playAudio = useCallback((id: number, url: string, onEnd?: () => void) => {
    // Prevent overlapping audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingId(id);

    const currentPlayQueue = ++playQueueRef.current;

    audio.play().catch(e => {
      if (e.name !== 'AbortError') {
        console.error("Audio play failed", e);
      }
    });

    audio.onended = () => {
      // Only trigger callback if this is still the current audio and component is mounted
      if (currentPlayQueue === playQueueRef.current && isMountedRef.current) {
        setPlayingId(null);
        if (onEnd) onEnd();
      }
    };

    audio.onerror = () => {
      if (currentPlayQueue === playQueueRef.current && isMountedRef.current) {
        setPlayingId(null);
      }
    };
  }, []);

  const playFullSurah = useCallback(function playFullSurah(startIndex = 0) {
    if (!isMountedRef.current) return;
    if (!data || startIndex >= data.ayat.length) {
      if (isMountedRef.current) {
        setIsFullSurahPlaying(false);
      }
      playQueueRef.current = 0;
      return;
    }

    if (isMountedRef.current) {
      setIsFullSurahPlaying(true);
    }
    const currentAyat = data.ayat[startIndex];

    playAudio(currentAyat.nomorAyat, currentAyat.audio['05'], () => {
      // Use requestAnimationFrame to prevent stack overflow
      if (isMountedRef.current) {
        requestAnimationFrame(() => {
          playFullSurah(startIndex + 1);
        });
      }
    });
  }, [data, playAudio]);

  const handleToggleFullSurah = () => {
    if (isFullSurahPlaying) {
      stopAudio();
      setIsFullSurahPlaying(false);
    } else {
      playFullSurah(0);
    }
  };

  return (
    <div className="reader-container animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} className="back-btn">← Kembali</button>
        {!loading && (
          <button
            className={`full-play-btn ${isFullSurahPlaying ? 'playing' : ''}`}
            onClick={handleToggleFullSurah}
          >
            {isFullSurahPlaying ? '⏹ Berhenti Murottal' : '▶ Putar Satu Surat'}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>Membuka Mushaf...</div>
      ) : (
        <>
          <div className="reader-header glass-card">
            <h1 className="arabic-title">{data.nama}</h1>
            <h2>Surat {data.namaLatin}</h2>
            <p>{data.arti} &bull; {data.tempatTurun} &bull; {data.jumlahAyat} Ayat</p>
          </div>

          <div className="verses-list">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.ayat.map((v: any) => (
              <div key={v.nomorAyat} className={`verse-item glass-card ${playingId === v.nomorAyat ? 'active-verse' : ''}`}>
                <div className="verse-sidebar">
                  <div className="verse-num">{v.nomorAyat}</div>
                  <button
                    className={`audio-btn ${playingId === v.nomorAyat ? 'playing' : ''}`}
                    onClick={() => {
                      if (playingId === v.nomorAyat) {
                        stopAudio();
                        setIsFullSurahPlaying(false);
                      } else {
                        setIsFullSurahPlaying(false);
                        playAudio(v.nomorAyat, v.audio['05']);
                      }
                    }}
                  >
                    {playingId === v.nomorAyat ? '⏹' : '▶'}
                  </button>
                </div>
                <div className="verse-content">
                  <p className="arabic-text">{v.teksArab}</p>
                  <p className="latin-text">{v.teksLatin}</p>
                  <p className="translation-text">{v.teksIndonesia}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .reader-container { max-width: 900px; margin: 0 auto; padding-bottom: 100px; }
        .back-btn, .full-play-btn { 
          background: transparent; border: 1px solid var(--divider); 
          color: var(--secondary-text); padding: 10px 20px; border-radius: 12px; 
          cursor: pointer; transition: 0.3s; font-weight: 600;
        }
        .back-btn:hover, .full-play-btn:hover { border-color: var(--primary); color: var(--primary); }
        .full-play-btn.playing { background: var(--primary); color: var(--on-primary); border-color: var(--primary); }
        
        .reader-header { text-align: center; padding: 60px; margin-bottom: 40px; border-color: rgba(212, 175, 55, 0.3); }
        .arabic-title { font-size: 64px; color: var(--primary); margin-bottom: 15px; font-family: 'Amiri', serif; }
        
        .verses-list { display: flex; flex-direction: column; gap: 24px; }
        .verse-item { display: flex; gap: 30px; padding: 40px; border-color: rgba(255,255,255,0.05); transition: 0.3s; }
        .active-verse { border-color: var(--primary); background: rgba(212, 175, 55, 0.05); }
        
        .verse-sidebar { display: flex; flex-direction: column; gap: 15px; align-items: center; }
        .verse-num { 
          width: 40px; height: 40px; background: rgba(212, 175, 55, 0.1); 
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: var(--primary);
        }
        .audio-btn {
          background: rgba(255,255,255,0.05); border: 1px solid var(--divider);
          color: white; width: 40px; height: 40px; border-radius: 50%;
          cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center;
        }
        .audio-btn:hover { border-color: var(--primary); transform: scale(1.1); }
        .audio-btn.playing { background: var(--primary); border-color: var(--primary); }
        
        .verse-content { flex: 1; text-align: right; }
        .arabic-text { font-size: 36px; line-height: 2.2; margin-bottom: 20px; font-family: 'Amiri', serif; color: var(--primary-text); }
        .latin-text { font-size: 14px; color: var(--primary); margin-bottom: 10px; font-style: italic; text-align: left; opacity: 0.8; }
        .translation-text { font-size: 16px; color: var(--secondary-text); line-height: 1.6; text-align: left; }
      `}</style>
    </div>
  );
};

export default QuranReader;
