import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Calendar,
  MapPin,
  Ticket,
  Bookmark,
  Heart,
  ShieldCheck,
  Zap,
  Home
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const location = useLocation();
  const { activeDay } = useApp();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop & Tablet Global Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(8, 9, 15, 0.95)',
          padding: '60px 0 30px 0',
          marginTop: 'auto'
        }}
      >
        <div className="container-dayly">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 40,
              marginBottom: 48
            }}
          >
            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'var(--grad-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  <Sparkles size={18} />
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
                  DAYLY
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                The intelligent day-planning & experience-booking platform. Combining dining, culture,
                cinema, workshops, and sports into one seamless day outside.
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 16,
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem'
                }}
              >
                <ShieldCheck size={16} color="var(--emerald-500)" />
                <span>Verified Partners & Instant Booking</span>
              </div>
            </div>

            {/* Quick Explore */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Explore Experiences
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <li><Link to="/explore?category=food" style={{ transition: 'color 0.2s' }}>Fine Dining & Cafes</Link></li>
                <li><Link to="/explore?category=workshops" style={{ transition: 'color 0.2s' }}>Pottery & Art Workshops</Link></li>
                <li><Link to="/explore?category=movies" style={{ transition: 'color 0.2s' }}>Luxury Cinema & Theatres</Link></li>
                <li><Link to="/explore?category=activities" style={{ transition: 'color 0.2s' }}>VR, Escape Rooms & Gaming</Link></li>
                <li><Link to="/explore?category=outdoor" style={{ transition: 'color 0.2s' }}>Nature, Cycling & Heritage Parks</Link></li>
              </ul>
            </div>

            {/* AI Day Planning */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Intelligent Planning
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <li><Link to="/plan">AI Day Builder</Link></li>
                <li><Link to="/day-mode">Real-Time Day Assistant</Link></li>
                <li><Link to="/my-day">Itinerary Timeline & Map</Link></li>
                <li><Link to="/bookings">DAYLY Virtual Queue</Link></li>
                <li><Link to="/wishlist">Saved Experiences</Link></li>
              </ul>
            </div>

            {/* Delhi NCR Coverage */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Delhi NCR Hubs
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 12 }}>
                Currently curating premium experiences across Hauz Khas, Connaught Place, Mehrauli, Saket, Lodhi Art District & Gurgaon CyberHub.
              </p>
              <div className="badge badge-emerald">Live in Delhi NCR</div>
            </div>
          </div>

          <div
            style={{
              paddingTop: 24,
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}
          >
            <div>© {new Date().getFullYear()} DAYLY Technologies Inc. Crafted for unforgettable days out.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Adapter API Docs</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation (320px - 959px) */}
      <nav className="mobile-nav">
        <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link to="/explore" className={`mobile-nav-item ${isActive('/explore') ? 'active' : ''}`}>
          <Compass size={20} />
          <span>Explore</span>
        </Link>
        <Link to="/plan" className={`mobile-nav-item ${isActive('/plan') ? 'active' : ''}`}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginTop: -16,
              boxShadow: '0 4px 14px var(--coral-glow)'
            }}
          >
            <Calendar size={18} />
          </div>
          <span>Plan</span>
        </Link>
        <Link to="/my-day" className={`mobile-nav-item ${isActive('/my-day') ? 'active' : ''}`}>
          <MapPin size={20} />
          <span>My Day</span>
          {activeDay?.items?.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 14,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--coral-500)'
              }}
            />
          )}
        </Link>
        <Link to="/bookings" className={`mobile-nav-item ${isActive('/bookings') ? 'active' : ''}`}>
          <Ticket size={20} />
          <span>Bookings</span>
        </Link>
      </nav>
    </>
  );
};
