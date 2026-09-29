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
      <div className="container-dayly" style={{ maxWidth: 860 }}>
        {/* Top Active Status Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
            padding: '12px 20px',
            borderRadius: 99,
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px #10b981'
              }}
            />
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#34d399', letterSpacing: '0.04em' }}>
              DAY MODE ACTIVE • PERSONAL ASSISTANT
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
              <CloudSun size={16} color="#fbbf24" />
              <span>Delhi 28°C • Pleasant Clear Skies</span>
            </div>

            <Link to="/my-day" style={{ color: 'var(--coral-500)', fontWeight: 700 }}>
              Edit Plan →
            </Link>
          </div>
        </div>

        {/* Traffic / Delay Alert Simulator Pill */}
        {trafficDelayed && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 16,
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
              animation: 'toastIn 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={20} color="#f59e0b" />
              <span style={{ fontSize: '0.88rem', color: '#fff' }}>
                Traffic buildup ahead (+14 mins). Recommend shifting next stop reservation.
              </span>
            </div>
            <button
              onClick={handleAdjustForTraffic}
              className="btn btn-secondary btn-sm"
              style={{ background: '#f59e0b', color: '#000', fontWeight: 700 }}
            >
              Auto-Adjust +15m
            </button>
          </div>
        )}

        {/* 1. CURRENT ACTIVITY HERO CARD */}
        <div
          className="glass-panel"
          style={{
            padding: '32px 28px',
            marginBottom: 28,
            border: '1px solid rgba(255, 77, 109, 0.35)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 30px var(--coral-glow)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--grad-primary)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: 99,
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.06em'
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
                fontSize: '0.95rem',
                fontWeight: 800,
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '4px 12px',
                borderRadius: 99
              }}
            >
              <Clock size={16} />
              <span>Ends in {formatCountdown(secondsRemaining)}</span>
            </div>
          </div>

          {/* Activity main showcase */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, marginBottom: 8 }}>
                {currentItem.experience.name}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: 16 }}>
                {currentItem.experience.tagline}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={15} color="var(--coral-500)" />
                  <strong style={{ color: '#fff' }}>{currentItem.startTime} – {currentItem.endTime}</strong>
                  <span>({currentItem.durationMinutes} mins)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={15} color="var(--coral-500)" />
                  <span>{currentItem.experience.venue.address}</span>
                </div>
              </div>
            </div>

            {/* Ticket & QR Pass widget */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px dashed rgba(255,255,255,0.2)',
                borderRadius: 18,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>DIGITAL ENTRY PASS</span>
                <span className="badge badge-emerald">ACTIVE</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={
                    currentBooking?.qrCodeUrl ||
                    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DAYLY-LIVE-PASS'
                  }
                  alt="Entry QR"
                  style={{ width: 80, height: 80, borderRadius: 8, background: '#fff', padding: 4 }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                    {currentBooking ? currentBooking.bookingCode : 'DAYLY-EXP-8891'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Group of 2 • Priority Entry
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Tap to show turnstile scanner
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Up Next</h3>
              {nextLeg && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {nextLeg.distanceKm} km away (~{nextLeg.travelMinutes} mins travel via {nextLeg.transportMode})
                </span>
              )}
            </div>

            <div
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: 'rgba(25, 27, 48, 0.6)'
              }}
            >
              <img
                src={nextItem.experience.images[0]}
                alt={nextItem.experience.name}
                style={{ width: 80, height: 80, borderRadius: 14, objectFit: 'cover' }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="badge badge-violet" style={{ fontSize: '0.68rem' }}>
                    {nextItem.startTime} – {nextItem.endTime}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {nextItem.experience.category}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  {nextItem.experience.name}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  <MapPin size={13} color="var(--coral-500)" />
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
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              Later Today
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {laterItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: 'var(--coral-500)', fontWeight: 700, fontSize: '0.85rem' }}>
                      {item.startTime}
                    </span>
                    <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{item.experience.name}</strong>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {item.experience.venue.area}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test simulator button */}
        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <button
            onClick={() => setTrafficDelayed(true)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
          >
            🧪 Simulate Traffic Jam Warning Notification
          </button>
        </div>
      </div>
    </div>
  );
};
