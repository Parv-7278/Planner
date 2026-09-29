import {
  DayItinerary,
  ItineraryItem,
  TravelLeg,
  PlanningPreferences,
  Experience,
  DayPlanningMode
} from '../types';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';

const STORAGE_KEY_ACTIVE_DAY = 'dayly_active_itinerary';
const STORAGE_KEY_SAVED_DAYS = 'dayly_saved_itineraries';

// Calculate distance in km between two lat/lng coordinates (Haversine Formula)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.max(0.8, Math.round(d * 10) / 10);
}

// Convert minutes from midnight to "HH:MM AM/PM"
export function minutesToTimeString(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
  return `${hours12}:${paddedMins} ${ampm}`;
}

// Convert "HH:MM" or "HH:MM AM/PM" to minutes from midnight
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 720;
  const trimmed = timeStr.trim();
  const isPM = /pm/i.test(trimmed);
  const isAM = /am/i.test(trimmed);
  const clean = trimmed.replace(/[ap]m/i, '').trim();
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10) || 12;
  const m = parseInt(mStr, 10) || 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

export class ItineraryEngine {
  // Generate Travel Legs between consecutive items
  static generateTravelLegs(
    items: ItineraryItem[],
    transportMode: 'car' | 'metro' | 'walking' | 'bike' = 'car'
  ): TravelLeg[] {
    const legs: TravelLeg[] = [];

    for (let i = 0; i < items.length - 1; i++) {
      const current = items[i].experience;
      const next = items[i + 1].experience;

      const dist = calculateDistanceKm(
        current.venue.lat,
        current.venue.lng,
        next.venue.lat,
        next.venue.lng
      );

      let speedKmH = 22; // city car with traffic
      let costPerKm = 18;
      let traffic: 'light' | 'moderate' | 'heavy' = 'moderate';

      if (transportMode === 'metro') {
        speedKmH = 32;
        costPerKm = 6;
        traffic = 'light';
      } else if (transportMode === 'walking') {
        speedKmH = 4.5;
        costPerKm = 0;
        traffic = 'light';
      } else if (transportMode === 'bike') {
        speedKmH = 16;
        costPerKm = 4;
        traffic = 'moderate';
      }

      const travelMins = Math.max(12, Math.round((dist / speedKmH) * 60) + 5); // +5 min parking/buffer
      const estCost = Math.round(dist * costPerKm + 30);

      legs.push({
        fromItemId: items[i].id,
        toItemId: items[i + 1].id,
        fromLocation: current.venue.name,
        toLocation: next.venue.name,
        distanceKm: dist,
        travelMinutes: travelMins,
        transportMode,
        estimatedCost: estCost,
        trafficStatus: traffic
      });
    }

    return legs;
  }

  // Multi-step chronological planner respecting opening hours, buffer time, and conflicts
  static buildPlan(prefs: PlanningPreferences): DayItinerary {
    const startMins = timeStringToMinutes(prefs.startTime || '11:00');
    const endMins = timeStringToMinutes(prefs.endTime || '22:00');
    const totalDayWindow = Math.max(180, endMins - startMins);

    // Filter candidate experiences matching preferences
    let candidates = [...MOCK_EXPERIENCES];

    if (prefs.dietary && prefs.dietary.length > 0) {
      candidates = candidates.filter((exp) => {
        if (exp.category !== 'food') return true;
        return exp.dietaryOptions?.some((opt) => prefs.dietary?.includes(opt));
      });
    }

    // Filter by mode priorities
    const modePriority: Record<DayPlanningMode, string[]> = {
      date: ['romantic', 'date', 'fine dining', 'aesthetic', 'pottery', 'movie', 'cocktails'],
      friends: ['gaming', 'friends', 'vr', 'street food', 'racing', 'live music', 'cafe'],
      family: ['family', 'kids', 'interactive', 'picnic', 'museum', 'heritage'],
      solo: ['peaceful', 'books', 'art', 'cycling', 'coffee', 'spa', 'reading'],
      kids: ['kids', 'interactive', 'fun', 'picnic', 'museum'],
      tourist: ['heritage', 'monument', 'culture', 'street food', 'handicrafts', 'photography'],
      foodie: ['street food', 'fine dining', 'cafe', 'food tour', 'tasting'],
      adventure: ['adventure', 'racing', 'cycling', 'thrill', 'sports'],
      relax: ['relaxation', 'spa', 'picnic', 'nature', 'peaceful', 'reading'],
      culture: ['culture', 'museum', 'theatre', 'art', 'heritage'],
      night_out: ['nightlife', 'cocktails', 'live music', 'party', 'fine dining'],
      budget_day: ['free', 'heritage', 'monument', 'picnic', 'street food', 'books'],
      custom: []
    };

    const targetTags = modePriority[prefs.mode] || [];

    // Sort by relevance to tags and rating
    candidates.sort((a, b) => {
      const matchA = a.tags.filter((t) => targetTags.includes(t)).length;
      const matchB = b.tags.filter((t) => targetTags.includes(t)).length;
      if (matchA !== matchB) return matchB - matchA;
      return b.rating - a.rating;
    });

    // Pick 3-5 complementary experiences without category redundancy (e.g., max 1 movie, max 2 food)
    const selectedExperiences: Experience[] = [];
    const usedCategories: Record<string, number> = {};

    for (const exp of candidates) {
      const catCount = usedCategories[exp.category] || 0;
      if (exp.category === 'food' && catCount >= 2) continue;
      if (exp.category !== 'food' && catCount >= 1) continue;

      selectedExperiences.push(exp);
      usedCategories[exp.category] = catCount + 1;
      if (selectedExperiences.length >= 4) break;
    }

    // If still less than 3, add top rated experiences
    if (selectedExperiences.length < 3) {
      for (const exp of MOCK_EXPERIENCES) {
        if (!selectedExperiences.find((s) => s.id === exp.id)) {
          selectedExperiences.push(exp);
          if (selectedExperiences.length >= 4) break;
        }
      }
    }

    // Schedule chronologically with conflict prevention and travel buffer
    let currentClockMins = startMins;
    const items: ItineraryItem[] = [];

    for (let i = 0; i < selectedExperiences.length; i++) {
      const exp = selectedExperiences[i];
      const duration = exp.durationMinutes;

      // Check if we will exceed user's end time
      if (currentClockMins + duration > endMins + 30 && items.length >= 2) {
        break;
      }

      const itemStartTimeStr = minutesToTimeString(currentClockMins);
      const itemEndTimeStr = minutesToTimeString(currentClockMins + duration);
      const slot = exp.slots[0] || { id: 's-default', time: itemStartTimeStr };

      items.push({
        id: `item-${Date.now()}-${i}`,
        experience: exp,
        startTime: itemStartTimeStr,
        endTime: itemEndTimeStr,
        durationMinutes: duration,
        selectedSlotId: slot.id,
        isBooked: false
      });

      // Advance clock: duration + 20-30 min travel/buffer to next spot
      const travelBuffer = i < selectedExperiences.length - 1 ? 25 : 0;
      currentClockMins += duration + travelBuffer;
    }

    const legs = this.generateTravelLegs(items, prefs.transportMode);

    // Calculate totals
    const totalCost = items.reduce(
      (sum, item) => sum + item.experience.pricePerPerson * prefs.numPeople,
      0
    );
    const totalDist = legs.reduce((sum, leg) => sum + leg.distanceKm, 0);

    const titleMap: Record<DayPlanningMode, string> = {
      date: 'Romantic Sunset Date Day',
      friends: 'High-Energy Weekend Outing',
      family: 'Fun Family Day Out in Delhi',
      solo: 'Soulful Solo City Escape',
      kids: 'Playful Kids Discovery Day',
      tourist: 'Delhi Icons & Flavours Walk',
      foodie: 'The Ultimate Gastronomy Trail',
      adventure: 'Adrenaline & High-Speed Day',
      relax: 'Zen Rejuvenation Sunday',
      culture: 'Art, Heritage & Theatrical Day',
      night_out: 'Glitz, Jazz & Nightlife Hop',
      budget_day: 'Smart Budget City Explorer',
      custom: 'Custom Curated Dayly Plan'
    };

    const itinerary: DayItinerary = {
      id: `plan-${Date.now()}`,
      title: titleMap[prefs.mode] || 'My Perfect DAYLY',
      date: prefs.date || 'Today',
      city: prefs.city || 'Delhi NCR',
      area: prefs.area,
      items,
      travelLegs: legs,
      totalCost,
      totalDurationMinutes: Math.min(totalDayWindow, currentClockMins - startMins),
      totalDistanceKm: Math.round(totalDist * 10) / 10,
      numActivities: items.length,
      numBookings: 0,
      mode: prefs.mode,
      createdAt: new Date().toISOString()
    };

    this.saveActiveDay(itinerary);
    return itinerary;
  }

  // "Surprise Me" Day Generator
  static generateSurpriseDay(budget: number = 3500, numPeople: number = 2): DayItinerary {
    const modes: DayPlanningMode[] = ['date', 'friends', 'culture', 'foodie', 'adventure', 'relax'];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];

    return this.buildPlan({
      date: 'Today',
      startTime: '11:30',
      endTime: '21:30',
      city: 'Delhi NCR',
      area: 'South Delhi & CP',
      numPeople,
      budgetTotal: budget,
      ageGroup: 'young_adults',
      mode: randomMode,
      transportMode: 'car',
      tags: ['spontaneous', 'surprise', 'popular']
    });
  }

  // What If? Simulation Engine
  static simulateWhatIf(
    currentPlan: DayItinerary,
    scenario:
      | 'remove_movie'
      | 'increase_budget'
      | 'start_later'
      | 'rain_mode'
      | 'sold_out_replace'
      | 'custom',
    customPrompt?: string
  ): DayItinerary {
    const clone: DayItinerary = JSON.parse(JSON.stringify(currentPlan));
    clone.id = `plan-whatif-${Date.now()}`;

    if (scenario === 'remove_movie') {
      clone.items = clone.items.filter((item) => item.experience.category !== 'movies');
      clone.title = `${currentPlan.title} (No Movie)`;
    } else if (scenario === 'start_later') {
      // Shift all times 2 hours forward (120 mins)
      clone.items.forEach((item) => {
        const start = timeStringToMinutes(item.startTime) + 120;
        const end = timeStringToMinutes(item.endTime) + 120;
        item.startTime = minutesToTimeString(start);
        item.endTime = minutesToTimeString(end);
      });
      clone.title = `${currentPlan.title} (+2hr Late Start)`;
    } else if (scenario === 'rain_mode') {
      // Replace any outdoor activities with indoor experiences
      const indoorReplacements = MOCK_EXPERIENCES.filter((e) => e.weatherFit === 'indoor_only');
      clone.items = clone.items.map((item, idx) => {
        if (item.experience.weatherFit === 'pleasant_outdoor') {
          const replacement = indoorReplacements[idx % indoorReplacements.length];
          return {
            ...item,
            experience: replacement,
            selectedSlotId: replacement.slots[0]?.id || 's-1'
          };
        }
        return item;
      });
      clone.title = `☔ Rainy Day Edition: ${currentPlan.title}`;
    } else if (scenario === 'sold_out_replace' && clone.items.length > 0) {
      // Simulate swapping the 2nd activity with an available top-rated alternative
      const alternatives = this.getReplacementsFor(clone.items[0].experience);
      if (alternatives.length > 0) {
        clone.items[0].experience = alternatives[0];
        clone.items[0].selectedSlotId = alternatives[0].slots[0].id;
      }
      clone.title = `${currentPlan.title} (Auto-Swapped Alternative)`;
    }

    // Recalculate legs & totals
    clone.travelLegs = this.generateTravelLegs(clone.items, 'car');
    clone.totalCost = clone.items.reduce(
      (sum, item) => sum + item.experience.pricePerPerson * 2,
      0
    );
    clone.totalDistanceKm = Math.round(
      clone.travelLegs.reduce((s, l) => s + l.distanceKm, 0) * 10
    ) / 10;
    clone.numActivities = clone.items.length;

    this.saveActiveDay(clone);
    return clone;
  }

  // Intelligent Rescheduling: Find nearby, high-rated replacements for a cancelled/sold-out experience
  static getReplacementsFor(target: Experience): Experience[] {
    return MOCK_EXPERIENCES.filter(
      (exp) =>
        exp.id !== target.id &&
        (exp.category === target.category || exp.tags.some((t) => target.tags.includes(t))) &&
        exp.slots.some((s) => s.status === 'available' || s.status === 'few_left')
    ).slice(0, 3);
  }

  // Storage helpers
  static getActiveDay(): DayItinerary {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_DAY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }

    // Default rich sample day ready for the user to explore immediately!
    const defaultPrefs: PlanningPreferences = {
      date: 'Today',
      startTime: '12:00',
      endTime: '21:30',
      city: 'Delhi NCR',
      area: 'Hauz Khas & Mehrauli',
      numPeople: 2,
      budgetTotal: 4000,
      ageGroup: 'young_adults',
      mode: 'date',
      transportMode: 'car',
      tags: ['romantic', 'pottery', 'fine dining', 'aesthetic']
    };

    return this.buildPlan(defaultPrefs);
  }

  static saveActiveDay(itinerary: DayItinerary): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_DAY, JSON.stringify(itinerary));
    } catch (e) {
      console.error(e);
    }
  }

  static getSavedDays(): DayItinerary[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED_DAYS);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  }

  static saveToMyDays(itinerary: DayItinerary): void {
    const list = this.getSavedDays();
    const existingIdx = list.findIndex((d) => d.id === itinerary.id);
    if (existingIdx >= 0) {
      list[existingIdx] = itinerary;
    } else {
      list.unshift(itinerary);
    }
    localStorage.setItem(STORAGE_KEY_SAVED_DAYS, JSON.stringify(list));
  }
}
