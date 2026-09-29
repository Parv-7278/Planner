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
  onBookClick,
  onQueueClick
}) => {
  const { wishlistIds, toggleWishlist, activeDay, addExperienceToActiveDay } = useApp();

  const isSaved = wishlistIds.includes(experience.id);
  const isInActiveDay = activeDay.items.some((item) => item.experience.id === experience.id);

  // Check slot availability state
  const hasSoldOut = experience.slots.some((s) => s.status === 'sold_out' || s.status === 'waitlist');
  const hasAvailable = experience.slots.some((s) => s.status === 'available' || s.status === 'few_left');

  return (
    <div className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Image container */}
      <div style={{ position: 'relative', width: '100%', height: 210, overflow: 'hidden' }}>
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
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(10,11,18,0.9) 100%)'
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span className="badge badge-coral" style={{ backdropFilter: 'blur(8px)' }}>
            {experience.category}
          </span>

          {/* Heart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(experience.id);
            }}
            aria-label="Save to wishlist"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(10, 11, 18, 0.65)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isSaved ? '#ff4d6d' : '#ffffff',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.85)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          >
            <Heart size={18} fill={isSaved ? '#ff4d6d' : 'none'} />
          </button>
        </div>

        {/* Rating and Duration at bottom of image */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 14,
            right: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(0,0,0,0.7)',
              padding: '3px 8px',
              borderRadius: 99,
              color: '#fbbf24',
              fontWeight: 700
            }}
          >
            <Star size={13} fill="#fbbf24" />
            <span>{experience.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({experience.reviewCount})</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(0,0,0,0.7)',
              padding: '3px 8px',
              borderRadius: 99,
              color: 'var(--text-secondary)'
            }}
          >
            <Clock size={12} />
            <span>{experience.durationMinutes} mins</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to={`/experience/${experience.id}`}>
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: 4,
              transition: 'color 0.2s'
            }}
          >
            {experience.name}
          </h3>
        </Link>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: 12,
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {experience.tagline}
        </p>

        {/* Location & Metro */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: 14
          }}
        >
          <MapPin size={13} color="var(--coral-500)" />
          <span>{experience.venue.area}, {experience.venue.city}</span>
        </div>

        {/* Feature tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {experience.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: 99,
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Slot status teaser */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            marginBottom: 16,
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 10,
            border: '1px solid var(--border-subtle)'
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Slots Today:</span>
          {hasSoldOut && !hasAvailable ? (
            <span style={{ color: '#fb7185', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Hourglass size={12} /> Sold out (DAYLY Queue Open)
            </span>
          ) : (
            <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              ● Instant Slots Available
            </span>
          )}
        </div>

        {/* Pricing & CTA Actions */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starting from</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              ₹{experience.pricePerPerson}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}> / person</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
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
                width: 38,
                height: 38,
                padding: 0,
                color: isInActiveDay ? '#34d399' : 'var(--text-primary)',
                borderColor: isInActiveDay ? 'rgba(16,185,129,0.4)' : undefined
              }}
            >
              {isInActiveDay ? <Check size={18} /> : <Plus size={18} />}
            </button>

            {/* Book or View Details */}
            {onBookClick ? (
              <button onClick={() => onBookClick(experience)} className="btn btn-primary btn-sm">
                <Ticket size={14} />
                Book Now
              </button>
            ) : (
              <Link to={`/experience/${experience.id}`} className="btn btn-primary btn-sm">
                View Slots
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
