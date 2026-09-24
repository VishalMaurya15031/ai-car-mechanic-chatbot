import React from 'react';
import { X, MessageSquare, PlusCircle, Calendar, ChevronRight } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, conversations, onSelectSession, onNewSession }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 900,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '360px',
        height: '100%',
        borderRadius: 0,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare color="var(--accent-amber)" /> Past Diagnostic Sessions
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <button
          className="btn-primary"
          onClick={() => { onNewSession(); onClose(); }}
          style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}
        >
          <PlusCircle size={18} />
          Start New Diagnostic Session
        </button>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No past diagnostic sessions recorded.
            </div>
          ) : (
            conversations.map((session) => (
              <div
                key={session.id}
                onClick={() => { onSelectSession(session.id); onClose(); }}
                className="glass-panel-interactive"
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {session.title || 'Diagnostic Session'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(session.created_at).toLocaleDateString()}
                  </span>
                  <ChevronRight size={14} color="var(--accent-amber)" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
