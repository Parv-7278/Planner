import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  CloudRain,
  Clock,
  Film,
  Wallet,
  AlertTriangle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItineraryEngine } from '../services/itineraryEngine';

interface WhatIfModalProps {
  onClose: () => void;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({ onClose }) => {
  const { activeDay, setActiveDay } = useApp();
  const [customQuestion, setCustomQuestion] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const presets = [
    {
      id: 'rain_mode',
      title: 'What if it rains? ☔',
      desc: 'Automatically shifts outdoor picnics, walks and open-air activities to indoor pottery, VR, museums and cafes.',
      icon: CloudRain,
      color: '#60a5fa'
    },
    {
      id: 'remove_movie',
      title: 'What if we skip the movie? 🎬',
      desc: 'Removes cinema block, opens up 2.5 hours of free evening time for rooftop dining or art strolls.',
      icon: Film,
      color: '#ff4d6d'
    },
    {
      id: 'start_later',
      title: 'What if we start 2 hours later? ⏰',
      desc: 'Nudges the entire chronological schedule forward by 120 minutes so you can sleep in.',
      icon: Clock,
      color: '#fbbf24'
    },
    {
      id: 'sold_out_replace',
      title: 'What if an activity is sold out? ⚠️',
      desc: 'Simulates high demand and auto-replaces the first activity with an available high-rated alternative.',
      icon: AlertTriangle,
      color: '#fb7185'
    }
  ];

  const handleRunSimulation = async (scenario: any) => {
    setIsSimulating(true);
    await new Promise((r) => setTimeout(r, 600));

    const updated = ItineraryEngine.simulateWhatIf(activeDay, scenario, customQuestion);
    setActiveDay(updated);
    setIsSimulating(false);
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
              <HelpCircle size={20} />
            </div>
            <div>
              <span className="badge badge-coral" style={{ fontSize: '0.68rem', marginBottom: 2 }}>
                Scenario Simulator
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>DAYLY "What If?" Engine</h3>
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

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            Test hypothetical circumstances. DAYLY dynamically recalculates time windows, conflicts,
            and routes without breaking your confirmed day.
          </p>

          {/* Preset Scenario Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {presets.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  onClick={() => handleRunSimulation(p.id)}
                  style={{
                    padding: '16px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,77,109,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: p.color
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>{p.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                      {p.desc}
                    </p>
                  </div>
                  <ArrowRight size={18} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>

          {/* Natural language custom prompt */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 18 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Or type a custom What-If scenario:
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. What if we want dinner in Mehrauli instead?"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="input-field"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => handleRunSimulation('start_later')}
                className="btn btn-primary"
                disabled={!customQuestion.trim() || isSimulating}
              >
                Simulate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
