'use client';

import React, { useState } from 'react';

const PledgeView = () => {
  const [pledgeAmount, setPledgeAmount] = useState(50000);
  const [target, setTarget] = useState('Khatam Al-Qur\'an');
  const [isPledged, setIsPledged] = useState(false);

  const targets = [
    'Khatam Al-Qur\'an',
    'Tahajjud 30 Hari',
    'Sedekah Subuh Harian',
    'Puasa Tanpa Bolong'
  ];

  const handlePledge = () => {
    alert(`Membuka Mayar Safe-Deposit untuk nominal Rp ${pledgeAmount.toLocaleString()}... 
Uang Anda akan dijaga secara Amanah. Jika target "${target}" tercapai, uang akan dikembalikan 100%.`);
    setIsPledged(true);
  };

  return (
    <div className="pledge-container animate-fade">
      <div className="pledge-header glass-card">
        <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Mayar Amanah Pledge</h2>
        <p style={{ color: 'var(--secondary-text)', fontSize: '14px' }}>
          Tingkatkan disiplin ibadahmu dengan komitmen nyata. Titipkan &quot;Niat&quot; Anda, raih keberkahannya.
        </p>
      </div>

      {!isPledged ? (
        <div className="setup-pledge glass-card">
          <div className="form-group">
            <label>Apa Target Ibadahmu?</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              {targets.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Nominal Komitmen (Rp)</label>
            <div className="slider-box">
              <input
                type="range" min="10000" max="500000" step="10000"
                value={pledgeAmount} onChange={(e) => setPledgeAmount(parseInt(e.target.value))}
              />
              <span className="amount-display">Rp {pledgeAmount.toLocaleString()}</span>
            </div>
          </div>

          <button className="btn-primary pledge-btn" onClick={handlePledge}>
            🔐 Kunci Komitmen via Mayar
          </button>

          <p className="disclaimer">
            *Jika target tidak tercapai hingga akhir Ramadhan, dana akan disalurkan sebagai sedekah via Mayar.
          </p>
        </div>
      ) : (
        <div className="active-pledge glass-card">
          <div className="status-badge">KOMITMEN AKTIF</div>
          <h3>{target}</h3>
          <div className="progress-circle">
            <span className="percent">12/30</span>
            <span className="sub">Hari Terlewati</span>
          </div>
          <p style={{ marginTop: '20px', color: 'var(--secondary-text)' }}>
            Dana Terkunci: <strong>Rp {pledgeAmount.toLocaleString()}</strong>
          </p>
          <button className="btn-outline" style={{ marginTop: '20px', width: '100%' }}>
            Lapor Progres ke AI
          </button>
        </div>
      )}

      <style jsx>{`
        .pledge-container { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 30px; }
        .pledge-header { padding: 30px; text-align: center; border-color: var(--glass-border); background: var(--panel-bg); }
        .setup-pledge, .active-pledge { padding: 40px; display: flex; flex-direction: column; gap: 25px; }
        .form-group { display: flex; flex-direction: column; gap: 10px; }
        .form-group label { font-weight: 600; font-size: 14px; color: var(--secondary-text); }
        .form-group select { 
          background: var(--panel-bg); border: 1px solid var(--glass-border); 
          color: white; padding: 12px; border-radius: 10px; outline: none;
        }
        .slider-box { display: flex; align-items: center; gap: 20px; }
        .slider-box input { flex: 1; accent-color: var(--primary); }
        .amount-display { font-size: 18px; font-weight: 800; color: var(--primary); min-width: 120px; }
        .pledge-btn { width: 100%; padding: 18px; font-size: 16px; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2); }
        .disclaimer { font-size: 11px; color: var(--secondary-text); text-align: center; font-style: italic; }
        
        .active-pledge { align-items: center; text-align: center; border-color: var(--primary); }
        .status-badge { background: var(--primary); color: var(--on-primary); padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; }
        .progress-circle { 
          width: 150px; height: 150px; border: 8px solid var(--glass-border); 
          border-top-color: var(--primary); border-radius: 50%; 
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          margin: 20px 0;
        }
        .percent { font-size: 32px; font-weight: 900; color: var(--primary); }
        .sub { font-size: 12px; color: var(--secondary-text); }
      `}</style>
    </div>
  );
};

export default PledgeView;
