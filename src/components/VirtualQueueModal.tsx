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
  Bell,
  Bot,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  Key,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Experience, AvailabilitySlot, QueueEntry } from '../types';
import { useApp } from '../context/AppContext';

interface VirtualQueueModalProps {
  experience: Experience;
  slot: AvailabilitySlot;
  onClose: () => void;
}

export const VirtualQueueModal: React.FC<VirtualQueueModalProps> = ({ experience, slot, onClose }) => {
  const {
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

  const [partySize, setPartySize] = useState<number>(2);
  const [autoQueueEntry, setAutoQueueEntry] = useState<boolean>(true);
  const [assistantEnabled, setAssistantEnabled] = useState<boolean>(true);
  const [scheduledOpeningTime, setScheduledOpeningTime] = useState<string>('');
  const [showOpeningScheduler, setShowOpeningScheduler] = useState<boolean>(false);
  const [verificationInput, setVerificationInput] = useState<string>('');
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Check if user already has an active queue for this slot
  const activeQueue = queues.find(
    (q) => q.experienceId === experience.id && q.slotTime === slot.time
  );

  const handleJoinQueue = () => {
    joinVirtualQueue(
      experience.id,
      slot.time,
      'Today',
      partySize,
      false, // Never auto-finalize paid bookings without explicit approval!
      {
        assistantEnabled,
        autoQueueEntry,
        openingTime: showOpeningScheduler && scheduledOpeningTime ? scheduledOpeningTime : undefined,
        timeZone: 'Asia/Kolkata'
      }
    );
  };

  const handleManualCheck = async () => {
    if (!activeQueue) return;
    setIsChecking(true);
    await triggerManualCheck(activeQueue.id);
    setTimeout(() => setIsChecking(false), 500);
  };

  const handleSolveVerification = () => {
    if (!activeQueue || !verificationInput) return;
    solveManualVerification(activeQueue.id, verificationInput);
    setVerificationInput('');
  };

  const handleReserve = async () => {
    if (activeQueue) {
      await reserveQueueSlot(activeQueue.id);
      onClose();
    }
  };

  const isTurnArrived = activeQueue?.status === 'slot_available' || activeQueue?.monitoringStatus === 'turn_arrived';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
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
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.25), rgba(103, 232, 249, 0.25))',
                border: '1px solid rgba(167, 139, 250, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--lavender-electric)'
              }}
            >
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="badge badge-violet" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  AI Queue Assistant
                </span>
                {activeQueue?.assistantEnabled && (
                  <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    ● 24/7 Monitoring
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 2 }}>{experience.name}</h3>
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
            <div>
              {/* Turn Arrived Screen with explicit user confirmation requirement */}
              {isTurnArrived ? (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '2px solid #10B981',
                      boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      color: '#34D399'
                    }}
                  >
                    <CheckCircle2 size={38} />
                  </div>
                  <h4 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#34D399', marginBottom: 6 }}>
                    YOUR TURN HAS ARRIVED!
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 18 }}>
                    The assistant held your spot. Priority hold is reserved until{' '}
                    <strong style={{ color: '#FFFFFF' }}>{activeQueue.availableUntil || 'next 10 minutes'}</strong>.
                  </p>

                  {/* Summary Card before user approval */}
                  <div
                    style={{
                      background: 'rgba(11, 16, 32, 0.75)',
                      padding: 16,
                      borderRadius: 16,
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      marginBottom: 20,
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Slot Time</span>
                      <strong style={{ color: '#fff' }}>{activeQueue.slotTime} ({activeQueue.slotDate})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Party Size</span>
                      <strong style={{ color: '#fff' }}>{activeQueue.partySize} Guests</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Total To Pay</span>
                      <strong style={{ color: '#34D399', fontSize: '1.05rem' }}>
                        ₹{(slot.price || experience.pricePerPerson) * activeQueue.partySize}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => leaveQueue(activeQueue.id)}
                      className="btn btn-ghost"
                      style={{ color: '#FDA4AF', fontSize: '0.85rem' }}
                    >
                      Decline
                    </button>
                    <button
                      onClick={handleReserve}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '13px', fontSize: '1rem' }}
                    >
                      Approve & Confirm Booking
                    </button>
                  </div>
                </div>
              ) : activeQueue.status === 'booked' ? (
                /* Already Booked */
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <CheckCircle2 size={42} color="#34D399" style={{ margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Booking Confirmed!</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                    Your ticket was officially confirmed. View your turnstile pass in Bookings.
                  </p>
                  <button onClick={onClose} className="btn btn-secondary" style={{ marginTop: 20 }}>
                    Close
                  </button>
                </div>
              ) : (
                /* Still In Queue or Monitoring Opening */
                <div>
                  {/* Manual Verification Challenge Alert if triggered */}
                  {activeQueue.requiresManualVerification && (
                    <div
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        borderRadius: 16,
                        padding: '16px',
                        marginBottom: 18
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FBBF24', marginBottom: 6 }}>
                        <Lock size={18} />
                        <strong style={{ fontSize: '0.92rem' }}>Manual Human Verification Required</strong>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                        The booking site presented a verification challenge ({activeQueue.verificationChallenge?.type || 'CAPTCHA / OTP'}).
                        Please enter the verification code below to let the assistant proceed.
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          placeholder="Enter OTP / Captcha solution"
                          value={verificationInput}
                          onChange={(e) => setVerificationInput(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#fff',
                            fontSize: '0.85rem'
                          }}
                        />
                        <button onClick={handleSolveVerification} className="btn btn-primary btn-sm">
                          Submit
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Top Status & Controls Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.03)',
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.08)',
                      marginBottom: 16
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: activeQueue.assistantEnabled ? '#10B981' : '#F59E0B',
                          boxShadow: activeQueue.assistantEnabled ? '0 0 8px #10B981' : 'none'
                        }}
                      />
                      <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
                        Status: <strong style={{ color: '#FFFFFF' }}>
                          {activeQueue.monitoringStatus === 'monitoring_opening'
                            ? 'Monitoring Opening Drop'
                            : activeQueue.monitoringStatus === 'in_queue'
                            ? `In Queue (#${activeQueue.currentPosition})`
                            : activeQueue.monitoringStatus?.toUpperCase()}
                        </strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={handleManualCheck}
                        title="Check status now"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <RefreshCw size={12} className={isChecking ? 'spin' : ''} />
                        <span>Check</span>
                      </button>

                      {activeQueue.assistantEnabled ? (
                        <button
                          onClick={() => stopAssistantMonitoring(activeQueue.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#FDA4AF', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Pause size={12} />
                          <span>Stop</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => startAssistantMonitoring(activeQueue.id)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Play size={12} />
                          <span>Resume</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Live Position & Progress Display */}
                  <div
                    style={{
                      background: 'linear-gradient(145deg, rgba(33, 21, 56, 0.85) 0%, rgba(17, 26, 46, 0.8) 100%)',
                      border: '1px solid rgba(167, 139, 250, 0.35)',
                      borderRadius: 20,
                      padding: '22px 18px',
                      marginBottom: 18,
                      textAlign: 'center',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
                    }}
                  >
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                      {activeQueue.monitoringStatus === 'monitoring_opening' ? 'SCHEDULED DROP' : 'LIVE QUEUE POSITION'}
                    </span>
                    <div
                      style={{
                        fontSize: '3.4rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-heading)',
                        color: '#FFFFFF',
                        lineHeight: 1.1,
                        margin: '6px 0'
                      }}
                    >
                      {activeQueue.monitoringStatus === 'monitoring_opening'
                        ? activeQueue.openingTime || 'Opening'
                        : `#${activeQueue.currentPosition}`}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, color: 'var(--lavender-electric)', fontSize: '0.86rem', fontWeight: 600 }}>
                      <Clock size={15} />
                      <span>
                        {activeQueue.monitoringStatus === 'monitoring_opening'
                          ? 'Auto-queue entry armed'
                          : `Estimated Wait: ~${activeQueue.estimatedWaitMinutes} mins`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {activeQueue.monitoringStatus === 'in_queue' && (
                      <div
                        style={{
                          width: '100%',
                          height: 7,
                          borderRadius: 99,
                          background: 'rgba(255,255,255,0.08)',
                          marginTop: 16,
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
                            background: 'linear-gradient(90deg, #67E8F9, #A78BFA, #F0ABFC)',
                            transition: 'width 0.8s ease'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Auto Queue Entry Switch */}
                  <div
                    onClick={() => toggleAutoQueueEntry(activeQueue.id, !activeQueue.autoQueueEntry)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      marginBottom: 14,
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>Auto Queue Entry</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Instantly joins queue as soon as bookings open.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={activeQueue.autoQueueEntry ?? true}
                      onChange={(e) => toggleAutoQueueEntry(activeQueue.id, e.target.checked)}
                      style={{ accentColor: 'var(--lavender-electric)', width: 16, height: 16 }}
                    />
                  </div>

                  {/* Last Checked Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                    <span>Last check: {activeQueue.lastCheckedAt || 'Just now'}</span>
                    <span>Interval: {activeQueue.checkIntervalSeconds || 5}s</span>
                  </div>

                  {/* Toggle Activity Logs */}
                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}
                  >
                    {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    <span>{showLogs ? 'Hide Assistant Logs' : 'View Assistant Logs'}</span>
                  </button>

                  {showLogs && (
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12,
                        padding: '12px',
                        maxHeight: 140,
                        overflowY: 'auto',
                        fontSize: '0.76rem',
                        fontFamily: 'monospace',
                        color: 'var(--text-secondary)',
                        marginBottom: 16
                      }}
                    >
                      {activeQueue.logs && activeQueue.logs.length > 0 ? (
                        activeQueue.logs.map((log) => (
                          <div key={log.id} style={{ marginBottom: 4 }}>
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

                  {/* Modal Action Buttons */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => leaveQueue(activeQueue.id)}
                      className="btn btn-ghost"
                      style={{ color: '#FDA4AF', fontSize: '0.85rem' }}
                    >
                      Leave Waitlist
                    </button>
                    <button onClick={onClose} className="btn btn-primary" style={{ flex: 1 }}>
                      Keep Running in Background
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Setup AI Booking Assistant Screen */
            <div>
              <div
                style={{
                  background: 'rgba(167, 139, 250, 0.10)',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  borderRadius: 16,
                  padding: '16px',
                  marginBottom: 20,
                  display: 'flex',
                  gap: 12
                }}
              >
                <Bot size={24} color="var(--lavender-electric)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Automated Booking Queue Assistant
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                    The assistant continuously monitors official opening transitions, joins the queue immediately upon drop, tracks position, and alerts you the moment your turn arrives.
                  </p>
                </div>
              </div>

              {/* Party size picker */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Party Size
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.max(1, partySize - 1))}
                    className="btn btn-secondary btn-sm"
                    style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>{partySize} Guests</span>
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.min(10, partySize + 1))}
                    className="btn btn-secondary btn-sm"
                    style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Auto Queue Entry Toggle */}
              <div
                onClick={() => setAutoQueueEntry(!autoQueueEntry)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: autoQueueEntry ? '1px solid var(--lavender-electric)' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 14
                }}
              >
                <input
                  type="checkbox"
                  checked={autoQueueEntry}
                  onChange={(e) => setAutoQueueEntry(e.target.checked)}
                  style={{ accentColor: 'var(--lavender-electric)', width: 16, height: 16 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FFFFFF' }}>
                    Auto-Join Queue as soon as bookings open
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Claims priority spot with your configured profile details.
                  </div>
                </div>
              </div>

              {/* Scheduled opening time option */}
              <div style={{ marginBottom: 20 }}>
                <div
                  onClick={() => setShowOpeningScheduler(!showOpeningScheduler)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    color: 'var(--lavender-electric)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    marginBottom: 6
                  }}
                >
                  <span>Schedule specific drop / opening time?</span>
                  <span>{showOpeningScheduler ? '▲' : '▼'}</span>
                </div>

                {showOpeningScheduler && (
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM, 12:30 PM (Asia/Kolkata)"
                      value={scheduledOpeningTime}
                      onChange={(e) => setScheduledOpeningTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                      Assistant will standby and initiate detection at the scheduled drop.
                    </span>
                  </div>
                )}
              </div>

              {/* Start Assistant Button */}
              <button
                onClick={handleJoinQueue}
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Bot size={18} />
                <span>Start AI Queue Assistant (#{slot.waitlistLength || 37} in line)</span>
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  color: 'var(--text-muted)',
                  fontSize: '0.74rem',
                  marginTop: 12
                }}
              >
                <ShieldCheck size={14} color="#34D399" />
                <span>Non-intrusive protocol • Strict approval before payment</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
