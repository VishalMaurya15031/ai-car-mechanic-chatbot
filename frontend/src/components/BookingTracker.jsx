import React from 'react';
import { CheckCircle2, Clock, UserCheck, ShieldCheck, MapPin, Phone } from 'lucide-react';

export default function BookingTracker({ booking }) {
  if (!booking) return null;

  const steps = [
    { label: 'Confirmed', icon: CheckCircle2 },
    { label: 'Assigned', icon: UserCheck },
    { label: 'In Progress', icon: Clock },
    { label: 'Completed', icon: ShieldCheck }
  ];

  const currentStepIndex = ['Confirmed', 'Assigned', 'In Progress', 'Completed'].indexOf(booking.status);

  return (
    <div className="glass-panel" style={{ padding: '16px', borderTop: '3px solid var(--emerald-success)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={16} /> Booking Active #{booking.id.slice(0, 8)}
        </h4>
        <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '6px', color: 'var(--emerald-success)' }}>
          {booking.service_type.toUpperCase()}
        </span>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
        <div><strong>Customer:</strong> {booking.customer_name} ({booking.customer_phone})</div>
        <div><strong>Vehicle:</strong> {booking.car_details}</div>
      </div>

      {/* Status Timeline Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '16px' }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentStepIndex;

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isDone ? 'var(--emerald-success)' : 'rgba(255,255,255,0.1)',
                color: isDone ? '#000' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isDone ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                <Icon size={14} />
              </div>
              <span style={{ fontSize: '0.65rem', marginTop: '4px', color: isDone ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: isDone ? 600 : 400 }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
