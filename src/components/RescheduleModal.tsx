import { X, RefreshCw, Star, MapPin, Check, AlertTriangle } from 'lucide-react';
import { Experience, ItineraryItem } from '../types';
import { ItineraryEngine } from '../services/itineraryEngine';
import { useApp } from '../context/AppContext';

interface RescheduleModalProps {
  item: ItineraryItem;
  onClose: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ item, onClose }) => {
  const { activeDay, replaceActivityInDay } = useApp();
  const numPeople = activeDay.numPeople || item.numPeople || 2;
  const userBudget = activeDay.userBudget || 4000;

  const alternatives = ItineraryEngine.getReplacementsFor(item.experience, activeDay);

  const handleSelectReplacement = (newExp: Experience) => {
    replaceActivityInDay(item.id, newExp);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 650, borderRadius: 26 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '22px 26px',
            borderBottom: '1px solid var(--glass-panel-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(167, 139, 250, 0.20)',
                border: '1px solid rgba(167, 139, 250, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--lavender-electric)'
              }}
            >
              <RefreshCw size={18} />
            </div>
            <div>
              <span className="badge badge-violet" style={{ fontSize: '0.70rem', marginBottom: 2 }}>
                Intelligent Replacement Engine
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Swap "{item.experience.name}"</h3>
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
        <div style={{ padding: '26px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.90rem', marginBottom: 18, lineHeight: 1.55 }}>
            Evaluating verified alternatives around{' '}
            <strong style={{ color: '#FFFFFF' }}>{item.startTime}</strong> for{' '}
            <strong style={{ color: '#FFFFFF' }}>{numPeople} guests</strong>. DAYLY validates budget impact and downstream transit before swapping.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {alternatives.map((alt) => {
              const currentCost = (item.itemCost ?? (item.experience.pricePerPerson * numPeople));
              const newCost = ItineraryEngine.calculateActivityCost(alt, numPeople);
              const costDiff = newCost - currentCost;
              const willExceedBudget = activeDay.totalCost + costDiff > userBudget;
              const durationDiff = alt.durationMinutes - item.durationMinutes;

              return (
                <div
                  key={alt.id}
                  style={{
                    background: willExceedBudget ? 'rgba(239, 68, 68, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                    border: willExceedBudget ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 18,
                    padding: '16px',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <img
                    src={alt.images[0]}
                    alt={alt.name}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 14,
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      flexShrink: 0
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span className="badge badge-violet" style={{ fontSize: '0.65rem' }}>
                        {alt.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.8rem', color: '#FCD34D' }}>
                        <Star size={12} fill="#FCD34D" />
                        <span style={{ fontWeight: 700 }}>{alt.rating}</span>
                      </div>

                      {/* Cost difference pill */}
                      {costDiff > 0 ? (
                        <span style={{ fontSize: '0.72rem', color: willExceedBudget ? '#F87171' : '#FBBF24', fontWeight: 700 }}>
                          +₹{costDiff} group cost
                        </span>
                      ) : costDiff < 0 ? (
                        <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}>
                          -₹{Math.abs(costDiff)} savings
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Same price
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
                      {alt.name}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} color="var(--lavender-electric)" /> {alt.venue.area}
                      </span>
                      <span>₹{alt.pricePerPerson}/person</span>
                      <span>
                        {alt.durationMinutes} mins {durationDiff !== 0 && `(${durationDiff > 0 ? `+${durationDiff}` : durationDiff}m)`}
                      </span>
                    </div>

                    {willExceedBudget && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#FCA5A5', marginTop: 6 }}>
                        <AlertTriangle size={12} /> Exceeds budget limit by ₹{(activeDay.totalCost + costDiff) - userBudget}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSelectReplacement(alt)}
                    className={`btn ${willExceedBudget ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                  >
                    <Check size={14} /> Swap
                  </button>
                </div>
              );
            })}
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
