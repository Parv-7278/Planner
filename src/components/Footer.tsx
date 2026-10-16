import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Calendar,
  MapPin,
  Ticket,
  Home
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Bot } from './icons';

export const Footer: React.FC = () => {
  const location = useLocation();
  const { activeDay, queues } = useApp();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop & Tablet Global Footer */}
      <footer
        style={{
          borderTop: '1px solid #1E2532',
          background: '#090B0E',
          padding: '60px 0 32px 0',
          marginTop: 'auto'
        }}
      >
        <div className="container-dayly">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 36,
              marginBottom: 44
            }}
          >
            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '6px',
                    background: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '0.95rem'
                  }}
                >
                  D
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  DAYLY
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6, maxWidth: 300, marginBottom: 14 }}>
                Curating multi-stop city itineraries with realistic transit pacing and automated waitlist queue entry for high-demand spots.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: '#121620',
                  border: '1px solid #232A38',
                  color: 'var(--text-secondary)',
                  fontSize: '0.74rem'
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
                <span>Active in Delhi NCR</span>
              </div>
            </div>

            {/* Quick Explore */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF' }}>
                Curated Disciplines
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li><Link to="/explore?category=food" className="hover-lavender">Fine Dining & Roasteries</Link></li>
                <li><Link to="/explore?category=workshops" className="hover-lavender">Pottery & Handcraft</Link></li>
                <li><Link to="/explore?category=movies" className="hover-lavender">Director's Cut Theatres</Link></li>
                <li><Link to="/explore?category=activities" className="hover-lavender">Karting, VR & Gaming</Link></li>
                <li><Link to="/explore?category=culture" className="hover-lavender">Heritage Walks & Galleries</Link></li>
              </ul>
            </div>

            {/* Itinerary & Automation */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF' }}>
                Planning & Queues
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li><Link to="/plan" className="hover-lavender">Itinerary Builder</Link></li>
                <li><Link to="/queue" className="hover-lavender">Booking Queue Assistant</Link></li>
                <li><Link to="/day-mode" className="hover-lavender">Live Turnstile & Day Mode</Link></li>
                <li><Link to="/my-day" className="hover-lavender">Interactive Timeline</Link></li>
                <li><Link to="/wishlist" className="hover-lavender">Saved Venues</Link></li>
              </ul>
            </div>

            {/* Coverage Hubs */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF' }}>
                Coverage Zones
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: 12 }}>
                Real-time booking and queue coverage across Hauz Khas Village, Connaught Place, Mehrauli, Saket, Lodhi Art District & CyberHub.
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                More metropolitan zones opening soon.
              </span>
            </div>
          </div>

          <div
            style={{
              paddingTop: 24,
              borderTop: '1px solid #1E2532',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}
          >
            <div>© {new Date().getFullYear()} DAYLY Technologies. Crafted for intentional days out.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link to="/explore" className="hover-lavender">Explore</Link>
              <Link to="/plan" className="hover-lavender">Plan</Link>
              <Link to="/queue" className="hover-lavender">Queue Bot</Link>
              <Link to="/bookings" className="hover-lavender">Bookings</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation (320px - 959px) */}
      <nav className="mobile-nav">
        <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
          <Home size={18} />
          <span>Home</span>
        </Link>
        <Link to="/explore" className={`mobile-nav-item ${isActive('/explore') ? 'active' : ''}`}>
          <Compass size={18} />
          <span>Explore</span>
        </Link>
        <Link to="/plan" className={`mobile-nav-item ${isActive('/plan') ? 'active' : ''}`}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              background: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginTop: -12,
              boxShadow: '0 2px 8px rgba(242, 95, 58, 0.4)'
            }}
          >
            <Calendar size={16} />
          </div>
          <span>Plan</span>
        </Link>
        <Link to="/my-day" className={`mobile-nav-item ${isActive('/my-day') ? 'active' : ''}`}>
          <MapPin size={18} />
          <span>My Day</span>
          {activeDay?.items?.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 14,
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--brand-primary)'
              }}
            />
          )}
        </Link>
        <Link to="/queue" className={`mobile-nav-item ${isActive('/queue') ? 'active' : ''}`}>
          <Bot size={18} />
          <span>Queue</span>
          {queues?.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 14,
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#10B981'
              }}
            />
          )}
        </Link>
        <Link to="/bookings" className={`mobile-nav-item ${isActive('/bookings') ? 'active' : ''}`}>
          <Ticket size={18} />
          <span>Passes</span>
        </Link>
      </nav>
    </>
  );
};
