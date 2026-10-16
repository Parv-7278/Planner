import type { QueueEntry, VerificationChallenge } from '../types/index.ts';
import { MOCK_EXPERIENCES } from '../data/mockExperiences.ts';
import { NotificationService } from './notificationService.ts';
import { BookingManager } from './bookingAdapters.ts';
import { BookingAssistantService } from './bookingAssistantService.ts';

const STORAGE_KEY_QUEUES = 'dayly_virtual_queues';

type QueueListener = (queues: QueueEntry[]) => void;

class QueueServiceClass {
  private listeners: Set<QueueListener> = new Set();
  private timers: Map<string, number | NodeJS.Timeout> = new Map();

  constructor() {
    // Resume simulation or assistant monitoring on page load if any active queue exists
    setTimeout(() => {
      const active = this.getStored().filter((q) => q.status === 'monitoring' || q.monitoringStatus === 'monitoring_opening' || q.monitoringStatus === 'in_queue');
      active.forEach((q) => {
        if (q.assistantEnabled) {
          this.runAssistantLoop(q.id);
        } else {
          this.runSimulationSteps(q.id);
        }
      });
    }, 1000);
  }

  private inMemoryQueues: QueueEntry[] | null = null;

  private getStored(): QueueEntry[] {
    if (this.inMemoryQueues !== null) {
      return this.inMemoryQueues;
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_QUEUES);
        if (raw) {
          this.inMemoryQueues = JSON.parse(raw);
          return this.inMemoryQueues!;
        }
      } catch {
        // fallback
      }
    }
    return [];
  }

  private save(entries: QueueEntry[]) {
    this.inMemoryQueues = entries;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_QUEUES, JSON.stringify(entries));
      } catch {
        // fallback
      }
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
    autoBook: boolean = false,
    assistantOptions?: {
      assistantEnabled?: boolean;
      autoQueueEntry?: boolean;
      openingTime?: string;
      timeZone?: string;
      initialChallenge?: VerificationChallenge;
    }
  ): QueueEntry {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === experienceId);
    if (!exp) throw new Error('Experience not found');

    // Duplicate queue entry prevention:
    const existing = this.getStored().find(
      (q) =>
        q.experienceId === experienceId &&
        q.slotTime === slotTime &&
        q.slotDate === slotDate &&
        q.status !== 'booked' &&
        q.status !== 'expired' &&
        q.status !== 'left'
    );

    if (existing) {
      if (assistantOptions) {
        if (assistantOptions.assistantEnabled !== undefined) existing.assistantEnabled = assistantOptions.assistantEnabled;
        if (assistantOptions.autoQueueEntry !== undefined) existing.autoQueueEntry = assistantOptions.autoQueueEntry;
        if (assistantOptions.openingTime !== undefined) existing.openingTime = assistantOptions.openingTime;
        if (assistantOptions.timeZone !== undefined) existing.timeZone = assistantOptions.timeZone;
        this.save(this.getStored().map((q) => (q.id === existing.id ? existing : q)));
      }
      return existing;
    }

    const slot = exp.slots.find((s) => s.time === slotTime);
    const initialPos = slot?.waitlistLength || 37;

    const isOpeningScheduled = Boolean(assistantOptions?.openingTime);
    const assistantEnabled = assistantOptions?.assistantEnabled ?? true;
    const autoQueueEntry = assistantOptions?.autoQueueEntry ?? true;

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
      currentPosition: isOpeningScheduled ? 0 : initialPos,
      estimatedWaitMinutes: isOpeningScheduled ? 0 : Math.round(initialPos * 0.5),
      status: 'monitoring',
      autoBook,
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      assistantEnabled,
      monitoringStatus: isOpeningScheduled ? 'monitoring_opening' : 'in_queue',
      autoQueueEntry,
      openingTime: assistantOptions?.openingTime,
      timeZone: assistantOptions?.timeZone || 'Asia/Kolkata',
      lastCheckedAt: new Date().toLocaleTimeString(),
      checkIntervalSeconds: 5,
      workerLockId: `lock-${Date.now()}`,
      requiresPaymentApproval: false,
      requiresManualVerification: Boolean(assistantOptions?.initialChallenge),
      verificationChallenge: assistantOptions?.initialChallenge,
      logs: [
        {
          id: `log-init-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: isOpeningScheduled
            ? `AI Assistant scheduled to detect booking opening at ${assistantOptions?.openingTime}.`
            : `Joined official queue at position #${initialPos}. Assistant active.`
        }
      ]
    };

    const current = this.getStored();
    this.save([entry, ...current]);

    // Send notification
    if (isOpeningScheduled) {
      NotificationService.addNotification({
        title: '🤖 Assistant Scheduled for Opening Drop',
        message: `Monitoring ${exp.name} (${slotTime}). Will auto-join queue at ${assistantOptions?.openingTime}.`,
        type: 'queue',
        actionUrl: '/bookings',
        actionText: 'View Assistant'
      });
    } else {
      NotificationService.addNotification({
        title: 'Joined DAYLY Virtual Queue',
        message: `You are #${initialPos} in line for ${exp.name} (${slotTime}). DAYLY Assistant is monitoring slot releases.`,
        type: 'queue',
        actionUrl: '/bookings',
        actionText: 'Track Queue'
      });
    }

    if (assistantEnabled) {
      this.runAssistantLoop(entry.id);
    } else {
      this.runSimulationSteps(entry.id);
    }

    return entry;
  }

  public startAssistantMonitoring(queueId: string) {
    const list = this.getStored();
    const target = list.find((q) => q.id === queueId);
    if (!target) return;

    target.assistantEnabled = true;
    if (target.status === 'slot_available') {
      target.monitoringStatus = 'turn_arrived';
    } else if (target.openingTime && target.currentPosition === 0) {
      target.monitoringStatus = 'monitoring_opening';
    } else {
      target.monitoringStatus = 'in_queue';
    }

    target.lastCheckedAt = new Date().toLocaleTimeString();
    if (!target.logs) target.logs = [];
    target.logs.unshift({
      id: `log-start-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'AI Assistant continuous monitoring started.'
    });

    this.save(list);
    this.runAssistantLoop(queueId);

    NotificationService.addNotification({
      title: '🤖 Booking Assistant Active',
      message: `Monitoring restarted for ${target.experienceName}.`,
      type: 'queue'
    });
  }

  public stopAssistantMonitoring(queueId: string) {
    if (this.timers.has(queueId)) {
      clearTimeout(this.timers.get(queueId) as any);
      this.timers.delete(queueId);
    }

    const list = this.getStored();
    const target = list.find((q) => q.id === queueId);
    if (!target) return;

    target.assistantEnabled = false;
    target.monitoringStatus = 'stopped';
    if (!target.logs) target.logs = [];
    target.logs.unshift({
      id: `log-stop-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'warn',
      message: 'Assistant monitoring paused by user.'
    });

    this.save(list);

    NotificationService.addNotification({
      title: 'Assistant Paused',
      message: `Monitoring suspended for ${target.experienceName}.`,
      type: 'queue'
    });
  }

  public toggleAutoQueueEntry(queueId: string, auto: boolean) {
    const list = this.getStored();
    const target = list.find((q) => q.id === queueId);
    if (!target) return;

    target.autoQueueEntry = auto;
    this.save(list);
  }

  public solveManualVerification(queueId: string, solution: string): boolean {
    const list = this.getStored();
    const target = list.find((q) => q.id === queueId);
    if (!target) return false;

    const ok = BookingAssistantService.solveVerificationChallenge(target, solution);
    if (ok) {
      this.save(list);
      this.runAssistantLoop(queueId);
    }
    return ok;
  }

  public async triggerManualCheck(queueId: string) {
    const list = this.getStored();
    const target = list.find((q) => q.id === queueId);
    if (!target) return;

    target.lastCheckedAt = new Date().toLocaleTimeString();
    if (target.monitoringStatus === 'monitoring_opening') {
      const res = await BookingAssistantService.checkBookingOpening(target.experienceId, target.slotTime);
      if (res.isOpen && target.autoQueueEntry) {
        target.monitoringStatus = 'in_queue';
        target.currentPosition = target.initialPosition || 25;
        target.estimatedWaitMinutes = Math.round(target.currentPosition * 0.5);
      }
    } else if (target.monitoringStatus === 'in_queue') {
      await BookingAssistantService.pollQueueStatus(target);
    }
    this.save(list);
  }

  private runAssistantLoop(queueId: string) {
    if (this.timers.has(queueId)) return;

    const stepInterval = 4500;
    const timer = setInterval(async () => {
      const list = this.getStored();
      const target = list.find((q) => q.id === queueId);

      if (!target || !target.assistantEnabled || target.monitoringStatus === 'stopped' || target.status === 'booked') {
        clearInterval(timer);
        this.timers.delete(queueId);
        return;
      }

      // If manual verification is required, pause loop until solved
      if (target.requiresManualVerification) {
        return;
      }

      target.lastCheckedAt = new Date().toLocaleTimeString();

      if (target.monitoringStatus === 'monitoring_opening') {
        const openingCheck = await BookingAssistantService.checkBookingOpening(
          target.experienceId,
          target.slotTime,
          target.openingTime,
          target.timeZone
        );

        if (openingCheck.isOpen) {
          if (target.autoQueueEntry) {
            target.currentPosition = target.initialPosition || 37;
            target.estimatedWaitMinutes = Math.round(target.currentPosition * 0.5);
            target.monitoringStatus = 'in_queue';
            if (!target.logs) target.logs = [];
            target.logs.unshift({
              id: `log-open-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              level: 'success',
              message: `Bookings opened! Auto-joined official queue as #${target.currentPosition}.`
            });
            NotificationService.addNotification({
              title: '🚀 Bookings Opened!',
              message: `Auto-joined official queue for ${target.experienceName}. Position #${target.currentPosition}.`,
              type: 'queue',
              actionUrl: '/bookings',
              actionText: 'Track Queue'
            });
          } else {
            target.monitoringStatus = 'idle';
          }
        }
        this.save(list);
        return;
      }

      if (target.monitoringStatus === 'in_queue') {
        if (target.currentPosition > 4) {
          const next = Math.max(4, Math.round(target.currentPosition * 0.65));
          target.currentPosition = next;
          target.estimatedWaitMinutes = Math.max(1, Math.round(next * 0.45));
          if (!target.logs) target.logs = [];
          target.logs.unshift({
            id: `log-prog-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: `Queue position advanced to #${next}. Est. wait: ~${target.estimatedWaitMinutes}m.`
          });

          if (next <= 4) {
            NotificationService.addNotification({
              title: '⚡ Your Turn is Approaching!',
              message: `Position for ${target.experienceName} is now #${next}. Get ready to confirm.`,
              type: 'queue',
              actionUrl: '/bookings',
              actionText: 'View Queue'
            });
          }
        } else if (target.currentPosition > 1) {
          target.currentPosition = 1;
          target.estimatedWaitMinutes = 1;
          if (!target.logs) target.logs = [];
          target.logs.unshift({
            id: `log-next-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: 'You are next in line! Position #1.'
          });
        } else {
          // TURN HAS ARRIVED!
          // Note: PAUSE FOR USER APPROVAL (Requirement 8)
          target.currentPosition = 0;
          target.estimatedWaitMinutes = 0;
          target.status = 'slot_available';
          target.monitoringStatus = 'turn_arrived';
          target.requiresPaymentApproval = true; // MUST PAUSE for explicit approval!
          target.bookingHoldToken = `hold-${Date.now()}-${target.experienceId}`;
          target.availableUntil = new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          if (!target.logs) target.logs = [];
          target.logs.unshift({
            id: `log-turn-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            level: 'success',
            message: `🎉 Turn arrived! Reservation held until ${target.availableUntil}. Awaiting explicit confirmation.`
          });

          NotificationService.addNotification({
            title: '🎉 YOUR TURN HAS ARRIVED!',
            message: `Spot secured for ${target.experienceName} (${target.slotTime})! Review and confirm your booking.`,
            type: 'queue',
            actionUrl: '/bookings',
            actionText: 'Confirm Booking'
          });

          clearInterval(timer);
          this.timers.delete(queueId);
        }

        this.save(list);
      }
    }, stepInterval);

    this.timers.set(queueId, timer);
  }

  private runSimulationSteps(queueId: string) {
    if (this.timers.has(queueId)) return;

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
          estimatedWaitMinutes: Math.max(1, Math.round(newPos * 0.4)),
          lastCheckedAt: new Date().toLocaleTimeString()
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

    const availableUntil = new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Pause for user approval before payment (Requirement 8)
    const updated = list.map((q) =>
      q.id === queueId
        ? {
            ...q,
            status: 'slot_available' as const,
            monitoringStatus: 'turn_arrived' as const,
            currentPosition: 0,
            availableUntil,
            requiresPaymentApproval: true,
            bookingHoldToken: `hold-${Date.now()}`
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
    const updated = list.map((item) =>
      item.id === queueId
        ? {
            ...item,
            status: 'booked' as const,
            monitoringStatus: 'completed' as const,
            requiresPaymentApproval: false
          }
        : item
    );
    this.save(updated);

    NotificationService.addNotification({
      title: 'Slot Confirmed & Digital Pass Issued!',
      message: `Reservation confirmed for ${q.experienceName}. Added to your bookings.`,
      type: 'booking',
      actionUrl: '/bookings',
      actionText: 'View QR Code'
    });

    return true;
  }

  leaveQueue(queueId: string) {
    if (this.timers.has(queueId)) {
      clearTimeout(this.timers.get(queueId) as any);
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
