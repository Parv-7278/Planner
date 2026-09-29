import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DayItinerary,
  Experience,
  Booking,
  QueueEntry,
  NotificationItem,
  UserProfile,
  ItineraryItem
} from '../types';
import { ItineraryEngine, minutesToTimeString, timeStringToMinutes } from '../services/itineraryEngine';
import { BookingManager } from '../services/bookingAdapters';
import { QueueService } from '../services/queueService';
import { NotificationService } from '../services/notificationService';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';

interface AppContextType {
  activeDay: DayItinerary;
  setActiveDay: (day: DayItinerary) => void;
  wishlistIds: string[];
  toggleWishlist: (expId: string) => void;
  bookings: Booking[];
  refreshBookings: () => void;
  queues: QueueEntry[];
  joinVirtualQueue: (expId: string, time: string, date?: string, partySize?: number, autoBook?: boolean) => void;
  reserveQueueSlot: (queueId: string) => Promise<boolean>;
  leaveQueue: (queueId: string) => void;
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

  // Keep active day in local storage
  const setActiveDay = (day: DayItinerary) => {
    setActiveDayState(day);
    ItineraryEngine.saveActiveDay(day);
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

    return () => {
      unsubQueues();
      unsubNotifs();
      unsubToast();
    };
  }, []);

  const refreshBookings = () => {
    setBookings(BookingManager.getAllBookings());
  };

  const toggleWishlist = (expId: string) => {
    setWishlistIds((prev) => {
      const next = prev.includes(expId) ? prev.filter((id) => id !== expId) : [...prev, expId];
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(next));
      return next;
    });
  };

  const joinVirtualQueue = (
    expId: string,
    time: string,
    date = 'Today',
    partySize = 2,
    autoBook = false
  ) => {
    QueueService.joinQueue(expId, time, date, partySize, autoBook);
  };

  const reserveQueueSlot = async (queueId: string) => {
    const ok = await QueueService.reserveSlot(queueId);
    if (ok) refreshBookings();
    return ok;
  };

  const leaveQueue = (queueId: string) => {
    QueueService.leaveQueue(queueId);
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
      return next;
    });
  };

  // Itinerary mutations
  const addExperienceToActiveDay = (exp: Experience) => {
    const clone: DayItinerary = JSON.parse(JSON.stringify(activeDay));

    let startMins = 720;
    if (clone.items.length > 0) {
      const last = clone.items[clone.items.length - 1];
      startMins = timeStringToMinutes(last.endTime) + 25; // 25 min travel buffer
    }

    const newItem: ItineraryItem = {
      id: `item-${Date.now()}`,
      experience: exp,
      startTime: minutesToTimeString(startMins),
      endTime: minutesToTimeString(startMins + exp.durationMinutes),
      durationMinutes: exp.durationMinutes,
      selectedSlotId: exp.slots[0]?.id || 's-1',
      isBooked: false
    };

    clone.items.push(newItem);
    clone.travelLegs = ItineraryEngine.generateTravelLegs(clone.items, 'car');
    clone.totalCost = clone.items.reduce((s, it) => s + it.experience.pricePerPerson * 2, 0);
    clone.totalDistanceKm = Math.round(clone.travelLegs.reduce((s, l) => s + l.distanceKm, 0) * 10) / 10;
    clone.numActivities = clone.items.length;

    setActiveDay(clone);

    NotificationService.addNotification({
      title: 'Added to Your Day',
      message: `"${exp.name}" was scheduled at ${newItem.startTime}. Route & timings updated.`,
      type: 'itinerary'
    });
  };

  const removeActivityFromDay = (itemId: string) => {
    const clone: DayItinerary = JSON.parse(JSON.stringify(activeDay));
    clone.items = clone.items.filter((it) => it.id !== itemId);
    clone.travelLegs = ItineraryEngine.generateTravelLegs(clone.items, 'car');
    clone.totalCost = clone.items.reduce((s, it) => s + it.experience.pricePerPerson * 2, 0);
    clone.totalDistanceKm = Math.round(clone.travelLegs.reduce((s, l) => s + l.distanceKm, 0) * 10) / 10;
    clone.numActivities = clone.items.length;
    setActiveDay(clone);
  };

  const replaceActivityInDay = (itemId: string, newExp: Experience) => {
    const clone: DayItinerary = JSON.parse(JSON.stringify(activeDay));
    const targetIdx = clone.items.findIndex((it) => it.id === itemId);
    if (targetIdx === -1) return;

    const oldItem = clone.items[targetIdx];
    const startMins = timeStringToMinutes(oldItem.startTime);

    clone.items[targetIdx] = {
      id: `item-rep-${Date.now()}`,
      experience: newExp,
      startTime: oldItem.startTime,
      endTime: minutesToTimeString(startMins + newExp.durationMinutes),
      durationMinutes: newExp.durationMinutes,
      selectedSlotId: newExp.slots[0]?.id || 's-1',
      isBooked: false
    };

    clone.travelLegs = ItineraryEngine.generateTravelLegs(clone.items, 'car');
    clone.totalCost = clone.items.reduce((s, it) => s + it.experience.pricePerPerson * 2, 0);
    clone.totalDistanceKm = Math.round(clone.travelLegs.reduce((s, l) => s + l.distanceKm, 0) * 10) / 10;
    setActiveDay(clone);

    NotificationService.addNotification({
      title: 'Activity Replaced',
      message: `Replaced with ${newExp.name}. Timings and route recalibrated.`,
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

    setActiveDay(clone);
  };

  const moveActivityPosition = (fromIdx: number, toIdx: number) => {
    const clone: DayItinerary = JSON.parse(JSON.stringify(activeDay));
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= clone.items.length || toIdx >= clone.items.length)
      return;

    const [moved] = clone.items.splice(fromIdx, 1);
    clone.items.splice(toIdx, 0, moved);

    // Re-adjust timings sequentially
    let clock = timeStringToMinutes(clone.items[0].startTime);
    clone.items.forEach((it, idx) => {
      it.startTime = minutesToTimeString(clock);
      it.endTime = minutesToTimeString(clock + it.durationMinutes);
      clock += it.durationMinutes + (idx < clone.items.length - 1 ? 25 : 0);
    });

    clone.travelLegs = ItineraryEngine.generateTravelLegs(clone.items, 'car');
    setActiveDay(clone);
  };

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        activeDay,
        setActiveDay,
        wishlistIds,
        toggleWishlist,
        bookings,
        refreshBookings,
        queues,
        joinVirtualQueue,
        reserveQueueSlot,
        leaveQueue,
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
