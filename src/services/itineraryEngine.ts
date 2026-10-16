import type {
  DayItinerary,
  ItineraryItem,
  TravelLeg,
  PlanningPreferences,
  Experience,
  DayPlanningMode,
  ItineraryValidationResult,
  PlanGenerationResult
} from '../types/index.ts';
import { MOCK_EXPERIENCES } from '../data/mockExperiences.ts';
import { NaturalLanguageService } from './naturalLanguageService.ts';

const STORAGE_KEY_ACTIVE_DAY = 'dayly_active_itinerary';
const STORAGE_KEY_SAVED_DAYS = 'dayly_saved_itineraries';

/**
 * Calculates road-adjusted distance in km between two lat/lng coordinates (Haversine Formula)
 * Multiplies by road winding factor (1.35x) to prevent unrealistic straight-line estimates.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  routeWindingFactor = 1.35
): number {
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
  const straightLine = R * c;
  const roadDistance = straightLine * routeWindingFactor;
  return Math.max(0.8, Math.round(roadDistance * 10) / 10);
}

/**
 * Converts minutes from midnight to "HH:MM AM/PM"
 */
export function minutesToTimeString(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
  return `${hours12}:${paddedMins} ${ampm}`;
}

/**
 * Converts "HH:MM", "H:MM", or "HH:MM AM/PM" to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 720;
  const trimmed = timeStr.trim().toLowerCase();
  const isPM = /pm/.test(trimmed);
  const isAM = /am/.test(trimmed);
  const clean = trimmed.replace(/[ap]m/g, '').trim();
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10) || 12;
  const m = parseInt(mStr, 10) || 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

export class ItineraryEngine {
  /**
   * Parse user natural language input into planning preferences
   */
  static parsePlanningRequest(
    input: string,
    basePrefs?: Partial<PlanningPreferences>
  ): PlanningPreferences {
    return NaturalLanguageService.parsePlanningRequest(input, basePrefs);
  }

  /**
   * Calculate group cost for a single activity
   */
  static calculateActivityCost(exp: Experience, numPeople: number): number {
    const people = Math.max(1, numPeople || 1);
    if (typeof exp.fixedGroupPrice === 'number' && exp.fixedGroupPrice > 0) {
      return exp.fixedGroupPrice + (exp.applicableFees || 0);
    }
    const perPerson = exp.pricePerPerson || 0;
    const fees = exp.applicableFees || 0;
    return perPerson * people + fees;
  }

  /**
   * Calculate transit time & buffer in minutes based on transport mode
   */
  static calculateTravelTime(
    distanceKm: number,
    transportMode: 'car' | 'metro' | 'walking' | 'bike' = 'car'
  ): { travelMinutes: number; bufferMinutes: number } {
    let speedKmH = 22; // city car average with traffic
    let buffer = 6; // parking / pickup

    if (transportMode === 'metro') {
      speedKmH = 30;
      buffer = 8; // walking to station, security, train interval
    } else if (transportMode === 'walking') {
      speedKmH = 4.5;
      buffer = 2;
    } else if (transportMode === 'bike') {
      speedKmH = 16;
      buffer = 3;
    }

    const travelMinutes = Math.max(8, Math.round((distanceKm / speedKmH) * 60));
    return { travelMinutes, bufferMinutes: buffer };
  }

  /**
   * Calculate estimated travel cost for group
   */
  static calculateTravelCost(
    distanceKm: number,
    transportMode: 'car' | 'metro' | 'walking' | 'bike' = 'car'
  ): number {
    if (transportMode === 'walking') return 0;
    if (transportMode === 'metro') {
      return Math.round(20 + distanceKm * 5);
    }
    if (transportMode === 'bike') {
      return Math.round(25 + distanceKm * 8);
    }
    // Car / Cab
    return Math.round(40 + distanceKm * 16);
  }

  /**
   * Generates travel legs between consecutive items, plus optional initial leg
   */
  static generateTravelLegs(
    items: ItineraryItem[],
    transportMode: 'car' | 'metro' | 'walking' | 'bike' = 'car',
    _startLocation?: string
  ): TravelLeg[] {
    const legs: TravelLeg[] = [];
    if (!items || items.length === 0) return legs;

    for (let i = 0; i < items.length - 1; i++) {
      const current = items[i].experience;
      const next = items[i + 1].experience;

      const dist = calculateDistanceKm(
        current.venue.lat,
        current.venue.lng,
        next.venue.lat,
        next.venue.lng
      );

      const { travelMinutes, bufferMinutes } = this.calculateTravelTime(dist, transportMode);
      const estCost = this.calculateTravelCost(dist, transportMode);

      legs.push({
        fromItemId: items[i].id,
        toItemId: items[i + 1].id,
        fromLocation: current.venue.name,
        toLocation: next.venue.name,
        distanceKm: dist,
        travelMinutes: travelMinutes + bufferMinutes,
        transportMode,
        estimatedCost: estCost,
        trafficStatus: dist > 10 ? 'heavy' : dist > 4 ? 'moderate' : 'light'
      });
    }

    return legs;
  }

  /**
   * Generate initial travel leg if starting location is provided
   */
  static generateInitialTravelLeg(
    firstItem: ItineraryItem,
    startLocation: string,
    transportMode: 'car' | 'metro' | 'walking' | 'bike' = 'car'
  ): TravelLeg {
    // Approximate distance from starting location to first venue
    const dist = 3.5;
    const { travelMinutes, bufferMinutes } = this.calculateTravelTime(dist, transportMode);
    const estCost = this.calculateTravelCost(dist, transportMode);

    return {
      fromItemId: 'start-point',
      toItemId: firstItem.id,
      fromLocation: startLocation,
      toLocation: firstItem.experience.venue.name,
      distanceKm: dist,
      travelMinutes: travelMinutes + bufferMinutes,
      transportMode,
      estimatedCost: estCost,
      trafficStatus: 'moderate',
      isInitialLeg: true
    };
  }

  /**
   * Calculate total itinerary duration in minutes including activities and travel
   */
  static calculateItineraryDuration(
    items: ItineraryItem[],
    travelLegs: TravelLeg[],
    initialLeg?: TravelLeg
  ): number {
    const activityMins = items.reduce((s, it) => s + it.durationMinutes, 0);
    const travelMins = travelLegs.reduce((s, l) => s + l.travelMinutes, 0);
    const initialMins = initialLeg ? initialLeg.travelMinutes : 0;
    return activityMins + travelMins + initialMins;
  }

  /**
   * Validate budget constraints strictly
   */
  static validateBudget(
    items: ItineraryItem[],
    travelLegs: TravelLeg[],
    userBudget: number,
    numPeople: number,
    budgetType: 'total' | 'per_person' = 'total',
    initialLeg?: TravelLeg
  ) {
    const people = Math.max(1, numPeople || 1);
    const totalLimit = budgetType === 'per_person' ? userBudget * people : userBudget;

    let activityCost = 0;
    let foodCost = 0;
    let feesCost = 0;

    for (const item of items) {
      const cost = this.calculateActivityCost(item.experience, people);
      activityCost += cost;
      if (item.experience.category === 'food') {
        foodCost += cost;
      }
      feesCost += item.experience.applicableFees || 0;
    }

    const travelCost =
      travelLegs.reduce((s, l) => s + l.estimatedCost, 0) + (initialLeg ? initialLeg.estimatedCost : 0);

    const totalEstimatedCost = activityCost + travelCost;
    const remainingReserve = totalLimit - totalEstimatedCost;
    const isOverBudget = totalEstimatedCost > totalLimit;
    const percentUsed = totalLimit > 0 ? Math.round((totalEstimatedCost / totalLimit) * 100) : 100;

    return {
      isValid: !isOverBudget,
      totalLimit,
      totalCost: totalEstimatedCost,
      activityCost,
      foodCost,
      travelCost,
      feesCost,
      remainingReserve: Math.max(0, remainingReserve),
      percentUsed,
      isOverBudget,
      error: isOverBudget
        ? `Total estimated cost (₹${totalEstimatedCost}) exceeds user budget (₹${totalLimit}) by ₹${totalEstimatedCost - totalLimit}.`
        : undefined
    };
  }

  /**
   * Validate schedule, timings, opening hours, and travel buffers
   */
  static validateSchedule(
    items: ItineraryItem[],
    travelLegs: TravelLeg[],
    startMins: number,
    endMins: number,
    initialLeg?: TravelLeg
  ) {
    const errors: string[] = [];
    const availableMinutes = endMins - startMins;

    if (startMins >= endMins) {
      errors.push('Start time must be before end time.');
    }

    if (items.length === 0) {
      return { isValid: false, totalDuration: 0, errors: ['Itinerary has no activities scheduled.'] };
    }

    // Check first item start against initial travel
    let clock = startMins;
    if (initialLeg) {
      clock += initialLeg.travelMinutes;
      const firstItemStart = timeStringToMinutes(items[0].startTime);
      if (firstItemStart < clock) {
        errors.push(
          `Initial travel from ${initialLeg.fromLocation} takes ${initialLeg.travelMinutes} mins, but first activity starts earlier at ${items[0].startTime}.`
        );
      }
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const itStart = timeStringToMinutes(it.startTime);
      const itEnd = timeStringToMinutes(it.endTime);

      if (it.durationMinutes <= 0) {
        errors.push(`Activity "${it.experience.name}" has invalid duration (${it.durationMinutes} mins).`);
      }

      if (itStart >= itEnd) {
        errors.push(`Activity "${it.experience.name}" start time (${it.startTime}) is not before end time (${it.endTime}).`);
      }

      // Check venue opening & closing hours
      if (it.experience.openingHours && it.experience.closingHours) {
        const openMins = timeStringToMinutes(it.experience.openingHours);
        const closeMins = timeStringToMinutes(it.experience.closingHours);

        // Standard daytime venue check
        if (closeMins > openMins) {
          if (itStart < openMins) {
            errors.push(
              `"${it.experience.name}" starts at ${it.startTime}, but venue does not open until ${it.experience.openingHours}.`
            );
          }
          if (itEnd > closeMins) {
            errors.push(
              `"${it.experience.name}" ends at ${it.endTime}, but venue closes at ${it.experience.closingHours}.`
            );
          }
        }
      }

      // Check consecutive spacing & travel
      if (i > 0) {
        const prev = items[i - 1];
        const prevEnd = timeStringToMinutes(prev.endTime);
        const leg = travelLegs[i - 1];
        const travelRequired = leg ? leg.travelMinutes : 15;

        if (itStart < prevEnd) {
          errors.push(
            `Schedule conflict: "${it.experience.name}" starts at ${it.startTime} before "${prev.experience.name}" ends at ${prev.endTime}.`
          );
        } else if (itStart < prevEnd + travelRequired) {
          errors.push(
            `Travel conflict: Journey between "${prev.experience.name}" and "${it.experience.name}" requires ${travelRequired} mins, but gap is only ${itStart - prevEnd} mins.`
          );
        }
      }
    }

    const lastItem = items[items.length - 1];
    const lastItemEnd = timeStringToMinutes(lastItem.endTime);

    if (lastItemEnd > endMins) {
      errors.push(
        `Final activity "${lastItem.experience.name}" finishes at ${lastItem.endTime}, which exceeds user day end deadline of ${minutesToTimeString(endMins)}.`
      );
    }

    const totalDuration = this.calculateItineraryDuration(items, travelLegs, initialLeg);
    if (totalDuration > availableMinutes) {
      errors.push(
        `Total itinerary duration (${totalDuration} mins) exceeds available time (${availableMinutes} mins).`
      );
    }

    return {
      isValid: errors.length === 0,
      totalDuration,
      errors
    };
  }

  /**
   * Master validation function checking all hard rules and constraints
   */
  static validateItinerary(
    itinerary: DayItinerary,
    constraints: PlanningPreferences
  ): ItineraryValidationResult {
    const numPeople = itinerary.numPeople || constraints.numPeople || 2;
    const userBudget = constraints.budgetTotal || itinerary.userBudget || 3000;
    const budgetType = constraints.budgetType || itinerary.budgetType || 'total';

    const startMins = timeStringToMinutes(constraints.startTime || itinerary.startTime || '11:00');
    const endMins = timeStringToMinutes(constraints.endTime || itinerary.endTime || '21:00');

    const budgetVal = this.validateBudget(
      itinerary.items,
      itinerary.travelLegs,
      userBudget,
      numPeople,
      budgetType,
      itinerary.initialTravelLeg
    );

    const scheduleVal = this.validateSchedule(
      itinerary.items,
      itinerary.travelLegs,
      startMins,
      endMins,
      itinerary.initialTravelLeg
    );

    const errors: string[] = [];
    const conflicts: ItineraryValidationResult['conflicts'] = [];

    if (!budgetVal.isValid && budgetVal.error) {
      errors.push(budgetVal.error);
      conflicts.push({ type: 'budget', message: budgetVal.error });
    }

    for (const schErr of scheduleVal.errors) {
      errors.push(schErr);
      const isTravel = schErr.includes('Travel conflict');
      const isHours = schErr.includes('closes at') || schErr.includes('does not open');
      conflicts.push({
        type: isTravel ? 'travel' : isHours ? 'hours' : 'time',
        message: schErr
      });
    }

    const hardConstraintsMet = errors.length === 0;

    return {
      isValid: hardConstraintsMet,
      hardConstraintsMet,
      errors,
      warnings: [],
      budgetSummary: {
        userBudget: budgetVal.totalLimit,
        budgetType,
        numPeople,
        plannedCost: budgetVal.totalCost,
        activityCost: budgetVal.activityCost,
        foodCost: budgetVal.foodCost,
        travelCost: budgetVal.travelCost,
        feesCost: budgetVal.feesCost,
        remainingReserve: budgetVal.remainingReserve,
        percentUsed: budgetVal.percentUsed,
        isOverBudget: budgetVal.isOverBudget
      },
      timeSummary: {
        availableMinutes: endMins - startMins,
        usedMinutes: scheduleVal.totalDuration,
        startTime: minutesToTimeString(startMins),
        endTime: minutesToTimeString(endMins),
        calculatedEndTime:
          itinerary.items.length > 0 ? itinerary.items[itinerary.items.length - 1].endTime : minutesToTimeString(startMins),
        isOverTime: scheduleVal.totalDuration > endMins - startMins,
        endTimeExceeded:
          itinerary.items.length > 0
            ? timeStringToMinutes(itinerary.items[itinerary.items.length - 1].endTime) > endMins
            : false
      },
      conflicts
    };
  }

  /**
   * Deterministic planning & knapsack optimization engine
   * Generates 3 verified options: Budget Friendly, Balanced, Maximum Experience
   */
  static optimizeItinerary(prefs: PlanningPreferences): PlanGenerationResult {
    const numPeople = Math.max(1, prefs.numPeople || 1);
    const budgetType = prefs.budgetType || 'total';
    const totalUserBudget = budgetType === 'per_person' ? prefs.budgetTotal * numPeople : prefs.budgetTotal;

    const startMins = timeStringToMinutes(prefs.startTime || '11:00');
    const endMins = timeStringToMinutes(prefs.endTime || '21:00');
    const availableMinutes = Math.max(120, endMins - startMins);

    // 1. Filter candidates by feasibility & hard constraints
    let pool = [...MOCK_EXPERIENCES];

    if (prefs.dietary && prefs.dietary.length > 0) {
      pool = pool.filter((exp) => {
        if (exp.category !== 'food') return true;
        return exp.dietaryOptions?.some((opt) => prefs.dietary?.includes(opt));
      });
    }

    if (prefs.indoorOnly) {
      pool = pool.filter((exp) => exp.weatherFit === 'indoor_only' || exp.weatherFit === 'all');
    }

    // Filter venues that can open at some point during the day window
    pool = pool.filter((exp) => {
      const openMins = timeStringToMinutes(exp.openingHours || '09:00 AM');
      const closeMins = timeStringToMinutes(exp.closingHours || '11:00 PM');
      return openMins < endMins && closeMins > startMins;
    });

    // Score experiences based on preferences & tags
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

    const getScore = (exp: Experience) => {
      let score = exp.rating * 10;
      score += exp.tags.filter((t) => targetTags.includes(t)).length * 15;
      if (prefs.preferredActivities?.some((act) => exp.tags.includes(act) || exp.subcategory.includes(act))) {
        score += 30;
      }
      if (prefs.requiredCategories?.includes(exp.category)) {
        score += 40;
      }
      return score;
    };

    pool.sort((a, b) => getScore(b) - getScore(a));

    // Helper to build and validate a single itinerary variant
    const buildVariant = (
      targetBudgetFactor: number, // e.g. 0.75 for budget, 0.90 for balanced, 1.00 for max
      sortMode: 'cheapest' | 'balanced' | 'rating',
      variantType: 'budget_friendly' | 'balanced' | 'max_experience'
    ): DayItinerary | null => {
      const targetBudgetLimit = totalUserBudget * targetBudgetFactor;

      const variantPool = [...pool].sort((a, b) => {
        if (sortMode === 'cheapest') {
          return a.pricePerPerson - b.pricePerPerson;
        }
        if (sortMode === 'rating') {
          return b.rating - a.rating;
        }
        return getScore(b) - getScore(a);
      });

      // Select diverse items: Ensure required categories first
      const selected: Experience[] = [];
      const usedCategories: Record<string, number> = {};

      // First pass: add required categories if specified
      if (prefs.requiredCategories && prefs.requiredCategories.length > 0) {
        for (const reqCat of prefs.requiredCategories) {
          const match = variantPool.find((e) => e.category === reqCat && !selected.includes(e));
          if (match) {
            selected.push(match);
            usedCategories[match.category] = (usedCategories[match.category] || 0) + 1;
          }
        }
      }

      // Second pass: fill up to 3-4 items respecting variety & budget
      for (const exp of variantPool) {
        if (selected.includes(exp)) continue;
        const count = usedCategories[exp.category] || 0;
        if (exp.category === 'food' && count >= 2) continue;
        if (exp.category !== 'food' && count >= 1) continue;

        // Tentative budget check
        const currentCost =
          selected.reduce((s, it) => s + this.calculateActivityCost(it, numPeople), 0) +
          this.calculateActivityCost(exp, numPeople) +
          (selected.length + 1) * 80; // approximate travel cushion

        if (currentCost <= targetBudgetLimit) {
          selected.push(exp);
          usedCategories[exp.category] = count + 1;
        }

        if (selected.length >= 4) break;
      }

      if (selected.length === 0) return null;

      // Chronological scheduling
      let clock = startMins;
      const scheduledItems: ItineraryItem[] = [];
      let initialLeg: TravelLeg | undefined;

      // Handle start location if provided
      if (prefs.startLocation) {
        const dummyItem: ItineraryItem = {
          id: 'temp',
          experience: selected[0],
          startTime: '',
          endTime: '',
          durationMinutes: selected[0].durationMinutes,
          selectedSlotId: 's-1',
          isBooked: false
        };
        initialLeg = this.generateInitialTravelLeg(dummyItem, prefs.startLocation, prefs.transportMode);
        clock += initialLeg.travelMinutes;
      }

      for (let i = 0; i < selected.length; i++) {
        const exp = selected[i];
        const duration = exp.durationMinutes;

        // Check venue opening hours, adjust clock forward if needed
        const openMins = timeStringToMinutes(exp.openingHours || '09:00 AM');
        if (clock < openMins) {
          clock = openMins;
        }

        // Check if item fits before end deadline
        if (clock + duration > endMins) {
          break; // cannot fit further activities
        }

        const startStr = minutesToTimeString(clock);
        const endStr = minutesToTimeString(clock + duration);
        const cost = this.calculateActivityCost(exp, numPeople);

        scheduledItems.push({
          id: `item-${Date.now()}-${variantType}-${i}`,
          experience: exp,
          startTime: startStr,
          endTime: endStr,
          durationMinutes: duration,
          selectedSlotId: exp.slots[0]?.id || 's-1',
          isBooked: false,
          venueOpeningTime: exp.openingHours,
          venueClosingTime: exp.closingHours,
          pricePerPerson: exp.pricePerPerson,
          numPeople,
          itemCost: cost,
          applicableFees: exp.applicableFees
        });

        // Advance clock with travel time to next venue
        if (i < selected.length - 1) {
          const next = selected[i + 1];
          const dist = calculateDistanceKm(
            exp.venue.lat,
            exp.venue.lng,
            next.venue.lat,
            next.venue.lng
          );
          const { travelMinutes, bufferMinutes } = this.calculateTravelTime(dist, prefs.transportMode);
          clock += duration + travelMinutes + bufferMinutes;
        } else {
          clock += duration;
        }
      }

      if (scheduledItems.length === 0) return null;

      const legs = this.generateTravelLegs(scheduledItems, prefs.transportMode);
      const budgetVal = this.validateBudget(
        scheduledItems,
        legs,
        totalUserBudget,
        numPeople,
        'total',
        initialLeg
      );

      // HARD RULE: Must never exceed budget!
      if (!budgetVal.isValid) {
        // Attempt to repair by removing most expensive non-mandatory item
        while (scheduledItems.length > 1 && !budgetVal.isValid) {
          scheduledItems.pop();
          const newLegs = this.generateTravelLegs(scheduledItems, prefs.transportMode);
          const reBudget = this.validateBudget(
            scheduledItems,
            newLegs,
            totalUserBudget,
            numPeople,
            'total',
            initialLeg
          );
          if (reBudget.isValid) {
            break;
          }
        }
      }

      const finalLegs = this.generateTravelLegs(scheduledItems, prefs.transportMode);
      const finalBudget = this.validateBudget(
        scheduledItems,
        finalLegs,
        totalUserBudget,
        numPeople,
        'total',
        initialLeg
      );

      if (!finalBudget.isValid) return null;

      const totalDist =
        finalLegs.reduce((s, l) => s + l.distanceKm, 0) + (initialLeg ? initialLeg.distanceKm : 0);
      const totalDur = this.calculateItineraryDuration(scheduledItems, finalLegs, initialLeg);

      const titleMap: Record<string, string> = {
        budget_friendly: 'Smart Budget Explorer Day',
        balanced: 'Harmonious Balanced Day',
        max_experience: 'Signature Experience Extravaganza'
      };

      const itinerary: DayItinerary = {
        id: `plan-${Date.now()}-${variantType}`,
        title: titleMap[variantType],
        date: prefs.date || 'Today',
        city: prefs.city || 'Delhi NCR',
        area: prefs.area,
        startLocation: prefs.startLocation,
        items: scheduledItems,
        travelLegs: finalLegs,
        initialTravelLeg: initialLeg,
        totalCost: finalBudget.totalCost,
        activityCost: finalBudget.activityCost,
        foodCost: finalBudget.foodCost,
        travelCost: finalBudget.travelCost,
        feesCost: finalBudget.feesCost,
        userBudget: totalUserBudget,
        budgetType,
        targetBudget: targetBudgetLimit,
        budgetReserve: finalBudget.remainingReserve,
        remainingBudget: finalBudget.remainingReserve,
        budgetUsedPercent: finalBudget.percentUsed,
        numPeople,
        startTime: prefs.startTime || '11:00',
        endTime: prefs.endTime || '21:00',
        totalDurationMinutes: totalDur,
        availableDurationMinutes: availableMinutes,
        totalDistanceKm: Math.round(totalDist * 10) / 10,
        numActivities: scheduledItems.length,
        numBookings: 0,
        mode: prefs.mode,
        optionType: variantType,
        createdAt: new Date().toISOString()
      };

      itinerary.validation = this.validateItinerary(itinerary, prefs);
      return itinerary;
    };

    // Generate the 3 options
    const budgetFriendly = buildVariant(0.8, 'cheapest', 'budget_friendly');
    const balanced = buildVariant(0.9, 'balanced', 'balanced');
    const maxExp = buildVariant(1.0, 'rating', 'max_experience');

    // Choose fallback if balanced is null
    const fallback = balanced || maxExp || budgetFriendly;

    if (!fallback) {
      return {
        options: {
          balanced: this.createEmptyFallbackItinerary(prefs, totalUserBudget)
        },
        activeOption: 'balanced',
        extractedPreferences: prefs,
        isFeasible: false,
        feasibilityExplanation:
          `Unable to construct a valid itinerary within ₹${totalUserBudget} for ${numPeople} guests across ${availableMinutes / 60} hours. Try increasing budget, reducing party size, or expanding your time window.`
      };
    }

    return {
      options: {
        budget_friendly: budgetFriendly || undefined,
        balanced: fallback,
        max_experience: maxExp || undefined
      },
      activeOption: 'balanced',
      extractedPreferences: prefs,
      isFeasible: true
    };
  }

  /**
   * Builds single default plan respecting budget and time
   */
  static buildPlan(prefs: PlanningPreferences): DayItinerary {
    const result = this.optimizeItinerary(prefs);
    const chosen = result.options.balanced || result.options.budget_friendly || result.options.max_experience!;
    this.saveActiveDay(chosen);
    return chosen;
  }

  /**
   * Intelligent Itinerary Repair: Re-stitches timings, travel legs and recalculates costs
   */
  static repairItinerary(
    itinerary: DayItinerary,
    constraints?: PlanningPreferences
  ): DayItinerary {
    const clone: DayItinerary = JSON.parse(JSON.stringify(itinerary));
    if (clone.items.length === 0) return clone;

    const numPeople = clone.numPeople || 2;
    const startMins = clone.startTime
      ? timeStringToMinutes(clone.startTime)
      : (clone.items[0]?.startTime ? timeStringToMinutes(clone.items[0].startTime) : 660);
    let clock = startMins;

    if (clone.initialTravelLeg) {
      clock += clone.initialTravelLeg.travelMinutes;
    }

    for (let i = 0; i < clone.items.length; i++) {
      const it = clone.items[i];
      const duration = it.durationMinutes;

      // Ensure venue opening hours
      if (it.experience.openingHours) {
        const openMins = timeStringToMinutes(it.experience.openingHours);
        if (clock < openMins) clock = openMins;
      }

      it.startTime = minutesToTimeString(clock);
      it.endTime = minutesToTimeString(clock + duration);
      it.itemCost = this.calculateActivityCost(it.experience, numPeople);

      if (i < clone.items.length - 1) {
        const next = clone.items[i + 1];
        const dist = calculateDistanceKm(
          it.experience.venue.lat,
          it.experience.venue.lng,
          next.experience.venue.lat,
          next.experience.venue.lng
        );
        const { travelMinutes, bufferMinutes } = this.calculateTravelTime(dist, 'car');
        clock += duration + travelMinutes + bufferMinutes;
      } else {
        clock += duration;
      }
    }

    clone.travelLegs = this.generateTravelLegs(clone.items, 'car');

    const budgetVal = this.validateBudget(
      clone.items,
      clone.travelLegs,
      clone.userBudget || 4000,
      numPeople,
      clone.budgetType || 'total',
      clone.initialTravelLeg
    );

    clone.totalCost = budgetVal.totalCost;
    clone.activityCost = budgetVal.activityCost;
    clone.foodCost = budgetVal.foodCost;
    clone.travelCost = budgetVal.travelCost;
    clone.feesCost = budgetVal.feesCost;
    clone.remainingBudget = budgetVal.remainingReserve;
    clone.budgetReserve = budgetVal.remainingReserve;
    clone.budgetUsedPercent = budgetVal.percentUsed;
    clone.totalDurationMinutes = this.calculateItineraryDuration(
      clone.items,
      clone.travelLegs,
      clone.initialTravelLeg
    );
    clone.totalDistanceKm =
      Math.round(
        (clone.travelLegs.reduce((s, l) => s + l.distanceKm, 0) +
          (clone.initialTravelLeg ? clone.initialTravelLeg.distanceKm : 0)) *
          10
      ) / 10;
    clone.numActivities = clone.items.length;

    if (constraints) {
      clone.validation = this.validateItinerary(clone, constraints);
    }

    this.saveActiveDay(clone);
    return clone;
  }

  /**
   * Replacement Finder: Finds compatible experiences that fit within budget and schedule
   */
  static getReplacementsFor(
    target: Experience,
    _currentItinerary?: DayItinerary,
    _constraints?: PlanningPreferences
  ): Experience[] {
    const maxCost = target.pricePerPerson * 1.35; // keep alternative close in cost
    return MOCK_EXPERIENCES.filter(
      (exp) =>
        exp.id !== target.id &&
        (exp.category === target.category || exp.tags.some((t) => target.tags.includes(t))) &&
        exp.pricePerPerson <= maxCost &&
        exp.slots.some((s) => s.status === 'available' || s.status === 'few_left')
    )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }

  /**
   * "Surprise Me" Generator
   */
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
      budgetType: 'total',
      ageGroup: 'young_adults',
      mode: randomMode,
      transportMode: 'car',
      tags: ['spontaneous', 'surprise', 'popular']
    });
  }

  /**
   * What-If Scenario Engine with full re-validation
   */
  static simulateWhatIf(
    currentPlan: DayItinerary,
    scenario:
      | 'remove_movie'
      | 'increase_budget'
      | 'start_later'
      | 'rain_mode'
      | 'sold_out_replace'
      | 'tight_budget'
      | 'custom',
    _customPrompt?: string
  ): DayItinerary {
    const clone: DayItinerary = JSON.parse(JSON.stringify(currentPlan));
    clone.id = `plan-whatif-${Date.now()}`;

    if (scenario === 'remove_movie') {
      clone.items = clone.items.filter((item) => item.experience.category !== 'movies');
      clone.title = `${currentPlan.title} (No Movie)`;
    } else if (scenario === 'start_later') {
      clone.startTime = minutesToTimeString(timeStringToMinutes(clone.startTime || '11:00') + 120);
      clone.title = `${currentPlan.title} (+2hr Late Start)`;
    } else if (scenario === 'rain_mode') {
      const indoorReplacements = MOCK_EXPERIENCES.filter((e) => e.weatherFit === 'indoor_only');
      clone.items = clone.items.map((item, idx) => {
        if (item.experience.weatherFit === 'pleasant_outdoor') {
          const rep = indoorReplacements[idx % indoorReplacements.length];
          return {
            ...item,
            experience: rep,
            selectedSlotId: rep.slots[0]?.id || 's-1'
          };
        }
        return item;
      });
      clone.title = `☔ Rainy Day Edition: ${currentPlan.title}`;
    } else if (scenario === 'sold_out_replace' && clone.items.length > 0) {
      const alternatives = this.getReplacementsFor(clone.items[0].experience);
      if (alternatives.length > 0) {
        clone.items[0].experience = alternatives[0];
        clone.items[0].selectedSlotId = alternatives[0].slots[0].id;
      }
      clone.title = `${currentPlan.title} (Auto-Swapped Alternative)`;
    }

    return this.repairItinerary(clone);
  }

  private static createEmptyFallbackItinerary(
    prefs: PlanningPreferences,
    budget: number
  ): DayItinerary {
    return {
      id: `plan-empty-${Date.now()}`,
      title: 'No Feasible Plan Found',
      date: prefs.date || 'Today',
      city: prefs.city || 'Delhi NCR',
      items: [],
      travelLegs: [],
      totalCost: 0,
      userBudget: budget,
      remainingBudget: budget,
      totalDurationMinutes: 0,
      totalDistanceKm: 0,
      numActivities: 0,
      numBookings: 0,
      mode: prefs.mode,
      createdAt: new Date().toISOString()
    };
  }

  // Storage helpers
  static getActiveDay(): DayItinerary {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_DAY);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // fallback
    }

    const defaultPrefs: PlanningPreferences = {
      date: 'Today',
      startTime: '11:30',
      endTime: '21:00',
      city: 'Delhi NCR',
      area: 'South Delhi & CP',
      numPeople: 2,
      budgetTotal: 4000,
      budgetType: 'total',
      ageGroup: 'young_adults',
      mode: 'date',
      transportMode: 'car',
      tags: ['romantic', 'pottery', 'fine dining', 'aesthetic']
    };

    return this.buildPlan(defaultPrefs);
  }

  static saveActiveDay(itinerary: DayItinerary): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ACTIVE_DAY, JSON.stringify(itinerary));
      }
    } catch (e) {
      console.error(e);
    }
  }

  static getSavedDays(): DayItinerary[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_SAVED_DAYS);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    return [];
  }

  static saveToMyDays(itinerary: DayItinerary): void {
    if (typeof localStorage === 'undefined') return;
    const list = this.getSavedDays();
    const existingIdx = list.findIndex((d) => d.id === itinerary.id);
    if (existingIdx >= 0) {
      list[existingIdx] = itinerary;
    } else {
      list.unshift(itinerary);
    }
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_DAYS, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }
}
