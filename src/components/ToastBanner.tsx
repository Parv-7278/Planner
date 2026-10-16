import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { X, Bell, CheckCircle2, Clock, Car, Sparkles } from 'lucide-react';

export const ToastBanner: React.FC = () => {
  const { toast, dismissToast } = useApp();

  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className="toast-card">
        <div style={{ marginTop: 2 }}>
          {toast.type === 'queue' && <Clock size={20} color="var(--violet-500)" />}
          {toast.type === 'booking' && <CheckCircle2 size={20} color="var(--emerald-500)" />}
          {toast.type === 'traffic' && <Car size={20} color="var(--amber-500)" />}
          {toast.type === 'itinerary' && <Sparkles size={20} color="var(--coral-500)" />}
          {toast.type === 'weather' && <Sparkles size={20} color="var(--blue-500)" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{toast.title}</h5>
            <button
              onClick={dismissToast}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={16} />
            </button>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
            {toast.message}
          </p>
          {toast.actionUrl && (
            <Link
              to={toast.actionUrl}
              onClick={dismissToast}
              style={{
                display: 'inline-block',
                marginTop: 6,
                fontSize: '0.78rem',
                color: 'var(--lavender-400)',
                fontWeight: 700
              }}
            >
              {toast.actionText || 'View now'} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
