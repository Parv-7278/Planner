import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Settings,
  Heart,
  Ticket,
  Calendar,
  Sparkles,
  MapPin,
  Check,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExperienceCategory } from '../types';

export const ProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile, bookings, wishlistIds, activeDay } = useApp();

  const [name, setName] = useState(userProfile.name);
  const [city, setCity] = useState(userProfile.preferredCity);
  const [dietary, setDietary] = useState(userProfile.dietaryPreference);
  const [budgetTier, setBudgetTier] = useState(userProfile.budgetTier);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const allCategories: { id: ExperienceCategory; label: string }[] = [
    { id: 'food', label: 'Food & Dining' },
    { id: 'movies', label: 'Cinema & Theatres' },
    { id: 'workshops', label: 'Workshops & Craft' },
    { id: 'activities', label: 'VR & Escape Rooms' },
    { id: 'culture', label: 'Museums & Art' },
    { id: 'outdoor', label: 'Nature & Parks' },
    { id: 'nightlife', label: 'Nightlife & Jazz' },
    { id: 'dates', label: 'Romantic Dates' }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      preferredCity: city,
      dietaryPreference: dietary,
      budgetTier: budgetTier as any
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container-dayly" style={{ maxWidth: 860 }}>
        {/* User Card */}
        <div
          className="glass-panel"
          style={{
            padding: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 32,
            borderRadius: 24
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              style={{
                width: 82,
                height: 82,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(255, 255, 255, 0.20)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 900 }}>{userProfile.name}</h1>
                <span className="badge badge-emerald">Verified Explorer</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{userProfile.email}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 4 }}>
                <MapPin size={13} color="var(--lavender-electric)" />
                <span>Base: {userProfile.preferredCity}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/my-day" className="btn btn-primary btn-sm">
              Today's Itinerary
            </Link>
          </div>
        </div>

        {/* Lifetime Activity Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            marginBottom: 32
          }}
        >
          <div className="glass-card" style={{ padding: '20px 22px', borderRadius: 20 }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>TOTAL BOOKINGS</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#FFFFFF', marginTop: 4 }}>{bookings.length}</div>
          </div>
          <div className="glass-card" style={{ padding: '20px 22px', borderRadius: 20 }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>SAVED PLACES</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--lavender-electric)', marginTop: 4 }}>
              {wishlistIds.length}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '20px 22px', borderRadius: 20 }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>PLANNED DAYS</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--cyan-accent)', marginTop: 4 }}>3</div>
          </div>
          <div className="glass-card" style={{ padding: '20px 22px', borderRadius: 20 }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>MEMBER TIER</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#34D399', marginTop: 4 }}>DAYLY VIP</div>
          </div>
        </div>

        {/* Personalization Preferences Form */}
        <form onSubmit={handleSave} className="glass-panel" style={{ padding: '36px', borderRadius: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Personalization Engine</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
                DAYLY fine-tunes AI day recommendations around your palate, distance limits, and budget.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Preferred Metro Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Dietary Preference
              </label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="input-field"
              >
                <option value="Vegetarian friendly" style={{ background: '#111A2E' }}>Vegetarian friendly</option>
                <option value="Strict vegetarian" style={{ background: '#111A2E' }}>Strict vegetarian</option>
                <option value="Vegan" style={{ background: '#111A2E' }}>Vegan</option>
                <option value="Halal" style={{ background: '#111A2E' }}>Halal</option>
                <option value="Jain friendly" style={{ background: '#111A2E' }}>Jain friendly</option>
                <option value="Omnivore / All" style={{ background: '#111A2E' }}>No restrictions</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Default Budget Tier
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value as any)}
                className="input-field"
              >
                <option value="budget" style={{ background: '#111A2E' }}>Budget Friendly (Under ₹2,000)</option>
                <option value="moderate" style={{ background: '#111A2E' }}>Moderate Comfort (₹2,000 - ₹6,000)</option>
                <option value="luxury" style={{ background: '#111A2E' }}>Luxury & Fine Dining (₹6,000+)</option>
              </select>
            </div>
          </div>

          {/* Favorite Categories */}
          <div style={{ marginBottom: 30 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Favorite Categories
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allCategories.map((c) => (
                <span
                  key={c.id}
                  style={{
                    background: 'rgba(167, 139, 250, 0.12)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(167, 139, 250, 0.28)',
                    padding: '6px 14px',
                    borderRadius: 99,
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  ★ {c.label}
                </span>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            {savedSuccess ? <Check size={16} /> : <Sparkles size={16} />}
            {savedSuccess ? 'Preferences Saved!' : 'Save Personalization Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};
