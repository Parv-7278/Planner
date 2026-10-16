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
  ArrowLeft,
  Bot
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
          style={{ marginBottom: 20, padding: 0, color: 'var(--text-secondary)' }}
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
            marginBottom: 36,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: 'var(--shadow-lg)'
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
                    borderRadius: 14,
                    border: '1px solid rgba(255, 255, 255, 0.09)'
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span className="badge badge-violet">{experience.category}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FCD34D', fontSize: '0.9rem', fontWeight: 700 }}>
                  <Star size={16} fill="#FCD34D" />
                  <span>{experience.rating}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({experience.reviewCount} reviews)</span>
                </div>
              </div>

              <h1 style={{ fontSize: 'clamp(2.1rem, 3.8vw, 3rem)', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.025em' }}>
                {experience.name}
              </h1>

              <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 18 }}>
                {experience.tagline}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <MapPin size={16} color="var(--lavender-electric)" />
                <span>{experience.venue.address}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 12 }}>About This Experience</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {experience.description}
              </p>
            </div>

            {/* Features & Amenities */}
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 14 }}>Venue Facilities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {experience.features.map((feat) => (
                  <span
                    key={feat}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Check size={14} color="#34D399" /> {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* What is Included & What to Bring */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div className="glass-card" style={{ padding: 22, borderRadius: 20 }}>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: 12, color: '#34D399' }}>
                  What is Included
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  {experience.whatIsIncluded.map((inc) => (
                    <li key={inc} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={14} color="#34D399" /> {inc}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card" style={{ padding: 22, borderRadius: 20 }}>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: 12, color: '#FCD34D' }}>
                  What to Bring
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
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
                padding: '18px 22px',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                gap: 14
              }}
            >
              <ShieldCheck size={22} color="#34D399" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#FFFFFF', display: 'block' }}>
                  DAYLY Flexible Cancellation Guarantee
                </strong>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {experience.cancellationPolicy}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Slot Booking Card */}
          <div
            className="glass-panel"
            style={{
              padding: '30px',
              position: 'sticky',
              top: 90,
              boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              borderRadius: 24
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ticket Price</span>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#FFFFFF' }}>
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
                  color: isSaved ? '#F43F5E' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <Heart size={18} fill={isSaved ? '#F43F5E' : 'none'} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* Time Slots Selector */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Available Slots Today
                </label>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Duration: {experience.durationMinutes}m
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {experience.slots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const isSoldOut = slot.status === 'sold_out';
                  const isWaitlist = slot.status === 'waitlist';

                  return (
                    <div
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      style={{
                        padding: '13px 18px',
                        borderRadius: 16,
                        border: isSelected
                          ? '1px solid var(--lavender-electric)'
                          : '1px solid rgba(255,255,255,0.09)',
                        background: isSelected
                          ? 'rgba(167, 139, 250, 0.18)'
                          : 'rgba(255,255,255,0.03)',
                        boxShadow: isSelected
                          ? '0 0 16px rgba(167, 139, 250, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                          : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.96rem', color: '#FFFFFF', display: 'block' }}>
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
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Bot size={18} /> Start AI Queue Assistant (#{selectedSlot.waitlistLength || 37})
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
                {isInActiveDay ? <Check size={16} color="#34D399" /> : <Plus size={16} />}
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
