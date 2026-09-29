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
      <div className="container-dayly" style={{ maxWidth: 840 }}>
        {/* User Card */}
        <div
          className="glass-panel"
          style={{
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 32
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--coral-500)',
                boxShadow: '0 0 16px var(--coral-glow)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900 }}>{userProfile.name}</h1>
                <span className="badge badge-emerald">Verified Explorer</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{userProfile.email}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 4 }}>
                <MapPin size={13} color="var(--coral-500)" />
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
            gap: 14,
            marginBottom: 32
          }}
        >
          <div className="glass-card" style={{ padding: '18px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL BOOKINGS</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>{bookings.length}</div>
          </div>
          <div className="glass-card" style={{ padding: '18px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SAVED PLACES</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--coral-500)' }}>
              {wishlistIds.length}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '18px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PLANNED DAYS</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--violet-500)' }}>3</div>
          </div>
          <div className="glass-card" style={{ padding: '18px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MEMBER TIER</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>DAYLY VIP</div>
          </div>
        </div>

        {/* Personalization Preferences Form */}
        <form onSubmit={handleSave} className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Personalization Engine</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                DAYLY fine-tunes AI day recommendations around your palate, distance limits, and budget.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
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
                <option value="Vegetarian friendly">Vegetarian friendly</option>
                <option value="Strict vegetarian">Strict vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Halal">Halal</option>
                <option value="Jain friendly">Jain friendly</option>
                <option value="Omnivore / All">No restrictions</option>
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
                <option value="budget">Budget Friendly (Under ₹2,000)</option>
                <option value="moderate">Moderate Comfort (₹2,000 - ₹6,000)</option>
                <option value="luxury">Luxury & Fine Dining (₹6,000+)</option>
              </select>
            </div>
          </div>

          {/* Favorite Categories */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Favorite Categories
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allCategories.map((c) => (
                <span
                  key={c.id}
                  style={{
                    background: 'rgba(255, 77, 109, 0.14)',
                    color: '#fff',
                    border: '1px solid rgba(255, 77, 109, 0.3)',
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
