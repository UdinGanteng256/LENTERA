'use client';

import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="language-toggle">
      <button
        onClick={() => setLanguage('id')}
        className={`lang-btn ${language === 'id' ? 'active' : ''}`}
        aria-label="Switch to Indonesian"
        aria-pressed={language === 'id'}
      >
        🇮🇩 ID
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        🇬🇧 EN
      </button>
      <style jsx>{`
        .language-toggle {
          display: flex;
          gap: 8px;
          background: var(--panel-bg);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 4px;
        }
        .lang-btn {
          background: transparent;
          border: none;
          color: var(--secondary-text);
          padding: 6px 12px;
          border-radius: 16px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .lang-btn:hover {
          color: var(--primary-text);
          background: rgba(255, 255, 255, 0.05);
        }
        .lang-btn.active {
          background: var(--primary);
          color: #0F0F1B;
        }
      `}</style>
    </div>
  );
};

export default LanguageToggle;
