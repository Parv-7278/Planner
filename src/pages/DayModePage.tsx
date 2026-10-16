import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Clock,
  MapPin,
  Navigation,
  CloudSun,
  Ticket,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Car
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DayModePage: React.FC = () => {
  const { activeDay, bookings, shiftActivityTime } = useApp();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(42 * 60 + 18); // Simulated 42 mins remaining in current stop
  const [trafficDelayed, setTrafficDelayed] = useState(false);

  // Countdown timer simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const currentItem = activeDay.items[currentIdx] || activeDay.items[0];
  const nextItem = activeDay.items[currentIdx + 1];
  const laterItems = activeDay.items.slice(currentIdx + 2);
  const nextLeg = activeDay.travelLegs[currentIdx];

  // Match booking pass for current experience
  const currentBooking = bookings.find(
    (b) => b.experienceId === currentItem?.experience.id && b.status === 'confirmed'
  );

  const handleAdjustForTraffic = () => {
    // Nudge next activities by +15 mins
    if (nextItem) {
      shiftActivityTime(nextItem.id, 15);
      setTrafficDelayed(false);
    }
  };

  if (!currentItem) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>No activities planned for today yet.</h2>
        <Link to="/plan" className="btn btn-primary" style={{ marginTop: 16 }}>
          Plan Your Day
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px 0 80px 0' }}>
      <div className="container-dayly" style={{ maxWidth: 880 }}>
        {/* Top Active Status Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
            padding: '12px 22px',
            borderRadius: 99,
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.32)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 10px #10B981'
              }}
            />
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#6EE7B7', letterSpacing: '0.04em' }}>
              DAY MODE ACTIVE • PERSONAL TELEMETRY
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
              <CloudSun size={16} color="#FCD34D" />
              <span>Delhi 28°C • Pleasant Clear Skies</span>
            </div>

            <Link to="/my-day" style={{ color: 'var(--lavender-electric)', fontWeight: 700 }}>
              Edit Plan →
            </Link>
          </div>
        </div>

        {/* Traffic / Delay Alert Simulator Pill */}
        {trafficDelayed && (
          <div
            style={{
              padding: '14px 20px',
              borderRadius: 18,
              background: 'rgba(245, 158, 11, 0.14)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
              animation: 'toastIn 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={20} color="#F59E0B" />
              <span style={{ fontSize: '0.88rem', color: '#FFFFFF' }}>
                Traffic buildup ahead (+14 mins). Recommend shifting next stop reservation.
              </span>
            </div>
            <button
              onClick={handleAdjustForTraffic}
              className="btn btn-secondary btn-sm"
              style={{ background: '#F59E0B', color: '#0B1020', fontWeight: 800 }}
            >
              Auto-Adjust +15m
            </button>
          </div>
        )}

        {/* 1. CURRENT ACTIVITY HERO CARD */}
        <div
          className="glass-panel"
          style={{
            padding: '36px 32px',
            marginBottom: 32,
            border: '1px solid rgba(255, 255, 255, 0.10)',
            boxShadow: 'var(--shadow-floating), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            borderRadius: 28,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--grad-primary)',
                color: '#FFFFFF',
                padding: '5px 14px',
                borderRadius: 99,
                fontWeight: 800,
                fontSize: '0.74rem',
                letterSpacing: '0.06em',
                boxShadow: '0 2px 10px rgba(139, 92, 246, 0.35)'
              }}
            >
              CURRENT STOP ({currentIdx + 1} of {activeDay.items.length})
            </span>

            {/* Countdown timer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.92rem',
                fontWeight: 800,
                color: '#6EE7B7',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '5px 14px',
                borderRadius: 99
              }}
            >
              <Clock size={15} />
              <span>Ends in {formatCountdown(secondsRemaining)}</span>
            </div>
          </div>

          {/* Activity main showcase */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 28 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.025em' }}>
                {currentItem.experience.name}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.55, marginBottom: 18 }}>
                {currentItem.experience.tagline}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} color="var(--lavender-electric)" />
                  <strong style={{ color: '#FFFFFF' }}>{currentItem.startTime} – {currentItem.endTime}</strong>
                  <span>({currentItem.durationMinutes} mins)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={16} color="var(--cyan-accent)" />
                  <span>{currentItem.experience.venue.address}</span>
                </div>
              </div>
            </div>

            {/* Ticket & QR Pass widget */}
            <div
              style={{
                background: 'rgba(11, 16, 32, 0.65)',
                border: '1px dashed rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(16px)',
                borderRadius: 20,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  DIGITAL ENTRY PASS
                </span>
                <span className="badge badge-emerald">ACTIVE</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <img
                  src={
                    currentBooking?.qrCodeUrl ||
                    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DAYLY-LIVE-PASS'
                  }
                  alt="Entry QR"
                  style={{ width: 84, height: 84, borderRadius: 10, background: '#FFFFFF', padding: 5 }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF' }}>
                    {currentBooking ? currentBooking.bookingCode : 'DAYLY-EXP-8891'}
                  </div>
                  <div style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                    Group of 2 • Priority Entry
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--lavender-electric)', marginTop: 4 }}>
                    Tap to show turnstile scanner
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                currentItem.experience.venue.name + ' ' + currentItem.experience.venue.address
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <Navigation size={16} /> Open in Google Maps
            </a>

            {currentIdx < activeDay.items.length - 1 && (
              <button
                onClick={() => {
                  setCurrentIdx(currentIdx + 1);
                  setSecondsRemaining(currentItem.durationMinutes * 60);
                }}
                className="btn btn-secondary"
              >
                Mark Complete & Next Stop <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 2. UP NEXT ACTIVITY */}
        {nextItem && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>Up Next</h3>
              {nextLeg && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {nextLeg.distanceKm} km away (~{nextLeg.travelMinutes} mins travel via {nextLeg.transportMode})
                </span>
              )}
            </div>

            <div
              className="glass-card"
              style={{
                padding: '22px',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                borderRadius: 22
              }}
            >
              <img
                src={nextItem.experience.images[0]}
                alt={nextItem.experience.name}
                style={{ width: 84, height: 84, borderRadius: 16, objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="badge badge-violet" style={{ fontSize: '0.70rem' }}>
                    {nextItem.startTime} – {nextItem.endTime}
                  </span>
                  <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                    {nextItem.experience.category}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {nextItem.experience.name}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  <MapPin size={13} color="var(--lavender-electric)" />
                  <span>{nextItem.experience.venue.name}</span>
                </div>
              </div>

              <Link to={`/experience/${nextItem.experience.id}`} className="btn btn-secondary btn-sm">
                View Details
              </Link>
            </div>
          </div>
        )}

        {/* 3. LATER TODAY AGENDA */}
        {laterItems.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 14 }}>
              Later Today
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {laterItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderRadius: 16,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ color: 'var(--lavender-electric)', fontWeight: 700, fontSize: '0.88rem' }}>
                      {item.startTime}
                    </span>
                    <strong style={{ color: '#FFFFFF', fontSize: '0.94rem' }}>{item.experience.name}</strong>
                  </div>

                  <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                    {item.experience.venue.area}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test simulator button */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <button
            onClick={() => setTrafficDelayed(true)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
          >
            🧪 Simulate Traffic Jam Warning Notification
          </button>
        </div>
      </div>
    </div>
  );
};
