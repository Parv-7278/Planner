import { Experience, AvailabilitySlot, Booking } from '../types';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';

export interface BookingRequest {
  experienceId: string;
  slotId: string;
  date: string;
  numPeople: number;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  seatsOrTable?: string;
}

export interface BookingProvider {
  providerName: string;
  canHandle(experience: Experience): boolean;
  search(query: string): Promise<Experience[]>;
  getAvailability(experienceId: string, date: string): Promise<AvailabilitySlot[]>;
  holdSlot(experienceId: string, slotId: string): Promise<{ holdToken: string; expiresAt: string }>;
  book(request: BookingRequest): Promise<Booking>;
  cancel(bookingId: string): Promise<boolean>;
  getBookingStatus(bookingId: string): Promise<Booking | null>;
}

const STORAGE_KEY_BOOKINGS = 'dayly_bookings_store';

function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to persist bookings', e);
  }
}

// 1. Movie Booking Provider
export class MockMovieProvider implements BookingProvider {
  providerName = 'CinemaMatrix / PVR Adapter';

  canHandle(experience: Experience): boolean {
    return experience.category === 'movies';
  }

  async search(query: string): Promise<Experience[]> {
    return MOCK_EXPERIENCES.filter(
      (e) => e.category === 'movies' && e.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getAvailability(experienceId: string): Promise<AvailabilitySlot[]> {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === experienceId);
    return exp?.slots || [];
  }

  async holdSlot(experienceId: string, slotId: string): Promise<{ holdToken: string; expiresAt: string }> {
    return {
      holdToken: `hold-mov-${experienceId}-${slotId}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    };
  }

  async book(request: BookingRequest): Promise<Booking> {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === request.experienceId);
    if (!exp) throw new Error('Cinema experience not found');

    const slot = exp.slots.find((s) => s.id === request.slotId) || exp.slots[0];
    const total = slot.price * request.numPeople;

    const booking: Booking = {
      id: `BK-MOV-${Math.floor(100000 + Math.random() * 900000)}`,
      experienceId: exp.id,
      experienceName: exp.name,
      category: 'movies',
      date: request.date,
      timeSlot: slot.time,
      numPeople: request.numPeople,
      totalAmount: total,
      venueName: exp.venue.name,
      venueAddress: exp.venue.address,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=DAYLY-BK-${exp.id}-${Date.now()}`,
      bookingCode: `DLY-CIN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      cancellationPolicy: exp.cancellationPolicy,
      attendeeName: request.attendeeName,
      attendeeEmail: request.attendeeEmail,
      attendeePhone: request.attendeePhone,
      seatsOrTable: request.seatsOrTable || 'Recliner Rows C4-C5'
    };

    const bookings = getStoredBookings();
    saveBookings([booking, ...bookings]);
    return booking;
  }

  async cancel(bookingId: string): Promise<boolean> {
    const bookings = getStoredBookings();
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b));
    saveBookings(updated);
    return true;
  }

  async getBookingStatus(bookingId: string): Promise<Booking | null> {
    const bookings = getStoredBookings();
    return bookings.find((b) => b.id === bookingId) || null;
  }
}

// 2. Restaurant Reservation Provider
export class MockRestaurantProvider implements BookingProvider {
  providerName = 'DineConnect Reserve Engine';

  canHandle(experience: Experience): boolean {
    return experience.category === 'food' || experience.category === 'nightlife';
  }

  async search(query: string): Promise<Experience[]> {
    return MOCK_EXPERIENCES.filter(
      (e) => (e.category === 'food' || e.category === 'nightlife') && e.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getAvailability(experienceId: string): Promise<AvailabilitySlot[]> {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === experienceId);
    return exp?.slots || [];
  }

  async holdSlot(experienceId: string, slotId: string): Promise<{ holdToken: string; expiresAt: string }> {
    return {
      holdToken: `dine-hold-${experienceId}-${slotId}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  }

  async book(request: BookingRequest): Promise<Booking> {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === request.experienceId);
    if (!exp) throw new Error('Dining venue not found');

    const slot = exp.slots.find((s) => s.id === request.slotId) || exp.slots[0];
    const total = slot.price * request.numPeople;

    const booking: Booking = {
      id: `BK-DINE-${Math.floor(100000 + Math.random() * 900000)}`,
      experienceId: exp.id,
      experienceName: exp.name,
      category: 'food',
      date: request.date,
      timeSlot: slot.time,
      numPeople: request.numPeople,
      totalAmount: total,
      venueName: exp.venue.name,
      venueAddress: exp.venue.address,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=DAYLY-DINE-${exp.id}`,
      bookingCode: `DLY-TBL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      cancellationPolicy: exp.cancellationPolicy,
      attendeeName: request.attendeeName,
      attendeeEmail: request.attendeeEmail,
      attendeePhone: request.attendeePhone,
      seatsOrTable: request.seatsOrTable || 'Table for ' + request.numPeople + ' (Courtyard / Window)'
    };

    const bookings = getStoredBookings();
    saveBookings([booking, ...bookings]);
    return booking;
  }

  async cancel(bookingId: string): Promise<boolean> {
    const bookings = getStoredBookings();
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b));
    saveBookings(updated);
    return true;
  }

  async getBookingStatus(bookingId: string): Promise<Booking | null> {
    const bookings = getStoredBookings();
    return bookings.find((b) => b.id === bookingId) || null;
  }
}

// 3. Activity & Sports Provider
export class MockActivityProvider implements BookingProvider {
  providerName = 'ActivePass Sports & Escape Integration';

  canHandle(experience: Experience): boolean {
    return experience.category === 'activities' || experience.category === 'sports' || experience.category === 'family';
  }

  async search(query: string): Promise<Experience[]> {
    return MOCK_EXPERIENCES.filter(
      (e) => (e.category === 'activities' || e.category === 'sports') && e.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getAvailability(experienceId: string): Promise<AvailabilitySlot[]> {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === experienceId);
    return exp?.slots || [];
  }

  async holdSlot(experienceId: string, slotId: string) {
    return {
      holdToken: `act-hold-${experienceId}-${slotId}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  }

  async book(request: BookingRequest): Promise<Booking> {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === request.experienceId);
    if (!exp) throw new Error('Activity venue not found');

    const slot = exp.slots.find((s) => s.id === request.slotId) || exp.slots[0];
    const total = slot.price * request.numPeople;

    const booking: Booking = {
      id: `BK-ACT-${Math.floor(100000 + Math.random() * 900000)}`,
      experienceId: exp.id,
      experienceName: exp.name,
      category: exp.category,
      date: request.date,
      timeSlot: slot.time,
      numPeople: request.numPeople,
      totalAmount: total,
      venueName: exp.venue.name,
      venueAddress: exp.venue.address,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=DAYLY-ACT-${exp.id}`,
      bookingCode: `DLY-PASS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      cancellationPolicy: exp.cancellationPolicy,
      attendeeName: request.attendeeName,
      attendeeEmail: request.attendeeEmail,
      attendeePhone: request.attendeePhone,
      seatsOrTable: 'Slot Session Access (Group of ' + request.numPeople + ')'
    };

    const bookings = getStoredBookings();
    saveBookings([booking, ...bookings]);
    return booking;
  }

  async cancel(bookingId: string): Promise<boolean> {
    const bookings = getStoredBookings();
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b));
    saveBookings(updated);
    return true;
  }

  async getBookingStatus(bookingId: string): Promise<Booking | null> {
    const bookings = getStoredBookings();
    return bookings.find((b) => b.id === bookingId) || null;
  }
}

// 4. Workshop & Culture Provider
export class MockWorkshopProvider implements BookingProvider {
  providerName = 'ArtisanPass & Heritage Ticketing';

  canHandle(experience: Experience): boolean {
    return (
      experience.category === 'workshops' ||
      experience.category === 'culture' ||
      experience.category === 'relaxation' ||
      experience.category === 'outdoor' ||
      experience.category === 'shopping' ||
      experience.category === 'dates'
    );
  }

  async search(query: string): Promise<Experience[]> {
    return MOCK_EXPERIENCES.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));
  }

  async getAvailability(experienceId: string): Promise<AvailabilitySlot[]> {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === experienceId);
    return exp?.slots || [];
  }

  async holdSlot(experienceId: string, slotId: string) {
    return {
      holdToken: `wrk-hold-${experienceId}-${slotId}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  }

  async book(request: BookingRequest): Promise<Booking> {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === request.experienceId);
    if (!exp) throw new Error('Experience not found');

    const slot = exp.slots.find((s) => s.id === request.slotId) || exp.slots[0];
    const total = slot.price * request.numPeople;

    const booking: Booking = {
      id: `BK-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      experienceId: exp.id,
      experienceName: exp.name,
      category: exp.category,
      date: request.date,
      timeSlot: slot.time,
      numPeople: request.numPeople,
      totalAmount: total,
      venueName: exp.venue.name,
      venueAddress: exp.venue.address,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=DAYLY-EXP-${exp.id}`,
      bookingCode: `DLY-EVT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      cancellationPolicy: exp.cancellationPolicy,
      attendeeName: request.attendeeName,
      attendeeEmail: request.attendeeEmail,
      attendeePhone: request.attendeePhone,
      seatsOrTable: 'Workshop Stool / Seat Access'
    };

    const bookings = getStoredBookings();
    saveBookings([booking, ...bookings]);
    return booking;
  }

  async cancel(bookingId: string): Promise<boolean> {
    const bookings = getStoredBookings();
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b));
    saveBookings(updated);
    return true;
  }

  async getBookingStatus(bookingId: string): Promise<Booking | null> {
    const bookings = getStoredBookings();
    return bookings.find((b) => b.id === bookingId) || null;
  }
}

// Universal Booking Manager coordinating all providers
export class BookingManager {
  private static providers: BookingProvider[] = [
    new MockMovieProvider(),
    new MockRestaurantProvider(),
    new MockActivityProvider(),
    new MockWorkshopProvider()
  ];

  static getProviderFor(experience: Experience): BookingProvider {
    return (
      this.providers.find((p) => p.canHandle(experience)) ||
      this.providers[this.providers.length - 1]
    );
  }

  static async book(request: BookingRequest): Promise<Booking> {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === request.experienceId);
    if (!exp) throw new Error('Experience not found');
    const provider = this.getProviderFor(exp);
    return provider.book(request);
  }

  static async cancel(bookingId: string): Promise<boolean> {
    const bookings = getStoredBookings();
    const b = bookings.find((item) => item.id === bookingId);
    if (!b) return false;
    const exp = MOCK_EXPERIENCES.find((e) => e.id === b.experienceId);
    const provider = exp ? this.getProviderFor(exp) : this.providers[0];
    return provider.cancel(bookingId);
  }

  static getAllBookings(): Booking[] {
    const stored = getStoredBookings();
    if (stored.length > 0) return stored;

    // Provide initial realistic sample booking so user sees "My Bookings" populated immediately!
    const sample: Booking[] = [
      {
        id: 'BK-SAMPLE-782194',
        experienceId: 'exp-craft-1',
        experienceName: 'The Clay Company - Wheel Pottery Workshop',
        category: 'workshops',
        date: 'Today',
        timeSlot: '02:00 PM',
        numPeople: 2,
        totalAmount: 2200,
        venueName: 'The Clay Company Studio',
        venueAddress: '1st Floor, Building 16, Hauz Khas Village, New Delhi 110016',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=DAYLY-POTTERY-CONFIRMED',
        bookingCode: 'DLY-POT-9941',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        cancellationPolicy: 'Reschedule or cancel up to 4 hours before the session.',
        attendeeName: 'Parv Gupta',
        attendeeEmail: 'parv@example.com',
        attendeePhone: '+91 98112 34567',
        seatsOrTable: 'Pottery Wheels #4 & #5'
      }
    ];
    saveBookings(sample);
    return sample;
  }
}
