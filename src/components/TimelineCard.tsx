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
    removeActivityFromDay,
    shiftActivityTime,
    moveActivityPosition,
    bookings
  } = useApp();

  const [showReschedule, setShowReschedule] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  // Check if item is already booked
  const isBooked = bookings.some(
    (b) => b.experienceId === item.experience.id && b.status === 'confirmed'
  );

  return (
    <>
      <div
        className="glass-card"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'rgba(20, 22, 40, 0.75)',
          border: isBooked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)'
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
                background: 'rgba(255, 77, 109, 0.15)',
                color: '#ff6b87',
                border: '1px solid rgba(255, 77, 109, 0.3)',
                padding: '4px 12px',
                borderRadius: 99,
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              <Clock size={14} />
              <span>{item.startTime} – {item.endTime}</span>
            </div>

            <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>
              {item.experience.category}
            </span>
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
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <img
            src={item.experience.images[0]}
            alt={item.experience.name}
            style={{ width: 100, height: 100, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }}
          />

          <div style={{ flex: 1 }}>
            <Link to={`/experience/${item.experience.id}`}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                {item.experience.name}
              </h3>
            </Link>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
              {item.experience.tagline}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} color="var(--coral-500)" />
                {item.experience.venue.name}, {item.experience.venue.area}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#fbbf24' }}>
                <Star size={13} fill="#fbbf24" />
                <strong>{item.experience.rating}</strong>
              </span>
              <span>Duration: {item.durationMinutes} mins</span>
              <strong style={{ color: '#fff' }}>₹{item.experience.pricePerPerson * 2} (for 2)</strong>
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div
          style={{
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          {/* Time nudging and order moving */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Earlier / Later time adjust */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 99, padding: '2px 6px' }}>
              <button
                onClick={() => shiftActivityTime(item.id, -30)}
                className="btn btn-ghost btn-sm"
                title="Move 30 minutes earlier"
                style={{ padding: '4px 6px', fontSize: '0.75rem', height: 28 }}
              >
                <Minus size={12} /> 30m
              </button>
              <button
                onClick={() => shiftActivityTime(item.id, 30)}
                className="btn btn-ghost btn-sm"
                title="Move 30 minutes later"
                style={{ padding: '4px 6px', fontSize: '0.75rem', height: 28 }}
              >
                <Plus size={12} /> 30m
              </button>
            </div>

            {/* Reorder Up / Down */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button
                disabled={index === 0}
                onClick={() => moveActivityPosition(index, index - 1)}
                className="btn btn-secondary btn-sm"
                title="Move up"
                style={{ width: 28, height: 28, padding: 0, opacity: index === 0 ? 0.3 : 1 }}
              >
                <ChevronUp size={14} />
              </button>
              <button
                disabled={index === totalItems - 1}
                onClick={() => moveActivityPosition(index, index + 1)}
                className="btn btn-secondary btn-sm"
                title="Move down"
                style={{ width: 28, height: 28, padding: 0, opacity: index === totalItems - 1 ? 0.3 : 1 }}
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Replace Button */}
            <button
              onClick={() => setShowReschedule(true)}
              className="btn btn-secondary btn-sm"
              title="Replace with nearby alternative"
              style={{ fontSize: '0.78rem', height: 28, padding: '0 10px' }}
            >
              <RefreshCw size={12} /> Swap
            </button>

            {/* Remove Button */}
            <button
              onClick={() => removeActivityFromDay(item.id)}
              className="btn btn-ghost btn-sm"
              title="Remove from itinerary"
              style={{ color: '#fb7185', height: 28, padding: '0 8px' }}
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
