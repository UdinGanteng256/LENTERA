'use client';

import React, { useState, useRef, useEffect } from 'react';
import { chatWithLenteraAI, getMoodRecommendation, getPrayerTimeRecommendation, ChatMessage } from '@/lib/lenteraAI';
import { useDynamicTheme } from '@/hooks/useDynamicTheme';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Assalamualaikum! Saya Lentera AI. Ada yang bisa saya bantu untuk menemani ibadahmu hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickActions, setQuickActions] = useState<Array<{ label: string; action: () => void }>>([]);

  const { currentPrayer } = useDynamicTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Set quick actions
      setQuickActions([
        { label: '📖 Ayat untuk kesabaran', action: () => handleQuickAction('butuh_sabar') },
        { label: '💪 Motivasi ibadah', action: () => handleQuickAction('butuh_motivasi') },
        { label: '😔 Sedih & cemas', action: () => handleQuickAction('cemas') },
        { label: '🌙 Keutamaan waktu ini', action: () => handlePrayerAction() },
      ]);

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

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  const handleQuickAction = async (mood: string) => {
    setInput('');
    setIsLoading(true);

    const userMessage: ChatMessage = { role: 'user', content: `Saya sedang ${mood.replace('_', ' ')}` };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await getMoodRecommendation(mood, currentPrayer || undefined);
      setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrayerAction = async () => {
    if (!currentPrayer) return;

    setInput('');
    setIsLoading(true);

    const userMessage: ChatMessage = { role: 'user', content: `Apa keutamaan waktu ${currentPrayer}?` };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await getPrayerTimeRecommendation(currentPrayer);
      setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithLenteraAI(messages.concat(userMessage));
      setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, saya mengalami gangguan. Silakan coba lagi nanti.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="chat-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Lentera AI Chat Assistant"
      aria-describedby="chat-description"
    >
      <div
        ref={dialogRef}
        className="chat-window glass-card"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Visually hidden description for screen readers */}
        <div id="chat-description" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
          Chat with Lentera AI assistant for spiritual guidance, Quran verses, and prayer motivation. Press Escape to close.
        </div>

        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="ai-status" aria-hidden="true"></div>
            <div>
              <span style={{ fontWeight: 700, display: 'block' }}>AI Lentera Companion</span>
              <span style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>
                {currentPrayer ? `Waktu ${currentPrayer}` : 'Online'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="close-btn"
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        <div
          className="chat-body"
          role="log"
          aria-live="polite"
          aria-atomic="false"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`msg-wrapper ${msg.role === 'assistant' ? 'ai' : 'user'}`}
              role="article"
              aria-label={`Message from ${msg.role === 'assistant' ? 'AI Assistant' : 'user'}`}
            >
              <div className={`msg-bubble ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
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

        {quickActions.length > 0 && messages.length <= 1 && (
          <div
            className="quick-actions"
            role="listbox"
            aria-label="Quick action suggestions"
          >
            {quickActions.map((action, i) => (
              <button
                key={i}
                className="quick-action-btn"
                onClick={action.action}
                disabled={isLoading}
                role="option"
                aria-label={action.label.replace(/[^\w\s]/gi, '').trim()}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

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
            placeholder="Tanyakan tentang Al-Qur'an, ibadah, atau curhat..."
            disabled={isLoading}
            aria-label="Type your message"
            autoComplete="off"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            aria-label={isLoading ? 'Sending message' : 'Send message'}
          >
            {isLoading ? '⏳' : '🚀'}
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
          height: 80vh;
          max-height: 650px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          border: 1px solid var(--glass-border);
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
        .close-btn:hover,
        .close-btn:focus-visible {
          background: rgba(255,255,255,0.1);
          outline: 2px solid var(--primary);
          outline-offset: 2px;
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
          max-width: 80%;
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .msg-bubble.ai {
          background: var(--panel-bg);
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
        .quick-actions {
          padding: 15px 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          border-top: 1px solid var(--divider);
          background: var(--panel-bg);
        }
        .quick-action-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--primary-text);
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .quick-action-btn:hover:not(:disabled),
        .quick-action-btn:focus-visible {
          background: var(--primary);
          color: #0F0F1B;
          border-color: var(--primary);
          outline: 2px solid var(--primary);
          outline-offset: 2px;
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
          background: rgba(255,255,255,0.05);
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
        .chat-footer input:disabled {
          opacity: 0.5;
        }
        .chat-footer button {
          background: var(--primary);
          border: none;
          padding: 0 20px;
          border-radius: 14px;
          cursor: pointer;
          font-size: 18px;
          transition: transform 0.2s, opacity 0.2s;
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
