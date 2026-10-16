import type { PlanningPreferences, DayPlanningMode, ExperienceCategory } from '../types/index.ts';

export interface ExtractedIntent {
  rawPrompt: string;
  source: 'ai_engine' | 'deterministic_nlp';
  durationMinutes?: number;
  startTime?: string;
  endTime?: string;
  budget?: number;
  budgetType?: 'total' | 'per_person';
  budgetReserve?: number;
  budgetReservePercent?: number;
  numPeople?: number;
  startLocation?: string;
  categories: ExperienceCategory[];
  preferredActivities: string[];
  avoidActivities: string[];
  dietary: ('vegetarian' | 'vegan' | 'halal' | 'jain')[];
  indoorOnly?: boolean;
  mode?: DayPlanningMode;
  transportMode?: 'car' | 'metro' | 'walking' | 'bike';
  maximizeExperience?: boolean;
}

export class NaturalLanguageService {
  /**
   * Deterministically extract structured intent from natural language input.
   */
  static extractIntent(prompt: string): ExtractedIntent {
    const text = (prompt || '').trim();
    const lower = text.toLowerCase();

    const intent: ExtractedIntent = {
      rawPrompt: text,
      source: 'deterministic_nlp',
      categories: [],
      preferredActivities: [],
      avoidActivities: [],
      dietary: []
    };

    if (!text) return intent;

    // 1. Group Size / Number of People
    // Match "with two friends" -> 1 + 2 = 3
    const friendsMatch = lower.match(/with\s+(one|two|three|four|five|\d+)\s+friends?/i);
    if (friendsMatch) {
      const numStr = friendsMatch[1];
      const wordMap: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
      const friendCount = wordMap[numStr] ?? parseInt(numStr, 10);
      if (!isNaN(friendCount)) {
        intent.numPeople = 1 + friendCount;
      }
    }

    if (!intent.numPeople) {
      if (/solo|alone|just me|myself|1 person/i.test(lower)) {
        intent.numPeople = 1;
      } else if (/date for two|for two|for 2|pair|couple/i.test(lower)) {
        intent.numPeople = 2;
      } else {
        const peopleMatch = lower.match(/(\d+)\s*(?:people|persons|guests|pax|friends|heads|guys)/i);
        if (peopleMatch) {
          intent.numPeople = parseInt(peopleMatch[1], 10);
        } else {
          // Words like "three people", "four guests"
          const wordPeopleMatch = lower.match(/(two|three|four|five|six)\s+(?:people|persons|guests|friends)/i);
          if (wordPeopleMatch) {
            const wordMap: Record<string, number> = { two: 2, three: 3, four: 4, five: 5, six: 6 };
            intent.numPeople = wordMap[wordPeopleMatch[1]];
          }
        }
      }
    }

    // 2. Budget and Budget Type
    // Detect per-person budget: "₹3,000 per person", "1500 each", "2000 per head"
    const isPerPerson = /(?:per\s+(?:person|head|guest)|each|a\s+head)/i.test(lower);
    if (isPerPerson) {
      intent.budgetType = 'per_person';
    } else {
      intent.budgetType = 'total';
    }

    // Match budget amount: ₹2,000, 2000, 1.5k, 2k, Rs 2000, under 1500
    const budgetMatch =
      lower.match(/(?:₹\s*|(?:\brs\.?|\binr|\bunder|\bbudget\s+of|\bbudget:?)\s*)([0-9]+(?:,[0-9]+)*)(?:\s*(?:k|thousand))?/i) ||
      lower.match(/([0-9]+(?:,[0-9]+)*)\s*(?:k|thousand)?\s*(?:\brupees|\brs\b|\binr\b)/i);

    if (budgetMatch) {
      const rawNum = budgetMatch[1].replace(/,/g, '');
      let val = parseInt(rawNum, 10);
      if (/k|thousand/i.test(budgetMatch[0]) && val < 100) {
        val *= 1000;
      }
      if (!isNaN(val) && val > 0) {
        intent.budget = val;
      }
    }

    // Detect explicit reserve requests: "keep at least ₹300 unused", "save 500", "keep 10% reserve"
    const reserveMatch = lower.match(
      /(?:\bkeep|\bsave|\bleave|\breserve)\s+(?:at\s+least\s+)?(?:₹\s*|rs\.?\s*)?([0-9]+(?:,[0-9]+)*)\s*(?:unused|in\s+reserve|unspent|left)?/i
    );
    if (reserveMatch) {
      const reserveVal = parseInt(reserveMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(reserveVal) && reserveVal > 0) {
        intent.budgetReserve = reserveVal;
      }
    }

    if (/maximize\s+experience|use\s+all\s+budget|full\s+budget|best\s+possible\s+budget/i.test(lower)) {
      intent.maximizeExperience = true;
    }

    // 3. Duration & Times
    const hoursMatch = lower.match(/(\d+)(?:\.5)?\s*(?:hours?|hrs?)/i) ||
                       lower.match(/(one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:hours?|hrs?)/i);
    if (hoursMatch) {
      const wordMap: Record<string, number> = {
        one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10
      };
      const hrs = wordMap[hoursMatch[1].toLowerCase()] ?? parseFloat(hoursMatch[1]);
      if (!isNaN(hrs)) {
        intent.durationMinutes = Math.round(hrs * 60);
      }
    } else if (/half\s*day/i.test(lower)) {
      intent.durationMinutes = 300; // 5 hours
    } else if (/full\s*day/i.test(lower)) {
      intent.durationMinutes = 540; // 9 hours
    }

    // Start time: "starting at 12 PM", "from 11:30 am", "start 10 am"
    const startMatch = lower.match(/(?:starting|start|from)\s+(?:at|around)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (startMatch) {
      intent.startTime = this.standardizeTimeString(startMatch[1]);
    }

    // 4. Starting Location
    // e.g. "starting from Hauz Khas", "from Connaught Place", "starting in Saket"
    const locMatch = lower.match(/(?:starting|start)\s+(?:from|in|at)\s+([a-zA-Z0-9\s&]+?)(?:,|\.|\bwith\b|\band\b|\bfor\b|\bat\b|$)/i) ||
                     lower.match(/from\s+([a-zA-Z0-9\s&]+?)(?:,|\.|\bto\b|\bwith\b|\bstarting\b|$)/i);
    if (locMatch && !/(\d|am|pm|today|tomorrow)/i.test(locMatch[1])) {
      const loc = locMatch[1].trim();
      if (loc.length > 2 && !/^(me|us|scratch)$/i.test(loc)) {
        intent.startLocation = loc;
      }
    }

    // 5. Categories & Activities
    if (/lunch|dinner|breakfast|brunch|food|eat|dining|cafe|coffee|restaurant|street food|food tour/i.test(lower)) {
      intent.categories.push('food');
    }
    if (/movie|cinema|film|theatre|theater|pvr|show|play/i.test(lower)) {
      intent.categories.push('movies');
    }
    if (/gaming|games|arcade|vr|virtual reality|escape room|bowling/i.test(lower)) {
      intent.categories.push('activities');
    }
    if (/pottery|painting|workshop|craft|diy|sip & paint|art class/i.test(lower)) {
      intent.categories.push('workshops');
    }
    if (/museum|gallery|monument|heritage|history|culture/i.test(lower)) {
      intent.categories.push('culture');
    }
    if (/nature|park|picnic|lake|garden|forest|outdoor/i.test(lower)) {
      intent.categories.push('outdoor');
    }
    if (/badminton|sports|racing|go-karting|cycling|squash|fitness/i.test(lower)) {
      intent.categories.push('sports');
    }
    if (/shopping|mall|bazaar|market/i.test(lower)) {
      intent.categories.push('shopping');
    }
    if (/nightlife|cocktails|club|bar|lounge/i.test(lower)) {
      intent.categories.push('nightlife');
    }

    // Specific Preferred Activities
    if (/pottery/i.test(lower)) intent.preferredActivities.push('pottery');
    if (/escape room/i.test(lower)) intent.preferredActivities.push('escape room');
    if (/vr/i.test(lower)) intent.preferredActivities.push('vr');
    if (/movie/i.test(lower)) intent.preferredActivities.push('movie');
    if (/fine dining/i.test(lower)) intent.preferredActivities.push('fine dining');
    if (/street food/i.test(lower)) intent.preferredActivities.push('street food');
    if (/museum/i.test(lower)) intent.preferredActivities.push('museum');
    if (/picnic/i.test(lower)) intent.preferredActivities.push('picnic');
    if (/badminton/i.test(lower)) intent.preferredActivities.push('badminton');

    // 6. Mode
    if (/date|romantic|couple/i.test(lower)) {
      intent.mode = 'date';
    } else if (/friend|squad|buddies|gang/i.test(lower)) {
      intent.mode = 'friends';
    } else if (/family|kids|children|parents/i.test(lower)) {
      intent.mode = 'family';
    } else if (/food tour|foodie|gastronomy/i.test(lower)) {
      intent.mode = 'foodie';
    } else if (/adventure|thrill|racing|fast/i.test(lower)) {
      intent.mode = 'adventure';
    } else if (/relax|zen|chill|peaceful|spa/i.test(lower)) {
      intent.mode = 'relax';
    } else if (/culture|heritage|historical/i.test(lower)) {
      intent.mode = 'culture';
    } else if (/cheap|budget|affordable/i.test(lower)) {
      intent.mode = 'budget_day';
    }

    // 7. Dietary
    if (/vegetarian|veg\b|pure veg/i.test(lower)) intent.dietary.push('vegetarian');
    if (/vegan/i.test(lower)) intent.dietary.push('vegan');
    if (/halal/i.test(lower)) intent.dietary.push('halal');
    if (/jain/i.test(lower)) intent.dietary.push('jain');

    // 8. Environmental / Indoor
    if (/indoors?|rain|raining|monsoon|ac only|air conditioned/i.test(lower)) {
      intent.indoorOnly = true;
    }

    // 9. Transport Mode
    if (/metro/i.test(lower)) intent.transportMode = 'metro';
    else if (/walk|walking|on foot/i.test(lower)) intent.transportMode = 'walking';
    else if (/bike|cycling/i.test(lower)) intent.transportMode = 'bike';
    else if (/car|cab|uber|drive/i.test(lower)) intent.transportMode = 'car';

    return intent;
  }

  /**
   * Translates intent into full PlanningPreferences with fallback defaults.
   */
  static parsePlanningRequest(
    prompt: string,
    basePrefs?: Partial<PlanningPreferences>
  ): PlanningPreferences {
    const extracted = this.extractIntent(prompt);

    // Duration calculation
    const durationMins = extracted.durationMinutes ?? 360; // default 6 hours
    const start = extracted.startTime || basePrefs?.startTime || '11:00';

    // Calculate end time from start time + duration
    const [h, m] = start.split(':').map((n) => parseInt(n, 10));
    const startMins = (h || 11) * 60 + (m || 0);
    const endMins = startMins + durationMins;
    const endH = Math.floor((endMins % 1440) / 60);
    const endM = endMins % 60;
    const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const numPeople = extracted.numPeople ?? basePrefs?.numPeople ?? 2;
    const budgetRaw = extracted.budget ?? basePrefs?.budgetTotal ?? 3000;
    const budgetType = extracted.budgetType ?? basePrefs?.budgetType ?? 'total';
    const budgetTotal = budgetType === 'per_person' ? budgetRaw * numPeople : budgetRaw;

    return {
      date: basePrefs?.date || 'Today',
      startTime: start,
      endTime: endStr,
      city: basePrefs?.city || 'Delhi NCR',
      area: basePrefs?.area || 'South Delhi & CP',
      startLocation: extracted.startLocation || basePrefs?.startLocation,
      numPeople,
      budgetTotal,
      budgetType,
      budgetReservePercent: extracted.budgetReservePercent ?? (basePrefs?.budgetReservePercent || 10),
      maximizeExperience: extracted.maximizeExperience ?? basePrefs?.maximizeExperience ?? false,
      ageGroup: basePrefs?.ageGroup || 'young_adults',
      mode: extracted.mode || basePrefs?.mode || 'custom',
      transportMode: extracted.transportMode || basePrefs?.transportMode || 'car',
      dietary: extracted.dietary.length > 0 ? extracted.dietary : basePrefs?.dietary,
      tags: basePrefs?.tags || [],
      naturalPrompt: prompt,
      requiredCategories: extracted.categories.length > 0 ? extracted.categories : undefined,
      preferredActivities: extracted.preferredActivities.length > 0 ? extracted.preferredActivities : undefined,
      indoorOnly: extracted.indoorOnly ?? basePrefs?.indoorOnly
    };
  }

  private static standardizeTimeString(timeStr: string): string {
    const clean = timeStr.trim().toLowerCase();
    const isPM = clean.includes('pm');
    const isAM = clean.includes('am');
    const digits = clean.replace(/[ap]m/g, '').trim();
    const parts = digits.split(':');
    let h = parseInt(parts[0], 10) || 11;
    const m = parts[1] ? parseInt(parts[1], 10) : 0;

    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
