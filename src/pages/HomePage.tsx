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
import { Bot, Activity, ShieldCheck as BotShield } from '../components/icons';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveDay, joinVirtualQueue, queues } = useApp();

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

  const handleSimulateLiveQueue = () => {
    const existing = queues.find((q) => q.experienceId === 'exp-food-1');
    if (!existing) {
      joinVirtualQueue('exp-food-1', '07:30 PM', 'Today', 2, false, {
        assistantEnabled: true,
        autoQueueEntry: true
      });
    }
    navigate('/queue');
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '75px 0 95px 0',
          overflow: 'hidden'
        }}
      >
        <div className="container-dayly" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Top Pill */}
          <div
            className="glass-pill glass-pill-accent"
            style={{
              marginBottom: 24,
              padding: '6px 18px',
              cursor: 'default'
            }}
          >
            <Sparkles size={16} />
            <span style={{ letterSpacing: '0.04em' }}>DAYLY AI 2.0 • Spatial Experience Architecture</span>
          </div>

          {/* Main Hero Heading */}
          <h1
            style={{
              fontSize: 'clamp(3rem, 6.5vw, 5.2rem)',
              fontWeight: 900,
              letterSpacing: '-0.035em',
              marginBottom: 20,
              color: '#FFFFFF',
              lineHeight: 1.08
            }}
          >
            Your entire day.{' '}
            <span
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 15%, #CBD5E1 100%)',
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
              fontSize: 'clamp(1.1rem, 2.2vw, 1.35rem)',
              color: 'var(--text-secondary)',
              maxWidth: 720,
              margin: '0 auto 40px auto',
              lineHeight: 1.6
            }}
          >
            Tell us what you want to do. DAYLY finds the places, timings, tickets and route — then
            builds your perfect day.
          </p>

          {/* AI-Style Natural Language Planner Input Dock */}
          <div
            className="glass-search-dock"
            style={{
              maxWidth: 780,
              margin: '0 auto 28px auto',
              padding: '8px 12px 8px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{ color: 'var(--lavender-electric)', display: 'flex' }}>
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
                color: '#FFFFFF',
                fontSize: '1.1rem',
                fontWeight: 500,
                padding: '12px 4px'
              }}
            />

            <button
              onClick={() => handleNaturalPlan()}
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '99px' }}
            >
              Plan My Day <ArrowRight size={16} />
            </button>
          </div>

          {/* Prompt Micro-Capsules */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
              maxWidth: 840,
              margin: '0 auto 40px auto'
            }}
          >
            {samplePrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleNaturalPlan(p)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 99,
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  padding: '7px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(167, 139, 250, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.40)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(167, 139, 250, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.06)';
                }}
              >
                ✨ {p}
              </button>
            ))}
          </div>

          {/* Dual Main CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Link to="/plan" className="btn btn-primary btn-lg">
              <Calendar size={18} /> Plan My Day
            </Link>
            <Link to="/explore" className="btn btn-secondary btn-lg">
              <Compass size={18} /> Explore Experiences
            </Link>
          </div>

          {/* AI Queue Assistant Live Spotlight Banner */}
          <div
            className="glass-card"
            style={{
              maxWidth: 820,
              margin: '36px auto 0 auto',
              padding: '18px 24px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              border: '1px solid rgba(99, 102, 241, 0.28)',
              background: 'rgba(14, 21, 38, 0.85)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818CF8'
                  }}
                >
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF' }}>
                      AI Booking Queue Assistant
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 99,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#34D399',
                        border: '1px solid rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                      24/7 Engine Active
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, marginTop: 2 }}>
                    Autonomous drop-sniping & queue progression for packed dining, pottery studios & concert passes.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={handleSimulateLiveQueue}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Zap size={14} />
                  <span>Test Live Waitlist (#37)</span>
                </button>
                <Link
                  to="/queue"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>Queue Hub</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CARDS GRID */}
      <section style={{ padding: '40px 0 60px 0' }}>
        <div className="container-dayly">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <span className="badge badge-violet" style={{ marginBottom: 6 }}>Curated Disciplines</span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Explore What You Love</h2>
            </div>
            <Link
              to="/explore"
              style={{
                color: 'var(--lavender-electric)',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              View all 50+ categories <ArrowRight size={14} />
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
                    height: 165,
                    borderRadius: 20,
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
                      opacity: 0.50,
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(11,16,32,0.1) 0%, rgba(11,16,32,0.92) 100%)'
                    }}
                  />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: 'rgba(167, 139, 250, 0.25)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        marginBottom: 8,
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>{c.name}</h4>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{c.count}</span>
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
              padding: '40px 36px',
              background: 'linear-gradient(135deg, rgba(33, 21, 56, 0.70) 0%, rgba(17, 26, 46, 0.75) 100%)',
              border: '1px solid rgba(167, 139, 250, 0.25)',
              boxShadow: 'var(--shadow-lg), 0 0 35px rgba(139, 92, 246, 0.15)',
              borderRadius: 28,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 28
            }}
          >
            <div style={{ maxWidth: 520 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#FCD34D',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                <Dice5 size={18} />
                <span>Spontaneous Discovery</span>
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginBottom: 10 }}>
                “Surprise Me” Generator
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
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
                background: 'rgba(11, 16, 32, 0.75)',
                backdropFilter: 'blur(16px)',
                padding: '18px 24px',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Max Budget
                </label>
                <select
                  value={surpriseBudget}
                  onChange={(e) => setSurpriseBudget(Number(e.target.value))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '9px 14px',
                    borderRadius: 12,
                    outline: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem'
                  }}
                >
                  <option value={1500} style={{ background: '#111A2E' }}>Under ₹1,500</option>
                  <option value={3000} style={{ background: '#111A2E' }}>Under ₹3,000</option>
                  <option value={5000} style={{ background: '#111A2E' }}>Under ₹5,000</option>
                  <option value={8000} style={{ background: '#111A2E' }}>Luxury (₹8,000+)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  People
                </label>
                <select
                  value={surpriseGuests}
                  onChange={(e) => setSurpriseGuests(Number(e.target.value))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '9px 14px',
                    borderRadius: 12,
                    outline: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem'
                  }}
                >
                  <option value={1} style={{ background: '#111A2E' }}>Solo (1)</option>
                  <option value={2} style={{ background: '#111A2E' }}>Pair (2)</option>
                  <option value={4} style={{ background: '#111A2E' }}>Friends (4)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateSurprise}
                className="btn btn-primary"
                style={{ padding: '14px 26px', fontSize: '0.98rem', marginTop: 14 }}
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
            <span className="badge badge-cyan" style={{ marginBottom: 6 }}>Intelligent Presets</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Crafted for Every Occasion</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 8 }}>
              Each mode adjusts activity rhythm, ambiance thresholds, and meal timings automatically.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 18
            }}
          >
            {planningModes.map((m) => (
              <div
                key={m.id}
                onClick={() => handleModeClick(m.id)}
                className="glass-card glass-card-hover"
                style={{
                  padding: 24,
                  cursor: 'pointer',
                  borderRadius: 20
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#FFFFFF' }}>{m.label}</h4>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(167, 139, 250, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--lavender-electric)'
                    }}
                  >
                    <ArrowRight size={14} />
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
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
              <span className="badge badge-emerald" style={{ marginBottom: 6 }}>Top Rated in Delhi</span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Popular Today</h2>
            </div>
            <Link
              to="/explore"
              style={{
                color: 'var(--lavender-electric)',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              See all experiences <ArrowRight size={14} />
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
