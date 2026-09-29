import React from 'react';
import { X, RefreshCw, Star, MapPin, Clock, ArrowRight, Check } from 'lucide-react';
import { Experience, ItineraryItem } from '../types';
import { ItineraryEngine } from '../services/itineraryEngine';
import { useApp } from '../context/AppContext';

interface RescheduleModalProps {
  item: ItineraryItem;
  onClose: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ item, onClose }) => {
  const { replaceActivityInDay } = useApp();
  const alternatives = ItineraryEngine.getReplacementsFor(item.experience);

  const handleSelectReplacement = (newExp: Experience) => {
    replaceActivityInDay(item.id, newExp);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255, 77, 109, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--coral-500)'
              }}
            >
              <RefreshCw size={18} />
            </div>
            <div>
              <span className="badge badge-coral" style={{ fontSize: '0.68rem', marginBottom: 2 }}>
                Intelligent Replacement Engine
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Swap "{item.experience.name}"</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 18 }}>
            Selected top matching nearby experiences that seamlessly slot into your schedule around{' '}
            <strong>{item.startTime}</strong>:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <img
                  src={alt.images[0]}
                  alt={alt.name}
                  style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="badge badge-violet" style={{ fontSize: '0.65rem' }}>
                      {alt.category}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.8rem', color: '#fbbf24' }}>
                      <Star size={12} fill="#fbbf24" />
                      <span style={{ fontWeight: 700 }}>{alt.rating}</span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{alt.name}</h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} /> {alt.venue.area}
                    </span>
                    <span>₹{alt.pricePerPerson}/person</span>
                    <span>{alt.durationMinutes} mins</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectReplacement(alt)}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '8px 14px' }}
                >
                  <Check size={14} /> Swap
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Keep Current Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
