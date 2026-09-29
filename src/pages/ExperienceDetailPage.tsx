import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  MapPin,
  Calendar,
  ShieldCheck,
  Check,
  Plus,
  Heart,
  Share2,
  Navigation,
  Hourglass,
  Ticket,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';
import { useApp } from '../context/AppContext';
import { BookingModal } from '../components/BookingModal';
import { VirtualQueueModal } from '../components/VirtualQueueModal';
import { AvailabilitySlot } from '../types';

export const ExperienceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist, activeDay, addExperienceToActiveDay } = useApp();

  const experience = MOCK_EXPERIENCES.find((e) => e.id === id);

  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    experience ? experience.slots[0] : null
  );
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!experience) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Experience not found</h2>
        <Link to="/explore" className="btn btn-primary" style={{ marginTop: 16 }}>
          Back to Explore
        </Link>
      </div>
    );
  }

  const isSaved = wishlistIds.includes(experience.id);
  const isInActiveDay = activeDay.items.some((it) => it.experience.id === experience.id);

  const handleSlotClick = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
  };

  const handlePrimaryAction = () => {
    if (!selectedSlot) return;
    if (selectedSlot.status === 'sold_out' || selectedSlot.status === 'waitlist') {
      setShowQueueModal(true);
    } else {
      setShowBookingModal(true);
    }
  };

  return (
    <div style={{ padding: '30px 0 80px 0' }}>
      <div className="container-dayly">
        {/* Back navigation link */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 20, padding: 0 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Gallery / Images Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: experience.images.length > 1 ? '2fr 1fr' : '1fr',
            gap: 16,
            height: 'clamp(280px, 45vh, 480px)',
            borderRadius: 24,
            overflow: 'hidden',
            marginBottom: 32
          }}
        >
          <div style={{ position: 'relative', height: '100%' }}>
            <img
              src={experience.images[activePhotoIdx] || experience.images[0]}
              alt={experience.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {experience.images.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
              {experience.images.slice(1, 3).map((img, idx) => (
                <div
                  key={img}
                  onClick={() => setActivePhotoIdx(idx + 1)}
                  style={{
                    position: 'relative',
                    flex: 1,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    borderRadius: 12
                  }}
                >
                  <img
                    src={img}
                    alt={`${experience.name} preview`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content & Sticky Booking Sidebar Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            alignItems: 'flex-start'
          }}
        >
          {/* Left Column: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="badge badge-coral">{experience.category}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontSize: '0.9rem', fontWeight: 700 }}>
                  <Star size={16} fill="#fbbf24" />
                  <span>{experience.rating}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({experience.reviewCount} reviews)</span>
                </div>
              </div>

              <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 900, marginBottom: 8 }}>
                {experience.name}
              </h1>

              <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                {experience.tagline}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <MapPin size={16} color="var(--coral-500)" />
                <span>{experience.venue.address}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 12 }}>About This Experience</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {experience.description}
              </p>
            </div>

            {/* Features & Amenities */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 14 }}>Venue Facilities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {experience.features.map((feat) => (
                  <span
                    key={feat}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 12,
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Check size={14} color="var(--emerald-500)" /> {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* What is Included & What to Bring */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div className="glass-card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: '#34d399' }}>
                  What is Included
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {experience.whatIsIncluded.map((inc) => (
                    <li key={inc} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={14} color="#34d399" /> {inc}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: '#fbbf24' }}>
                  What to Bring
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {experience.whatToBring.map((br) => (
                    <li key={br} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      • {br}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: 12
              }}
            >
              <ShieldCheck size={20} color="var(--emerald-500)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block' }}>
                  DAYLY Flexible Cancellation Guarantee
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {experience.cancellationPolicy}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Slot Booking Card */}
          <div
            className="glass-panel"
            style={{
              padding: '28px',
              position: 'sticky',
              top: 90,
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket Price</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
                  ₹{selectedSlot ? selectedSlot.price : experience.pricePerPerson}
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}> / person</span>
                </div>
              </div>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(experience.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isSaved ? '#ff4d6d' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <Heart size={18} fill={isSaved ? '#ff4d6d' : 'none'} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* Time Slots Selector */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Available Slots Today
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Duration: {experience.durationMinutes}m
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {experience.slots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const isSoldOut = slot.status === 'sold_out';
                  const isWaitlist = slot.status === 'waitlist';

                  return (
                    <div
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 14,
                        border: isSelected
                          ? '1px solid var(--coral-500)'
                          : '1px solid var(--border-subtle)',
                        background: isSelected
                          ? 'rgba(255, 77, 109, 0.15)'
                          : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block' }}>
                          {slot.time}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ₹{slot.price} per ticket
                        </span>
                      </div>

                      {/* Status Badges */}
                      {isSoldOut ? (
                        <span className="badge badge-rose">
                          <Hourglass size={12} /> Sold Out (Queue Open)
                        </span>
                      ) : isWaitlist ? (
                        <span className="badge badge-amber">
                          <Hourglass size={12} /> Waitlist ({slot.waitlistLength})
                        </span>
                      ) : slot.status === 'few_left' ? (
                        <span className="badge badge-amber">Few Left ({slot.availableSeats})</span>
                      ) : (
                        <span className="badge badge-emerald">Available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedSlot && (selectedSlot.status === 'sold_out' || selectedSlot.status === 'waitlist') ? (
                <button
                  onClick={() => setShowQueueModal(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', background: 'var(--grad-primary)' }}
                >
                  <Hourglass size={16} /> Join DAYLY Queue (#{selectedSlot.waitlistLength || 37})
                </button>
              ) : (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                >
                  <Ticket size={16} /> Book Selected Slot ({selectedSlot?.time})
                </button>
              )}

              {/* Add to Active Day Button */}
              <button
                onClick={() => addExperienceToActiveDay(experience)}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
              >
                {isInActiveDay ? <Check size={16} color="#10b981" /> : <Plus size={16} />}
                {isInActiveDay ? 'Added to My Day' : 'Add Experience to My Day'}
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showBookingModal && (
          <BookingModal
            experience={experience}
            initialSlotId={selectedSlot?.id}
            onClose={() => setShowBookingModal(false)}
          />
        )}

        {showQueueModal && selectedSlot && (
          <VirtualQueueModal
            experience={experience}
            slot={selectedSlot}
            onClose={() => setShowQueueModal(false)}
          />
        )}
      </div>
    </div>
  );
};
