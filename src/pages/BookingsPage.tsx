import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Hourglass,
  QrCode,
  Share2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookingStatus, Booking } from '../types';
import { BookingManager } from '../services/bookingAdapters';

export const BookingsPage: React.FC = () => {
  const { bookings, refreshBookings, queues, reserveQueueSlot, leaveQueue } = useApp();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'today') return b.date.toLowerCase().includes('today') || b.status === 'confirmed';
    if (activeTab === 'upcoming') return b.status === 'confirmed';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking? Full refund will be processed.')) {
      await BookingManager.cancel(bookingId);
      refreshBookings();
    }
  };

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container-dayly">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <span className="badge badge-coral" style={{ marginBottom: 6 }}>
            Universal Tickets & Access Passes
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900 }}>
            My Bookings & DAYLY Queues
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 4 }}>
            Digital admissions, QR turnstile passes and real-time virtual waitlists.
          </p>
        </div>

        {/* 1. ACTIVE DAYLY VIRTUAL QUEUES SECTION */}
        {queues.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Hourglass size={18} color="var(--violet-500)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Active DAYLY Virtual Queues ({queues.length})</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {queues.map((q) => (
                <div
                  key={q.id}
                  className="glass-card"
                  style={{
                    padding: '20px',
                    border:
                      q.status === 'slot_available'
                        ? '1px solid rgba(16, 185, 129, 0.5)'
                        : '1px solid rgba(139, 92, 246, 0.4)',
                    boxShadow:
                      q.status === 'slot_available'
                        ? '0 0 20px rgba(16, 185, 129, 0.25)'
                        : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      {q.status === 'slot_available' ? (
                        <span className="badge badge-emerald">SLOT AVAILABLE! RESERVE NOW</span>
                      ) : q.status === 'booked' ? (
                        <span className="badge badge-emerald">AUTO-BOOKED</span>
                      ) : (
                        <span className="badge badge-violet">MONITORING QUEUE</span>
                      )}
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4 }}>{q.experienceName}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {q.slotDate} • {q.slotTime} ({q.partySize} Guests)
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>POSITION</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
                        {q.currentPosition > 0 ? `#${q.currentPosition}` : '✓'}
                      </div>
                    </div>
                  </div>

                  {q.status === 'monitoring' && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                        <span>Progressing in line</span>
                        <span>~{q.estimatedWaitMinutes} mins est. wait</span>
                      </div>
                      <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(
                              100,
                              Math.max(
                                15,
                                ((q.initialPosition - q.currentPosition + 1) / q.initialPosition) * 100
                              )
                            )}%`,
                            background: 'linear-gradient(90deg, #ff4d6d, #8b5cf6)'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    {q.status === 'slot_available' ? (
                      <button
                        onClick={() => reserveQueueSlot(q.id)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '10px' }}
                      >
                        Claim & Confirm Pass
                      </button>
                    ) : q.status === 'monitoring' ? (
                      <button
                        onClick={() => leaveQueue(q.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#fb7185', fontSize: '0.8rem' }}
                      >
                        Leave Waitlist
                      </button>
                    ) : (
                      <Link to="/bookings" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                        View Ticket
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. BOOKINGS SECTION */}
        {/* Tabs: Today, Upcoming, Completed, Cancelled */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
          {[
            { id: 'today', label: 'Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pill-filter ${activeTab === t.id ? 'pill-filter-active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Ticket size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No bookings in this tab</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
              Ready to plan your next outing?
            </p>
            <Link to="/explore" className="btn btn-primary" style={{ marginTop: 18 }}>
              Explore Experiences
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 20,
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className={`badge ${b.status === 'confirmed' ? 'badge-emerald' : 'badge-rose'}`}>
                      {b.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Code: <strong>{b.bookingCode}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                    {b.experienceName}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="var(--coral-500)" />
                      <span>{b.date} • <strong>{b.timeSlot}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} color="var(--coral-500)" />
                      <span>{b.venueName} ({b.venueAddress})</span>
                    </div>
                    <div>
                      <span>Party: <strong>{b.numPeople} Guests</strong> • Total Paid: <strong>₹{b.totalAmount}</strong></span>
                    </div>
                  </div>
                </div>

                {/* QR Code and Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      background: '#fff',
                      padding: 8,
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <img
                      src={b.qrCodeUrl}
                      alt="Digital Pass QR"
                      style={{ width: 90, height: 90, borderRadius: 6 }}
                    />
                    <span style={{ fontSize: '0.65rem', color: '#333', fontWeight: 700 }}>TURNSTILE PASS</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                    <Link to="/day-mode" className="btn btn-primary btn-sm">
                      Open in Day Mode
                    </Link>

                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#fb7185', fontSize: '0.8rem' }}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
