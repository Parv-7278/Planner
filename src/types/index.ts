export type ExperienceCategory =
  | 'food'
  | 'movies'
  | 'activities'
  | 'workshops'
  | 'culture'
  | 'outdoor'
  | 'sports'
  | 'shopping'
  | 'relaxation'
  | 'nightlife'
  | 'family'
  | 'dates';

export type ExperienceSubcategory =
  | 'restaurant'
  | 'cafe'
  | 'bakery'
  | 'street-food'
  | 'fine-dining'
  | 'buffet'
  | 'food-tour'
  | 'movie'
  | 'theatre'
  | 'concert'
  | 'comedy'
  | 'live-music'
  | 'bowling'
  | 'arcade'
  | 'gaming'
  | 'escape-room'
  | 'vr'
  | 'go-karting'
  | 'paintball'
  | 'pottery'
  | 'painting'
  | 'handicraft'
  | 'cooking'
  | 'dance'
  | 'music-jam'
  | 'museum'
  | 'gallery'
  | 'monument'
  | 'heritage-walk'
  | 'park'
  | 'picnic'
  | 'trekking'
  | 'cycling'
  | 'boating'
  | 'badminton'
  | 'cricket'
  | 'football'
  | 'tennis'
  | 'mall'
  | 'bookstore'
  | 'flea-market'
  | 'spa'
  | 'wellness'
  | 'lounge'
  | 'club'
  | 'zoo'
  | 'theme-park';

export type SlotStatus = 'available' | 'few_left' | 'sold_out' | 'waitlist';

export interface AvailabilitySlot {
  id: string;
  time: string; // e.g. "12:30 PM"
  rawTime: string; // e.g. "12:30"
  availableSeats: number;
  price: number;
  status: SlotStatus;
  waitlistLength?: number;
}

export interface Venue {
  id: string;
  name: string;
  area: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  metroStation?: string;
  parkingAvailable: boolean;
}

export interface ExperienceReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Experience {
  id: string;
  name: string;
  tagline: string;
  category: ExperienceCategory;
  subcategory: ExperienceSubcategory;
  description: string;
  images: string[];
  venue: Venue;
  pricePerPerson: number;
  durationMinutes: number;
  rating: number;
  reviewCount: number;
  openingHours: string;
  closingHours: string;
  ageRestriction?: string;
  dietaryOptions?: ('vegetarian' | 'vegan' | 'halal' | 'jain')[];
  tags: string[];
  features: string[]; // e.g. ["Indoor AC", "Valet Parking", "Wheelchair Accessible"]
  whatIsIncluded: string[];
  whatToBring: string[];
  cancellationPolicy: string;
  slots: AvailabilitySlot[];
  trendingScore: number;
  weatherFit: 'all' | 'indoor_only' | 'pleasant_outdoor' | 'night_only';
}

export interface ItineraryItem {
  id: string;
  experience: Experience;
  startTime: string; // "12:00 PM"
  endTime: string;   // "01:30 PM"
  durationMinutes: number;
  selectedSlotId: string;
  isBooked: boolean;
  bookingId?: string;
  notes?: string;
  customTimeChosen?: boolean;
}

export interface TravelLeg {
  fromItemId: string;
  toItemId: string;
  fromLocation: string;
  toLocation: string;
  distanceKm: number;
  travelMinutes: number;
  transportMode: 'car' | 'metro' | 'walking' | 'bike';
  estimatedCost: number;
  trafficStatus: 'light' | 'moderate' | 'heavy';
}

export interface DayItinerary {
  id: string;
  title: string;
  date: string;
  city: string;
  area?: string;
  items: ItineraryItem[];
  travelLegs: TravelLeg[];
  totalCost: number;
  totalDurationMinutes: number;
  totalDistanceKm: number;
  numActivities: number;
  numBookings: number;
  mode: DayPlanningMode;
  createdAt: string;
}

export type DayPlanningMode =
  | 'custom'
  | 'date'
  | 'friends'
  | 'family'
  | 'solo'
  | 'kids'
  | 'tourist'
  | 'foodie'
  | 'adventure'
  | 'relax'
  | 'culture'
  | 'night_out'
  | 'budget_day';

export interface PlanningPreferences {
  date: string;
  startTime: string; // "10:00"
  endTime: string;   // "22:00"
  city: string;
  area: string;
  numPeople: number;
  budgetTotal: number;
  ageGroup: 'all' | 'teens' | 'young_adults' | 'family_with_kids' | 'seniors';
  mode: DayPlanningMode;
  transportMode: 'car' | 'metro' | 'walking' | 'bike';
  dietary?: ('vegetarian' | 'vegan' | 'halal' | 'jain')[];
  tags: string[]; // e.g. "pet friendly", "indoor only", "romantic"
  naturalPrompt?: string;
}

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  experienceId: string;
  experienceName: string;
  category: ExperienceCategory;
  date: string;
  timeSlot: string;
  numPeople: number;
  totalAmount: number;
  venueName: string;
  venueAddress: string;
  qrCodeUrl: string;
  bookingCode: string;
  status: BookingStatus;
  createdAt: string;
  cancellationPolicy: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  seatsOrTable?: string;
}

export interface QueueEntry {
  id: string;
  experienceId: string;
  experienceName: string;
  experienceImage: string;
  venueName: string;
  slotTime: string;
  slotDate: string;
  partySize: number;
  currentPosition: number;
  initialPosition: number;
  estimatedWaitMinutes: number;
  status: 'monitoring' | 'slot_available' | 'booked' | 'expired' | 'left';
  autoBook: boolean;
  joinedAt: string;
  availableUntil?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'queue' | 'booking' | 'traffic' | 'itinerary' | 'weather' | 'system';
  actionUrl?: string;
  actionText?: string;
}

export interface GroupVoteItem {
  experienceId: string;
  upvotes: number;
  downvotes: number;
  voterNames: string[];
}

export interface GroupSession {
  id: string;
  title: string;
  creatorName: string;
  passcode: string;
  participants: string[];
  votes: Record<string, { up: number; down: number; users: Record<string, 'up' | 'down'> }>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  savedPlaces: string[];
  wishlistIds: string[];
  preferredCity: string;
  preferredCategories: ExperienceCategory[];
  budgetTier: 'budget' | 'moderate' | 'luxury';
  dietaryPreference: string;
}
