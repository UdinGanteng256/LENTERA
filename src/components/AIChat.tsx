'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatWithLenteraAI, getMoodRecommendation, getPrayerTimeRecommendation, ChatMessage } from '@/lib/lenteraAI';
import { useDynamicTheme } from '@/hooks/useDynamicTheme';
import { useTranslation } from '@/contexts/TranslationContext';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const { language, t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: t('ai.initial_greeting') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { currentPrayer } = useDynamicTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Update initial greeting when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', content: t('ai.initial_greeting') }]);
    }
  }, [language, t]);

  // Suggested prompts for quick engagement
  const suggestedPrompts = language === 'id' ? [
    { icon: '📖', text: 'Tafsir Al-Fatihah', query: 'Jelaskan tafsir surat Al-Fatihah' },
    { icon: '🤲', text: 'Doa buka puasa', query: 'Bacaan doa berbuka puasa' },
    { icon: '💪', text: 'Motivasi ibadah', query: 'Berikan motivasi untuk semangat ibadah' },
    { icon: '🌙', text: 'Keutamaan malam Lailatul Qadar', query: 'Apa keutamaan malam Lailatul Qadar?' },
  ] : [
    { icon: '📖', text: 'Tafsir Al-Fatihah', query: 'Explain the tafsir of Surah Al-Fatihah' },
    { icon: '🤲', text: 'Breaking fast dua', query: 'What is the dua for breaking fast?' },
    { icon: '💪', text: 'Worship motivation', query: 'Give me motivation for worship' },
    { icon: '🌙', text: 'Lailatul Qadar', query: 'What are the virtues of Laylat al-Qadr?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickAction = useCallback(async (mood: string) => {
    setInput('');
    setIsLoading(true);

    const userMessage: ChatMessage = { role: 'user', content: language === 'id' ? `Saya sedang ${mood.replace('_', ' ')}` : `I am feeling ${mood.replace('_', ' ')}` };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await getMoodRecommendation(mood, currentPrayer || undefined, language);
      setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('common.error') }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPrayer, language, t]);

  const handlePrayerAction = useCallback(async () => {
    if (!currentPrayer) return;

    setInput('');
    setIsLoading(true);

    const userMessage: ChatMessage = { role: 'user', content: language === 'id' ? `Apa keutamaan waktu ${currentPrayer}?` : `What are the virtues of ${currentPrayer} time?` };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await getPrayerTimeRecommendation(currentPrayer, language);
      setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('common.error') }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPrayer, language, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus on input after short delay for animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Add keyboard handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          previousFocusRef.current?.focus();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  const sendMessage = async (query?: string) => {
    const text = query || input;
    if (!text.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatWithLenteraAI(messages.concat(userMessage), undefined, language);
      setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('common.error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="chat-window glass-card" ref={dialogRef} role="dialog" aria-modal="true" aria-label="AI Assistant">
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="ai-status" aria-hidden="true"></div>
            <div>
              <span style={{ fontWeight: 700, display: 'block' }}>{t('ai.title')}</span>
              <span style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>
                {currentPrayer ? `${t('ai.prayer_time')} ${currentPrayer}` : 'Online'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close chat">×</button>
        </div>

        <div className="chat-body">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-wrapper ${msg.role}`}>
              <div className={`msg-bubble ${msg.role}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="msg-wrapper ai">
              <div className="msg-bubble ai">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {!isLoading && messages.length < 4 && (
          <div className="suggested-container">
            <p className="suggested-label">{t('ai.suggested')}</p>
            <div className="suggested-list">
              {suggestedPrompts.map((p, i) => (
                <button key={i} className="suggested-btn" onClick={() => sendMessage(p.query)}>
                  <span>{p.icon}</span> {p.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => handleQuickAction('sedih')} disabled={isLoading}>😢 {language === 'id' ? 'Sedih' : 'Sad'}</button>
          <button className="quick-action-btn" onClick={() => handleQuickAction('bahagia')} disabled={isLoading}>😊 {language === 'id' ? 'Bahagia' : 'Happy'}</button>
          <button className="quick-action-btn" onClick={() => handleQuickAction('gelisah')} disabled={isLoading}>😰 {language === 'id' ? 'Gelisah' : 'Anxious'}</button>
          {currentPrayer && (
            <button className="quick-action-btn" onClick={handlePrayerAction} disabled={isLoading}>
              ✨ {language === 'id' ? 'Keutamaan' : 'Virtue'} {currentPrayer}
            </button>
          )}
        </div>

        <div className="chat-footer">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={t('ai.placeholder')}
            disabled={isLoading}
            aria-label="Type your message"
            autoComplete="off"
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || isLoading} aria-label="Send message">
            {t('ai.send')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .chat-window {
          width: 90%;
          max-width: 450px;
          height: 85vh;
          max-height: 700px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          border: 1px solid var(--glass-border);
          background: var(--panel-bg);
          border-radius: 24px;
        }
        .chat-header {
          padding: 20px;
          border-bottom: 1px solid var(--divider);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--panel-bg);
        }
        .ai-status {
          width: 10px;
          height: 10px;
          background: #00FF88;
          border-radius: 50%;
          box-shadow: 0 0 10px #00FF88;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        .close-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .close-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .chat-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .msg-wrapper {
          display: flex;
          width: 100%;
          animation: messageIn 0.3s ease-out;
        }
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-wrapper.user { justify-content: flex-end; }
        .msg-wrapper.ai { justify-content: flex-start; }
        .msg-bubble {
          max-width: 85%;
          padding: 14px 18px;
          border-radius: 20px;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .msg-bubble.ai {
          background: var(--glass-bg);
          color: var(--primary-text);
          border-bottom-left-radius: 4px;
          border: 1px solid var(--glass-border);
        }
        .msg-bubble.user {
          background: var(--primary);
          color: #0F0F1B;
          border-bottom-right-radius: 4px;
          font-weight: 600;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: var(--secondary-text);
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
          30% { transform: translateY(-8px); opacity: 1; }
        }
        
        .suggested-container {
          padding: 0 20px 15px;
        }
        .suggested-label {
          font-size: 11px;
          color: var(--secondary-text);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }
        .suggested-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .suggested-btn {
          text-align: left;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--primary-text);
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .suggested-btn:hover {
          background: var(--panel-bg);
          border-color: var(--primary);
        }

        .quick-actions {
          padding: 15px 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          border-top: 1px solid var(--divider);
          background: rgba(0,0,0,0.1);
        }
        .quick-action-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--primary-text);
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .quick-action-btn:hover:not(:disabled) {
          background: var(--primary);
          color: #0F0F1B;
          border-color: var(--primary);
        }
        .quick-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chat-footer {
          padding: 20px;
          display: flex;
          gap: 10px;
          border-top: 1px solid var(--divider);
          background: rgba(0,0,0,0.3);
        }
        .chat-footer input {
          flex: 1;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          padding: 14px 18px;
          border-radius: 14px;
          color: white;
          outline: none;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .chat-footer input:focus {
          border-color: var(--primary);
        }
        .chat-footer button {
          background: var(--primary);
          color: #0F0F1B;
          border: none;
          padding: 0 20px;
          border-radius: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chat-footer button:hover:not(:disabled) {
          transform: scale(1.05);
        }
        .chat-footer button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default AIChat;
