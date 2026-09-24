import React, { useState } from 'react';
import { X, Calendar, MapPin, User, Phone, Car, Wrench, Truck } from 'lucide-react';
import { createBooking } from '../services/api';

export default function BookingModal({ diagnosis, onClose, onBookingComplete }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    car_details: '2020 Honda Civic / City',
    service_type: 'doorstep',
    location_address: '',
    preferred_date: 'Tomorrow at 10:00 AM',
    notes: diagnosis ? `Diagnosis: ${diagnosis.summary}` : ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_phone || !formData.location_address) {
      setError('Please fill in Name, Phone, and Address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        diagnosis: diagnosis ? diagnosis.id : null
      };
      const result = await createBooking(payload);
      onBookingComplete(result);
    } catch (err) {
      setError('Failed to create booking. Please check details and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '24px', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench color="var(--accent-amber)" /> Book Certified Mechanic
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {diagnosis ? `Pre-filled for: ${diagnosis.summary}` : 'Schedule doorstep inspection or workshop repair'}
        </p>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid var(--rose-alert)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--rose-alert)', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Customer Name</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px' }}>
              <User size={16} color="var(--accent-cyan)" />
              <input
                type="text"
                placeholder="e.g. Vishal Maurya"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '0.9rem' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px' }}>
                <Phone size={16} color="var(--emerald-success)" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '0.9rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Vehicle Make / Model</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px' }}>
                <Car size={16} color="var(--accent-amber)" />
                <input
                  type="text"
                  placeholder="2020 Honda Civic"
                  value={formData.car_details}
                  onChange={(e) => setFormData({ ...formData, car_details: e.target.value })}
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Service Type</label>
            <select
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            >
              <option value="doorstep" style={{ background: '#111827' }}>🚗 Doorstep Mechanic Visit</option>
              <option value="workshop" style={{ background: '#111827' }}>🏭 Workshop Drop-off</option>
              <option value="towing" style={{ background: '#111827' }}>🚨 Emergency Towing Service</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Service Address / Location</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px' }}>
              <MapPin size={16} color="var(--rose-alert)" />
              <input
                type="text"
                placeholder="Street address, city, pin code"
                value={formData.location_address}
                onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '0.9rem' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {loading ? 'Confirming Booking...' : 'Confirm Mechanic Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
