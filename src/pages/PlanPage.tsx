import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Train,
  Footprints,
  Bike
} from 'lucide-react';
import { PlanningPreferences, DayPlanningMode, ExperienceCategory } from '../types';
import { ItineraryEngine } from '../services/itineraryEngine';
import { NaturalLanguageService } from '../services/naturalLanguageService';
import { useApp } from '../context/AppContext';

export const PlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setPlanResult, setActiveDay } = useApp();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [feasibilityError, setFeasibilityError] = useState<string | null>(null);

  // Form State
  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [date, setDate] = useState('2026-09-30');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('21:00');
  const [durationHours, setDurationHours] = useState<number>(6);
  const [startLocation, setStartLocation] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [area, setArea] = useState('South Delhi & CP');
  const [numPeople, setNumPeople] = useState<number>(2);

  // Budget states
  const [budgetAmount, setBudgetAmount] = useState<number>(3000);
  const [budgetType, setBudgetType] = useState<'total' | 'per_person'>('total');
  const [budgetReservePercent, setBudgetReservePercent] = useState<number>(10);
  const [maximizeExperience, setMaximizeExperience] = useState<boolean>(false);

  // Logistics & Preferences
  const [mode, setMode] = useState<DayPlanningMode>('date');
  const [transportMode, setTransportMode] = useState<PlanningPreferences['transportMode']>('car');
  const [indoorOnly, setIndoorOnly] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<ExperienceCategory[]>(['food', 'activities']);
  const [selectedTags, setSelectedTags] = useState<string[]>(['romantic', 'date', 'fine dining']);
  const [dietaryOptions, setDietaryOptions] = useState<('vegetarian' | 'vegan' | 'halal' | 'jain')[]>(['vegetarian']);

  // Apply NLP extraction to form state
  const applyNaturalPrompt = useCallback((promptText: string) => {
    if (!promptText.trim()) return;
    const extracted = NaturalLanguageService.extractIntent(promptText);

    if (extracted.numPeople) setNumPeople(extracted.numPeople);
    if (extracted.budget) setBudgetAmount(extracted.budget);
    if (extracted.budgetType) setBudgetType(extracted.budgetType);
    if (extracted.budgetReserve) {
      // Convert raw reserve into approximate percentage
      const totalBudget = extracted.budget || budgetAmount;
      if (totalBudget > 0) {
        setBudgetReservePercent(Math.min(40, Math.round((extracted.budgetReserve / totalBudget) * 100)));
      }
    }
    if (extracted.durationMinutes) {
      const hrs = Math.round(extracted.durationMinutes / 60);
      setDurationHours(hrs);
      // recalculate end time
      const [h, m] = startTime.split(':').map((n) => parseInt(n, 10));
      const endMins = (h || 11) * 60 + (m || 0) + extracted.durationMinutes;
      const endH = Math.floor((endMins % 1440) / 60);
      const endM = endMins % 60;
      setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    }
    if (extracted.startTime) setStartTime(extracted.startTime);
    if (extracted.startLocation) setStartLocation(extracted.startLocation);
    if (extracted.mode) setMode(extracted.mode);
    if (extracted.transportMode) setTransportMode(extracted.transportMode);
    if (extracted.indoorOnly !== undefined) setIndoorOnly(extracted.indoorOnly);
    if (extracted.maximizeExperience !== undefined) setMaximizeExperience(extracted.maximizeExperience);
    if (extracted.categories && extracted.categories.length > 0) {
      setSelectedCategories(extracted.categories);
    }
    if (extracted.dietary && extracted.dietary.length > 0) {
      setDietaryOptions(extracted.dietary);
    }
  }, [budgetAmount, startTime]);

  // Handle incoming query params from Home
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    const modeParam = searchParams.get('mode') as DayPlanningMode | null;

    if (promptParam) {
      setNaturalPrompt(promptParam);
      applyNaturalPrompt(promptParam);
    }

    if (modeParam) {
      setMode(modeParam);
    }
  }, [searchParams, applyNaturalPrompt]);

  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyNaturalPrompt(naturalPrompt);
    }
  };

  // Quick Chips Handlers
  const handleDurationChip = (hours: number) => {
    setDurationHours(hours);
    const [h, m] = startTime.split(':').map((n) => parseInt(n, 10));
    const endMins = (h || 11) * 60 + (m || 0) + hours * 60;
    const endH = Math.floor((endMins % 1440) / 60);
    const endM = endMins % 60;
    setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
  };

  const handleBudgetChip = (amount: number) => {
    setBudgetAmount(amount);
  };

  const toggleCategory = (cat: ExperienceCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleDietary = (d: 'vegetarian' | 'vegan' | 'halal' | 'jain') => {
    setDietaryOptions((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    );
  };

  const handleReset = () => {
    setNaturalPrompt('');
    setBudgetAmount(3000);
    setBudgetType('total');
    setBudgetReservePercent(10);
    setMaximizeExperience(false);
    setNumPeople(2);
    setDurationHours(6);
    setStartTime('11:00');
    setEndTime('17:00');
    setStartLocation('');
    setIndoorOnly(false);
    setSelectedCategories(['food', 'activities']);
    setDietaryOptions(['vegetarian']);
    setMode('date');
    setFeasibilityError(null);
  };

  // Effective Total Budget calculation
  const effectiveTotalBudget = budgetType === 'per_person' ? budgetAmount * numPeople : budgetAmount;
  const targetSpendLimit = maximizeExperience
    ? effectiveTotalBudget
    : Math.round(effectiveTotalBudget * (1 - budgetReservePercent / 100));
  const reserveAmount = effectiveTotalBudget - targetSpendLimit;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setFeasibilityError(null);

    const prefs: PlanningPreferences = {
      date,
      startTime,
      endTime,
      city,
      area,
      startLocation: startLocation.trim() || undefined,
      numPeople,
      budgetTotal: effectiveTotalBudget,
      budgetType,
      budgetReservePercent,
      maximizeExperience,
      ageGroup: 'young_adults',
      mode,
      transportMode,
      dietary: dietaryOptions,
      tags: selectedTags,
      naturalPrompt,
      requiredCategories: selectedCategories.length > 0 ? selectedCategories : undefined,
      indoorOnly
    };

    // Simulate high-speed AI optimization & candidate verification
    await new Promise((r) => setTimeout(r, 650));

    const result = ItineraryEngine.optimizeItinerary(prefs);

    if (!result.isFeasible) {
      setFeasibilityError(
        result.feasibilityExplanation ||
          `Unable to satisfy budget (₹${effectiveTotalBudget}) and duration constraints. Please adjust your criteria.`
      );
      setIsGenerating(false);
      return;
    }

    setPlanResult(result);
    setIsGenerating(false);
    navigate('/my-day');
  };

  return (
    <div style={{ padding: '36px 0 80px 0' }}>
      <div className="container-dayly" style={{ maxWidth: 880 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span className="badge badge-cyan" style={{ marginBottom: 6 }}>
            Itinerary Sequencing & Feasibility Engine
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800 }}>
            Plan Your Day Itinerary
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              marginTop: 6,
              maxWidth: 600,
              margin: '6px auto 0'
            }}
          >
            Strict budget compliance, automatic transit time calculations, and verified venue opening hours.
          </p>
        </div>

        {/* Natural Language Prompt Dock */}
        <div
          style={{
            padding: '20px 24px',
            borderRadius: '12px',
            marginBottom: 24,
            background: '#131720',
            border: '1px solid #232A38',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
              Describe your day in plain language
            </label>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Press Enter or click Parse to auto-fill form
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="e.g. 6 hours in Delhi, ₹1,500 total budget for 3 people with food and karting"
              value={naturalPrompt}
              onChange={(e) => setNaturalPrompt(e.target.value)}
              onKeyDown={handlePromptKeyDown}
              className="input-field"
              style={{ fontSize: '0.92rem', padding: '12px 16px' }}
            />
            <button
              type="button"
              onClick={() => applyNaturalPrompt(naturalPrompt)}
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap', padding: '0 18px', borderRadius: '6px' }}
              title="Parse intent into form"
            >
              Parse
            </button>
          </div>

          {/* Extracted preferences chips dock */}
          {naturalPrompt && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #1E2532' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Extracted Criteria:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: '0.76rem' }}>
                <span className="badge badge-cyan">{durationHours} Hours Duration</span>
                <span className="badge badge-emerald">
                  ₹{budgetAmount} ({budgetType === 'total' ? 'Total' : 'Per Person'})
                </span>
                <span className="badge badge-violet">{numPeople} People</span>
                {startLocation && <span className="badge badge-amber">From {startLocation}</span>}
                {indoorOnly && <span className="badge badge-pink">Indoor Only</span>}
                {selectedCategories.map((c) => (
                  <span key={c} className="badge" style={{ background: '#181E29', border: '1px solid #283142' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compact Planning Control Panel */}
        <div className="glass-panel" style={{ padding: '32px 30px', borderRadius: 26, marginBottom: 26 }}>
          {/* Section 1: Logistics (Location & Time) */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="var(--lavender-electric)" />
              1. Where & When
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Starting Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hauz Khas Village, Saket, CP"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
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
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Quick Duration Chips */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Total Available Time: <strong style={{ color: '#FFFFFF' }}>{durationHours} Hours</strong> (Ends around {endTime})
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: '4 Hours', hours: 4 },
                  { label: '6 Hours', hours: 6 },
                  { label: '8 Hours', hours: 8 },
                  { label: 'Half Day (5h)', hours: 5 },
                  { label: 'Full Day (9h)', hours: 9 }
                ].map((chip) => (
                  <button
                    type="button"
                    key={chip.label}
                    onClick={() => handleDurationChip(chip.hours)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 12,
                      border: durationHours === chip.hours ? '1px solid var(--lavender-electric)' : '1px solid rgba(255,255,255,0.1)',
                      background: durationHours === chip.hours ? 'rgba(167, 139, 250, 0.22)' : 'rgba(255,255,255,0.04)',
                      color: durationHours === chip.hours ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Budget & Group Size */}
          <div style={{ marginBottom: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wallet size={18} color="var(--cyan-accent)" />
              2. Budget & Group Size
            </h3>

            {/* Group size buttons */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Number of People
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 6].map((count) => (
                  <button
                    type="button"
                    key={count}
                    onClick={() => setNumPeople(count)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 12,
                      border: numPeople === count ? '1px solid var(--cyan-accent)' : '1px solid rgba(255,255,255,0.1)',
                      background: numPeople === count ? 'rgba(6, 182, 212, 0.20)' : 'rgba(255,255,255,0.04)',
                      color: numPeople === count ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    {count === 1 ? 'Solo (1)' : count === 2 ? 'Pair (2)' : `${count} Guests`}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Type Toggle & Input */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <label style={{ fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Enter Budget: <strong style={{ color: 'var(--cyan-accent)', fontSize: '1.1rem' }}>₹{budgetAmount}</strong>
                </label>

                {/* Radio for Budget Definition */}
                <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    type="button"
                    onClick={() => setBudgetType('total')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 99,
                      border: 'none',
                      background: budgetType === 'total' ? 'var(--cyan-accent)' : 'transparent',
                      color: budgetType === 'total' ? '#000000' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      cursor: 'pointer'
                    }}
                  >
                    Total Group Budget
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetType('per_person')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 99,
                      border: 'none',
                      background: budgetType === 'per_person' ? 'var(--cyan-accent)' : 'transparent',
                      color: budgetType === 'per_person' ? '#000000' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      cursor: 'pointer'
                    }}
                  >
                    Budget Per Person
                  </button>
                </div>
              </div>

              {/* Quick Budget Chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {[
                  { label: 'Under ₹500', val: 500 },
                  { label: 'Under ₹1,000', val: 1000 },
                  { label: 'Under ₹2,000', val: 2000 },
                  { label: 'Under ₹5,000', val: 5000 }
                ].map((b) => (
                  <button
                    type="button"
                    key={b.label}
                    onClick={() => handleBudgetChip(b.val)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      border: budgetAmount === b.val ? '1px solid var(--cyan-accent)' : '1px solid rgba(255,255,255,0.08)',
                      background: budgetAmount === b.val ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: budgetAmount === b.val ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.80rem',
                      fontWeight: 600
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Slider for Budget */}
              <input
                type="range"
                min={500}
                max={10000}
                step={250}
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyan-accent)', cursor: 'pointer' }}
              />

              {/* Budget transparency summary card */}
              <div
                style={{
                  marginTop: 12,
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                  fontSize: '0.80rem'
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Effective Total Budget: </span>
                  <strong style={{ color: '#FFFFFF' }}>₹{effectiveTotalBudget}</strong>
                  {budgetType === 'per_person' && (
                    <span style={{ color: 'var(--text-secondary)' }}> (₹{budgetAmount} × {numPeople} guests)</span>
                  )}
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Target Spend: </span>
                  <strong style={{ color: '#6EE7B7' }}>~₹{targetSpendLimit}</strong>
                  <span style={{ color: 'var(--text-secondary)' }}> • Reserve: ₹{reserveAmount} ({budgetReservePercent}%)</span>
                </div>
              </div>
            </div>

            {/* Budget Buffer / Maximize Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="maximizeExp"
                  checked={maximizeExperience}
                  onChange={(e) => setMaximizeExperience(e.target.checked)}
                  style={{ accentColor: 'var(--lavender-electric)', cursor: 'pointer' }}
                />
                <label htmlFor="maximizeExp" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Maximize experience (Use full budget without leaving 10% reserve)
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="indoorOnlyToggle"
                  checked={indoorOnly}
                  onChange={(e) => setIndoorOnly(e.target.checked)}
                  style={{ accentColor: 'var(--pink-soft)', cursor: 'pointer' }}
                />
                <label htmlFor="indoorOnlyToggle" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Rain mode / Indoor AC only
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Activities & Desired Categories */}
          <div style={{ marginBottom: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} color="var(--pink-soft)" />
              3. Desired Activities & Must-Haves
            </h3>

            {/* Activity category chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {[
                { id: 'food', label: '🍜 Food & Dining' },
                { id: 'movies', label: '🎬 Movies & Cinema' },
                { id: 'activities', label: '🕹️ Gaming & VR' },
                { id: 'workshops', label: '🎨 Workshops & Pottery' },
                { id: 'culture', label: '🏛️ Museums & Heritage' },
                { id: 'shopping', label: '🛍️ Shopping & Bazaars' },
                { id: 'outdoor', label: '🌿 Nature & Parks' },
                { id: 'sports', label: '🏎️ Adventure & Racing' },
                { id: 'nightlife', label: '🍸 Nightlife & Jazz' }
              ].map((cat) => {
                const active = selectedCategories.includes(cat.id as ExperienceCategory);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id as ExperienceCategory)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 99,
                      border: active ? '1px solid var(--pink-soft)' : '1px solid rgba(255,255,255,0.09)',
                      background: active ? 'rgba(236, 72, 153, 0.20)' : 'rgba(255,255,255,0.04)',
                      color: active ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      transition: 'all 0.18s ease'
                    }}
                  >
                    {active ? '✓ ' : '+ '} {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Transport Mode Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Primary Transport Mode (Travel duration is automatically calculated)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { id: 'car', icon: Car, label: 'Car / Cab' },
                  { id: 'metro', icon: Train, label: 'Delhi Metro' },
                  { id: 'bike', icon: Bike, label: 'Bike' },
                  { id: 'walking', icon: Footprints, label: 'Walking' }
                ].map((m) => {
                  const Icon = m.icon;
                  const active = transportMode === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setTransportMode(m.id as any)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 12,
                        border: active ? '1px solid var(--lavender-electric)' : '1px solid rgba(255,255,255,0.08)',
                        background: active ? 'rgba(167, 139, 250, 0.22)' : 'rgba(255,255,255,0.03)',
                        color: active ? '#FFFFFF' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        fontWeight: 600,
                        fontSize: '0.82rem'
                      }}
                    >
                      <Icon size={14} /> {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Feasibility Error Banner if any */}
          {feasibilityError && (
            <div
              style={{
                marginBottom: 20,
                padding: '14px 18px',
                borderRadius: 16,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.40)',
                color: '#FCA5A5',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: '0.85rem'
              }}
            >
              <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
              <div>
                <strong>Constraint Conflict:</strong> {feasibilityError}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} /> Reset
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="btn btn-primary btn-lg"
              style={{ borderRadius: 99, padding: '16px 36px', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <Sparkles size={18} />
              {isGenerating ? 'Synthesizing & Verifying Route...' : 'Generate 3 Verified Itineraries'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
