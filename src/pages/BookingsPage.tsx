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
  ArrowRight,
  Bot,
  Play,
  Pause,
  RefreshCw,
  Lock,
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldCheck,
  Check,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookingStatus, Booking } from '../types';
import { BookingManager } from '../services/bookingAdapters';

export const BookingsPage: React.FC = () => {
  const {
    bookings,
    refreshBookings,
    queues,
    joinVirtualQueue,
    reserveQueueSlot,
    leaveQueue,
    startAssistantMonitoring,
    stopAssistantMonitoring,
    toggleAutoQueueEntry,
    solveManualVerification,
    triggerManualCheck
  } = useApp();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [verificationInputs, setVerificationInputs] = useState<Record<string, string>>({});
  const [checkingIds, setCheckingIds] = useState<Record<string, boolean>>({});

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

  const handleManualCheck = async (queueId: string) => {
    setCheckingIds((prev) => ({ ...prev, [queueId]: true }));
    await triggerManualCheck(queueId);
    setTimeout(() => {
      setCheckingIds((prev) => ({ ...prev, [queueId]: false }));
    }, 600);
  };

  const handleSolveVerification = (queueId: string) => {
    const code = verificationInputs[queueId];
    if (!code) return;
    solveManualVerification(queueId, code);
    setVerificationInputs((prev) => ({ ...prev, [queueId]: '' }));
  };

  const handleJoinSampleQueue = (experienceId: string, slotTime: string, partySize: number = 2) => {
    const existing = queues.find((q) => q.experienceId === experienceId && q.slotTime === slotTime);
    if (!existing) {
      joinVirtualQueue(experienceId, slotTime, 'Today', partySize, false, {
        assistantEnabled: true,
        autoQueueEntry: true
      });
    }
  };

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container-dayly">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <span className="badge badge-violet" style={{ marginBottom: 6 }}>
            Universal Tickets & Access Passes
          </span>
          <h1 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3rem)', fontWeight: 900 }}>
            My Bookings & DAYLY Queues
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 6 }}>
            Digital admissions, QR turnstile passes and real-time virtual waitlists.
          </p>
        </div>

        {/* 1. DAYLY AI QUEUE ASSISTANT CONTROL CENTER */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818CF8'
                }}
              >
                <Bot size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                    AI Booking Queue Assistant {queues.length > 0 ? `(${queues.length} Active)` : ''}
                  </h3>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#34D399',
                      border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                    24/7 Engine Active
                  </span>
                </div>
                <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                  Microsecond drop opening detection, automated queue entry, anti-bot challenge solving & turn arrival holds
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => handleJoinSampleQueue('exp-food-1', '07:30 PM')}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Zap size={14} />
                <span>Simulate Live Waitlist (#37)</span>
              </button>
            </div>
          </div>

          {queues.length > 0 ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
              {queues.map((q) => {
                const isChecking = checkingIds[q.id];
                const isTurnArrived = q.status === 'slot_available' || q.monitoringStatus === 'turn_arrived';
                const isOpening = q.monitoringStatus === 'monitoring_opening';
                const isLogsOpen = expandedLogId === q.id;

                return (
                  <div
                    key={q.id}
                    className="glass-card"
                    style={{
                      padding: '24px',
                      borderRadius: 22,
                      border: isTurnArrived
                        ? '1px solid rgba(16, 185, 129, 0.55)'
                        : q.requiresManualVerification
                        ? '1px solid rgba(245, 158, 11, 0.55)'
                        : '1px solid rgba(167, 139, 250, 0.40)',
                      boxShadow: isTurnArrived
                        ? '0 0 25px rgba(16, 185, 129, 0.25)'
                        : 'var(--shadow-sm)'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {isTurnArrived ? (
                            <span className="badge badge-emerald">TURN ARRIVED! APPROVE TO BOOK</span>
                          ) : q.status === 'booked' ? (
                            <span className="badge badge-emerald">BOOKED & CONFIRMED</span>
                          ) : isOpening ? (
                            <span className="badge badge-violet">MONITORING OPENING DROP</span>
                          ) : q.requiresManualVerification ? (
                            <span className="badge badge-amber">MANUAL VERIFICATION REQUIRED</span>
                          ) : (
                            <span className="badge badge-violet">IN OFFICIAL QUEUE</span>
                          )}

                          {q.assistantEnabled && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.70rem',
                                color: '#34D399',
                                fontWeight: 700
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                              AI Assistant Active
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 6, color: '#FFFFFF' }}>{q.experienceName}</h4>
                        <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                          {q.slotDate} • {q.slotTime} ({q.partySize} Guests)
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                          {isOpening ? 'DROP' : 'POSITION'}
                        </span>
                        <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#FFFFFF' }}>
                          {isOpening ? (q.openingTime || 'Soon') : q.currentPosition > 0 ? `#${q.currentPosition}` : '✓'}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar (if in queue) */}
                    {q.status === 'monitoring' && !isOpening && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 5 }}>
                          <span>Progression in line</span>
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
                              background: 'linear-gradient(90deg, #67E8F9, #A78BFA, #F0ABFC)'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Manual Verification Challenge Prompt */}
                    {q.requiresManualVerification && (
                      <div
                        style={{
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          borderRadius: 14,
                          padding: '12px 14px',
                          marginBottom: 14
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FBBF24', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                          <Lock size={15} />
                          <span>Human Verification Challenge</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                          Enter OTP / CAPTCHA solution to resume automatic progression.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            placeholder="Enter solution"
                            value={verificationInputs[q.id] || ''}
                            onChange={(e) =>
                              setVerificationInputs({ ...verificationInputs, [q.id]: e.target.value })
                            }
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: 8,
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#fff',
                              fontSize: '0.80rem'
                            }}
                          />
                          <button
                            onClick={() => handleSolveVerification(q.id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 14px', fontSize: '0.80rem' }}
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Controls Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        marginBottom: 14
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          id={`auto-entry-${q.id}`}
                          checked={q.autoQueueEntry ?? true}
                          onChange={(e) => toggleAutoQueueEntry(q.id, e.target.checked)}
                          style={{ accentColor: 'var(--lavender-electric)', width: 15, height: 15 }}
                        />
                        <label htmlFor={`auto-entry-${q.id}`} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          Auto Queue Entry
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => handleManualCheck(q.id)}
                          className="btn btn-ghost btn-sm"
                          title="Check status now"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <RefreshCw size={12} className={isChecking ? 'spin' : ''} />
                          <span>Check</span>
                        </button>

                        {q.assistantEnabled ? (
                          <button
                            onClick={() => stopAssistantMonitoring(q.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#FDA4AF', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Pause size={12} />
                            <span>Pause</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => startAssistantMonitoring(q.id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Play size={12} />
                            <span>Resume</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Last Check Timestamp */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                      <span>Last check: {q.lastCheckedAt || 'Active'}</span>
                      <span>Rate limit: 5s interval</span>
                    </div>

                    {/* Logs toggle */}
                    <button
                      onClick={() => setExpandedLogId(isLogsOpen ? null : q.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', padding: '4px', fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 14 }}
                    >
                      {isLogsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      <span>{isLogsOpen ? 'Hide Assistant Activity' : 'View Assistant Activity Logs'}</span>
                    </button>

                    {isLogsOpen && (
                      <div
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 10,
                          padding: '10px',
                          maxHeight: 120,
                          overflowY: 'auto',
                          fontSize: '0.74rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-secondary)',
                          marginBottom: 14
                        }}
                      >
                        {q.logs && q.logs.length > 0 ? (
                          q.logs.map((log) => (
                            <div key={log.id} style={{ marginBottom: 3 }}>
                              <span style={{ color: 'var(--text-muted)' }}>[{log.timestamp}]</span>{' '}
                              <span style={{ color: log.level === 'success' ? '#34D399' : log.level === 'warn' ? '#FBBF24' : log.level === 'error' ? '#FDA4AF' : '#A78BFA' }}>
                                {log.message}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div>No logs recorded yet.</div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      {isTurnArrived ? (
                        <button
                          onClick={() => reserveQueueSlot(q.id)}
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '11px', fontSize: '0.92rem', fontWeight: 700 }}
                        >
                          Approve & Confirm Booking Pass
                        </button>
                      ) : q.status === 'monitoring' ? (
                        <button
                          onClick={() => leaveQueue(q.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#FDA4AF', fontSize: '0.82rem', width: '100%' }}
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
                );
              })}
              </div>

              {/* Quick queue another venue row */}
              <div
                style={{
                  marginTop: 20,
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  <Plus size={16} color="#818CF8" />
                  <span>Queue another venue:</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { id: 'exp-craft-1', time: '04:00 PM', name: 'Pottery Workshop' },
                    { id: 'exp-ent-1', time: '07:30 PM', name: 'PVR Director’s Cut' },
                    { id: 'exp-food-2', time: '06:00 PM', name: 'Champa Gali Roastery' }
                  ].map((venue) => (
                    <button
                      key={venue.id}
                      onClick={() => handleJoinSampleQueue(venue.id, venue.time)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      + {venue.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Standby / Zero Active Queues View */
            <div
              className="glass-card"
              style={{
                padding: '28px',
                borderRadius: 20,
                background: 'rgba(14, 21, 38, 0.75)',
                border: '1px solid rgba(99, 102, 241, 0.22)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
              }}
            >
              {/* Top Simulation Spotlight Card */}
              <div
                style={{
                  padding: '20px 24px',
                  borderRadius: 16,
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16
                }}
              >
                <div style={{ maxWidth: 560 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Zap size={16} color="#818CF8" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#C7D2FE' }}>
                      INTERACTIVE LIVE SIMULATION
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                    Test Autonomous Waitlist Progression Live (#37)
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Olive Bar & Kitchen in Mehrauli is currently packed for dinner. Click below to inject a simulated waitlist spot (#37 in line, ~8 mins wait). The assistant will automatically track drop opening conditions, step through positions, prompt for verification if challenged, and chime when your turn arrives!
                  </p>
                </div>

                <button
                  onClick={() => handleJoinSampleQueue('exp-food-1', '07:30 PM')}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', fontSize: '0.92rem' }}
                >
                  <Zap size={16} />
                  <span>Start Live Waitlist (#37)</span>
                </button>
              </div>

              {/* Quick-Join Venues Grid */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  Top High-Demand Waitlist Venues in Delhi NCR
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  {[
                    {
                      id: 'exp-food-1',
                      time: '07:30 PM',
                      name: 'Olive Bar & Kitchen',
                      area: 'Mehrauli',
                      tag: 'Fine Dining • 14 on waitlist',
                      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80'
                    },
                    {
                      id: 'exp-craft-1',
                      time: '04:00 PM',
                      name: 'The Clay Company Pottery',
                      area: 'Hauz Khas',
                      tag: 'Workshop • 9 on waitlist',
                      img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80'
                    },
                    {
                      id: 'exp-ent-1',
                      time: '07:30 PM',
                      name: 'PVR Director’s Cut',
                      area: 'Vasant Kunj',
                      tag: 'Luxury Cinema • 22 on waitlist',
                      img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
                    },
                    {
                      id: 'exp-food-2',
                      time: '06:00 PM',
                      name: 'Champa Gali Roastery',
                      area: 'Saket',
                      tag: 'Artisan Cafe • 8 on waitlist',
                      img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80'
                    }
                  ].map((venue) => (
                    <div
                      key={venue.id}
                      style={{
                        padding: '14px',
                        borderRadius: 14,
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <img
                          src={venue.img}
                          alt={venue.name}
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>{venue.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{venue.area} • {venue.time}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: '0.72rem', color: '#818CF8' }}>{venue.tag}</span>
                        <button
                          onClick={() => handleJoinSampleQueue(venue.id, venue.time)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 12px', fontSize: '0.76rem' }}
                        >
                          Join AI Queue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Core Architectural Guarantees */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 12,
                  paddingTop: 18,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                {[
                  {
                    title: 'Microsecond Drop Sniping',
                    desc: 'Synchronized to server clocks to join the split-second booking opens.',
                    icon: Zap
                  },
                  {
                    title: 'Zero-Surprise Hold',
                    desc: 'Holds spots for 5 mins; NEVER auto-charges payment without approval.',
                    icon: ShieldCheck
                  },
                  {
                    title: 'Anti-Bot & OTP Solver',
                    desc: 'Prompts seamlessly in-app when human verification challenges appear.',
                    icon: Lock
                  },
                  {
                    title: 'Multi-Channel Chimes',
                    desc: 'Instant audio chimes, visual banners & browser alerts on turn arrival.',
                    icon: CheckCircle2
                  }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Icon size={16} color="#818CF8" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#FFFFFF' }}>{item.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. BOOKINGS SECTION */}
        {/* Tabs: Today, Upcoming, Completed, Cancelled */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 26, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 12 }}>
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
              alignItems: 'center',
              borderRadius: 24
            }}
          >
            <Ticket size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>No bookings in this tab</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
              Ready to plan your next outing?
            </p>
            <Link to="/explore" className="btn btn-primary" style={{ marginTop: 20 }}>
              Explore Experiences
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="glass-card"
                style={{
                  padding: '26px 28px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 24,
                  alignItems: 'center',
                  borderRadius: 22
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className={`badge ${b.status === 'confirmed' ? 'badge-emerald' : 'badge-rose'}`}>
                      {b.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                      Code: <strong style={{ color: '#FFFFFF' }}>{b.bookingCode}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 8, letterSpacing: '-0.02em' }}>
                    {b.experienceName}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={15} color="var(--lavender-electric)" />
                      <span>{b.date} • <strong style={{ color: '#fff' }}>{b.timeSlot}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={15} color="var(--cyan-accent)" />
                      <span>{b.venueName} ({b.venueAddress})</span>
                    </div>
                    <div style={{ marginTop: 2 }}>
                      <span>Party: <strong style={{ color: '#fff' }}>{b.numPeople} Guests</strong> • Total Paid: <strong style={{ color: '#34D399' }}>₹{b.totalAmount}</strong></span>
                    </div>
                  </div>
                </div>

                {/* QR Code and Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      background: '#FFFFFF',
                      padding: 10,
                      borderRadius: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <img
                      src={b.qrCodeUrl}
                      alt="Digital Pass QR"
                      style={{ width: 92, height: 92, borderRadius: 6 }}
                    />
                    <span style={{ fontSize: '0.65rem', color: '#111827', fontWeight: 800 }}>TURNSTILE PASS</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 150 }}>
                    <Link to="/day-mode" className="btn btn-primary btn-sm">
                      Open in Day Mode
                    </Link>

                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#FDA4AF', fontSize: '0.82rem' }}
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
