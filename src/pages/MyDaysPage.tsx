import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Wallet,
  Car,
  Copy,
  ArrowRight,
  Plus,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DayItinerary } from '../types';
import { ItineraryEngine } from '../services/itineraryEngine';

export const MyDaysPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveDay, activeDay } = useApp();

  const [savedDays, setSavedDays] = useState<DayItinerary[]>(() => {
    const list = ItineraryEngine.getSavedDays();
    if (list.length > 0) return list;

    // Seed realistic sample days
    const samples: DayItinerary[] = [
      activeDay,
      {
        id: 'plan-sample-heritage',
        title: 'Old Delhi Food & Mughal Heritage Stroll',
        date: 'Last Saturday',
        city: 'Delhi',
        area: 'Old Delhi & Chandni Chowk',
        items: [activeDay.items[0]],
        travelLegs: [],
        totalCost: 2400,
        totalDurationMinutes: 360,
        totalDistanceKm: 6.2,
        numActivities: 3,
        numBookings: 2,
        mode: 'foodie',
        createdAt: new Date().toISOString()
      },
      {
        id: 'plan-sample-friends',
        title: 'Friends High-Speed Racing & Mystery Day',
        date: '2 Weeks Ago',
        city: 'Gurugram & South Delhi',
        items: [activeDay.items[1] || activeDay.items[0]],
        travelLegs: [],
        totalCost: 3800,
        totalDurationMinutes: 420,
        totalDistanceKm: 14.5,
        numActivities: 4,
        numBookings: 3,
        mode: 'friends',
        createdAt: new Date().toISOString()
      }
    ];
    return samples;
  });

  const handleLoadDay = (day: DayItinerary) => {
    setActiveDay(day);
    navigate('/my-day');
  };

  const handleDuplicate = (day: DayItinerary) => {
    const clone: DayItinerary = JSON.parse(JSON.stringify(day));
    clone.id = `plan-dup-${Date.now()}`;
    clone.title = `${day.title} (Copy)`;
    clone.date = 'Today';
    ItineraryEngine.saveToMyDays(clone);
    setSavedDays([clone, ...savedDays]);
    setActiveDay(clone);
    navigate('/my-day');
  };

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container-dayly">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span className="badge badge-violet" style={{ marginBottom: 6 }}>
              Itinerary Archives
            </span>
            <h1 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3rem)', fontWeight: 900 }}>
              My Saved Days ({savedDays.length})
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 6 }}>
              Re-experience your favourite day plans or duplicate and customize them.
            </p>
          </div>

          <Link to="/plan" className="btn btn-primary">
            <Plus size={16} /> Plan a New Day
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
          {savedDays.map((day) => (
            <div
              key={day.id}
              className="glass-card"
              style={{
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 22
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="badge badge-violet">{day.mode}</span>
                  <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>{day.date}</span>
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 8, letterSpacing: '-0.02em' }}>
                  {day.title}
                </h3>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 18 }}>
                  {day.city} {day.area ? `• ${day.area}` : ''}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(11, 16, 32, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.82rem',
                    marginBottom: 22
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Duration</span>
                    <strong style={{ display: 'block', color: '#FFFFFF', fontSize: '0.92rem' }}>
                      {Math.round(day.totalDurationMinutes / 60)}h {day.totalDurationMinutes % 60}m
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Cost (2p)</span>
                    <strong style={{ display: 'block', color: '#34D399', fontSize: '0.92rem' }}>₹{day.totalCost}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Distance</span>
                    <strong style={{ display: 'block', color: '#FFFFFF', fontSize: '0.92rem' }}>{day.totalDistanceKm} km</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Stops</span>
                    <strong style={{ display: 'block', color: '#FFFFFF', fontSize: '0.92rem' }}>{day.numActivities} activities</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleLoadDay(day)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  Load as Active Day <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => handleDuplicate(day)}
                  className="btn btn-secondary btn-sm"
                  title="Duplicate and Modify"
                >
                  <Copy size={14} /> Duplicate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
