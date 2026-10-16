import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  MapPin,
  Lock,
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Plus,
  RefreshCw,
  Pause,
  Play
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookingManager } from '../services/bookingAdapters';
import { Bot } from '../components/icons';

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
          <span className="badge badge-cyan" style={{ marginBottom: 6 }}>
            Admissions & Waitlists
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', fontWeight: 800 }}>
            Passes & Booking Queues
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 4 }}>
            Digital turnstile passes and autonomous waitlist queue progression.
          </p>
        </div>

        {/* 1. DAYLY AI QUEUE ASSISTANT CONTROL CENTER */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: '#181E29',
                  border: '1px solid #283142',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)'
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                    Booking Queue Assistant {queues.length > 0 ? `(${queues.length} Active)` : ''}
                  </h3>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'var(--emerald-subtle)',
                      color: '#34D399',
                      border: '1px solid var(--emerald-border)'
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                    24/7 Engine
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Drop opening detection, automated queue entry & turn arrival holds
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => handleJoinSampleQueue('exp-food-1', '07:30 PM')}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Zap size={13} />
                <span>Simulate Waitlist (#37)</span>
              </button>
            </div>
          </div>

          {queues.length > 0 ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {queues.map((q) => {
                const isChecking = checkingIds[q.id];
                const isTurnArrived = q.status === 'slot_available' || q.monitoringStatus === 'turn_arrived';
                const isOpening = q.monitoringStatus === 'monitoring_opening';
                const isLogsOpen = expandedLogId === q.id;

                return (
                  <div
                    key={q.id}
                    style={{
                      padding: '20px',
                      borderRadius: '10px',
                      background: '#131720',
                      border: isTurnArrived
                        ? '1px solid rgba(16, 185, 129, 0.60)'
                        : q.requiresManualVerification
                        ? '1px solid rgba(245, 158, 11, 0.60)'
                        : '1px solid #232A38',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {isTurnArrived ? (
                            <span className="badge badge-emerald">TURN ARRIVED! APPROVE TO BOOK</span>
                          ) : q.status === 'booked' ? (
                            <span className="badge badge-emerald">BOOKED & CONFIRMED</span>
                          ) : isOpening ? (
                            <span className="badge badge-cyan">MONITORING OPENING DROP</span>
                          ) : q.requiresManualVerification ? (
                            <span className="badge badge-amber">CHALLENGE REQUIRED</span>
                          ) : (
                            <span className="badge badge-violet">IN QUEUE</span>
                          )}

                          {q.assistantEnabled && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.68rem',
                                color: '#34D399',
                                fontWeight: 700
                              }}
                            >
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                              Assistant Active
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '1.12rem', fontWeight: 700, marginTop: 6, color: '#FFFFFF' }}>{q.experienceName}</h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {q.slotDate} • {q.slotTime} ({q.partySize} Guests)
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isOpening ? 'DROP' : 'POSITION'}
                        </span>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand-primary)' }}>
                          {isOpening ? (q.openingTime || 'Soon') : q.currentPosition > 0 ? `#${q.currentPosition}` : '✓'}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar (if in queue) */}
                    {q.status === 'monitoring' && !isOpening && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                          <span>Progression in line</span>
                          <span style={{ color: '#F3F4F6' }}>~{q.estimatedWaitMinutes} mins remaining</span>
                        </div>
                        <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#0E1218', overflow: 'hidden' }}>
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
                              background: 'var(--brand-primary)',
                              borderRadius: 2
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Manual Verification Challenge Prompt */}
                    {q.requiresManualVerification && (
                      <div
                        style={{
                          background: 'var(--amber-subtle)',
                          border: '1px solid var(--amber-border)',
                          borderRadius: 8,
                          padding: '10px 12px',
                          marginBottom: 12
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#FBBF24', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                          <Lock size={14} />
                          <span>Human Verification Challenge</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                          Enter solution to resume automated progression.
                        </p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            type="text"
                            placeholder="Enter solution"
                            value={verificationInputs[q.id] || ''}
                            onChange={(e) =>
                              setVerificationInputs({ ...verificationInputs, [q.id]: e.target.value })
                            }
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: 6,
                              background: '#0E1218',
                              border: '1px solid var(--border-default)',
                              color: '#fff',
                              fontSize: '0.78rem'
                            }}
                          />
                          <button
                            onClick={() => handleSolveVerification(q.id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 12px', fontSize: '0.76rem' }}
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
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: '#0E1218',
                        border: '1px solid #1E2532',
                        marginBottom: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="checkbox"
                          id={`auto-entry-${q.id}`}
                          checked={q.autoQueueEntry ?? true}
                          onChange={(e) => toggleAutoQueueEntry(q.id, e.target.checked)}
                          style={{ accentColor: 'var(--brand-primary)', width: 14, height: 14 }}
                        />
                        <label htmlFor={`auto-entry-${q.id}`} style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          Auto Queue Entry
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => handleManualCheck(q.id)}
                          className="btn btn-ghost btn-sm"
                          title="Check status now"
                          style={{ padding: '3px 6px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 3 }}
                        >
                          <RefreshCw size={11} className={isChecking ? 'spin' : ''} />
                          <span>Check</span>
                        </button>

                        {q.assistantEnabled ? (
                          <button
                            onClick={() => stopAssistantMonitoring(q.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '3px 6px', fontSize: '0.72rem', color: '#F87171', display: 'flex', alignItems: 'center', gap: 3 }}
                          >
                            <Pause size={11} />
                            <span>Pause</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => startAssistantMonitoring(q.id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 6px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 3 }}
                          >
                            <Play size={11} />
                            <span>Resume</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Last Check Timestamp */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                      <span>Checked: {q.lastCheckedAt || 'Active'}</span>
                      <span>Rate limit: 5s</span>
                    </div>

                    {/* Logs toggle */}
                    <button
                      onClick={() => setExpandedLogId(isLogsOpen ? null : q.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', padding: '4px', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 12 }}
                    >
                      {isLogsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      <span>{isLogsOpen ? 'Hide Assistant Logs' : 'View Activity Logs'}</span>
                    </button>

                    {isLogsOpen && (
                      <div
                        style={{
                          background: '#090B0E',
                          border: '1px solid #1E2532',
                          borderRadius: 6,
                          padding: '8px 10px',
                          maxHeight: 110,
                          overflowY: 'auto',
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-secondary)',
                          marginBottom: 12
                        }}
                      >
                        {q.logs && q.logs.length > 0 ? (
                          q.logs.map((log) => (
                            <div key={log.id} style={{ marginBottom: 2 }}>
                              <span style={{ color: 'var(--text-muted)' }}>[{log.timestamp}]</span>{' '}
                              <span style={{ color: log.level === 'success' ? '#34D399' : log.level === 'warn' ? '#FBBF24' : log.level === 'error' ? '#F87171' : 'var(--brand-primary)' }}>
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
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isTurnArrived ? (
                        <button
                          onClick={() => reserveQueueSlot(q.id)}
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '10px', fontSize: '0.88rem', fontWeight: 700 }}
                        >
                          Approve & Issue Booking Pass
                        </button>
                      ) : q.status === 'monitoring' ? (
                        <button
                          onClick={() => leaveQueue(q.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#F87171', fontSize: '0.78rem', width: '100%' }}
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
                  marginTop: 18,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: '#131720',
                  border: '1px solid #232A38',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
                  <Plus size={14} color="var(--brand-primary)" />
                  <span>Queue another venue:</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { id: 'exp-craft-1', time: '04:00 PM', name: 'Pottery Studio' },
                    { id: 'exp-ent-1', time: '07:30 PM', name: 'PVR Director’s Cut' },
                    { id: 'exp-food-2', time: '06:00 PM', name: 'Champa Gali Roastery' }
                  ].map((venue) => (
                    <button
                      key={venue.id}
                      onClick={() => handleJoinSampleQueue(venue.id, venue.time)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.76rem', padding: '5px 10px' }}
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
              style={{
                padding: '24px',
                borderRadius: '10px',
                background: '#131720',
                border: '1px solid #232A38',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Top Simulation Spotlight Card */}
              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: '8px',
                  background: '#0E1218',
                  border: '1px solid #1E2532',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 14
                }}
              >
                <div style={{ maxWidth: 540 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Zap size={14} color="var(--brand-primary)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
                      Interactive Waitlist Demo
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.08rem', fontWeight: 700, margin: '0 0 4px 0', color: '#FFFFFF' }}>
                    Test Autonomous Waitlist Progression Live (#37)
                  </h4>
                  <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Olive Bar & Kitchen in Mehrauli is currently packed for dinner. Inject a live simulated waitlist spot (#37 in line, ~8 mins wait). The assistant monitors drop conditions, steps through line positions, and alerts when your turn arrives.
                  </p>
                </div>

                <button
                  onClick={() => handleJoinSampleQueue('exp-food-1', '07:30 PM')}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: '0.88rem' }}
                >
                  <Zap size={14} />
                  <span>Start Live Waitlist (#37)</span>
                </button>
              </div>

              {/* Quick-Join Venues Grid */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Popular Waitlist Spots in Delhi NCR
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
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
                        padding: '12px',
                        borderRadius: '8px',
                        background: '#0E1218',
                        border: '1px solid #1E2532',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 10
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <img
                          src={venue.img}
                          alt={venue.name}
                          style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>{venue.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{venue.area} • {venue.time}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                        <span style={{ fontSize: '0.70rem', color: 'var(--brand-primary)', fontWeight: 600 }}>{venue.tag}</span>
                        <button
                          onClick={() => handleJoinSampleQueue(venue.id, venue.time)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                        >
                          Join Queue
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: 12,
                  paddingTop: 16,
                  borderTop: '1px solid #1E2532'
                }}
              >
                {[
                  {
                    title: 'Precision Drop Sniping',
                    desc: 'Synchronized to venue servers to join the instant booking opens.',
                    icon: Zap
                  },
                  {
                    title: 'Approval Protection',
                    desc: 'Holds spots for 5 mins; never charges payment without explicit consent.',
                    icon: ShieldCheck
                  },
                  {
                    title: 'Challenge Solving',
                    desc: 'In-app OTP and verification solver when challenges appear.',
                    icon: Lock
                  },
                  {
                    title: 'Turn Notifications',
                    desc: 'Browser push alerts and auditory chime when your turn is minutes away.',
                    icon: CheckCircle2
                  }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Icon size={14} color="var(--brand-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>{item.title}</div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. BOOKINGS SECTION */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid #1E2532', paddingBottom: 10 }}>
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
            style={{
              padding: '48px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '10px',
              background: '#131720',
              border: '1px solid #232A38'
            }}
          >
            <Ticket size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: '1.18rem', fontWeight: 700 }}>No bookings in this tab</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
              Ready to plan your next outing?
            </p>
            <Link to="/explore" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
              Explore Experiences
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: '20px 24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 20,
                  alignItems: 'center',
                  borderRadius: '10px',
                  background: '#131720',
                  border: '1px solid #232A38'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className={`badge ${b.status === 'confirmed' ? 'badge-emerald' : 'badge-rose'}`}>
                      {b.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Code: <strong style={{ color: '#FFFFFF' }}>{b.bookingCode}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 6, letterSpacing: '-0.02em' }}>
                    {b.experienceName}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="var(--brand-primary)" />
                      <span>{b.date} • <strong style={{ color: '#fff' }}>{b.timeSlot}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} color="#60A5FA" />
                      <span>{b.venueName} ({b.venueAddress})</span>
                    </div>
                    <div style={{ marginTop: 2 }}>
                      <span>Party: <strong style={{ color: '#fff' }}>{b.numPeople} Guests</strong> • Total Paid: <strong style={{ color: '#34D399' }}>₹{b.totalAmount}</strong></span>
                    </div>
                  </div>
                </div>

                {/* QR Code and Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      background: '#FFFFFF',
                      padding: 8,
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <img
                      src={b.qrCodeUrl}
                      alt="Digital Pass QR"
                      style={{ width: 84, height: 84, borderRadius: 4 }}
                    />
                    <span style={{ fontSize: '0.62rem', color: '#111827', fontWeight: 800 }}>TURNSTILE PASS</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                    <Link to="/day-mode" className="btn btn-primary btn-sm">
                      Open in Day Mode
                    </Link>

                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#F87171', fontSize: '0.78rem' }}
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
