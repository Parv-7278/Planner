import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  MapPin,
  Clock,
  Sparkles,
  Hourglass,
  Tag
} from 'lucide-react';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';
import { ExperienceCard } from '../components/ExperienceCard';
import { BookingModal } from '../components/BookingModal';
import { VirtualQueueModal } from '../components/VirtualQueueModal';
import { Experience, ExperienceCategory, AvailabilitySlot } from '../types';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected category from url or default 'all'
  const initialCategory = (searchParams.get('category') as ExperienceCategory) || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [minRating, setMinRating] = useState<number>(4.0);
  const [weatherFit, setWeatherFit] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  // Modals state
  const [bookingExp, setBookingExp] = useState<Experience | null>(null);
  const [queueModalData, setQueueModalData] = useState<{ exp: Experience; slot: AvailabilitySlot } | null>(null);

  const categories = [
    { id: 'all', label: 'All Experiences' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'movies', label: 'Cinema & Plays' },
    { id: 'activities', label: 'Gaming & VR' },
    { id: 'workshops', label: 'Craft & Pottery' },
    { id: 'culture', label: 'Museums & Art' },
    { id: 'outdoor', label: 'Nature & Parks' },
    { id: 'sports', label: 'Sports & Racing' },
    { id: 'shopping', label: 'Markets & Bazaars' },
    { id: 'relaxation', label: 'Spas & Wellness' },
    { id: 'nightlife', label: 'Nightlife & Jazz' },
    { id: 'family', label: 'Family & Kids' },
    { id: 'dates', label: 'Romantic Dates' }
  ];

  const filteredExperiences = useMemo(() => {
    return MOCK_EXPERIENCES.filter((exp) => {
      // Category filter
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          exp.name.toLowerCase().includes(q) ||
          exp.tagline.toLowerCase().includes(q) ||
          exp.venue.name.toLowerCase().includes(q) ||
          exp.venue.area.toLowerCase().includes(q) ||
          exp.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Max price
      if (exp.pricePerPerson > maxPrice) return false;

      // Min rating
      if (exp.rating < minRating) return false;

      // Weather fit
      if (weatherFit !== 'all' && exp.weatherFit !== weatherFit) return false;

      // Availability filter
      if (availabilityFilter === 'available') {
        const hasOpen = exp.slots.some((s) => s.status === 'available' || s.status === 'few_left');
        if (!hasOpen) return false;
      } else if (availabilityFilter === 'waitlist') {
        const hasWaitlist = exp.slots.some((s) => s.status === 'sold_out' || s.status === 'waitlist');
        if (!hasWaitlist) return false;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, maxPrice, minRating, weatherFit, availabilityFilter]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container-dayly">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <span className="badge badge-violet" style={{ marginBottom: 6 }}>
            Curated Discovery
          </span>
          <h1 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3rem)', fontWeight: 900 }}>
            Discover Top Experiences
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 6 }}>
            Explore verified activities across Delhi NCR with live availability and slot booking.
          </p>
        </div>

        {/* Category Horizontal Scrolling Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 14,
            marginBottom: 26,
            scrollbarWidth: 'none'
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`pill-filter ${selectedCategory === cat.id ? 'pill-filter-active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div
          className="glass-panel"
          style={{
            padding: '22px 24px',
            marginBottom: 36,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 18,
            alignItems: 'center',
            borderRadius: 22
          }}
        >
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="var(--lavender-electric)"
              style={{ position: 'absolute', left: 14, top: 15 }}
            />
            <input
              type="text"
              placeholder="Search keyword, tag, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 40 }}
            />
          </div>

          {/* Max Price Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Max Price / Person</span>
              <strong style={{ color: '#FFFFFF' }}>₹{maxPrice}</strong>
            </div>
            <input
              type="range"
              min={200}
              max={4000}
              step={200}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--lavender-electric)', cursor: 'pointer' }}
            />
          </div>

          {/* Min Rating */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>
              Minimum Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="input-field"
              style={{ padding: '9px 12px', fontSize: '0.85rem' }}
            >
              <option value={4.0} style={{ background: '#111A2E' }}>★ 4.0 & above</option>
              <option value={4.5} style={{ background: '#111A2E' }}>★ 4.5 & above (Top Tier)</option>
              <option value={4.8} style={{ background: '#111A2E' }}>★ 4.8 & above (Exceptional)</option>
            </select>
          </div>

          {/* Indoor / Outdoor */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>
              Environment
            </label>
            <select
              value={weatherFit}
              onChange={(e) => setWeatherFit(e.target.value)}
              className="input-field"
              style={{ padding: '9px 12px', fontSize: '0.85rem' }}
            >
              <option value="all" style={{ background: '#111A2E' }}>All Environments</option>
              <option value="indoor_only" style={{ background: '#111A2E' }}>Indoor AC Only</option>
              <option value="pleasant_outdoor" style={{ background: '#111A2E' }}>Pleasant Outdoor</option>
            </select>
          </div>

          {/* Availability Status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>
              Slot Status
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="input-field"
              style={{ padding: '9px 12px', fontSize: '0.85rem' }}
            >
              <option value="all" style={{ background: '#111A2E' }}>All Slots</option>
              <option value="available" style={{ background: '#111A2E' }}>Instant Available Only</option>
              <option value="waitlist" style={{ background: '#111A2E' }}>DAYLY Virtual Queue Open</option>
            </select>
          </div>
        </div>

        {/* Results Count & Grid */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredExperiences.length}</strong> experiences in Delhi NCR
          </span>
        </div>

        {filteredExperiences.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 24
            }}
          >
            <Compass size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>No experiences match your filters</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 6, maxWidth: 400 }}>
              Try adjusting your price ceiling, minimum rating, or clearing search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setMaxPrice(3500);
                setMinRating(4.0);
              }}
              className="btn btn-secondary"
              style={{ marginTop: 20 }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid-cards">
            {filteredExperiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                onBookClick={(e) => setBookingExp(e)}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {bookingExp && (
          <BookingModal experience={bookingExp} onClose={() => setBookingExp(null)} />
        )}

        {queueModalData && (
          <VirtualQueueModal
            experience={queueModalData.exp}
            slot={queueModalData.slot}
            onClose={() => setQueueModalData(null)}
          />
        )}
      </div>
    </div>
  );
};
