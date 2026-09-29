import React, { useState } from 'react';
import {
  X,
  Hourglass,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Users,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { Experience, AvailabilitySlot, QueueEntry } from '../types';
import { useApp } from '../context/AppContext';

interface VirtualQueueModalProps {
  experience: Experience;
  slot: AvailabilitySlot;
  onClose: () => void;
}

export const VirtualQueueModal: React.FC<VirtualQueueModalProps> = ({ experience, slot, onClose }) => {
  const { queues, joinVirtualQueue, reserveQueueSlot, leaveQueue } = useApp();

  const [partySize, setPartySize] = useState<number>(2);
  const [autoBook, setAutoBook] = useState<boolean>(true);

  // Check if user already has an active queue for this slot
  const activeQueue = queues.find(
    (q) => q.experienceId === experience.id && q.slotTime === slot.time
  );

  const handleJoinQueue = () => {
    joinVirtualQueue(experience.id, slot.time, 'Today', partySize, autoBook);
  };

  const handleReserve = async () => {
    if (activeQueue) {
      await reserveQueueSlot(activeQueue.id);
      onClose();
    }
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
                background: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a78bfa'
              }}
            >
              <Hourglass size={18} />
            </div>
            <div>
              <span className="badge badge-violet" style={{ fontSize: '0.68rem', marginBottom: 2 }}>
                DAYLY Virtual Queue
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{experience.name}</h3>
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

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Active Queue State */}
          {activeQueue ? (
            <div style={{ textAlign: 'center' }}>
              {activeQueue.status === 'slot_available' ? (
                /* Slot opened! */
                <div style={{ padding: '16px 0' }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '2px solid #10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      color: '#10b981'
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399', marginBottom: 6 }}>
                    YOUR SLOT IS AVAILABLE!
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                    A cancellation occurred. Your priority window is open until{' '}
                    <strong>{activeQueue.availableUntil || 'next 5 minutes'}</strong>.
                  </p>

                  <div
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      padding: 16,
                      borderRadius: 14,
                      border: '1px solid var(--border-subtle)',
                      marginBottom: 20,
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Slot Time</span>
                      <strong>{activeQueue.slotTime}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Party Size</span>
                      <strong>{activeQueue.partySize} Guests</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleReserve}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
                  >
                    Reserve Now (Zero Waiting)
                  </button>
                </div>
              ) : activeQueue.status === 'booked' ? (
                /* Already Booked */
                <div style={{ padding: '20px 0' }}>
                  <CheckCircle2 size={42} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Auto-Book Completed!</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                    Your ticket was automatically locked and confirmed.
                  </p>
                  <button onClick={onClose} className="btn btn-secondary" style={{ marginTop: 20 }}>
                    Close
                  </button>
                </div>
              ) : (
                /* Still Monitoring */
                <div>
                  {/* Queue Position Card */}
                  <div
                    style={{
                      background: 'linear-gradient(145deg, rgba(139,92,246,0.15) 0%, rgba(10,11,18,0.8) 100%)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      borderRadius: 20,
                      padding: '24px 20px',
                      marginBottom: 20
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      YOUR LIVE QUEUE POSITION
                    </span>
                    <div
                      style={{
                        fontSize: '3.6rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-heading)',
                        color: '#fff',
                        lineHeight: 1.1,
                        margin: '8px 0',
                        textShadow: '0 0 24px var(--purple-glow)'
                      }}
                    >
                      #{activeQueue.currentPosition}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, color: '#a78bfa', fontSize: '0.9rem', fontWeight: 600 }}>
                      <Clock size={16} />
                      <span>Estimated Wait: ~{activeQueue.estimatedWaitMinutes} minutes</span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        width: '100%',
                        height: 8,
                        borderRadius: 99,
                        background: 'rgba(255,255,255,0.08)',
                        marginTop: 18,
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(
                            100,
                            Math.max(
                              12,
                              ((activeQueue.initialPosition - activeQueue.currentPosition + 1) /
                                activeQueue.initialPosition) *
                                100
                            )
                          )}%`,
                          background: 'linear-gradient(90deg, #ff4d6d, #8b5cf6)',
                          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: 20,
                      textAlign: 'left'
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 8px #10b981'
                      }}
                    />
                    <div style={{ flex: 1, fontSize: '0.85rem' }}>
                      <strong style={{ color: '#fff', display: 'block' }}>DAYLY Bot Active & Listening</strong>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Monitoring real-time table turnover and cancel drops.
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => leaveQueue(activeQueue.id)}
                      className="btn btn-ghost"
                      style={{ color: '#fb7185', fontSize: '0.85rem' }}
                    >
                      Leave Waitlist
                    </button>
                    <button onClick={onClose} className="btn btn-primary" style={{ flex: 1 }}>
                      Keep Monitoring in Background
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Join Queue Prompt */
            <div>
              <div
                style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: 14,
                  padding: '16px',
                  marginBottom: 20,
                  display: 'flex',
                  gap: 12
                }}
              >
                <Hourglass size={24} color="#fb7185" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    {slot.time} Slot is Currently Sold Out
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Popular slots often have cancellations 1-2 hours beforehand. Join the DAYLY Virtual Queue
                    and our availability engine will claim a spot the moment one opens.
                  </p>
                </div>
              </div>

              {/* Party size picker */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Party Size
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.max(1, partySize - 1))}
                    className="btn btn-secondary btn-sm"
                    style={{ width: 38, height: 38, padding: 0 }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{partySize} Guests</span>
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.min(10, partySize + 1))}
                    className="btn btn-secondary btn-sm"
                    style={{ width: 38, height: 38, padding: 0 }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Auto-book option */}
              <div
                onClick={() => setAutoBook(!autoBook)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: autoBook ? '1px solid var(--coral-500)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 20
                }}
              >
                <input
                  type="checkbox"
                  checked={autoBook}
                  onChange={(e) => setAutoBook(e.target.checked)}
                  style={{ accentColor: 'var(--coral-500)', width: 18, height: 18 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                    Auto-book when slot frees up (Recommended)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    DAYLY will instantly lock the reservation without requiring manual tap.
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={handleJoinQueue}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
              >
                Join DAYLY Queue (#{slot.waitlistLength || 37} in line)
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  marginTop: 12
                }}
              >
                <ShieldCheck size={14} color="var(--emerald-500)" />
                <span>Simulated adapter waitlist algorithm • Non-intrusive protocol</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
