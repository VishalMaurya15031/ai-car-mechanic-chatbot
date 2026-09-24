import React from 'react';
import { Wrench, ShieldCheck, Sun, Moon, History, Activity } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, toggleHistory, currentSessionTitle, systemStatus }) {
  return (
    <header className="navbar glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          padding: '10px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
        }}>
          <Wrench size={22} color="#000000" strokeWidth={2.5} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Instant Mechanic <span style={{ color: 'var(--accent-amber)', fontSize: '0.85rem' }}>AI 2.0</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={12} color="var(--emerald-success)" />
            {currentSessionTitle || 'Automotive Master Diagnostic System'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Zero-AI Rule Filter Active Badge */}
        <div className="badge-neon-cyan" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} />
          <span>Zero-AI Cost Filter Active</span>
        </div>

        {/* History Drawer Toggle Button */}
        <button className="btn-secondary" onClick={toggleHistory} title="Diagnostic Session History">
          <History size={18} />
          <span style={{ fontSize: '0.85rem' }}>History</span>
        </button>

        {/* Light/Dark Theme Switcher */}
        <button className="btn-secondary" onClick={toggleTheme} style={{ padding: '10px' }} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} color="var(--accent-amber)" /> : <Moon size={18} color="var(--accent-cyan)" />}
        </button>
      </div>
    </header>
  );
}
