import React from 'react';
import { AlertTriangle, CheckCircle, DollarSign, CalendarCheck, ShieldAlert, Cpu } from 'lucide-react';

export default function DiagnosisCard({ diagnosis, onOpenBooking }) {
  if (!diagnosis) {
    return (
      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Cpu size={32} color="var(--accent-cyan)" style={{ marginBottom: '10px' }} />
        <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>No Active Diagnosis Yet</h3>
        <p style={{ fontSize: '0.8rem' }}>Describe your car symptoms or upload photo/audio to generate a technical diagnosis card.</p>
      </div>
    );
  }

  const { summary, severity, probable_causes, recommended_fixes, estimated_cost } = diagnosis;

  const severityClass = `severity-${(severity || 'Medium').toLowerCase()}`;

  return (
    <div className="glass-panel glass-panel-interactive" style={{ padding: '20px', borderLeft: '4px solid var(--accent-amber)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-amber)', letterSpacing: '0.8px', fontWeight: 700 }}>
            Master Technician Diagnosis
          </span>
          <h3 style={{ fontSize: '1.1rem', marginTop: '4px', fontWeight: 700 }}>{summary}</h3>
        </div>
        <span className={`badge-neon-amber ${severityClass}`} style={{ textTransform: 'capitalize' }}>
          {severity} Risk
        </span>
      </div>

      {/* Probable Causes */}
      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <AlertTriangle size={14} color="var(--accent-amber)" /> Probable Causes:
        </h4>
        <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
          {Array.isArray(probable_causes) && probable_causes.map((cause, idx) => (
            <li key={idx} style={{ marginBottom: '3px' }}>{cause}</li>
          ))}
        </ul>
      </div>

      {/* Recommended Fixes */}
      <div style={{ marginBottom: '14px' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <CheckCircle size={14} color="var(--emerald-success)" /> Recommended Fixes:
        </h4>
        <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
          {Array.isArray(recommended_fixes) && recommended_fixes.map((fix, idx) => (
            <li key={idx} style={{ marginBottom: '3px' }}>{fix}</li>
          ))}
        </ul>
      </div>

      {/* Repair Cost & Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-glass)',
        marginTop: '12px'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Cost:</span>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={16} /> {estimated_cost}
          </div>
        </div>

        <button className="btn-primary" onClick={() => onOpenBooking(diagnosis)}>
          <CalendarCheck size={18} />
          Book Mechanic
        </button>
      </div>
    </div>
  );
}
