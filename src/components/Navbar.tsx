import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Compass,
  MapPin,
  Bookmark,
  Bell,
  Search,
  User,
  Zap,
  Ticket,
  CheckCircle2,
  Clock,
  Car,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SearchModal } from './SearchModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { unreadNotifs, notifications, markNotifRead, markAllNotifsRead, activeDay, queues } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const activeQueuesCount = (queues || []).filter(
    (q) => q.status === 'monitoring' || q.monitoringStatus === 'turn_arrived'
  ).length;

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="header-glass">
        <div className="container-dayly header-inner">
          {/* Logo */}
          <Link to="/" className="brand-logo">
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 60%, #67E8F9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Sparkles size={20} />
            </span>
            <span>DAYLY</span>
            <span className="brand-badge">Spatial Planner</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>
              Home
            </Link>
            <Link to="/explore" className={`nav-link ${isActive('/explore') ? 'nav-link-active' : ''}`}>
              <Compass size={16} />
              Explore
            </Link>
            <Link to="/plan" className={`nav-link ${isActive('/plan') ? 'nav-link-active' : ''}`}>
              <Calendar size={16} />
              Plan Day
            </Link>
            <Link to="/my-day" className={`nav-link ${isActive('/my-day') ? 'nav-link-active' : ''}`}>
              <MapPin size={16} />
              My Day
              {activeDay?.items?.length > 0 && (
                <span
                  style={{
                    background: 'var(--lavender-electric)',
                    color: '#0B1020',
                    borderRadius: '99px',
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    fontWeight: 800,
                    boxShadow: '0 0 10px rgba(167, 139, 250, 0.5)'
                  }}
                >
                  {activeDay.items.length}
                </span>
              )}
            </Link>
            <Link
              to="/queue"
              className={`nav-link ${isActive('/queue') ? 'nav-link-active' : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Bot size={16} color="var(--lavender-electric)" />
              <span>AI Queue</span>
              {activeQueuesCount > 0 ? (
                <span
                  style={{
                    background: '#10B981',
                    color: '#090D16',
                    borderRadius: '99px',
                    fontSize: '0.68rem',
                    padding: '1px 6px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                >
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />
                  {activeQueuesCount}
                </span>
              ) : (
                <span
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#A5B4FC',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    borderRadius: '99px',
                    fontSize: '0.65rem',
                    padding: '1px 6px',
                    fontWeight: 700
                  }}
                >
                  Live
                </span>
              )}
            </Link>
            <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'nav-link-active' : ''}`}>
              <Ticket size={16} />
              Bookings
            </Link>
            <Link to="/wishlist" className={`nav-link ${isActive('/wishlist') ? 'nav-link-active' : ''}`}>
              <Bookmark size={16} />
              Wishlist
            </Link>
            <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'nav-link-active' : ''}`}>
              <User size={16} />
              Profile
            </Link>
          </nav>

          {/* Actions & Live Day Mode Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Quick Search Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="btn btn-secondary btn-sm"
              title="Search experiences (Ctrl+K)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: '99px'
              }}
            >
              <Search size={15} color="var(--text-secondary)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Search</span>
              <kbd
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '2px 6px',
                  borderRadius: 6,
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)'
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Live Day Mode Button */}
            <Link
              to="/day-mode"
              className="btn btn-sm"
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.32)',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.18)',
                backdropFilter: 'blur(12px)',
                borderRadius: '99px'
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981'
                }}
              />
              <Zap size={14} />
              <span>Day Mode</span>
            </Link>

            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="btn btn-secondary btn-sm"
                style={{
                  width: 40,
                  height: 40,
                  padding: 0,
                  borderRadius: '50%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadNotifs > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'var(--lavender-electric)',
                      boxShadow: '0 0 8px var(--lavender-electric)'
                    }}
                  />
                )}
              </button>

              {showNotifs && (
                <div className="notif-dropdown">
                  <div
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--glass-panel-border)',
                      background: 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Notifications</h4>
                      {unreadNotifs > 0 && (
                        <span className="badge badge-violet">{unreadNotifs} New</span>
                      )}
                    </div>
                    {unreadNotifs > 0 && (
                      <button
                        onClick={markAllNotifsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--lavender-electric)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: 30,
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '0.9rem'
                        }}
                      >
                        No notifications right now
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotifRead(n.id)}
                          style={{
                            padding: '14px 18px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            background: n.read ? 'transparent' : 'rgba(167, 139, 250, 0.05)',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <div style={{ marginTop: 2 }}>
                            {n.type === 'queue' && <Clock size={16} color="var(--lavender-electric)" />}
                            {n.type === 'booking' && <CheckCircle2 size={16} color="var(--emerald-live)" />}
                            {n.type === 'traffic' && <Car size={16} color="var(--amber-warm)" />}
                            {n.type === 'itinerary' && <Calendar size={16} color="var(--cyan-accent)" />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 2
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: n.read ? 600 : 700,
                                  fontSize: '0.88rem',
                                  color: n.read ? 'var(--text-secondary)' : '#FFFFFF'
                                }}
                              >
                                {n.title}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {n.timestamp}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              {n.message}
                            </p>
                            {n.actionUrl && (
                              <Link
                                to={n.actionUrl}
                                onClick={() => setShowNotifs(false)}
                                style={{
                                  display: 'inline-block',
                                  marginTop: 6,
                                  fontSize: '0.78rem',
                                  color: 'var(--lavender-electric)',
                                  fontWeight: 600
                                }}
                              >
                                {n.actionText || 'View details'} →
                              </Link>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
};
