import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  Wallet,
  Car,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Heart,
  ShieldCheck
} from 'lucide-react';
import { PlanningPreferences, DayPlanningMode } from '../types';
import { ItineraryEngine } from '../services/itineraryEngine';
import { useApp } from '../context/AppContext';

export const PlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setActiveDay } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Form State
  const [date, setDate] = useState('2026-09-30');
  const [startTime, setStartTime] = useState('11:30');
  const [endTime, setEndTime] = useState('21:30');
  const [city, setCity] = useState('Delhi NCR');
  const [area, setArea] = useState('South Delhi & CP');
  const [numPeople, setNumPeople] = useState<number>(2);
  const [budgetTotal, setBudgetTotal] = useState<number>(4000);
  const [ageGroup, setAgeGroup] = useState<PlanningPreferences['ageGroup']>('young_adults');
  const [transportMode, setTransportMode] = useState<PlanningPreferences['transportMode']>('car');
  const [mode, setMode] = useState<DayPlanningMode>('date');
  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['romantic', 'date', 'fine dining']);
  const [dietaryOptions, setDietaryOptions] = useState<('vegetarian' | 'vegan' | 'halal' | 'jain')[]>(['vegetarian']);

  // Handle incoming query params from Home
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    const modeParam = searchParams.get('mode') as DayPlanningMode | null;

    if (promptParam) {
      setNaturalPrompt(promptParam);
      // Auto-extract semantics
      if (promptParam.toLowerCase().includes('date')) setMode('date');
      if (promptParam.toLowerCase().includes('friend')) setMode('friends');
      if (promptParam.toLowerCase().includes('family') || promptParam.toLowerCase().includes('kid'))
        setMode('family');
      if (promptParam.toLowerCase().includes('adventure')) setMode('adventure');
      if (promptParam.toLowerCase().includes('relax')) setMode('relax');
    }

    if (modeParam) {
      setMode(modeParam);
    }
  }, [searchParams]);

  const tagOptions = [
    'romantic',
    'fine dining',
    'pottery',
    'movie',
    'aesthetic cafe',
    'street food',
    'escape room',
    'vr gaming',
    'monument',
    'museum',
    'picnic',
    'cycling',
    'badminton',
    'go-karting',
    'craft bazaar',
    'spa & wellness',
    'live jazz',
    'rooftop cocktails',
    'pet friendly',
    'wheelchair accessible',
    'indoor ac only',
    'photography spots'
  ];

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const toggleDietary = (d: 'vegetarian' | 'vegan' | 'halal' | 'jain') => {
    setDietaryOptions((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    const prefs: PlanningPreferences = {
      date,
      startTime,
      endTime,
      city,
      area,
      numPeople,
      budgetTotal,
      ageGroup,
      mode,
      transportMode,
      dietary: dietaryOptions,
      tags: selectedTags,
      naturalPrompt
    };

    // Simulate AI synthesis & route optimization delay
    await new Promise((r) => setTimeout(r, 1200));

    const dayPlan = ItineraryEngine.buildPlan(prefs);
    setActiveDay(dayPlan);
    setIsGenerating(false);

    navigate('/my-day');
  };

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container-dayly" style={{ maxWidth: 840 }}>
        {/* Wizard Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span className="badge badge-coral" style={{ marginBottom: 6 }}>
            Step {currentStep} of 3 • AI Day Generator
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900 }}>
            Design Your Perfect Day
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 6 }}>
            DAYLY structures your ideal timings, coordinates venues, checks tickets and prevents impossible schedules.
          </p>

          {/* Stepper Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                onClick={() => setCurrentStep(step)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background:
                    currentStep === step
                      ? 'var(--grad-primary)'
                      : currentStep > step
                      ? '#10b981'
                      : 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: currentStep === step ? '0 0 14px var(--coral-glow)' : 'none'
                }}
              >
                {currentStep > step ? <Check size={16} /> : step}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Form Panel */}
        <div className="glass-panel" style={{ padding: '36px 32px' }}>
          {/* STEP 1: Logistics & Timings */}
          {currentStep === 1 && (
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>
                1. Date, Timings & Location
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
                When would you like your day to begin and end?
              </p>

              {/* Natural prompt input at top */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Describe your day in your own words (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    rows={2}
                    placeholder="e.g. I want a fun date starting at 12 PM with lunch, pottery, a movie and romantic dinner."
                    value={naturalPrompt}
                    onChange={(e) => setNaturalPrompt(e.target.value)}
                    className="input-field"
                    style={{ resize: 'none' }}
                  />
                  <Sparkles
                    size={16}
                    color="var(--coral-500)"
                    style={{ position: 'absolute', right: 14, bottom: 14 }}
                  />
                </div>
              </div>

              {/* Date & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    City / Metro Region
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
                    Preferred Area
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="input-field"
                  >
                    <option value="South Delhi & CP">South Delhi & Connaught Place</option>
                    <option value="Hauz Khas & Mehrauli">Hauz Khas & Mehrauli Heritage</option>
                    <option value="Old Delhi & Chandni Chowk">Old Delhi & Chandni Chowk</option>
                    <option value="CyberHub & Gurgaon">CyberHub & Golf Course Rd (Gurgaon)</option>
                    <option value="Anywhere in Delhi NCR">Anywhere in Delhi NCR</option>
                  </select>
                </div>
              </div>

              {/* Start & End Times */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Day Starts Around
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Day Ends Around
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Group Size */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Number of People
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[1, 2, 3, 4, 6].map((count) => (
                    <button
                      type="button"
                      key={count}
                      onClick={() => setNumPeople(count)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 14,
                        border: numPeople === count ? '1px solid var(--coral-500)' : '1px solid var(--border-subtle)',
                        background: numPeople === count ? 'rgba(255, 77, 109, 0.18)' : 'rgba(255,255,255,0.04)',
                        color: numPeople === count ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.95rem'
                      }}
                    >
                      {count === 1 ? 'Solo (1)' : count === 2 ? 'Pair (2)' : `${count} People`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-primary"
                  style={{ padding: '14px 28px' }}
                >
                  Next: Budget & Mode <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Mode, Budget & Transit */}
          {currentStep === 2 && (
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>
                2. Vibe, Mode & Budget
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
                What type of day are you envisioning?
              </p>

              {/* Planning Mode Selector */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  Select Planning Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {[
                    { id: 'date', label: 'Date Day 💖' },
                    { id: 'friends', label: 'Friends Squad ⚡' },
                    { id: 'family', label: 'Family & Kids 🎈' },
                    { id: 'foodie', label: 'Foodie Trail 🍜' },
                    { id: 'adventure', label: 'Adventure 🏎️' },
                    { id: 'relax', label: 'Zen & Chill 🌿' },
                    { id: 'culture', label: 'Art & Heritage 🏛️' },
                    { id: 'budget_day', label: 'Budget Explorer 🏷️' }
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMode(m.id as any)}
                      style={{
                        padding: '12px',
                        borderRadius: 14,
                        border: mode === m.id ? '1px solid var(--coral-500)' : '1px solid var(--border-subtle)',
                        background: mode === m.id ? 'rgba(255, 77, 109, 0.18)' : 'rgba(255,255,255,0.04)',
                        color: mode === m.id ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textAlign: 'center'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Budget Slider */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Total Day Budget (All activities, food & tickets)
                  </label>
                  <strong style={{ color: 'var(--coral-500)', fontSize: '1.1rem' }}>₹{budgetTotal}</strong>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={12000}
                  step={500}
                  value={budgetTotal}
                  onChange={(e) => setBudgetTotal(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--coral-500)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>₹1,000 (Budget)</span>
                  <span>₹5,000 (Comfortable)</span>
                  <span>₹12,000+ (Luxury)</span>
                </div>
              </div>

              {/* Transit Mode */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Primary Transport Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { id: 'car', label: 'Car / Cab' },
                    { id: 'metro', label: 'Metro' },
                    { id: 'bike', label: 'Bike' },
                    { id: 'walking', label: 'Walking' }
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTransportMode(t.id as any)}
                      style={{
                        padding: '12px 6px',
                        borderRadius: 14,
                        border: transportMode === t.id ? '1px solid var(--coral-500)' : '1px solid var(--border-subtle)',
                        background: transportMode === t.id ? 'rgba(255, 77, 109, 0.18)' : 'rgba(255,255,255,0.04)',
                        color: transportMode === t.id ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textAlign: 'center'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn btn-primary"
                  style={{ padding: '14px 28px' }}
                >
                  Next: Preferences & Dietary <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Dietary & Vibe Tags */}
          {currentStep === 3 && (
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>
                3. Dietary & Experience Preferences
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
                Tailor venues and restaurant suggestions to your specific lifestyle.
              </p>

              {/* Dietary pills */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Dietary Preferences
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'vegetarian', label: 'Vegetarian Only' },
                    { id: 'vegan', label: 'Vegan Friendly' },
                    { id: 'halal', label: 'Halal Certified' },
                    { id: 'jain', label: 'Jain Friendly' }
                  ].map((d) => {
                    const active = dietaryOptions.includes(d.id as any);
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => toggleDietary(d.id as any)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 99,
                          border: active ? '1px solid var(--emerald-500)' : '1px solid var(--border-subtle)',
                          background: active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                          color: active ? '#34d399' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        {active && '✓ '} {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Interests & Vibe Tags */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Activities & Vibe Keywords (Click to toggle)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {tagOptions.map((t) => {
                    const active = selectedTags.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => toggleTag(t)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 99,
                          border: active ? '1px solid var(--coral-500)' : '1px solid var(--border-subtle)',
                          background: active ? 'rgba(255, 77, 109, 0.2)' : 'rgba(255,255,255,0.04)',
                          color: active ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {active ? '★ ' : '+ '} {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Final Synthesis CTA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="btn btn-primary btn-lg"
                >
                  <Sparkles size={18} />
                  {isGenerating ? 'Synthesizing Itinerary...' : 'Generate My Perfect Day'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
