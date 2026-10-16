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
      <div className="modal-box" style={{ maxWidth: 660, borderRadius: 26 }} onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '20px 24px',
            borderBottom: '1px solid var(--glass-panel-border)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <Search size={22} color="var(--lavender-electric)" />
          <input
            type="text"
            placeholder="Search experiences, vibes, areas or try 'cheap date'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '1.15rem',
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
        <div style={{ padding: '14px 24px', background: 'rgba(11, 16, 32, 0.55)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Sparkles size={14} color="var(--lavender-electric)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Try natural queries:
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {samplePrompts.map((p) => (
              <button
                key={p}
                onClick={() => setQuery(p)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 99,
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(167, 139, 250, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.4)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results List */}
        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '16px 20px' }}>
          {query.trim() === '' ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)' }}>Type to search 50+ curated experiences in Delhi NCR</p>
              <p style={{ fontSize: '0.82rem', marginTop: 4, color: 'var(--text-muted)' }}>
                Restaurants, cinemas, workshops, heritage, sports & nightlife
              </p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '44px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                No exact matches for "{query}"
              </p>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 6 }}>
                Try searching for "pottery", "fine dining", "escape room" or "date"
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => handleSelect(exp)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '14px 16px',
                    borderRadius: 16,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(167, 139, 250, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <img
                    src={exp.images[0]}
                    alt={exp.name}
                    style={{ width: 62, height: 62, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-violet" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
                        {exp.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.8rem', color: '#FCD34D' }}>
                        <Star size={12} fill="#FCD34D" />
                        <span style={{ fontWeight: 700 }}>{exp.rating}</span>
                      </div>
                    </div>
                    <h5 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>{exp.name}</h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.80rem', color: 'var(--text-muted)', marginTop: 3 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} color="var(--lavender-electric)" /> {exp.venue.area}
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
