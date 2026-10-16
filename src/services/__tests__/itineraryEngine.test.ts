import test from 'node:test';
import assert from 'node:assert/strict';
import { ItineraryEngine, timeStringToMinutes, minutesToTimeString } from '../itineraryEngine.ts';
import { NaturalLanguageService } from '../naturalLanguageService.ts';
import type { Experience, ItineraryItem, TravelLeg, DayItinerary, PlanningPreferences } from '../../types/index.ts';

// Helper mock experience creator
function createMockExperience(overrides: Partial<Experience> = {}): Experience {
  return {
    id: overrides.id || `exp-test-${Math.random()}`,
    name: overrides.name || 'Sample Activity',
    tagline: overrides.tagline || 'Exciting experience',
    category: overrides.category || 'activities',
    subcategory: overrides.subcategory || 'gaming',
    description: 'Description',
    images: ['https://example.com/img.jpg'],
    venue: {
      id: 'venue-1',
      name: 'Test Venue',
      area: 'Connaught Place',
      city: 'Delhi',
      address: 'Test Address',
      lat: 28.6328,
      lng: 77.2197,
      parkingAvailable: true
    },
    pricePerPerson: overrides.pricePerPerson ?? 300,
    durationMinutes: overrides.durationMinutes ?? 60,
    rating: overrides.rating ?? 4.8,
    reviewCount: 100,
    openingHours: overrides.openingHours || '10:00 AM',
    closingHours: overrides.closingHours || '10:00 PM',
    tags: overrides.tags || ['gaming'],
    features: ['AC'],
    whatIsIncluded: ['Entry'],
    whatToBring: ['ID'],
    cancellationPolicy: 'Free',
    slots: [{ id: 's-1', time: '12:00 PM', rawTime: '12:00', availableSeats: 10, price: 300, status: 'available' }],
    trendingScore: 90,
    weatherFit: 'all',
    fixedGroupPrice: overrides.fixedGroupPrice,
    applicableFees: overrides.applicableFees
  };
}

// TEST 1: Budget compliance
test('TEST 1: Budget compliance - Generated itinerary cost > budget fails validation', () => {
  const exp1 = createMockExperience({ pricePerPerson: 1000 });
  const exp2 = createMockExperience({ pricePerPerson: 1100 });

  const items: ItineraryItem[] = [
    {
      id: 'it-1',
      experience: exp1,
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      durationMinutes: 60,
      selectedSlotId: 's-1',
      isBooked: false
    },
    {
      id: 'it-2',
      experience: exp2,
      startTime: '12:30 PM',
      endTime: '01:30 PM',
      durationMinutes: 60,
      selectedSlotId: 's-1',
      isBooked: false
    }
  ];

  const travelLegs: TravelLeg[] = [
    {
      fromItemId: 'it-1',
      toItemId: 'it-2',
      fromLocation: 'Venue 1',
      toLocation: 'Venue 2',
      distanceKm: 2,
      travelMinutes: 20,
      transportMode: 'car',
      estimatedCost: 50,
      trafficStatus: 'light'
    }
  ];

  // Budget is ₹2,000 for 1 person, but cost is ₹1,000 + ₹1,100 + ₹50 = ₹2,150
  const validation = ItineraryEngine.validateBudget(items, travelLegs, 2000, 1, 'total');
  assert.strictEqual(validation.isValid, false, 'Expected validation to fail when cost exceeds budget');
  assert.strictEqual(validation.isOverBudget, true);
  assert.ok(validation.error && validation.error.includes('exceeds user budget'));
});

// TEST 2: Group pricing
test('TEST 2: Group pricing - Price per person: ₹300, Group size: 4 -> Group activity cost = ₹1,200', () => {
  const exp = createMockExperience({ pricePerPerson: 300 });
  const groupCost = ItineraryEngine.calculateActivityCost(exp, 4);
  assert.strictEqual(groupCost, 1200, 'Expected group cost to be 300 * 4 = ₹1200');

  // Also test fixed group price if set
  const fixedExp = createMockExperience({ pricePerPerson: 500, fixedGroupPrice: 1500 });
  const fixedCost = ItineraryEngine.calculateActivityCost(fixedExp, 4);
  assert.strictEqual(fixedCost, 1500, 'Expected fixed group price to be ₹1500');
});

// TEST 3: Travel conflict
test('TEST 3: Travel conflict - Activity A ends at 2:00 PM, travel takes 30 mins, Activity B begins at 2:15 PM fails validation', () => {
  const expA = createMockExperience({ name: 'Activity A' });
  const expB = createMockExperience({ name: 'Activity B' });

  const items: ItineraryItem[] = [
    {
      id: 'it-a',
      experience: expA,
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      durationMinutes: 60,
      selectedSlotId: 's-1',
      isBooked: false
    },
    {
      id: 'it-b',
      experience: expB,
      startTime: '02:15 PM',
      endTime: '03:15 PM',
      durationMinutes: 60,
      selectedSlotId: 's-1',
      isBooked: false
    }
  ];

  const travelLegs: TravelLeg[] = [
    {
      fromItemId: 'it-a',
      toItemId: 'it-b',
      fromLocation: 'Venue A',
      toLocation: 'Venue B',
      distanceKm: 8,
      travelMinutes: 30, // Travel takes 30 mins, but slot gap is only 15 mins!
      transportMode: 'car',
      estimatedCost: 100,
      trafficStatus: 'moderate'
    }
  ];

  const schedule = ItineraryEngine.validateSchedule(items, travelLegs, timeStringToMinutes('12:00 PM'), timeStringToMinutes('06:00 PM'));
  assert.strictEqual(schedule.isValid, false, 'Expected validation to fail due to travel conflict');
  assert.ok(schedule.errors.some((e) => e.includes('Travel conflict')));
});

// TEST 4: Valid schedule
test('TEST 4: Valid schedule - Activity A ends at 2:00 PM, travel takes 20 mins, buffer is 10 mins, Activity B begins at 2:30 PM passes validation', () => {
  const expA = createMockExperience({ name: 'Activity A' });
  const expB = createMockExperience({ name: 'Activity B' });

  const items: ItineraryItem[] = [
    {
      id: 'it-a',
      experience: expA,
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      durationMinutes: 60,
      selectedSlotId: 's-1',
      isBooked: false
    },
    {
      id: 'it-b',
      experience: expB,
      startTime: '02:30 PM',
      endTime: '03:30 PM',
      durationMinutes: 60,
      selectedSlotId: 's-1',
      isBooked: false
    }
  ];

  const travelLegs: TravelLeg[] = [
    {
      fromItemId: 'it-a',
      toItemId: 'it-b',
      fromLocation: 'Venue A',
      toLocation: 'Venue B',
      distanceKm: 5,
      travelMinutes: 30, // 20m travel + 10m buffer = 30m
      transportMode: 'car',
      estimatedCost: 80,
      trafficStatus: 'light'
    }
  ];

  const schedule = ItineraryEngine.validateSchedule(items, travelLegs, timeStringToMinutes('12:00 PM'), timeStringToMinutes('06:00 PM'));
  assert.strictEqual(schedule.isValid, true, 'Expected valid schedule to pass validation');
  assert.strictEqual(schedule.errors.length, 0);
});

// TEST 5: Time limit
test('TEST 5: Time limit - Available duration: 6 hours (360 mins). Complete itinerary duration including travel: 6 hours and 15 mins (375 mins) fails validation', () => {
  const expA = createMockExperience({ durationMinutes: 180 });
  const expB = createMockExperience({ durationMinutes: 160 });

  const items: ItineraryItem[] = [
    {
      id: 'it-a',
      experience: expA,
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      durationMinutes: 180,
      selectedSlotId: 's-1',
      isBooked: false
    },
    {
      id: 'it-b',
      experience: expB,
      startTime: '01:35 PM',
      endTime: '04:15 PM', // 10:00 AM to 4:15 PM = 6 hrs 15 mins
      durationMinutes: 160,
      selectedSlotId: 's-1',
      isBooked: false
    }
  ];

  const travelLegs: TravelLeg[] = [
    {
      fromItemId: 'it-a',
      toItemId: 'it-b',
      fromLocation: 'Venue A',
      toLocation: 'Venue B',
      distanceKm: 6,
      travelMinutes: 35,
      transportMode: 'car',
      estimatedCost: 90,
      trafficStatus: 'moderate'
    }
  ];

  // User available time: 10:00 AM to 4:00 PM (6 hours = 360 mins)
  const schedule = ItineraryEngine.validateSchedule(items, travelLegs, timeStringToMinutes('10:00 AM'), timeStringToMinutes('04:00 PM'));
  assert.strictEqual(schedule.isValid, false, 'Expected validation to fail when exceeding 6 hours');
  assert.ok(schedule.errors.some((e) => e.includes('exceeds user day end deadline') || e.includes('exceeds available time')));
});

// TEST 6: Venue closing
test('TEST 6: Venue closing - Venue closes at 5:00 PM, activity scheduled to finish at 5:30 PM fails validation', () => {
  const exp = createMockExperience({
    name: 'Art Gallery',
    openingHours: '10:00 AM',
    closingHours: '05:00 PM',
    durationMinutes: 90
  });

  const items: ItineraryItem[] = [
    {
      id: 'it-1',
      experience: exp,
      startTime: '04:00 PM',
      endTime: '05:30 PM', // 30 minutes after closing!
      durationMinutes: 90,
      selectedSlotId: 's-1',
      isBooked: false
    }
  ];

  const schedule = ItineraryEngine.validateSchedule(items, [], timeStringToMinutes('10:00 AM'), timeStringToMinutes('08:00 PM'));
  assert.strictEqual(schedule.isValid, false, 'Expected validation to fail when activity ends after venue closes');
  assert.ok(schedule.errors.some((e) => e.includes('closes at 05:00 PM')));
});

// TEST 7: Replacement activity
test('TEST 7: Replacement activity - Replacing an activity changes total cost and travel time, planner recalculates and revalidates', () => {
  const exp1 = createMockExperience({ id: 'exp-1', pricePerPerson: 400, durationMinutes: 60 });
  const exp2 = createMockExperience({ id: 'exp-2', pricePerPerson: 900, durationMinutes: 90 });

  const initialPlan: DayItinerary = {
    id: 'plan-orig',
    title: 'Original Plan',
    date: 'Today',
    city: 'Delhi',
    items: [
      {
        id: 'item-1',
        experience: exp1,
        startTime: '12:00 PM',
        endTime: '01:00 PM',
        durationMinutes: 60,
        selectedSlotId: 's-1',
        isBooked: false
      }
    ],
    travelLegs: [],
    totalCost: 800,
    userBudget: 2500,
    totalDurationMinutes: 60,
    totalDistanceKm: 0,
    numActivities: 1,
    numBookings: 0,
    mode: 'custom',
    createdAt: new Date().toISOString()
  };

  // Replace item-1 with exp2 (higher cost and duration)
  const modifiedPlan: DayItinerary = JSON.parse(JSON.stringify(initialPlan));
  modifiedPlan.items[0] = {
    id: 'item-1',
    experience: exp2,
    startTime: '12:00 PM',
    endTime: '01:30 PM',
    durationMinutes: 90,
    selectedSlotId: 's-2',
    isBooked: false
  };

  const repaired = ItineraryEngine.repairItinerary(modifiedPlan);
  // 900 * 2 people = 1800
  assert.strictEqual(repaired.totalCost, 1800, 'Expected total cost to be recalculated to ₹1800');
  assert.strictEqual(repaired.totalDurationMinutes, 90, 'Expected duration to be recalculated to 90 mins');
  assert.strictEqual(repaired.items[0].endTime, '1:30 PM');
});

// TEST 8: No feasible itinerary
test('TEST 8: No feasible itinerary - When budget or window cannot fit matching activities, explains problem and offers alternatives', () => {
  const impossiblePrefs: PlanningPreferences = {
    date: 'Today',
    startTime: '12:00',
    endTime: '13:00', // only 1 hour available
    city: 'Delhi',
    area: 'South Delhi',
    numPeople: 6,
    budgetTotal: 300, // ₹300 total for 6 people is ₹50/person - impossible
    ageGroup: 'young_adults',
    mode: 'date',
    transportMode: 'car',
    tags: []
  };

  const result = ItineraryEngine.optimizeItinerary(impossiblePrefs);
  assert.strictEqual(result.isFeasible, false);
  assert.ok(result.feasibilityExplanation && result.feasibilityExplanation.includes('Unable to construct a valid itinerary'));
});

// TEST 9: Budget reserve
test('TEST 9: Budget reserve - Budget: ₹2,000, Preferred reserve: 10% -> normal target is ₹1,800 or less, absolute spending limit remains ₹2,000', () => {
  const prefs: PlanningPreferences = {
    date: 'Today',
    startTime: '11:00',
    endTime: '19:00',
    city: 'Delhi',
    area: 'South Delhi',
    numPeople: 1,
    budgetTotal: 2000,
    budgetType: 'total',
    budgetReservePercent: 10,
    ageGroup: 'young_adults',
    mode: 'budget_day',
    transportMode: 'metro',
    tags: []
  };

  const result = ItineraryEngine.optimizeItinerary(prefs);
  assert.strictEqual(result.isFeasible, true);

  const balanced = result.options.balanced;
  assert.ok(balanced, 'Balanced plan should exist');
  assert.ok(balanced.totalCost <= 2000, `Cost ${balanced.totalCost} must NEVER exceed ₹2,000`);
  assert.ok((balanced.budgetReserve ?? 0) >= 0, 'Reserve must be non-negative');
});

// TEST 10: Natural-language extraction
test('TEST 10: Natural-language extraction - "I have six hours, ₹1,500 total, and three people. I want food and gaming."', () => {
  const prompt = 'I have six hours, ₹1,500 total, and three people. I want food and gaming.';
  const extracted = NaturalLanguageService.extractIntent(prompt);

  assert.strictEqual(extracted.durationMinutes, 360, 'Expected duration to be 360 minutes (6 hours)');
  assert.strictEqual(extracted.budget, 1500, 'Expected budget to be ₹1,500');
  assert.strictEqual(extracted.budgetType, 'total', 'Expected budget type to be total');
  assert.strictEqual(extracted.numPeople, 3, 'Expected group size to be 3 people');
  assert.ok(extracted.categories.includes('food'), 'Expected categories to include food');
  assert.ok(extracted.categories.includes('activities'), 'Expected categories to include gaming/activities');
});

// TEST 11: First journey
test('TEST 11: First journey - When starting location is provided, travel to the first activity is included', () => {
  const prefs: PlanningPreferences = {
    date: 'Today',
    startTime: '11:00',
    endTime: '19:00',
    city: 'Delhi',
    area: 'South Delhi',
    startLocation: 'Hauz Khas Village',
    numPeople: 2,
    budgetTotal: 4000,
    budgetType: 'total',
    ageGroup: 'young_adults',
    mode: 'friends',
    transportMode: 'car',
    tags: []
  };

  const plan = ItineraryEngine.buildPlan(prefs);
  assert.ok(plan.initialTravelLeg, 'Expected initial travel leg to be created');
  assert.strictEqual(plan.initialTravelLeg?.fromLocation, 'Hauz Khas Village');
  assert.ok((plan.initialTravelLeg?.travelMinutes ?? 0) > 0);
  assert.ok((plan.initialTravelLeg?.estimatedCost ?? 0) > 0);
});

// TEST 12: Date and time
test('TEST 12: Date and time - Conversion helpers handle midnight, 24h/12h formatting, and minute math reliably', () => {
  assert.strictEqual(timeStringToMinutes('12:00 AM'), 0);
  assert.strictEqual(timeStringToMinutes('12:30 AM'), 30);
  assert.strictEqual(timeStringToMinutes('12:00 PM'), 720);
  assert.strictEqual(timeStringToMinutes('01:15 PM'), 795);
  assert.strictEqual(timeStringToMinutes('11:59 PM'), 1439);

  assert.strictEqual(minutesToTimeString(0), '12:00 AM');
  assert.strictEqual(minutesToTimeString(30), '12:30 AM');
  assert.strictEqual(minutesToTimeString(720), '12:00 PM');
  assert.strictEqual(minutesToTimeString(795), '1:15 PM');
  assert.strictEqual(minutesToTimeString(1439), '11:59 PM');

  // Across midnight wrap check
  assert.strictEqual(minutesToTimeString(1440), '12:00 AM');
  assert.strictEqual(minutesToTimeString(1500), '1:00 AM');
});
