import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DayItinerary,
  Experience,
  Booking,
  QueueEntry,
  NotificationItem,
  UserProfile,
  ItineraryItem,
  PlanGenerationResult,
  PlanningPreferences
} from '../types';
import { ItineraryEngine, minutesToTimeString, timeStringToMinutes } from '../services/itineraryEngine';
import { BookingManager } from '../services/bookingAdapters';
import { QueueService } from '../services/queueService';
import { NotificationService } from '../services/notificationService';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';
import { SupabaseSyncService } from '../services/supabaseSyncService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AppContextType {
  isSupabaseConnected: boolean;
  activeDay: DayItinerary;
  setActiveDay: (day: DayItinerary) => void;
  planOptions?: PlanGenerationResult['options'];
  activeOption: 'budget_friendly' | 'balanced' | 'max_experience';
  setPlanResult: (result: PlanGenerationResult) => void;
  switchOption: (option: 'budget_friendly' | 'balanced' | 'max_experience') => void;
  lastExtractedPreferences?: PlanningPreferences;
  setLastExtractedPreferences: (prefs: PlanningPreferences) => void;
  wishlistIds: string[];
  toggleWishlist: (expId: string) => void;
  bookings: Booking[];
  refreshBookings: () => void;
  queues: QueueEntry[];
  joinVirtualQueue: (
    expId: string,
    time: string,
    date?: string,
    partySize?: number,
    autoBook?: boolean,
    assistantOptions?: {
      assistantEnabled?: boolean;
      autoQueueEntry?: boolean;
      openingTime?: string;
      timeZone?: string;
    }
  ) => void;
  reserveQueueSlot: (queueId: string) => Promise<boolean>;
  leaveQueue: (queueId: string) => void;
  startAssistantMonitoring: (queueId: string) => void;
  stopAssistantMonitoring: (queueId: string) => void;
  toggleAutoQueueEntry: (queueId: string, auto: boolean) => void;
  solveManualVerification: (queueId: string, solution: string) => boolean;
  triggerManualCheck: (queueId: string) => Promise<void>;
  notifications: NotificationItem[];
  unreadNotifs: number;
  markNotifRead: (id: string) => void;
  markAllNotifsRead: () => void;
  toast: NotificationItem | null;
  dismissToast: () => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  // Day itinerary mutation helpers:
  addExperienceToActiveDay: (exp: Experience) => void;
  removeActivityFromDay: (itemId: string) => void;
  replaceActivityInDay: (itemId: string, newExp: Experience) => void;
  shiftActivityTime: (itemId: string, deltaMins: number) => void;
  moveActivityPosition: (fromIdx: number, toIdx: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_WISHLIST = 'dayly_wishlist_ids';
const STORAGE_KEY_PROFILE = 'dayly_user_profile';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDay, setActiveDayState] = useState<DayItinerary>(() => ItineraryEngine.getActiveDay());
  const [planOptions, setPlanOptions] = useState<PlanGenerationResult['options'] | undefined>(undefined);
  const [activeOption, setActiveOption] = useState<'budget_friendly' | 'balanced' | 'max_experience'>('balanced');
  const [lastExtractedPreferences, setLastExtractedPreferences] = useState<PlanningPreferences | undefined>(undefined);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WISHLIST);
      return raw ? JSON.parse(raw) : ['exp-craft-1', 'exp-food-1', 'exp-ent-1'];
    } catch {
      return ['exp-craft-1', 'exp-food-1'];
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => BookingManager.getAllBookings());
  const [queues, setQueues] = useState<QueueEntry[]>(() => QueueService.getAllQueues());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    NotificationService.getNotifications()
  );
  const [toast, setToast] = useState<NotificationItem | null>(null);

  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return {
      id: 'usr-parv-01',
      name: 'Parv Gupta',
      email: 'parv@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      savedPlaces: ['Mehrauli', 'Hauz Khas', 'Connaught Place'],
      wishlistIds: ['exp-craft-1', 'exp-food-1'],
      preferredCity: 'Delhi NCR',
      preferredCategories: ['food', 'workshops', 'movies', 'outdoor'],
      budgetTier: 'moderate',
      dietaryPreference: 'Vegetarian friendly'
    };
  });

  // Keep active day in local storage and cloud
  const setActiveDay = (day: DayItinerary) => {
    setActiveDayState(day);
    ItineraryEngine.saveActiveDay(day);
    SupabaseSyncService.syncItinerary(day);
  };

  const setPlanResult = (result: PlanGenerationResult) => {
    setPlanOptions(result.options);
    setActiveOption(result.activeOption);
    setLastExtractedPreferences(result.extractedPreferences);
    const chosen =
      result.options[result.activeOption] ||
      result.options.balanced ||
      result.options.budget_friendly ||
      result.options.max_experience;
    if (chosen) {
      setActiveDay(chosen);
    }
  };

  const switchOption = (opt: 'budget_friendly' | 'balanced' | 'max_experience') => {
    if (!planOptions) return;
    const target = planOptions[opt];
    if (target) {
      setActiveOption(opt);
      setActiveDay(target);
      NotificationService.addNotification({
        title: `Switched to ${opt === 'budget_friendly' ? 'Budget Friendly' : opt === 'balanced' ? 'Balanced' : 'Maximum Experience'}`,
        message: `Itinerary recalibrated. Planned cost: ₹${target.totalCost} (Budget: ₹${target.userBudget}).`,
        type: 'itinerary'
      });
    }
  };

  // Sync queues and notifications via subscriptions
  useEffect(() => {
    const unsubQueues = QueueService.subscribe((list) => setQueues([...list]));
    const unsubNotifs = NotificationService.subscribe((list) => setNotifications([...list]));
    const unsubToast = NotificationService.subscribeToast((t) => {
      setToast(t);
      setTimeout(() => {
        setToast((current) => (current?.id === t.id ? null : current));
      }, 5000);
    });

    // Cloud synchronization when Supabase credentials are configured
    if (isSupabaseConfigured) {
      SupabaseSyncService.fetchBookings().then((cloudBookings) => {
        if (cloudBookings.length > 0) setBookings(cloudBookings);
      });
      SupabaseSyncService.fetchQueues().then((cloudQueues) => {
        if (cloudQueues.length > 0) setQueues(cloudQueues);
      });
      SupabaseSyncService.fetchWishlist().then((cloudWishlist) => {
        if (cloudWishlist.length > 0) setWishlistIds(cloudWishlist);
      });
      SupabaseSyncService.fetchProfile().then((cloudProfile) => {
        if (cloudProfile) setUserProfileState((prev) => ({ ...prev, ...cloudProfile }));
      });
    }

    return () => {
      unsubQueues();
      unsubNotifs();
      unsubToast();
    };
  }, []);

  const refreshBookings = () => {
    setBookings(BookingManager.getAllBookings());
    if (isSupabaseConfigured) {
      SupabaseSyncService.fetchBookings().then((cloud) => {
        if (cloud.length > 0) setBookings(cloud);
      });
    }
  };

  const toggleWishlist = (expId: string) => {
    const isAdding = !wishlistIds.includes(expId);
    setWishlistIds((prev) => {
      const next = isAdding ? [...prev, expId] : prev.filter((id) => id !== expId);
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(next));
      return next;
    });
    SupabaseSyncService.syncWishlistToggle(expId, isAdding);
  };

  const joinVirtualQueue = (
    expId: string,
    time: string,
    date = 'Today',
    partySize = 2,
    autoBook = false,
    assistantOptions?: {
      assistantEnabled?: boolean;
      autoQueueEntry?: boolean;
      openingTime?: string;
      timeZone?: string;
    }
  ) => {
    QueueService.joinQueue(expId, time, date, partySize, autoBook, assistantOptions);
    const created = QueueService.getAllQueues().find((q) => q.experienceId === expId && q.slotTime === time);
    if (created) {
      SupabaseSyncService.syncQueue(created);
    }
  };

  const reserveQueueSlot = async (queueId: string) => {
    const ok = await QueueService.reserveSlot(queueId);
    if (ok) refreshBookings();
    return ok;
  };

  const leaveQueue = (queueId: string) => {
    QueueService.leaveQueue(queueId);
    SupabaseSyncService.removeQueue(queueId);
  };

  const startAssistantMonitoring = (queueId: string) => {
    QueueService.startAssistantMonitoring(queueId);
  };

  const stopAssistantMonitoring = (queueId: string) => {
    QueueService.stopAssistantMonitoring(queueId);
  };

  const toggleAutoQueueEntry = (queueId: string, auto: boolean) => {
    QueueService.toggleAutoQueueEntry(queueId, auto);
  };

  const solveManualVerification = (queueId: string, solution: string) => {
    return QueueService.solveManualVerification(queueId, solution);
  };

  const triggerManualCheck = async (queueId: string) => {
    await QueueService.triggerManualCheck(queueId);
  };

  const markNotifRead = (id: string) => {
    NotificationService.markAsRead(id);
  };

  const markAllNotifsRead = () => {
    NotificationService.markAllAsRead();
  };

  const dismissToast = () => {
    setToast(null);
  };

  const updateUserProfile = (patch: Partial<UserProfile>) => {
    setUserProfileState((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(next));
      SupabaseSyncService.syncProfile(next);
      return next;
    });
  };

  // Itinerary mutations with deterministic recalculation and validation
  const addExperienceToActiveDay = (exp: Experience) => {
    const clone: DayItinerary = JSON.parse(JSON.stringify(activeDay));
    const numPeople = clone.numPeople || 2;

    let startMins = 720;
    if (clone.items.length > 0) {
      const last = clone.items[clone.items.length - 1];
      startMins = timeStringToMinutes(last.endTime) + 25;
    }

    const newItem: ItineraryItem = {
      id: `item-${Date.now()}`,
      experience: exp,
      startTime: minutesToTimeString(startMins),
      endTime: minutesToTimeString(startMins + exp.durationMinutes),
      durationMinutes: exp.durationMinutes,
      selectedSlotId: exp.slots[0]?.id || 's-1',
      isBooked: false,
      pricePerPerson: exp.pricePerPerson,
      numPeople,
      itemCost: ItineraryEngine.calculateActivityCost(exp, numPeople)
    };

    clone.items.push(newItem);
    const repaired = ItineraryEngine.repairItinerary(clone, lastExtractedPreferences);
    setActiveDay(repaired);

    NotificationService.addNotification({
      title: 'Added to Your Day',
      message: `"${exp.name}" was scheduled at ${newItem.startTime}. Route & budget recalibrated.`,
      type: 'itinerary'
    });
  };

  const removeActivityFromDay = (itemId: string) => {
    const clone: DayItinerary = JSON.parse(JSON.stringify(activeDay));
    clone.items = clone.items.filter((it) => it.id !== itemId);
    const repaired = ItineraryEngine.repairItinerary(clone, lastExtractedPreferences);
    setActiveDay(repaired);
  };

  const replaceActivityInDay = (itemId: string, newExp: Experience) => {
    const clone: DayItinerary = JSON.parse(JSON.stringify(activeDay));
    const targetIdx = clone.items.findIndex((it) => it.id === itemId);
    if (targetIdx === -1) return;

    const numPeople = clone.numPeople || 2;
    const oldItem = clone.items[targetIdx];
    const startMins = timeStringToMinutes(oldItem.startTime);

    clone.items[targetIdx] = {
      id: `item-rep-${Date.now()}`,
      experience: newExp,
      startTime: oldItem.startTime,
      endTime: minutesToTimeString(startMins + newExp.durationMinutes),
      durationMinutes: newExp.durationMinutes,
      selectedSlotId: newExp.slots[0]?.id || 's-1',
      isBooked: false,
      pricePerPerson: newExp.pricePerPerson,
      numPeople,
      itemCost: ItineraryEngine.calculateActivityCost(newExp, numPeople)
    };

    const repaired = ItineraryEngine.repairItinerary(clone, lastExtractedPreferences);
    setActiveDay(repaired);

    const costDiff = repaired.totalCost - activeDay.totalCost;
    NotificationService.addNotification({
      title: 'Activity Replaced',
      message: `Swapped for ${newExp.name}. ${
        costDiff > 0 ? `+₹${costDiff} cost difference.` : costDiff < 0 ? `-₹${Math.abs(costDiff)} saved.` : 'Equal cost.'
      } Schedule recalibrated.`,
      type: 'itinerary'
    });
  };

  const shiftActivityTime = (itemId: string, deltaMins: number) => {
    const clone: DayItinerary = JSON.parse(JSON.stringify(activeDay));
    const target = clone.items.find((it) => it.id === itemId);
    if (!target) return;

    const start = timeStringToMinutes(target.startTime) + deltaMins;
    const end = timeStringToMinutes(target.endTime) + deltaMins;
    target.startTime = minutesToTimeString(start);
    target.endTime = minutesToTimeString(end);
    target.customTimeChosen = true;

    const repaired = ItineraryEngine.repairItinerary(clone, lastExtractedPreferences);
    setActiveDay(repaired);
  };

  const moveActivityPosition = (fromIdx: number, toIdx: number) => {
    const clone: DayItinerary = JSON.parse(JSON.stringify(activeDay));
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= clone.items.length || toIdx >= clone.items.length)
      return;

    const [moved] = clone.items.splice(fromIdx, 1);
    clone.items.splice(toIdx, 0, moved);

    const repaired = ItineraryEngine.repairItinerary(clone, lastExtractedPreferences);
    setActiveDay(repaired);
  };

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        isSupabaseConnected: isSupabaseConfigured,
        activeDay,
        setActiveDay,
        planOptions,
        activeOption,
        setPlanResult,
        switchOption,
        lastExtractedPreferences,
        setLastExtractedPreferences,
        wishlistIds,
        toggleWishlist,
        bookings,
        refreshBookings,
        queues,
        joinVirtualQueue,
        reserveQueueSlot,
        leaveQueue,
        startAssistantMonitoring,
        stopAssistantMonitoring,
        toggleAutoQueueEntry,
        solveManualVerification,
        triggerManualCheck,
        notifications,
        unreadNotifs,
        markNotifRead,
        markAllNotifsRead,
        toast,
        dismissToast,
        userProfile,
        updateUserProfile,
        addExperienceToActiveDay,
        removeActivityFromDay,
        replaceActivityInDay,
        shiftActivityTime,
        moveActivityPosition
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
