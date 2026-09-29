import { QueueEntry } from '../types';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';
import { NotificationService } from './notificationService';
import { BookingManager } from './bookingAdapters';

const STORAGE_KEY_QUEUES = 'dayly_virtual_queues';

type QueueListener = (queues: QueueEntry[]) => void;

class QueueServiceClass {
  private listeners: Set<QueueListener> = new Set();
  private timers: Map<string, number> = new Map();

  constructor() {
    // Resume simulation on page load if any monitoring queue exists
    setTimeout(() => {
      const active = this.getStored().filter((q) => q.status === 'monitoring');
      active.forEach((q) => this.runSimulationSteps(q.id));
    }, 1000);
  }

  private getStored(): QueueEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_QUEUES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save(entries: QueueEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEY_QUEUES, JSON.stringify(entries));
    } catch (e) {
      console.error(e);
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    const list = this.getStored();
    this.listeners.forEach((fn) => fn(list));
  }

  subscribe(listener: QueueListener) {
    this.listeners.add(listener);
    listener(this.getStored());
    return () => {
      this.listeners.delete(listener);
    };
  }

  getAllQueues(): QueueEntry[] {
    return this.getStored();
  }

  getQueueStatus(queueId: string): QueueEntry | undefined {
    return this.getStored().find((q) => q.id === queueId);
  }

  joinQueue(
    experienceId: string,
    slotTime: string,
    slotDate: string = 'Today',
    partySize: number = 2,
    autoBook: boolean = false
  ): QueueEntry {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === experienceId);
    if (!exp) throw new Error('Experience not found');

    const slot = exp.slots.find((s) => s.time === slotTime);
    const initialPos = slot?.waitlistLength || 37;

    const entry: QueueEntry = {
      id: `queue-${Date.now()}`,
      experienceId: exp.id,
      experienceName: exp.name,
      experienceImage: exp.images[0],
      venueName: exp.venue.name,
      slotTime,
      slotDate,
      partySize,
      initialPosition: initialPos,
      currentPosition: initialPos,
      estimatedWaitMinutes: Math.round(initialPos * 0.5),
      status: 'monitoring',
      autoBook,
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const current = this.getStored();
    this.save([entry, ...current]);

    NotificationService.addNotification({
      title: 'Joined DAYLY Virtual Queue',
      message: `You are #${initialPos} in line for ${exp.name} (${slotTime}). DAYLY is monitoring slot releases.`,
      type: 'queue',
      actionUrl: '/bookings',
      actionText: 'Track Queue'
    });

    this.runSimulationSteps(entry.id);
    return entry;
  }

  private runSimulationSteps(queueId: string) {
    if (this.timers.has(queueId)) return;

    // Fast-tracked realistic progression for user demo experience:
    // Step 1: 37 -> 25 (after 4s)
    // Step 2: 25 -> 12 (after 9s)
    // Step 3: 12 -> 4 (after 14s)
    // Step 4: Slot Available! (after 20s)
    const timer1 = window.setTimeout(() => this.advancePosition(queueId, 25), 4500);
    const timer2 = window.setTimeout(() => this.advancePosition(queueId, 12), 9500);
    const timer3 = window.setTimeout(() => {
      this.advancePosition(queueId, 4);
      const q = this.getQueueStatus(queueId);
      if (q) {
        NotificationService.addNotification({
          title: 'Queue Moving Fast! (#4)',
          message: `Your position for ${q.experienceName} is now #4. Estimated wait: 2 mins.`,
          type: 'queue'
        });
      }
    }, 14500);

    const timer4 = window.setTimeout(() => {
      this.markSlotAvailable(queueId);
      this.timers.delete(queueId);
    }, 20500);

    this.timers.set(queueId, timer4);
  }

  private advancePosition(queueId: string, newPos: number) {
    const list = this.getStored();
    const updated = list.map((q) => {
      if (q.id === queueId && q.status === 'monitoring') {
        return {
          ...q,
          currentPosition: newPos,
          estimatedWaitMinutes: Math.max(1, Math.round(newPos * 0.4))
        };
      }
      return q;
    });
    this.save(updated);
  }

  private async markSlotAvailable(queueId: string) {
    const list = this.getStored();
    const target = list.find((q) => q.id === queueId);
    if (!target || target.status !== 'monitoring') return;

    const availableUntil = new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (target.autoBook) {
      // Execute auto-book via BookingManager!
      const exp = MOCK_EXPERIENCES.find((e) => e.id === target.experienceId);
      if (exp) {
        const slot = exp.slots.find((s) => s.time === target.slotTime) || exp.slots[0];
        await BookingManager.book({
          experienceId: exp.id,
          slotId: slot.id,
          date: target.slotDate,
          numPeople: target.partySize,
          attendeeName: 'Parv Gupta (Auto-Booked)',
          attendeeEmail: 'parv@example.com',
          attendeePhone: '+91 98112 34567'
        });

        const updated = list.map((q) => (q.id === queueId ? { ...q, status: 'booked' as const, currentPosition: 0 } : q));
        this.save(updated);

        NotificationService.addNotification({
          title: '✨ Auto-Booked Successfully!',
          message: `DAYLY Auto-Book secured your ticket for ${target.experienceName} at ${target.slotTime}!`,
          type: 'booking',
          actionUrl: '/bookings',
          actionText: 'View Ticket QR'
        });
        return;
      }
    }

    // Manual reserve required
    const updated = list.map((q) =>
      q.id === queueId
        ? {
            ...q,
            status: 'slot_available' as const,
            currentPosition: 0,
            availableUntil
          }
        : q
    );
    this.save(updated);

    NotificationService.addNotification({
      title: '🎉 YOUR SLOT IS AVAILABLE!',
      message: `${target.experienceName} (${target.slotTime}) opened a spot! Hold expires at ${availableUntil}.`,
      type: 'queue',
      actionUrl: '/bookings',
      actionText: 'Reserve Now'
    });
  }

  async reserveSlot(queueId: string): Promise<boolean> {
    const q = this.getQueueStatus(queueId);
    if (!q || q.status !== 'slot_available') return false;

    const exp = MOCK_EXPERIENCES.find((e) => e.id === q.experienceId);
    if (!exp) return false;

    const slot = exp.slots.find((s) => s.time === q.slotTime) || exp.slots[0];
    await BookingManager.book({
      experienceId: exp.id,
      slotId: slot.id,
      date: q.slotDate,
      numPeople: q.partySize,
      attendeeName: 'Parv Gupta',
      attendeeEmail: 'parv@example.com',
      attendeePhone: '+91 98112 34567'
    });

    const list = this.getStored();
    const updated = list.map((item) => (item.id === queueId ? { ...item, status: 'booked' as const } : item));
    this.save(updated);

    NotificationService.addNotification({
      title: 'Slot Confirmed!',
      message: `Reservation confirmed for ${q.experienceName}. Added to your bookings.`,
      type: 'booking',
      actionUrl: '/bookings',
      actionText: 'View QR Code'
    });

    return true;
  }

  leaveQueue(queueId: string) {
    if (this.timers.has(queueId)) {
      clearTimeout(this.timers.get(queueId));
      this.timers.delete(queueId);
    }
    const list = this.getStored();
    const updated = list.filter((q) => q.id !== queueId);
    this.save(updated);

    NotificationService.addNotification({
      title: 'Left Virtual Queue',
      message: 'You have left the virtual waitlist.',
      type: 'queue'
    });
  }
}

export const QueueService = new QueueServiceClass();
