import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Clock, MapPin, Plus, Check, Ticket, Hourglass } from 'lucide-react';
import { Experience } from '../types';
import { useApp } from '../context/AppContext';

interface ExperienceCardProps {
  experience: Experience;
  onBookClick?: (exp: Experience) => void;
  onQueueClick?: (exp: Experience) => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onBookClick
}) => {
  const { wishlistIds, toggleWishlist, activeDay, addExperienceToActiveDay } = useApp();

  const isSaved = wishlistIds.includes(experience.id);
  const isInActiveDay = activeDay.items.some((item) => item.experience.id === experience.id);

  const hasSoldOut = experience.slots.some((s) => s.status === 'sold_out' || s.status === 'waitlist');
  const hasAvailable = experience.slots.some((s) => s.status === 'available' || s.status === 'few_left');

  return (
    <div
      className="glass-card glass-card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        background: '#131720',
        border: '1px solid #232A38'
      }}
    >
      {/* Visual Header */}
      <div style={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', borderBottom: '1px solid #202736' }}>
        <img
          src={experience.images[0]}
          alt={experience.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />

        {/* Category Badge & Save Button */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2
          }}
        >
          <span
            className="badge"
            style={{
              background: '#0E1218E6',
              border: '1px solid #283142',
              color: '#F3F4F6',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px'
            }}
          >
            {experience.category.replace('_', ' ')}
          </span>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(experience.id);
            }}
            aria-label="Save to wishlist"
            style={{
              width: 30,
              height: 30,
              borderRadius: '6px',
              background: '#0E1218E6',
              border: '1px solid #283142',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isSaved ? '#EF4444' : '#9CA3AF',
              transition: 'all 0.15s ease'
            }}
          >
            <Heart size={15} fill={isSaved ? '#EF4444' : 'none'} />
          </button>
        </div>

        {/* Rating and Duration info pill */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 10,
            right: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            zIndex: 2
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#0E1218EE',
              padding: '3px 7px',
              borderRadius: '4px',
              border: '1px solid #232A38',
              color: '#FBBF24',
              fontWeight: 700
            }}
          >
            <Star size={11} fill="#FBBF24" />
            <span>{experience.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({experience.reviewCount})</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#0E1218EE',
              padding: '3px 7px',
              borderRadius: '4px',
              border: '1px solid #232A38',
              color: 'var(--text-secondary)'
            }}
          >
            <Clock size={11} />
            <span>{experience.durationMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to={`/experience/${experience.id}`}>
          <h3
            style={{
              fontSize: '1.08rem',
              fontWeight: 700,
              color: 'var(--text-white)',
              marginBottom: 4,
              letterSpacing: '-0.02em',
              transition: 'color 0.15s'
            }}
          >
            {experience.name}
          </h3>
        </Link>

        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginBottom: 10,
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {experience.tagline}
        </p>

        {/* Location Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: 12
          }}
        >
          <MapPin size={12} color="var(--brand-primary)" />
          <span>{experience.venue.area}, {experience.venue.city}</span>
        </div>

        {/* Slot Availability Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            marginBottom: 14,
            padding: '6px 10px',
            background: '#0E1218',
            borderRadius: '6px',
            border: '1px solid #1E2533'
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Status:</span>
          {hasSoldOut && !hasAvailable ? (
            <span style={{ color: '#FBBF24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Hourglass size={11} /> Waitlist (Queue Bot Ready)
            </span>
          ) : (
            <span style={{ color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
              Slots Available Today
            </span>
          )}
        </div>

        {/* Pricing & CTA Actions */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid #1F2634',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', display: 'block' }}>From</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              ₹{experience.pricePerPerson}
              <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)' }}> / person</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {/* Add to Day Button */}
            <button
              onClick={() => {
                if (!isInActiveDay) {
                  addExperienceToActiveDay(experience);
                }
              }}
              className="btn btn-secondary btn-sm"
              title={isInActiveDay ? 'Added to My Day' : 'Add to Day Itinerary'}
              style={{
                width: 32,
                height: 32,
                padding: 0,
                borderRadius: '6px',
                color: isInActiveDay ? '#34D399' : 'var(--text-primary)',
                borderColor: isInActiveDay ? 'rgba(16, 185, 129, 0.45)' : undefined,
                background: isInActiveDay ? 'rgba(16, 185, 129, 0.15)' : undefined
              }}
            >
              {isInActiveDay ? <Check size={15} /> : <Plus size={15} />}
            </button>

            {/* Book or View Details Button */}
            {onBookClick ? (
              <button onClick={() => onBookClick(experience)} className="btn btn-primary btn-sm">
                <Ticket size={13} />
                Book
              </button>
            ) : (
              <Link to={`/experience/${experience.id}`} className="btn btn-primary btn-sm">
                Slots
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
