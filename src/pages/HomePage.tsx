import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Compass,
  ArrowRight,
  MapPin,
  Clock,
  Heart,
  Zap,
  Users,
  Film,
  Utensils,
  Palette,
  Landmark,
  Trees,
  Dumbbell,
  ShoppingBag,
  Moon,
  Smile,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Dice5
} from 'lucide-react';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';
import { ExperienceCard } from '../components/ExperienceCard';
import { BookingModal } from '../components/BookingModal';
import { Experience, DayPlanningMode } from '../types';
import { ItineraryEngine } from '../services/itineraryEngine';
import { useApp } from '../context/AppContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveDay } = useApp();

  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [selectedExpForBooking, setSelectedExpForBooking] = useState<Experience | null>(null);

  // Surprise me state
  const [surpriseBudget, setSurpriseBudget] = useState(3500);
  const [surpriseGuests, setSurpriseGuests] = useState(2);

  const samplePrompts = [
    'Plan a date for two under ₹3000',
    'Fun Saturday with friends',
    'Family day with kids',
    'Food + movie + shopping',
    'Something adventurous',
    'Relaxing Sunday',
    'Best things to do tonight'
  ];

  const categories = [
    {
      id: 'food',
      name: 'Food & Dining',
      icon: Utensils,
      count: '14 places',
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'movies',
      name: 'Movies & Plays',
      icon: Film,
      count: '8 theatres',
      img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'activities',
      name: 'Activities & VR',
      icon: Zap,
      count: '11 arenas',
      img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'workshops',
      name: 'Workshops & Craft',
      icon: Palette,
      count: '9 studios',
      img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'culture',
      name: 'Culture & Museums',
      icon: Landmark,
      count: '16 monuments',
      img: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'sports',
      name: 'Sports & Racing',
      icon: Dumbbell,
      count: '7 complexes',
      img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'outdoor',
      name: 'Nature & Parks',
      icon: Trees,
      count: '12 trails',
      img: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'shopping',
      name: 'Markets & Malls',
      icon: ShoppingBag,
      count: '10 bazaars',
      img: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'nightlife',
      name: 'Nightlife & Jazz',
      icon: Moon,
      count: '15 lounges',
      img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'family',
      name: 'Family & Kids',
      icon: Smile,
      count: '9 exhibits',
      img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'dates',
      name: 'Date Experiences',
      icon: Heart,
      count: '18 romantic',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'relaxation',
      name: 'Spas & Wellness',
      icon: Sparkles,
      count: '6 retreats',
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const planningModes: { id: DayPlanningMode; label: string; desc: string }[] = [
    { id: 'date', label: 'Date Day', desc: 'Sunset vistas, cozy pottery & intimate dining' },
    { id: 'friends', label: 'Friends Squad', desc: 'High adrenaline, escape rooms & live music' },
    { id: 'family', label: 'Family with Kids', desc: 'Interactive illusions, lush picnics & heritage' },
    { id: 'foodie', label: 'Foodie Trail', desc: 'Street legends, craft roasteries & fine dining' },
    { id: 'adventure', label: 'Adventure Rush', desc: 'Go-karting, mountain biking & VR blasters' },
    { id: 'relax', label: 'Zen & Chill', desc: 'Aromatherapy, reading cafes & calm walks' },
    { id: 'culture', label: 'Art & Heritage', desc: 'Modern art galleries, live theatre & monuments' },
    { id: 'night_out', label: 'Night Out', desc: 'Speakeasies, live jazz & late night lounges' },
    { id: 'budget_day', label: 'Smart Budget', desc: 'Rich heritage & hidden gems under ₹1000' }
  ];

  const handleNaturalPlan = (promptText?: string) => {
    const text = promptText || naturalPrompt;
    navigate(`/plan?prompt=${encodeURIComponent(text)}`);
  };

  const handleGenerateSurprise = () => {
    const surpriseDay = ItineraryEngine.generateSurpriseDay(surpriseBudget, surpriseGuests);
    setActiveDay(surpriseDay);
    navigate('/my-day');
  };

  const handleModeClick = (mode: DayPlanningMode) => {
    navigate(`/plan?mode=${mode}`);
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '60px 0 80px 0',
          overflow: 'hidden'
        }}
      >
        <div className="container-dayly" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Top Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 99,
              background: 'rgba(255, 77, 109, 0.12)',
              border: '1px solid rgba(255, 77, 109, 0.3)',
              color: '#ff6b87',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: 20
            }}
          >
            <Sparkles size={16} />
            <span>DAYLY AI 2.0 • Delhi NCR Experience Platform</span>
          </div>

          {/* Main Hero Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 4.8rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              marginBottom: 16,
              color: '#ffffff',
              lineHeight: 1.1
            }}
          >
            Your entire day.{' '}
            <span
              style={{
                background: 'var(--grad-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              Planned.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
              color: 'var(--text-secondary)',
              maxWidth: 720,
              margin: '0 auto 36px auto',
              lineHeight: 1.55
            }}
          >
            Tell us what you want to do. DAYLY finds the places, timings, tickets and route — then
            builds your perfect day.
          </p>

          {/* AI-Style Natural Language Planner Input Box */}
          <div
            className="glass-panel"
            style={{
              maxWidth: 760,
              margin: '0 auto 28px auto',
              padding: 10,
              display: 'flex',
              alignItems: 'center',
              boxShadow: 'var(--shadow-lg), 0 0 35px rgba(255, 77, 109, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <div style={{ padding: '0 12px', color: 'var(--coral-500)', display: 'flex' }}>
              <Sparkles size={24} />
            </div>

            <input
              type="text"
              placeholder="What do you want to do? (e.g. Plan a date for two under ₹3000...)"
              value={naturalPrompt}
              onChange={(e) => setNaturalPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNaturalPlan()}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 500,
                padding: '12px 6px'
              }}
            />

            <button
              onClick={() => handleNaturalPlan()}
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              Plan My Day <ArrowRight size={16} />
            </button>
          </div>

          {/* Prompt Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
              maxWidth: 820,
              margin: '0 auto 36px auto'
            }}
          >
            {samplePrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleNaturalPlan(p)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 99,
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '6px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 77, 109, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 77, 109, 0.35)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                ✨ {p}
              </button>
            ))}
          </div>

          {/* Dual CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Link to="/plan" className="btn btn-primary btn-lg">
              <Calendar size={18} /> Plan My Day
            </Link>
            <Link to="/explore" className="btn btn-secondary btn-lg">
              <Compass size={18} /> Explore Experiences
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CARDS GRID */}
      <section style={{ padding: '40px 0 60px 0' }}>
        <div className="container-dayly">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <span className="badge badge-coral" style={{ marginBottom: 4 }}>Curated Disciplines</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Explore What You Love</h2>
            </div>
            <Link to="/explore" style={{ color: 'var(--coral-500)', fontSize: '0.9rem', fontWeight: 700 }}>
              View all 50+ categories →
            </Link>
          </div>

          <div className="grid-categories">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  to={`/explore?category=${c.id}`}
                  key={c.id}
                  className="glass-card glass-card-hover"
                  style={{
                    position: 'relative',
                    height: 160,
                    borderRadius: 18,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 16
                  }}
                >
                  <img
                    src={c.img}
                    alt={c.name}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.55,
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(10,11,18,0.2) 0%, rgba(10,11,18,0.85) 100%)'
                    }}
                  />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'rgba(255, 77, 109, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        marginBottom: 6
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{c.name}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{c.count}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SURPRISE ME SECTION */}
      <section style={{ padding: '40px 0 60px 0' }}>
        <div className="container-dayly">
          <div
            className="glass-panel"
            style={{
              padding: '36px 32px',
              background: 'linear-gradient(135deg, rgba(255, 77, 109, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              border: '1px solid rgba(255, 77, 109, 0.3)',
              borderRadius: 24,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24
            }}
          >
            <div style={{ maxWidth: 520 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#fbbf24',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginBottom: 8
                }}
              >
                <Dice5 size={18} />
                <span>SPONTANEOUS DISCOVERY</span>
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: 8 }}>
                “Surprise Me” Generator
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Indecisive? Let DAYLY construct an unexpected, harmonized day itinerary tailored to your
                budget and timing in 1 second.
              </p>
            </div>

            {/* Quick Surprise Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                background: 'rgba(10,11,18,0.7)',
                padding: '16px 20px',
                borderRadius: 18,
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Max Budget
                </label>
                <select
                  value={surpriseBudget}
                  onChange={(e) => setSurpriseBudget(Number(e.target.value))}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 10,
                    outline: 'none',
                    fontWeight: 700
                  }}
                >
                  <option value={1500}>Under ₹1,500</option>
                  <option value={3000}>Under ₹3,000</option>
                  <option value={5000}>Under ₹5,000</option>
                  <option value={8000}>Luxury (₹8,000+)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  People
                </label>
                <select
                  value={surpriseGuests}
                  onChange={(e) => setSurpriseGuests(Number(e.target.value))}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 10,
                    outline: 'none',
                    fontWeight: 700
                  }}
                >
                  <option value={1}>Solo (1)</option>
                  <option value={2}>Pair (2)</option>
                  <option value={4}>Friends (4)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateSurprise}
                className="btn btn-primary"
                style={{ padding: '14px 24px', fontSize: '1rem', marginTop: 14 }}
              >
                <Sparkles size={16} /> Roll Surprise Day
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PREDEFINED PLANNING MODES */}
      <section style={{ padding: '40px 0 60px 0' }}>
        <div className="container-dayly">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 36px auto' }}>
            <span className="badge badge-violet" style={{ marginBottom: 6 }}>Intelligent Presets</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Crafted for Every Occasion</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 8 }}>
              Each mode adjusts activity rhythm, ambiance thresholds, and meal timings automatically.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16
            }}
          >
            {planningModes.map((m) => (
              <div
                key={m.id}
                onClick={() => handleModeClick(m.id)}
                className="glass-card glass-card-hover"
                style={{
                  padding: 20,
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{m.label}</h4>
                  <ArrowRight size={16} color="var(--coral-500)" />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRENDING DELHI NCR EXPERIENCES */}
      <section style={{ padding: '40px 0 80px 0' }}>
        <div className="container-dayly">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: 4 }}>Top Rated in Delhi</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Popular Today</h2>
            </div>
            <Link to="/explore" style={{ color: 'var(--coral-500)', fontSize: '0.9rem', fontWeight: 700 }}>
              See all experiences →
            </Link>
          </div>

          <div className="grid-cards">
            {MOCK_EXPERIENCES.slice(0, 6).map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                onBookClick={(e) => setSelectedExpForBooking(e)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Universal Booking Modal if triggered from Home */}
      {selectedExpForBooking && (
        <BookingModal
          experience={selectedExpForBooking}
          onClose={() => setSelectedExpForBooking(null)}
        />
      )}
    </div>
  );
};
