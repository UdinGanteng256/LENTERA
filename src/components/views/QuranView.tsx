'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import QuranReader from './QuranReader';
import AnimatedList from '@/components/AnimatedList';
import { useLanguage } from '@/hooks/useLanguage';

const QuranView = () => {
  const { t } = useLanguage();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [surahs, setSurahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchSurahs = async () => {
      try {
        const response = await fetch('https://equran.id/api/v2/surat', {
          signal: abortController.signal
        });
        const data = await response.json();
        setSurahs(data.data);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Failed to fetch surahs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectSurah = useCallback((surah: any) => {
    setSelectedSurah(surah);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedSurah(null);
  }, []);

  // Memoize filtered results
  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return surahs;
    const searchLower = search.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return surahs.filter((s: any) =>
      s.namaLatin.toLowerCase().includes(searchLower) ||
      s.arti.toLowerCase().includes(searchLower) ||
      s.nomor.toString().includes(searchLower)
    );
  }, [surahs, search]);

  if (selectedSurah) {
    return <QuranReader surah={selectedSurah} onBack={handleBack} />;
  }

  return (
    <div className="quran-container animate-fade">
      <div style={{ marginBottom: '30px', position: 'relative' }}>
        <input
          type="text"
          placeholder={t('quran.search')}
          className="search-input"
          value={search}
          onChange={handleSearch}
          style={{
            width: '100%',
            maxWidth: '400px',
            background: 'var(--panel-bg)',
            border: '1px solid var(--glass-border)',
            padding: '12px 20px',
            borderRadius: '12px',
            color: 'white',
            outline: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '14px',
            transition: 'border-color 0.2s ease'
          }}
        />
        {search && (
          <span style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: 'var(--secondary-text)',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            {filteredSurahs.length} hasil
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--secondary-text)' }}>
          <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{t('quran.loading')}</p>
          <p style={{ fontSize: '13px', opacity: 0.7 }}>{t('quran.fetching')}</p>
        </div>
      ) : (
        <AnimatedList
          items={filteredSurahs}
          onItemSelect={handleSelectSurah}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderItem={(surah: any, isSelected: boolean) => (
            <div className={`surah-card glass-card ${isSelected ? 'selected' : ''}`} style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              border: isSelected ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
              background: isSelected ? 'var(--panel-bg)' : 'var(--glass-bg)',
              transition: 'all 0.2s ease',
              willChange: 'transform, border-color, background'
            }}>
              <div className="surah-num" style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                background: isSelected ? 'var(--primary)' : 'var(--panel-bg)',
                color: isSelected ? '#0F0F1B' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '14px',
                border: '1px solid var(--glass-border)'
              }}>
                {surah.nomor}
              </div>
              <div className="surah-info" style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{
                  fontSize: '16px',
                  margin: '0 0 6px 0',
                  fontWeight: 700,
                  color: 'var(--primary-text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>{surah.namaLatin}</h4>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--secondary-text)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>{surah.arti} • {surah.jumlahAyat} {t('quran.verses')}</p>
              </div>
              <div className="surah-arabic" style={{
                fontSize: '28px',
                color: 'var(--primary)',
                fontFamily: "'Amiri', serif",
                fontWeight: 700,
                minWidth: '60px',
                textAlign: 'center'
              }}>{surah.nama}</div>
            </div>
          )}
        />
      )}

      <style jsx>{`
        .search-input {
          width: 100%; max-width: 400px;
          background: var(--panel-bg); border: 1px solid var(--glass-border);
          padding: 12px 20px; border-radius: 12px; color: white; outline: none;
        }
        .surah-card {
          padding: 20px; display: flex; align-items: center; gap: 20px; height: 100%;
          border: 1px solid var(--glass-border);
        }
        .surah-card.selected { border-color: var(--primary); background: var(--panel-bg); }
        .surah-num {
          width: 40px; height: 40px; background: var(--panel-bg); color: var(--primary);
          display: flex; align-items: center; justify-content: center; border-radius: 10px; font-weight: 800;
          border: 1px solid var(--glass-border);
        }
        .surah-info { flex: 1; }
        .surah-info h4 { font-size: 18px; margin-bottom: 4px; font-weight: 700; }
        .surah-info p { font-size: 12px; color: var(--secondary-text); }
        .surah-arabic { font-size: 24px; color: var(--primary); font-family: 'Amiri', serif; }
      `}</style>
    </div>
  );
};

export default QuranView;
