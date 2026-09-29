import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Sparkles, Star, MapPin, Tag, ArrowRight } from 'lucide-react';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';
import { Experience } from '../types';

interface SearchModalProps {
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const samplePrompts = [
    'cheap date',
    'pottery near me',
    'movie + dinner',
    'indoor activities',
    'things to do tonight',
    'adventurous'
  ];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    return MOCK_EXPERIENCES.filter((exp) => {
      // Natural language / semantic matching
      if (q.includes('pottery') && exp.tags.includes('pottery')) return true;
      if (q.includes('cheap') && exp.pricePerPerson <= 500) return true;
      if (q.includes('date') && exp.tags.includes('date')) return true;
      if (q.includes('indoor') && exp.weatherFit === 'indoor_only') return true;
      if (q.includes('tonight') && exp.closingHours.includes('PM')) return true;
      if (q.includes('movie') && exp.category === 'movies') return true;
      if (q.includes('dinner') && (exp.category === 'food' || exp.category === 'nightlife')) return true;

      // Direct text matching
      return (
        exp.name.toLowerCase().includes(q) ||
        exp.tagline.toLowerCase().includes(q) ||
        exp.category.toLowerCase().includes(q) ||
        exp.venue.name.toLowerCase().includes(q) ||
        exp.venue.area.toLowerCase().includes(q) ||
        exp.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query]);

  const handleSelect = (exp: Experience) => {
    onClose();
    navigate(`/experience/${exp.id}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <Search size={22} color="var(--coral-500)" />
          <input
            type="text"
            placeholder="Search experiences, categories, vibes, or try 'cheap date'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 500
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Quick sample prompt pills */}
        <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Sparkles size={14} color="var(--violet-500)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Try natural queries:
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {samplePrompts.map((p) => (
              <button
                key={p}
                onClick={() => setQuery(p)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 99,
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  padding: '4px 10px',
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results List */}
        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '12px 16px' }}>
          {query.trim() === '' ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.95rem' }}>Type to search 50+ curated experiences in Delhi NCR</p>
              <p style={{ fontSize: '0.8rem', marginTop: 4 }}>
                Restaurants, cinemas, workshops, heritage, sports & nightlife
              </p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                No exact matches for "{query}"
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6 }}>
                Try searching for "pottery", "fine dining", "escape room" or "date"
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => handleSelect(exp)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 12,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.borderColor = 'rgba(255,77,109,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <img
                    src={exp.images[0]}
                    alt={exp.name}
                    style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-coral" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {exp.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.8rem', color: '#fbbf24' }}>
                        <Star size={12} fill="#fbbf24" />
                        <span style={{ fontWeight: 700 }}>{exp.rating}</span>
                      </div>
                    </div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 3 }}>{exp.name}</h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} /> {exp.venue.area}
                      </span>
                      <span>₹{exp.pricePerPerson}/person</span>
                    </div>
                  </div>
                  <ArrowRight size={18} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
