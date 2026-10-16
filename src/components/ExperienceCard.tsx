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
    <div
      className="glass-card glass-card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '22px'
      }}
    >
      {/* Image container */}
      <div style={{ position: 'relative', width: '100%', height: 215, overflow: 'hidden' }}>
        <img
          src={experience.images[0]}
          alt={experience.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />

        {/* Cinematic Translucent Shadow Gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(11, 16, 32, 0.45) 0%, transparent 45%, rgba(11, 16, 32, 0.95) 100%)'
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
            alignItems: 'center',
            zIndex: 2
          }}
        >
          <span
            className="badge badge-violet"
            style={{
              backdropFilter: 'blur(12px)',
              background: 'rgba(17, 26, 46, 0.75)',
              border: '1px solid rgba(167, 139, 250, 0.35)',
              color: 'var(--lavender-electric)'
            }}
          >
            {experience.category}
          </span>

          {/* Glass Heart Wishlist Button */}
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
              background: 'rgba(11, 16, 32, 0.70)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isSaved ? '#F43F5E' : '#FFFFFF',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.85)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          >
            <Heart size={17} fill={isSaved ? '#F43F5E' : 'none'} />
          </button>
        </div>

        {/* Rating and Duration pill at bottom of image */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            right: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            zIndex: 2
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(11, 16, 32, 0.75)',
              backdropFilter: 'blur(12px)',
              padding: '4px 9px',
              borderRadius: 99,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FCD34D',
              fontWeight: 700
            }}
          >
            <Star size={12} fill="#FCD34D" />
            <span>{experience.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({experience.reviewCount})</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(11, 16, 32, 0.75)',
              backdropFilter: 'blur(12px)',
              padding: '4px 9px',
              borderRadius: 99,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)'
            }}
          >
            <Clock size={12} />
            <span>{experience.durationMinutes} mins</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to={`/experience/${experience.id}`}>
          <h3
            style={{
              fontSize: '1.18rem',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: 4,
              letterSpacing: '-0.02em',
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
            lineHeight: 1.5,
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
            gap: 6,
            fontSize: '0.80rem',
            color: 'var(--text-muted)',
            marginBottom: 14
          }}
        >
          <MapPin size={13} color="var(--lavender-electric)" />
          <span>{experience.venue.area}, {experience.venue.city}</span>
        </div>

        {/* Frosted Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {experience.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.72rem',
                padding: '3px 9px',
                borderRadius: 99,
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Availability status capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            marginBottom: 16,
            padding: '8px 12px',
            background: 'rgba(11, 16, 32, 0.55)',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Slots Status:</span>
          {hasSoldOut && !hasAvailable ? (
            <span style={{ color: '#FDA4AF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Hourglass size={12} /> Waitlist (DAYLY Queue Open)
            </span>
          ) : (
            <span style={{ color: '#6EE7B7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              ● Live Booking Open
            </span>
          )}
        </div>

        {/* Pricing & CTA Actions */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 14,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Starting from</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
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
                borderRadius: '50%',
                color: isInActiveDay ? '#34D399' : 'var(--text-primary)',
                borderColor: isInActiveDay ? 'rgba(16, 185, 129, 0.45)' : undefined,
                background: isInActiveDay ? 'rgba(16, 185, 129, 0.15)' : undefined
              }}
            >
              {isInActiveDay ? <Check size={18} /> : <Plus size={18} />}
            </button>

            {/* Book or View Details Button */}
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
