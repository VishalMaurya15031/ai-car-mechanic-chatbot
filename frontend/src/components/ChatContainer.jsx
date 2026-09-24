import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShieldCheck, Zap, Sparkles, AlertTriangle } from 'lucide-react';
import MediaUploader from './MediaUploader';

export default function ChatContainer({
  messages,
  onSendMessage,
  loading,
  attachedMedia,
  onMediaAttached,
  clearAttachedMedia
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedMedia) return;
    onSendMessage(inputText, attachedMedia ? attachedMedia.id : null);
    setInputText('');
  };

  const handleChipClick = (text) => {
    onSendMessage(text, null);
  };

  return (
    <div className="glass-panel chat-panel" style={{ padding: '16px', borderRadius: '16px' }}>
      {/* Messages Scrollable Container */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '480px', padding: '20px' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid var(--accent-amber)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px auto', boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
            }}>
              <Bot size={30} color="var(--accent-amber)" />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
              Welcome to Instant Mechanic AI
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
              Diagnose engine knocks, starting troubles, dashboard error codes, or brake squeals. Powered by Zero-AI Cost Rule Filter & Gemini Automotive Multimodal AI.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tap a common issue to diagnose:
              </span>
              <button className="btn-secondary" onClick={() => handleChipClick("My car won't start and makes a rapid clicking sound")} style={{ fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                ⚡ "Car won't start & rapid clicking noise"
              </button>
              <button className="btn-secondary" onClick={() => handleChipClick("Loud squeaking noise when I press the brake pedal")} style={{ fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                🛑 "Squeaking sound when applying brakes"
              </button>
              <button className="btn-secondary" onClick={() => handleChipClick("Check engine light on with code P0300")} style={{ fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                🔍 "Check engine light code P0300"
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id || index}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: '10px'
                }}
              >
                {!isUser && (
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.2)', border: '1px solid var(--accent-amber)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Bot size={18} color="var(--accent-amber)" />
                  </div>
                )}

                <div style={{
                  maxWidth: '78%',
                  background: isUser ? 'linear-gradient(135deg, #0284c7, #06b6d4)' : 'rgba(31, 41, 55, 0.8)',
                  color: isUser ? '#ffffff' : 'var(--text-main)',
                  padding: '12px 16px',
                  borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  border: isUser ? 'none' : '1px solid var(--border-glass)',
                  boxShadow: isUser ? '0 4px 15px rgba(6, 182, 212, 0.25)' : 'var(--shadow-hud)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.media && (
                    <div style={{ marginBottom: '8px', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} color="var(--accent-amber)" />
                      <span>[{msg.media.media_type.toUpperCase()} Media Attached]</span>
                    </div>
                  )}

                  <div>{msg.text}</div>
                </div>

                {isUser && (
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'rgba(6, 182, 212, 0.2)', border: '1px solid var(--accent-cyan)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <User size={18} color="var(--accent-cyan)" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.2)', border: '1px solid var(--accent-amber)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bot size={18} color="var(--accent-amber)" />
            </div>
            <div style={{
              background: 'rgba(31, 41, 55, 0.8)',
              padding: '10px 16px',
              borderRadius: '16px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Zap size={14} className="recording-pulse" color="var(--accent-amber)" />
              <span>Analyzing car symptoms & scanning OBD rules...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Uploader Toolbar */}
      <MediaUploader
        onMediaAttached={onMediaAttached}
        attachedMedia={attachedMedia}
        clearAttachedMedia={clearAttachedMedia}
      />

      {/* Chat Input Form */}
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        <input
          type="text"
          placeholder="Describe your car issue (e.g., 'Car won't start', 'Brake squeaking')..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          <Send size={18} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
