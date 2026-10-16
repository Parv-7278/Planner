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
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, rgba(11, 16, 32, 0.7) 0%, rgba(7, 10, 20, 0.95) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: '70px 0 36px 0',
          marginTop: 'auto',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative aurora glow line at top of footer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            right: '20%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.4), rgba(103, 232, 249, 0.4), transparent)'
          }}
        />

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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'var(--grad-spatial)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Sparkles size={18} />
                </span>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }} className="text-shimmer">
                  DAYLY
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, maxWidth: 320 }}>
                The intelligent day-planning & experience-booking platform. Combining fine dining, culture,
                cinema, workshops, and sports into one seamless spatial day outside.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 18,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem'
                }}
              >
                <ShieldCheck size={16} color="var(--cyan-400)" />
                <span>Verified Partners & Instant Booking</span>
              </div>
            </div>

            {/* Quick Explore */}
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavender-300)' }}>
                Explore Experiences
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <li><Link to="/explore?category=food" style={{ transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6 }} className="hover-lavender">Fine Dining & Cafes</Link></li>
                <li><Link to="/explore?category=workshops" style={{ transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6 }} className="hover-lavender">Pottery & Art Workshops</Link></li>
                <li><Link to="/explore?category=movies" style={{ transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6 }} className="hover-lavender">Luxury Cinema & Theatres</Link></li>
                <li><Link to="/explore?category=activities" style={{ transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6 }} className="hover-lavender">VR, Escape Rooms & Gaming</Link></li>
                <li><Link to="/explore?category=outdoor" style={{ transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6 }} className="hover-lavender">Nature, Cycling & Heritage Parks</Link></li>
              </ul>
            </div>

            {/* AI Day Planning */}
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavender-300)' }}>
                Intelligent Planning
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <li><Link to="/plan" className="hover-lavender">AI Day Builder</Link></li>
                <li><Link to="/day-mode" className="hover-lavender">Real-Time Day Assistant</Link></li>
                <li><Link to="/my-day" className="hover-lavender">Itinerary Timeline & Map</Link></li>
                <li><Link to="/bookings" className="hover-lavender">DAYLY Virtual Queue</Link></li>
                <li><Link to="/wishlist" className="hover-lavender">Saved Experiences</Link></li>
              </ul>
            </div>

            {/* Delhi NCR Coverage */}
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavender-300)' }}>
                Delhi NCR Hubs
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16 }}>
                Curating spatial day experiences across Hauz Khas, Connaught Place, Mehrauli, Saket, Lodhi Art District & CyberHub.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(103, 232, 249, 0.1)',
                  border: '1px solid rgba(103, 232, 249, 0.25)',
                  color: 'var(--cyan-300)',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan-400)', boxShadow: '0 0 8px var(--cyan-400)' }} />
                Live in Delhi NCR
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: 28,
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              fontSize: '0.82rem',
              color: 'var(--text-muted)'
            }}
          >
            <div>© {new Date().getFullYear()} DAYLY Technologies Inc. Crafted for unforgettable days out.</div>
            <div style={{ display: 'flex', gap: 24 }}>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover-lavender">Privacy Policy</span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover-lavender">Terms of Service</span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover-lavender">Adapter API Docs</span>
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
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--grad-spatial)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginTop: -18,
              boxShadow: '0 4px 18px rgba(139, 92, 246, 0.45)',
              border: '2px solid rgba(255, 255, 255, 0.25)'
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
                top: 3,
                right: 14,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--lavender-400)',
                boxShadow: '0 0 6px var(--lavender-400)'
              }}
            />
          )}
        </Link>
        <Link to="/queue" className={`mobile-nav-item ${isActive('/queue') ? 'active' : ''}`}>
          <Bot size={20} />
          <span>AI Queue</span>
          {queues?.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 14,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 6px #10B981'
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
