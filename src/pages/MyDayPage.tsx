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
  Check,
  AlertTriangle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TimelineCard } from '../components/TimelineCard';
import { RouteMapView } from '../components/RouteMapView';
import { WhatIfModal } from '../components/WhatIfModal';
import { GroupPlanModal } from '../components/GroupPlanModal';
import { ItineraryEngine } from '../services/itineraryEngine';

export const MyDayPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeDay,
    setActiveDay,
    bookings,
    planOptions,
    activeOption,
    switchOption
  } = useApp();

  const [activeTab, setActiveTab] = useState<'timeline' | 'map'>('timeline');
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Group and budget details from activeDay
  const numPeople = activeDay.numPeople || 2;
  const userBudget = activeDay.userBudget || 4000;
  const totalCost = activeDay.totalCost;
  const remainingBudget =
    activeDay.remainingBudget !== undefined
      ? activeDay.remainingBudget
      : Math.max(0, userBudget - totalCost);
  const budgetPercentUsed =
    userBudget > 0 ? Math.min(100, Math.round((totalCost / userBudget) * 100)) : 100;

  // Breakdown metrics
  const activityCost =
    activeDay.activityCost !== undefined
      ? activeDay.activityCost
      : activeDay.items.reduce((s, it) => s + (it.itemCost || it.experience.pricePerPerson * numPeople), 0);

  const foodCost =
    activeDay.foodCost !== undefined
      ? activeDay.foodCost
      : activeDay.items
          .filter((it) => it.experience.category === 'food')
          .reduce((s, it) => s + (it.itemCost || it.experience.pricePerPerson * numPeople), 0);

  const travelCost =
    activeDay.travelCost !== undefined
      ? activeDay.travelCost
      : activeDay.travelLegs.reduce((s, l) => s + l.estimatedCost, 0) +
        (activeDay.initialTravelLeg ? activeDay.initialTravelLeg.estimatedCost : 0);

  const feesCost =
    activeDay.feesCost !== undefined
      ? activeDay.feesCost
      : activeDay.items.reduce((s, it) => s + (it.experience.applicableFees || 0), 0);

  const validation = activeDay.validation;
  const isValid = validation ? validation.isValid : totalCost <= userBudget;

  const handleSaveDay = () => {
    ItineraryEngine.saveToMyDays(activeDay);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAutoRepair = () => {
    const repaired = ItineraryEngine.repairItinerary(activeDay);
    setActiveDay(repaired);
  };

  const bookedCount = activeDay.items.filter((it) =>
    bookings.some((b) => b.experienceId === it.experience.id && b.status === 'confirmed')
  ).length;

  return (
    <div style={{ padding: '36px 0 80px 0' }}>
      <div className="container-dayly">
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 26
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-cyan">{activeDay.mode} Plan</span>
              <span className="badge badge-violet">
                {numPeople} {numPeople === 1 ? 'Guest' : 'Guests'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {activeDay.date} • {activeDay.city}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.7rem)', fontWeight: 800 }}>
              {activeDay.title}
            </h1>
          </div>

          {/* Quick Global Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setShowWhatIf(true)} className="btn btn-secondary btn-sm">
              <HelpCircle size={14} color="var(--brand-primary)" />
              What If?
            </button>

            <button onClick={() => setShowGroupModal(true)} className="btn btn-secondary btn-sm">
              <Users size={14} color="#60A5FA" />
              Invite Friends
            </button>

            <button onClick={handleSaveDay} className="btn btn-secondary btn-sm">
              {savedSuccess ? <Check size={14} color="#34D399" /> : <Bookmark size={14} />}
              {savedSuccess ? 'Saved' : 'Save Plan'}
            </button>

            <Link
              to="/day-mode"
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <Zap size={14} /> Live Day Mode
            </Link>
          </div>
        </div>

        {/* 3 Itinerary Options Switcher Dock */}
        {planOptions && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '10px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              background: '#131720',
              border: '1px solid #232A38'
            }}
          >
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>
                SELECT VERIFIED ITINERARY TIER:
              </span>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Switch options instantaneously without re-entering preferences.
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {planOptions.budget_friendly && (
                <button
                  type="button"
                  onClick={() => switchOption('budget_friendly')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border:
                      activeOption === 'budget_friendly'
                        ? '1px solid var(--emerald-live)'
                        : '1px solid rgba(255,255,255,0.08)',
                    background:
                      activeOption === 'budget_friendly'
                        ? 'rgba(16, 185, 129, 0.20)'
                        : 'rgba(255,255,255,0.04)',
                    color: activeOption === 'budget_friendly' ? '#6EE7B7' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  🏷️ Budget Friendly (₹{planOptions.budget_friendly.totalCost})
                </button>
              )}

              {planOptions.balanced && (
                <button
                  type="button"
                  onClick={() => switchOption('balanced')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border:
                      activeOption === 'balanced'
                        ? '1px solid var(--lavender-electric)'
                        : '1px solid rgba(255,255,255,0.08)',
                    background:
                      activeOption === 'balanced'
                        ? 'rgba(167, 139, 250, 0.22)'
                        : 'rgba(255,255,255,0.04)',
                    color: activeOption === 'balanced' ? '#FFFFFF' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  ⚖️ Balanced (₹{planOptions.balanced.totalCost})
                </button>
              )}

              {planOptions.max_experience && (
                <button
                  type="button"
                  onClick={() => switchOption('max_experience')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border:
                      activeOption === 'max_experience'
                        ? '1px solid var(--pink-soft)'
                        : '1px solid rgba(255,255,255,0.08)',
                    background:
                      activeOption === 'max_experience'
                        ? 'rgba(236, 72, 153, 0.20)'
                        : 'rgba(255,255,255,0.04)',
                    color: activeOption === 'max_experience' ? '#F472B6' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  ⭐ Max Experience (₹{planOptions.max_experience.totalCost})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Validation Verification Status Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 16,
            marginBottom: 26,
            background: isValid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)',
            border: isValid ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.40)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isValid ? (
              <ShieldCheck size={20} color="#10B981" />
            ) : (
              <AlertTriangle size={20} color="#EF4444" />
            )}
            <div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.90rem',
                  color: isValid ? '#6EE7B7' : '#FCA5A5'
                }}
              >
                {isValid
                  ? 'Mathematically Validated Itinerary • Zero Budget Overruns • Travel Times Guaranteed'
                  : 'Itinerary Constraint Issue Detected'}
              </span>
              {!isValid && validation && validation.errors.length > 0 && (
                <div style={{ fontSize: '0.80rem', color: '#FCA5A5', marginTop: 4 }}>
                  {validation.errors[0]}
                </div>
              )}
            </div>
          </div>

          {!isValid && (
            <button
              onClick={handleAutoRepair}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.80rem', padding: '6px 14px' }}
            >
              <RefreshCw size={13} /> Auto-Repair Schedule
            </button>
          )}
        </div>

        {/* High-level Summary Metrics Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 16,
            marginBottom: 26
          }}
        >
          <div className="glass-card" style={{ padding: '20px 22px', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.76rem', marginBottom: 6 }}>
              <Clock size={16} color="var(--lavender-electric)" />
              <span>TOTAL DURATION</span>
            </div>
            <div style={{ fontSize: '1.40rem', fontWeight: 800, color: '#FFFFFF' }}>
              {Math.floor(activeDay.totalDurationMinutes / 60)}h {activeDay.totalDurationMinutes % 60}m
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {activeDay.startTime} – {activeDay.endTime}
            </span>
          </div>

          <div className="glass-card" style={{ padding: '20px 22px', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.76rem', marginBottom: 6 }}>
              <Wallet size={16} color="var(--cyan-accent)" />
              <span>TOTAL COST ({numPeople} GUESTS)</span>
            </div>
            <div style={{ fontSize: '1.40rem', fontWeight: 800, color: '#FFFFFF' }}>
              ₹{activeDay.totalCost}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#34D399' }}>
              ₹{remainingBudget} remaining reserve
            </span>
          </div>

          <div className="glass-card" style={{ padding: '20px 22px', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.76rem', marginBottom: 6 }}>
              <Car size={16} color="var(--pink-soft)" />
              <span>TRAVEL DISTANCE</span>
            </div>
            <div style={{ fontSize: '1.40rem', fontWeight: 800, color: '#FFFFFF' }}>
              {activeDay.totalDistanceKm} km
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {activeDay.travelLegs.length} transit legs
            </span>
          </div>

          <div className="glass-card" style={{ padding: '20px 22px', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.76rem', marginBottom: 6 }}>
              <MapPin size={16} color="var(--amber-warm)" />
              <span>ACTIVITIES</span>
            </div>
            <div style={{ fontSize: '1.40rem', fontWeight: 800, color: '#FFFFFF' }}>
              {activeDay.numActivities} Stops
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Chronologically scheduled
            </span>
          </div>

          <div className="glass-card" style={{ padding: '20px 22px', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.76rem', marginBottom: 6 }}>
              <CheckCircle2 size={16} color="var(--emerald-live)" />
              <span>BOOKINGS CONFIRMED</span>
            </div>
            <div style={{ fontSize: '1.40rem', fontWeight: 800, color: '#FFFFFF' }}>
              {bookedCount} / {activeDay.numActivities}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Direct instant reservation
            </span>
          </div>
        </div>

        {/* Transparent Cost Breakdown Panel (Requirement 13) */}
        <div
          className="glass-panel"
          style={{
            padding: '24px 28px',
            marginBottom: 32,
            borderRadius: 24
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: '1.10rem', fontWeight: 800 }}>Transparent Budget Breakdown</h3>
              <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
                Itemized calculations for all {numPeople} guests • No hidden estimates
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Budget: <strong style={{ color: '#FFFFFF' }}>₹{userBudget}</strong> • Planned: <strong style={{ color: '#FFFFFF' }}>₹{totalCost}</strong> • Reserve: <strong style={{ color: '#34D399' }}>₹{remainingBudget}</strong> ({100 - budgetPercentUsed}%)
              </span>
            </div>
          </div>

          {/* Budget progress bar */}
          <div
            style={{
              width: '100%',
              height: 10,
              borderRadius: 99,
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              display: 'flex',
              marginBottom: 16
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (foodCost / userBudget) * 100)}%`,
                background: 'linear-gradient(90deg, #F0ABFC, #EC4899)'
              }}
              title={`Food & Dining: ₹${foodCost}`}
            />
            <div
              style={{
                width: `${Math.min(100, ((activityCost - foodCost) / userBudget) * 100)}%`,
                background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)'
              }}
              title={`Activities: ₹${activityCost - foodCost}`}
            />
            <div
              style={{
                width: `${Math.min(100, (travelCost / userBudget) * 100)}%`,
                background: 'linear-gradient(90deg, #F59E0B, #FBBF24)'
              }}
              title={`Transit: ₹${travelCost}`}
            />
          </div>

          {/* Detailed Itemized Line Items */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 12,
              fontSize: '0.82rem',
              paddingTop: 12,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Total User Budget</span>
              <strong style={{ color: '#FFFFFF', fontSize: '1rem' }}>₹{userBudget}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Est. Activity Cost</span>
              <strong style={{ color: '#A78BFA', fontSize: '1rem' }}>₹{activityCost}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Est. Food & Dining</span>
              <strong style={{ color: '#F472B6', fontSize: '1rem' }}>₹{foodCost}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Est. Group Travel</span>
              <strong style={{ color: '#FBBF24', fontSize: '1rem' }}>₹{travelCost}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Applicable Fees</span>
              <strong style={{ color: '#93C5FD', fontSize: '1rem' }}>₹{feesCost}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Remaining Reserve</span>
              <strong style={{ color: '#34D399', fontSize: '1rem' }}>₹{remainingBudget}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Budget Used</span>
              <strong style={{ color: '#FFFFFF', fontSize: '1rem' }}>{budgetPercentUsed}%</strong>
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

        {/* TAB 1: Chronological Timeline */}
        {activeTab === 'timeline' && (
          <div className="timeline-container">
            <div className="timeline-line" />

            {/* Initial starting leg if present */}
            {activeDay.initialTravelLeg && (
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <div className="travel-leg-card" style={{ marginLeft: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Navigation size={16} color="var(--cyan-accent)" />
                    <span>
                      Depart from {activeDay.initialTravelLeg.fromLocation} to {activeDay.initialTravelLeg.toLocation}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span>~{activeDay.initialTravelLeg.travelMinutes} mins</span>
                    <span style={{ color: '#FCD34D' }}>Est. ₹{activeDay.initialTravelLeg.estimatedCost}</span>
                  </div>
                </div>
              </div>
            )}

            {activeDay.items.map((item, index) => {
              const travelLeg = activeDay.travelLegs[index];

              return (
                <div key={item.id} style={{ position: 'relative', marginBottom: 26 }}>
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
                        <Car size={16} color="var(--lavender-electric)" />
                        <span>
                          Travel {travelLeg.distanceKm} km to {travelLeg.toLocation}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span>~{travelLeg.travelMinutes} mins transit</span>
                        <span style={{ color: '#FCD34D', fontWeight: 600 }}>
                          Est. ₹{travelLeg.estimatedCost}
                        </span>
                        <span style={{ color: '#34D399', fontWeight: 600 }}>
                          Traffic {travelLeg.trafficStatus}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add More Experiences Action */}
            <div style={{ marginTop: 14, paddingLeft: 10 }}>
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
