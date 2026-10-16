import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Ticket,
  ChevronUp,
  ChevronDown,
  Trash2,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  Star,
  ExternalLink
} from 'lucide-react';
import { ItineraryItem } from '../types';
import { useApp } from '../context/AppContext';
import { RescheduleModal } from './RescheduleModal';
import { BookingModal } from './BookingModal';

interface TimelineCardProps {
  item: ItineraryItem;
  index: number;
  totalItems: number;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ item, index, totalItems }) => {
  const {
    activeDay,
    removeActivityFromDay,
    shiftActivityTime,
    moveActivityPosition,
    bookings
  } = useApp();

  const [showReschedule, setShowReschedule] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const people = item.numPeople || activeDay.numPeople || 2;
  const cost = item.itemCost ?? (item.experience.pricePerPerson * people);

  // Check if item is already booked
  const isBooked = bookings.some(
    (b) => b.experienceId === item.experience.id && b.status === 'confirmed'
  );

  return (
    <>
      <div
        className="glass-card"
        style={{
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          borderRadius: '24px',
          border: isBooked ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(255, 255, 255, 0.11)',
          boxShadow: isBooked ? '0 8px 32px rgba(0, 0, 0, 0.35), 0 0 20px rgba(16, 185, 129, 0.15)' : undefined
        }}
      >
        {/* Top Time and Badges Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Time badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(167, 139, 250, 0.15)',
                color: 'var(--lavender-electric)',
                border: '1px solid rgba(167, 139, 250, 0.35)',
                padding: '5px 14px',
                borderRadius: 99,
                fontWeight: 700,
                fontSize: '0.85rem',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Clock size={14} />
              <span>{item.startTime} – {item.endTime}</span>
            </div>

            <span className="badge badge-violet" style={{ fontSize: '0.72rem' }}>
              {item.experience.category}
            </span>

            {item.experience.openingHours && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Open: {item.experience.openingHours} – {item.experience.closingHours}
              </span>
            )}
          </div>

          {/* Booking status badge */}
          {isBooked ? (
            <span className="badge badge-emerald">
              <CheckCircle2 size={13} /> Booked & Confirmed
            </span>
          ) : (
            <span className="badge badge-amber">
              ● Pending Booking
            </span>
          )}
        </div>

        {/* Middle Details Grid */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <img
            src={item.experience.images[0]}
            alt={item.experience.name}
            style={{
              width: 105,
              height: 105,
              borderRadius: 16,
              objectFit: 'cover',
              flexShrink: 0,
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          />

          <div style={{ flex: 1 }}>
            <Link to={`/experience/${item.experience.id}`}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.02em' }}>
                {item.experience.name}
              </h3>
            </Link>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.45 }}>
              {item.experience.tagline}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '0.80rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={13} color="var(--lavender-electric)" />
                {item.experience.venue.name}, {item.experience.venue.area}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FCD34D' }}>
                <Star size={13} fill="#FCD34D" />
                <strong>{item.experience.rating}</strong>
              </span>
              <span>Duration: {item.durationMinutes} mins</span>
              <strong style={{ color: '#FFFFFF' }}>
                ₹{cost} ({people} {people === 1 ? 'guest' : 'guests'} • ₹{item.experience.pricePerPerson}/ea)
              </strong>
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div
          style={{
            paddingTop: 14,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          {/* Time nudging and order moving */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Earlier / Later time adjust */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 99,
                padding: '3px 6px'
              }}
            >
              <button
                onClick={() => shiftActivityTime(item.id, -30)}
                className="btn btn-ghost btn-sm"
                title="Move 30 minutes earlier"
                style={{ padding: '4px 8px', fontSize: '0.75rem', height: 28 }}
              >
                <Minus size={12} /> 30m
              </button>
              <button
                onClick={() => shiftActivityTime(item.id, 30)}
                className="btn btn-ghost btn-sm"
                title="Move 30 minutes later"
                style={{ padding: '4px 8px', fontSize: '0.75rem', height: 28 }}
              >
                <Plus size={12} /> 30m
              </button>
            </div>

            {/* Reorder Up / Down */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                disabled={index === 0}
                onClick={() => moveActivityPosition(index, index - 1)}
                className="btn btn-secondary btn-sm"
                title="Move up"
                style={{ width: 30, height: 30, padding: 0, borderRadius: '50%', opacity: index === 0 ? 0.3 : 1 }}
              >
                <ChevronUp size={14} />
              </button>
              <button
                disabled={index === totalItems - 1}
                onClick={() => moveActivityPosition(index, index + 1)}
                className="btn btn-secondary btn-sm"
                title="Move down"
                style={{ width: 30, height: 30, padding: 0, borderRadius: '50%', opacity: index === totalItems - 1 ? 0.3 : 1 }}
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Replace Button */}
            <button
              onClick={() => setShowReschedule(true)}
              className="btn btn-secondary btn-sm"
              title="Replace with nearby alternative"
              style={{ fontSize: '0.78rem', height: 30, padding: '0 12px' }}
            >
              <RefreshCw size={12} /> Swap
            </button>

            {/* Remove Button */}
            <button
              onClick={() => removeActivityFromDay(item.id)}
              className="btn btn-ghost btn-sm"
              title="Remove from itinerary"
              style={{ color: '#FDA4AF', height: 30, padding: '0 8px' }}
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Primary CTA: Book or View */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to={`/experience/${item.experience.id}`} className="btn btn-secondary btn-sm">
              <ExternalLink size={13} /> Details
            </Link>

            {!isBooked && (
              <button onClick={() => setShowBooking(true)} className="btn btn-primary btn-sm">
                <Ticket size={13} /> Book Slot
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showReschedule && (
        <RescheduleModal item={item} onClose={() => setShowReschedule(false)} />
      )}

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal
          experience={item.experience}
          initialSlotId={item.selectedSlotId}
          onClose={() => setShowBooking(false)}
        />
      )}
    </>
  );
};
