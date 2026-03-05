'use client';

import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QuickActions = ({ onTabChange }: any) => {
  const { t } = useLanguage();
  
  const actions = [
    {
      title: t('action.zakat'),
      subtitle: t('action.zakat_sub'),
      icon: '💳', bg: '#E3F2FD', color: '#1976D2',
      onClick: () => {
        const choice = window.confirm("Pilih Metode Pembayaran Zakat:\n\nOK untuk Lazismu\nCancel untuk Baznas BAZIS DKI");
        window.open(choice ? 'https://donasi.lazismu.org/' : 'https://donasi.baznasbazisdki.id/?gad_source=1', '_blank');
      }
    },
    {
      title: t('action.mosque'),
      subtitle: t('action.mosque_sub'),
      icon: '🕌', bg: '#F3E5F5', color: '#7B1FA2',
      onClick: () => {
        window.open('https://www.google.com/maps/search/masjid+terdekat/', '_blank');
      }
    },
    {
      title: t('action.kultum'),
      subtitle: t('action.kultum_sub'),
      icon: '🎥', bg: '#FFF3E0', color: '#F57C00',
      onClick: () => {
        if (onTabChange) onTabChange('ceramah');
      }
    },
    {
      title: t('action.qibla'),
      subtitle: t('action.qibla_sub'),
      icon: '🧭', bg: '#F1F8E9', color: '#388E3C',
      onClick: () => {
        if (onTabChange) onTabChange('kiblat');
      }
    },
  ];

  return (
    <div className="actions-grid" role="listbox" aria-label="Quick actions">
      {actions.map((action, i) => (
        <div
          key={i}
          className="action-card glass-card"
          onClick={action.onClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              action.onClick();
            }
          }}
          tabIndex={0}
          role="option"
          aria-label={`${action.title}: ${action.subtitle}`}
          style={{ cursor: 'pointer' }}
        >
          <div className="icon-box" style={{ background: action.bg, color: action.color }}>
            {action.icon}
          </div>
          <div className="text-box">
            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{action.title}</h4>
            <p style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{action.subtitle}</p>
          </div>
        </div>
      ))}

      <style jsx>{`
        .actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; width: 100%; }
        .action-card { display: flex; align-items: center; gap: 16px; padding: 16px; transition: all 0.3s ease; border: 1px solid var(--glass-border); border-radius: var(--radius-xl); }
        .action-card:hover,
        .action-card:focus { transform: translateY(-5px); border-color: var(--primary); background: var(--panel-bg); outline: 3px solid var(--primary); outline-offset: 2px; }
        .action-card:active { transform: translateY(-2px); }
        .icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
      `}</style>
    </div>
  );
};

export default QuickActions;
