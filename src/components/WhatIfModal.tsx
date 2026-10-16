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
      color: '#67E8F9'
    },
    {
      id: 'remove_movie',
      title: 'What if we skip the movie? 🎬',
      desc: 'Removes cinema block, opens up 2.5 hours of free evening time for rooftop dining or art strolls.',
      icon: Film,
      color: '#F0ABFC'
    },
    {
      id: 'start_later',
      title: 'What if we start 2 hours later? ⏰',
      desc: 'Nudges the entire chronological schedule forward by 120 minutes so you can sleep in.',
      icon: Clock,
      color: '#FCD34D'
    },
    {
      id: 'sold_out_replace',
      title: 'What if an activity is sold out? ⚠️',
      desc: 'Simulates high demand and auto-replaces the first activity with an available high-rated alternative.',
      icon: AlertTriangle,
      color: '#FDA4AF'
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
      <div className="modal-box" style={{ maxWidth: 620, borderRadius: 26 }} onClick={(e) => e.stopPropagation()}>
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
              <HelpCircle size={20} />
            </div>
            <div>
              <span className="badge badge-violet" style={{ fontSize: '0.70rem', marginBottom: 2 }}>
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
        <div style={{ padding: '26px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.90rem', marginBottom: 22, lineHeight: 1.55 }}>
            Test hypothetical circumstances. DAYLY dynamically recalculates time windows, conflicts,
            and routes without breaking your confirmed day.
          </p>

          {/* Preset Scenario Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
            {presets.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  onClick={() => handleRunSimulation(p.id)}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 16,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    transition: 'all 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(167, 139, 250, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: p.color
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>{p.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.45 }}>
                      {p.desc}
                    </p>
                  </div>
                  <ArrowRight size={18} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>

          {/* Natural language custom prompt */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 20 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Or type a custom What-If scenario:
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
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
