import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  Wallet,
  Car,
  MapPin,
  Calendar,
  Share2,
  Bookmark,
  Zap,
  HelpCircle,
  Plus,
  RefreshCw,
  Users,
  CheckCircle2,
  Navigation,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TimelineCard } from '../components/TimelineCard';
import { RouteMapView } from '../components/RouteMapView';
import { WhatIfModal } from '../components/WhatIfModal';
import { GroupPlanModal } from '../components/GroupPlanModal';
import { ItineraryEngine } from '../services/itineraryEngine';

export const MyDayPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeDay, bookings } = useApp();

  const [activeTab, setActiveTab] = useState<'timeline' | 'map'>('timeline');
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Budget calculations
  const totalBudget = 5000;
  const spentAmount = activeDay.totalCost;
  const remainingBudget = Math.max(0, totalBudget - spentAmount);

  // Breakdown across categories
  const foodCost = activeDay.items
    .filter((it) => it.experience.category === 'food')
    .reduce((s, it) => s + it.experience.pricePerPerson * 2, 0);

  const activitiesCost = activeDay.items
    .filter((it) => it.experience.category === 'activities' || it.experience.category === 'workshops' || it.experience.category === 'sports')
    .reduce((s, it) => s + it.experience.pricePerPerson * 2, 0);

  const moviesCost = activeDay.items
    .filter((it) => it.experience.category === 'movies')
    .reduce((s, it) => s + it.experience.pricePerPerson * 2, 0);

  const transportCost = activeDay.travelLegs.reduce((s, l) => s + l.estimatedCost, 0);

  const handleSaveDay = () => {
    ItineraryEngine.saveToMyDays(activeDay);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const bookedCount = activeDay.items.filter((it) =>
    bookings.some((b) => b.experienceId === it.experience.id && b.status === 'confirmed')
  ).length;

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container-dayly">
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 28
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-coral">{activeDay.mode} Edition</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {activeDay.date} • {activeDay.city}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 900 }}>
              {activeDay.title}
            </h1>
          </div>

          {/* Quick Global Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setShowWhatIf(true)} className="btn btn-secondary btn-sm">
              <HelpCircle size={15} color="var(--coral-500)" />
              What If?
            </button>

            <button onClick={() => setShowGroupModal(true)} className="btn btn-secondary btn-sm">
              <Users size={15} color="var(--violet-500)" />
              Invite Friends
            </button>

            <button onClick={handleSaveDay} className="btn btn-secondary btn-sm">
              {savedSuccess ? <Check size={15} color="#10b981" /> : <Bookmark size={15} />}
              {savedSuccess ? 'Saved to My Days' : 'Save Plan'}
            </button>

            <Link
              to="/day-mode"
              className="btn btn-primary"
              style={{ padding: '10px 22px', fontSize: '0.95rem' }}
            >
              <Zap size={16} /> Enter Live Day Mode
            </Link>
          </div>
        </div>

        {/* High-level Summary Metrics Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 14,
            marginBottom: 28
          }}
        >
          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 6 }}>
              <Clock size={16} color="var(--coral-500)" />
              <span>TOTAL DURATION</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {Math.round(activeDay.totalDurationMinutes / 60)} hrs {activeDay.totalDurationMinutes % 60} mins
            </div>
          </div>

          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 6 }}>
              <Wallet size={16} color="var(--emerald-500)" />
              <span>TOTAL COST (2 GUESTS)</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              ₹{activeDay.totalCost}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 6 }}>
              <Car size={16} color="var(--blue-500)" />
              <span>TRAVEL DISTANCE</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {activeDay.totalDistanceKm} km
            </div>
          </div>

          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 6 }}>
              <MapPin size={16} color="var(--amber-500)" />
              <span>ACTIVITIES</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {activeDay.numActivities} Stops
            </div>
          </div>

          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 6 }}>
              <CheckCircle2 size={16} color="var(--violet-500)" />
              <span>BOOKINGS CONFIRMED</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {bookedCount} / {activeDay.numActivities}
            </div>
          </div>
        </div>

        {/* Budget Management Breakdown Widget */}
        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            marginBottom: 32,
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Day Budget Overview</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Target: ₹{totalBudget} • Spent: ₹{spentAmount} • Remaining: <strong style={{ color: '#34d399' }}>₹{remainingBudget}</strong>
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: 10,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
              display: 'flex',
              marginBottom: 14
            }}
          >
            <div style={{ width: `${(foodCost / totalBudget) * 100}%`, background: '#ff4d6d' }} title="Food" />
            <div style={{ width: `${(activitiesCost / totalBudget) * 100}%`, background: '#8b5cf6' }} title="Activities" />
            <div style={{ width: `${(moviesCost / totalBudget) * 100}%`, background: '#3b82f6' }} title="Cinema" />
            <div style={{ width: `${(transportCost / totalBudget) * 100}%`, background: '#f59e0b' }} title="Transport" />
          </div>

          {/* Categories Pill Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d6d' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Food & Dining: <strong>₹{foodCost}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Activities & Craft: <strong>₹{activitiesCost}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Cinema & Shows: <strong>₹{moviesCost}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Est. Transit: <strong>₹{transportCost}</strong></span>
            </div>
          </div>
        </div>

        {/* View Switcher: Chronological Timeline vs Route Map */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`btn ${activeTab === 'timeline' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Chronological Timeline
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`btn ${activeTab === 'map' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Route Map & Directions
          </button>
        </div>

        {/* TAB 1: Chronological Timeline with Travel Legs */}
        {activeTab === 'timeline' && (
          <div className="timeline-container">
            <div className="timeline-line" />

            {activeDay.items.map((item, index) => {
              const travelLeg = activeDay.travelLegs[index];

              return (
                <div key={item.id} style={{ position: 'relative', marginBottom: 24 }}>
                  {/* Timeline node circle */}
                  <div className="timeline-step-node" />

                  {/* Activity Card */}
                  <TimelineCard
                    item={item}
                    index={index}
                    totalItems={activeDay.items.length}
                  />

                  {/* Travel Leg between this and next item */}
                  {travelLeg && (
                    <div className="travel-leg-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Car size={16} color="var(--violet-500)" />
                        <span>
                          Travel {travelLeg.distanceKm} km to {travelLeg.toLocation}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span>~{travelLeg.travelMinutes} mins</span>
                        <span style={{ color: '#34d399', fontWeight: 600 }}>
                          Traffic {travelLeg.trafficStatus}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add More Experiences Action */}
            <div style={{ marginTop: 10, paddingLeft: 10 }}>
              <Link to="/explore" className="btn btn-secondary">
                <Plus size={16} /> Add More Activities to My Day
              </Link>
            </div>
          </div>
        )}

        {/* TAB 2: Route Map View */}
        {activeTab === 'map' && <RouteMapView itinerary={activeDay} />}

        {/* What If Modal */}
        {showWhatIf && <WhatIfModal onClose={() => setShowWhatIf(false)} />}

        {/* Group Planning Modal */}
        {showGroupModal && <GroupPlanModal onClose={() => setShowGroupModal(false)} />}
      </div>
    </div>
  );
};
