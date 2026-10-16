import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Compass,
  ArrowRight,
  Clock,
  Zap,
  Film,
  Utensils,
  Palette,
  Landmark,
  Trees,
  Dumbbell,
  ShoppingBag,
  Moon,
  Smile,
  Heart,
  Sparkles,
  Dice5,
  CheckCircle2,
  Hourglass,
  Car,
  ChevronRight
} from 'lucide-react';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';
import { ExperienceCard } from '../components/ExperienceCard';
import { BookingModal } from '../components/BookingModal';
import { Experience, DayPlanningMode } from '../types';
import { ItineraryEngine } from '../services/itineraryEngine';
import { useApp } from '../context/AppContext';
import { Bot } from '../components/icons';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveDay, joinVirtualQueue, queues } = useApp();

  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [selectedExpForBooking, setSelectedExpForBooking] = useState<Experience | null>(null);

  // Surprise me state
  const [surpriseBudget, setSurpriseBudget] = useState(3500);
  const [surpriseGuests, setSurpriseGuests] = useState(2);

  const samplePrompts = [
    'Date night in Mehrauli under ₹3000',
    'Saturday squad with karting & burgers',
    'Quiet Sunday with pottery & coffee',
    'Art gallery walk and heritage dinner',
    'Rainy day indoor escape & cinema'
  ];

  const categories = [
    {
      id: 'food',
      name: 'Food & Dining',
      icon: Utensils,
      count: '14 curated venues',
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'workshops',
      name: 'Pottery & Craft',
      icon: Palette,
      count: '9 studios',
      img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'movies',
      name: 'Cinema & Plays',
      icon: Film,
      count: '8 theatres',
      img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'culture',
      name: 'Heritage & Museums',
      icon: Landmark,
      count: '16 monuments',
      img: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'activities',
      name: 'Adrenaline & VR',
      icon: Zap,
      count: '11 arenas',
      img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'nightlife',
      name: 'Speakeasies & Jazz',
      icon: Moon,
      count: '15 lounges',
      img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const planningModes: { id: DayPlanningMode; label: string; desc: string }[] = [
    { id: 'date', label: 'Intimate Date', desc: 'Sunset overlooks, pottery hands-on & candlelit dining' },
    { id: 'friends', label: 'Crew Outing', desc: 'Escape games, craft brewery & live indie sets' },
    { id: 'foodie', label: 'Epicurean Trail', desc: 'Old Delhi legends, roasteries & chef tasting menus' },
    { id: 'culture', label: 'Art & Heritage', desc: 'Modern galleries, stepwells & architectural walks' },
    { id: 'relax', label: 'Rest & Unwind', desc: 'Aromatherapy, reading corners & quiet botanical strolls' },
    { id: 'budget_day', label: 'Smart Budget', desc: 'Heritage monuments & legendary street eats under ₹1,000' }
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
      {/* 1. EDITORIAL HERO SECTION */}
      <section
        style={{
          padding: '64px 0 56px 0',
          borderBottom: '1px solid #1E2532',
          background: 'radial-gradient(ellipse 60% 50% at 50% -10%, #151A24, #090B0E 80%)'
        }}
      >
        <div className="container-dayly" style={{ maxWidth: 980, textAlign: 'center' }}>
          {/* Subtle Location & Status Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              borderRadius: '6px',
              background: '#131720',
              border: '1px solid #232A38',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 20
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)' }} />
            <span>Delhi NCR Itinerary Curation & Queue Automation</span>
          </div>

          {/* Primary Editorial Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              color: '#FFFFFF',
              marginBottom: 18
            }}
          >
            Your entire day outside. <br />
            <span style={{ color: 'var(--brand-primary)' }}>Perfectled timed.</span>
          </h1>

          {/* Tangible Subhead */}
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.18rem)',
              color: 'var(--text-secondary)',
              maxWidth: 680,
              margin: '0 auto 32px auto',
              lineHeight: 1.6
            }}
          >
            Sequence dining, cinema, workshops, and exhibitions without schedule clashes or sold-out lines.
            DAYLY calculates transit buffers and stands in virtual queues for you.
          </p>

          {/* Natural Language Prompt Dock */}
          <div
            className="search-dock-editorial"
            style={{
              maxWidth: 720,
              margin: '0 auto 18px auto',
              padding: '6px 8px 6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <input
              type="text"
              placeholder="What are you in the mood for? (e.g. Date night in Mehrauli under ₹3,000...)"
              value={naturalPrompt}
              onChange={(e) => setNaturalPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNaturalPlan()}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '0.98rem',
                fontWeight: 500,
                padding: '8px 0'
              }}
            />

            <button
              onClick={() => handleNaturalPlan()}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.90rem' }}
            >
              Plan Day <ArrowRight size={15} />
            </button>
          </div>

          {/* Curated Prompt Chips (Grounded, No Emojis) */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 6,
              maxWidth: 740,
              margin: '0 auto 32px auto'
            }}
          >
            {samplePrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleNaturalPlan(p)}
                style={{
                  background: '#121620',
                  border: '1px solid #232A38',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '5px 11px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.background = '#181E29';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#232A38';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = '#121620';
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Direct Secondary Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Link to="/plan" className="btn btn-primary btn-lg">
              <Calendar size={16} /> Open Itinerary Builder
            </Link>
            <Link to="/explore" className="btn btn-secondary btn-lg">
              <Compass size={16} /> Explore All Experiences
            </Link>
          </div>
        </div>
      </section>

      {/* 2. LIVE QUEUE ASSISTANT — REAL PRODUCT FEATURE SHOWCASE */}
      <section style={{ padding: '64px 0', borderBottom: '1px solid #1E2532', background: '#0B0E14' }}>
        <div className="container-dayly">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 36,
              alignItems: 'center'
            }}
          >
            {/* Left: Product Explanation */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--brand-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 10
                }}
              >
                <Bot size={15} />
                <span>Autonomous Booking Bot</span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: 14 }}>
                Sold out? Let DAYLY stand in line for you.
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
                Weekend tables at Indian Accent, pottery wheels at The Clay Company, and midnight IMAX releases disappear in seconds. DAYLY monitors reservation openings, enters the official queue instantly, and alerts you when your turn is minutes away.
              </p>

              {/* 3 Step Flow */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      background: '#181E29',
                      border: '1px solid #283142',
                      color: 'var(--brand-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    1
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.90rem', color: '#FFFFFF', display: 'block' }}>Opening Drop Detection</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Tracks slot openings automatically so you never miss the 10:00 AM reservation drop.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      background: '#181E29',
                      border: '1px solid #283142',
                      color: 'var(--brand-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    2
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.90rem', color: '#FFFFFF', display: 'block' }}>Instant Queue Lock</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Enters the waitlist with concurrency locking to prevent duplicate entries and handles captcha verification.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      background: '#181E29',
                      border: '1px solid #283142',
                      color: 'var(--brand-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    3
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.90rem', color: '#FFFFFF', display: 'block' }}>Turn Arrival Approval</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Notifies you via push alert 2 minutes before your window opens. Confirm with one click.</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleSimulateLiveQueue} className="btn btn-primary">
                  <Zap size={14} /> Launch Live Waitlist Demo
                </button>
                <Link to="/queue" className="btn btn-secondary">
                  Queue Control Center <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right: Live Interactive Queue Card */}
            <div>
              <div
                style={{
                  background: '#131720',
                  border: '1px solid #232A38',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: '#10B981',
                          display: 'inline-block'
                        }}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Live Waitlist Active
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>Indian Accent • Chef's Table</h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Tonight • 07:30 PM • 2 Guests</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Line Position</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brand-primary)' }}>#4</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span>Progression rate: Fast (32 moved ahead)</span>
                    <span style={{ color: '#F3F4F6', fontWeight: 600 }}>~6 mins remaining</span>
                  </div>
                  <div style={{ width: '100%', height: 6, borderRadius: '4px', background: '#0E1218', overflow: 'hidden' }}>
                    <div style={{ width: '84%', height: '100%', background: 'var(--brand-primary)', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* Activity Log preview */}
                <div
                  style={{
                    background: '#0E1218',
                    border: '1px solid #1E2532',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    marginBottom: 18
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#9CA3AF' }}>12:45 PM • Initial drop detected</span>
                    <span style={{ color: '#6B7280' }}>Joined at #36</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#9CA3AF' }}>01:10 PM • Challenge solved</span>
                    <span style={{ color: '#10B981' }}>Verified</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>01:14 PM • Turn approaching alert primed</span>
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>Standby</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleSimulateLiveQueue}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Simulate Turn Arrival
                  </button>
                  <Link to="/queue" className="btn btn-secondary btn-sm">
                    Manage Waitlists
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. A TYPICAL DAY ON DAYLY — LIVE ITINERARY PREVIEW */}
      <section style={{ padding: '64px 0', borderBottom: '1px solid #1E2532' }}>
        <div className="container-dayly">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: 6 }}>Sequence Architecture</span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800 }}>A Typical Saturday on DAYLY</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 4 }}>
                4 stops, realistic transit buffers, and zero schedule overlaps.
              </p>
            </div>

            <Link to="/plan" className="btn btn-secondary btn-sm">
              Build Custom Itinerary <ChevronRight size={14} />
            </Link>
          </div>

          {/* Timeline Horizontal Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16
            }}
          >
            {[
              {
                time: '11:00 AM',
                title: 'Blue Tokai Coffee Roasters',
                category: 'Coffee & Breakfast',
                area: 'Saket',
                duration: '60 min',
                cost: '₹500',
                transitNext: '15 min metro'
              },
              {
                time: '12:30 PM',
                title: 'The Clay Company',
                category: 'Pottery Wheel Workshop',
                area: 'Hauz Khas',
                duration: '120 min',
                cost: '₹1,400',
                transitNext: '20 min cab'
              },
              {
                time: '03:30 PM',
                title: 'National Gallery of Modern Art',
                category: 'Exhibition & Sculpture',
                area: 'India Gate',
                duration: '90 min',
                cost: '₹100',
                transitNext: '25 min cab'
              },
              {
                time: '06:30 PM',
                title: 'Olive Bar & Kitchen',
                category: 'Fine Dining & Sunset Courtyard',
                area: 'Mehrauli',
                duration: '120 min',
                cost: '₹2,200',
                transitNext: 'End of day'
              }
            ].map((stop, i) => (
              <div
                key={stop.title}
                style={{
                  background: '#131720',
                  border: '1px solid #232A38',
                  borderRadius: '10px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{stop.time}</span>
                    <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Stop 0{i + 1}</span>
                  </div>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>{stop.title}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    {stop.category} • {stop.area}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #1E2532',
                    paddingTop: 10,
                    marginTop: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span>{stop.duration} • {stop.cost}</span>
                  <span style={{ color: '#60A5FA', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Car size={11} /> {stop.transitNext}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CURATED DISCIPLINES */}
      <section style={{ padding: '64px 0', borderBottom: '1px solid #1E2532' }}>
        <div className="container-dayly">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="badge badge-violet" style={{ marginBottom: 6 }}>Curated Disciplines</span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800 }}>Explore What You Love</h2>
            </div>
            <Link
              to="/explore"
              style={{
                color: 'var(--brand-primary)',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              Browse all 50+ venues <ChevronRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16
            }}
          >
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  to={`/explore?category=${c.id}`}
                  key={c.id}
                  style={{
                    position: 'relative',
                    height: 160,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '16px',
                    border: '1px solid #232A38'
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
                      opacity: 0.40,
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(11,14,20,0.1) 0%, rgba(11,14,20,0.95) 100%)'
                    }}
                  />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '6px',
                        background: '#131720EE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--brand-primary)',
                        marginBottom: 6,
                        border: '1px solid #2A3345'
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>{c.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.count}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SPONTANEOUS "SURPRISE ME" STUDIO */}
      <section style={{ padding: '64px 0', borderBottom: '1px solid #1E2532', background: '#0B0E14' }}>
        <div className="container-dayly">
          <div
            style={{
              padding: '36px',
              background: '#131720',
              border: '1px solid #232A38',
              borderRadius: '12px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 28
            }}
          >
            <div style={{ maxWidth: 500 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--brand-primary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                <Dice5 size={16} />
                <span>Spontaneous Discovery</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>
                Indecisive? Let DAYLY surprise you.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.90rem', lineHeight: 1.6 }}>
                Set your budget ceiling and party size. DAYLY calculates a complete 3-stop day with zero scheduling conflicts in under one second.
              </p>
            </div>

            {/* Quick Surprise Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
                background: '#0E1218',
                padding: '16px 20px',
                borderRadius: '8px',
                border: '1px solid #1E2532'
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
                  Budget Ceiling
                </label>
                <select
                  value={surpriseBudget}
                  onChange={(e) => setSurpriseBudget(Number(e.target.value))}
                  style={{
                    background: '#141820',
                    color: '#FFFFFF',
                    border: '1px solid #283142',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    outline: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  <option value={1500}>Under ₹1,500 total</option>
                  <option value={3000}>Under ₹3,000 total</option>
                  <option value={5000}>Under ₹5,000 total</option>
                  <option value={8000}>Under ₹8,000 total</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
                  Party Size
                </label>
                <select
                  value={surpriseGuests}
                  onChange={(e) => setSurpriseGuests(Number(e.target.value))}
                  style={{
                    background: '#141820',
                    color: '#FFFFFF',
                    border: '1px solid #283142',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    outline: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem'
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
                style={{ padding: '10px 20px', fontSize: '0.88rem', marginTop: 16 }}
              >
                <Dice5 size={14} /> Generate Day
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTELLIGENT PLANNING MODES */}
      <section style={{ padding: '64px 0', borderBottom: '1px solid #1E2532' }}>
        <div className="container-dayly">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 36px auto' }}>
            <span className="badge badge-cyan" style={{ marginBottom: 6 }}>Preset Blueprints</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800 }}>Crafted for Every Occasion</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.90rem', marginTop: 6 }}>
              Each blueprint pre-tunes transit pacing, atmosphere thresholds, and dining formats.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16
            }}
          >
            {planningModes.map((m) => (
              <div
                key={m.id}
                onClick={() => handleModeClick(m.id)}
                className="glass-card glass-card-hover"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  background: '#131720',
                  border: '1px solid #232A38'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>{m.label}</h4>
                  <ChevronRight size={15} color="var(--brand-primary)" />
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. POPULAR EXPERIENCES TODAY */}
      <section style={{ padding: '64px 0 80px 0' }}>
        <div className="container-dayly">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: 6 }}>Top Rated Today</span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800 }}>Popular in Delhi NCR</h2>
            </div>
            <Link
              to="/explore"
              style={{
                color: 'var(--brand-primary)',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              See all 30+ spots <ChevronRight size={14} />
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
