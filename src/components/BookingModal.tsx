import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  CreditCard,
  QrCode,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Ticket
} from 'lucide-react';
import { Experience, AvailabilitySlot, Booking } from '../types';
import { BookingManager } from '../services/bookingAdapters';
import { useApp } from '../context/AppContext';

interface BookingModalProps {
  experience: Experience;
  initialSlotId?: string;
  onClose: () => void;
  onSuccess?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  experience,
  initialSlotId,
  onClose,
  onSuccess
}) => {
  const { refreshBookings } = useApp();

  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [selectedDate, setSelectedDate] = useState('2026-09-30');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    initialSlotId || experience.slots.find((s) => s.status !== 'sold_out')?.id || experience.slots[0].id
  );
  const [partySize, setPartySize] = useState<number>(2);
  const [name, setName] = useState('Parv Gupta');
  const [email, setEmail] = useState('parv@example.com');
  const [phone, setPhone] = useState('+91 98112 34567');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'apple_pay'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const selectedSlot = experience.slots.find((s) => s.id === selectedSlotId) || experience.slots[0];
  const totalPrice = selectedSlot.price * partySize;
  const convenienceFee = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + convenienceFee;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment gateway delay (1.2s)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const booking = await BookingManager.book({
        experienceId: experience.id,
        slotId: selectedSlot.id,
        date: selectedDate,
        numPeople: partySize,
        attendeeName: name,
        attendeeEmail: email,
        attendeePhone: phone,
        seatsOrTable: specialRequests ? `Custom Notes: ${specialRequests}` : undefined
      });

      setConfirmedBooking(booking);
      refreshBookings();
      setStep('confirmed');

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onSuccess) onSuccess(booking);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span className="badge badge-coral" style={{ fontSize: '0.68rem', marginBottom: 4 }}>
              {step === 'confirmed' ? 'Booking Confirmed' : 'Universal Booking Engine'}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{experience.name}</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: Details */}
        {step === 'details' && (
          <form onSubmit={handleProceedToPayment} style={{ padding: '24px' }}>
            {/* Date selection */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Select Date
              </label>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                {[
                  { label: 'Today', date: '2026-09-29' },
                  { label: 'Tomorrow', date: '2026-09-30' },
                  { label: 'This Sat', date: '2026-10-03' },
                  { label: 'This Sun', date: '2026-10-04' }
                ].map((d) => (
                  <button
                    type="button"
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 12,
                      border: selectedDate === d.date ? '1px solid var(--coral-500)' : '1px solid var(--border-subtle)',
                      background: selectedDate === d.date ? 'rgba(255, 77, 109, 0.15)' : 'rgba(255,255,255,0.04)',
                      color: selectedDate === d.date ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot selection */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Available Time Slots
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                {experience.slots.map((slot) => {
                  const isSoldOut = slot.status === 'sold_out';
                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <button
                      type="button"
                      key={slot.id}
                      disabled={isSoldOut}
                      onClick={() => setSelectedSlotId(slot.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 12,
                        border: isSelected
                          ? '1px solid var(--coral-500)'
                          : '1px solid var(--border-subtle)',
                        background: isSelected
                          ? 'rgba(255, 77, 109, 0.18)'
                          : isSoldOut
                          ? 'rgba(255,255,255,0.02)'
                          : 'rgba(255,255,255,0.05)',
                        color: isSoldOut ? 'var(--text-muted)' : '#fff',
                        cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        opacity: isSoldOut ? 0.45 : 1
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{slot.time}</div>
                      <div style={{ fontSize: '0.72rem', marginTop: 2 }}>
                        {isSoldOut ? 'Sold Out' : `₹${slot.price}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guests count */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Number of Guests / Tickets
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button
                  type="button"
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  className="btn btn-secondary btn-sm"
                  style={{ width: 38, height: 38, padding: 0 }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{partySize} Guests</span>
                <button
                  type="button"
                  onClick={() => setPartySize(Math.min(10, partySize + 1))}
                  className="btn btn-secondary btn-sm"
                  style={{ width: 38, height: 38, padding: 0 }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Attendee Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Email for Tickets & QR
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Price Preview */}
            <div
              style={{
                marginTop: 20,
                padding: '14px 18px',
                borderRadius: 14,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated Total</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>₹{grandTotal}</div>
              </div>
              <button type="submit" className="btn btn-primary">
                Continue to Payment <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Mock Payment */}
        {step === 'payment' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Payment Method</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Safe simulated sandbox checkout (No real money deducted)
              </p>
            </div>

            {/* Payment Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'upi', label: 'UPI / Google Pay / PhonePe', desc: 'Instant zero-fee direct reservation' },
                { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay, Amex' },
                { id: 'apple_pay', label: 'Net Banking / Pay Later', desc: 'HDFC, ICICI, SBI & top banks' }
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id as any)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: paymentMethod === opt.id ? '1px solid var(--coral-500)' : '1px solid var(--border-subtle)',
                    background: paymentMethod === opt.id ? 'rgba(255, 77, 109, 0.12)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <CreditCard size={20} color={paymentMethod === opt.id ? 'var(--coral-500)' : 'var(--text-muted)'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: paymentMethod === opt.id ? '5px solid var(--coral-500)' : '2px solid var(--border-subtle)',
                      background: '#fff'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 14,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                marginBottom: 20,
                fontSize: '0.88rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--text-secondary)' }}>
                <span>Tickets ({partySize}x ₹{selectedSlot.price})</span>
                <span>₹{totalPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--text-secondary)' }}>
                <span>Booking & Venue Service Fee</span>
                <span>₹{convenienceFee}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                <span>Total Due</span>
                <span style={{ color: 'var(--coral-500)' }}>₹{grandTotal}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={isProcessing}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {isProcessing ? 'Confirming Reservation...' : `Pay ₹${grandTotal} & Book`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmed */}
        {step === 'confirmed' && confirmedBooking && (
          <div style={{ padding: '28px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: '#10b981'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>Reservation Confirmed!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              Sent to {confirmedBooking.attendeeEmail} and saved in My Bookings.
            </p>

            {/* Ticket Card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px dashed rgba(255,255,255,0.2)',
                borderRadius: 18,
                padding: '20px',
                textAlign: 'left',
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking ID</span>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{confirmedBooking.bookingCode}</div>
                </div>
                <span className="badge badge-emerald">CONFIRMED</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14, fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Date & Slot</span>
                  <strong>{confirmedBooking.date} • {confirmedBooking.timeSlot}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Attendees</span>
                  <strong>{confirmedBooking.numPeople} Guests ({confirmedBooking.attendeeName})</strong>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Venue Location</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{confirmedBooking.venueAddress}</span>
              </div>

              {/* QR Code */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px',
                  background: '#ffffff',
                  borderRadius: 12,
                  color: '#000'
                }}
              >
                <img
                  src={confirmedBooking.qrCodeUrl}
                  alt="Pass QR"
                  style={{ width: 68, height: 68, borderRadius: 6 }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Scan at Venue Turnstile</div>
                  <div style={{ fontSize: '0.75rem', color: '#444' }}>
                    Show this digital pass to the concierge for instant access.
                  </div>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
              Done & View Itinerary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
