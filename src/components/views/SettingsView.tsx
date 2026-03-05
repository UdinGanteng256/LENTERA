'use client';

import React, { useState } from 'react';

const SettingsView = () => {
  const [config, setConfig] = useState({
    themeSync: true,
    language: 'Bahasa Indonesia',
    notifications: true,
    highPrecisionGPS: true
  });

  const toggleSetting = (key: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    alert(`Pengaturan ${key} telah diperbarui!`);
  };

  return (
    <div className="settings-container animate-fade">
      <div className="glass-card" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '30px', fontWeight: 800 }}>Pengaturan LENTERA</h2>

        <div className="settings-list">
          <div className="setting-item" onClick={() => toggleSetting('themeSync')}>
            <div>
              <h4>Sinkronisasi Tema Otomatis</h4>
              <p>Warna aplikasi berubah sesuai waktu langit di lokasi Anda.</p>
            </div>
            <div className={`toggle-btn ${config.themeSync ? 'active' : ''}`} />
          </div>

          <div className="divider"></div>

          <div className="setting-item">
            <div>
              <h4>Bahasa Konten</h4>
              <p>Pilih bahasa untuk Al-Qur&apos;an dan Ceramah.</p>
            </div>
            <select
              className="setting-select"
              value={config.language}
              onChange={(e) => setConfig({ ...config, language: e.target.value })}
            >
              <option>Bahasa Indonesia</option>
              <option>English</option>
              <option>Arabic</option>
            </select>
          </div>

          <div className="divider"></div>

          <div className="setting-item" onClick={() => toggleSetting('notifications')}>
            <div>
              <h4>Notifikasi Waktu Sholat</h4>
              <p>Terima pengingat 15, 10, dan 5 menit sebelum adzan.</p>
            </div>
            <div className={`toggle-btn ${config.notifications ? 'active' : ''}`} />
          </div>

          <div className="divider"></div>

          <div className="setting-item" onClick={() => toggleSetting('highPrecisionGPS')}>
            <div>
              <h4>Akurasi GPS Tinggi</h4>
              <p>Gunakan sensor perangkat untuk perhitungan Kiblat yang presisi.</p>
            </div>
            <div className={`toggle-btn ${config.highPrecisionGPS ? 'active' : ''}`} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-container { max-width: 800px; margin: 0 auto; }
        .settings-list { display: flex; flex-direction: column; gap: 20px; }
        .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; cursor: pointer; }
        .setting-item h4 { font-size: 18px; margin-bottom: 5px; font-weight: 700; }
        .setting-item p { font-size: 13px; color: var(--secondary-text); max-width: 450px; }
        .divider { height: 1px; background: var(--divider); width: 100%; }
        
        .toggle-btn {
          width: 54px; height: 28px; background: var(--panel-bg); border: 1px solid var(--glass-border); border-radius: 20px; position: relative; transition: 0.3s;
        }
        .toggle-btn::after {
          content: ''; position: absolute; width: 22px; height: 22px; background: white; border-radius: 50%; top: 2px; left: 3px; transition: 0.3s;
        }
        .toggle-btn.active { background: var(--primary); border-color: var(--primary); }
        .toggle-btn.active::after { left: 29px; }
        
        .setting-select {
          background: var(--panel-bg); border: 1px solid var(--glass-border);
          color: white; padding: 10px 20px; border-radius: 10px; outline: none; cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default SettingsView;
