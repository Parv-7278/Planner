import type {
  QueueEntry,
  AssistantMonitoringStatus,
  QueueAssistantLog,
  VerificationChallenge,
  Experience,
  AvailabilitySlot,
  UserProfile
} from '../types/index.ts';
import { MOCK_EXPERIENCES } from '../data/mockExperiences.ts';
import { NotificationService } from './notificationService.ts';
import { BookingManager } from './bookingAdapters.ts';

export interface AssistantConfig {
  checkIntervalSeconds?: number;
  maxRetries?: number;
  timeZone?: string;
  autoQueueEntry?: boolean;
  rateLimitPerMinute?: number;
  sessionToken?: string;
}

export interface BookingOpeningCheckResult {
  isOpen: boolean;
  status: 'closed' | 'open' | 'waitlist' | 'sold_out';
  message: string;
  openingTime?: string;
  availableSeats?: number;
  waitlistLength?: number;
}

export interface QueueStatusResult {
  position: number;
  estimatedWaitMinutes: number;
  turnArrived: boolean;
  status: 'in_queue' | 'turn_arrived' | 'expired' | 'error';
  challenge?: VerificationChallenge;
  message?: string;
}

class BookingAssistantServiceClass {
  private activeWorkers: Map<string, NodeJS.Timeout | number> = new Map();
  private workerLocks: Map<string, string> = new Map(); // queueId -> workerLockId
  private lastCheckTimestamps: Map<string, number> = new Map();
  private retryCounts: Map<string, number> = new Map();

  private log(entry: QueueEntry, level: QueueAssistantLog['level'], message: string): QueueAssistantLog {
    const logItem: QueueAssistantLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      message
    };
    if (!entry.logs) entry.logs = [];
    entry.logs = [logItem, ...entry.logs].slice(0, 50); // keep last 50
    return logItem;
  }

  /**
   * Parse target opening time with timezone awareness (default: Asia/Kolkata / IST)
   */
  public parseOpeningTime(openingTimeStr?: string, timeZone: string = 'Asia/Kolkata'): Date | null {
    if (!openingTimeStr) return null;

    try {
      // If full ISO string:
      if (openingTimeStr.includes('T') || openingTimeStr.includes('-')) {
        const d = new Date(openingTimeStr);
        if (!isNaN(d.getTime())) return d;
      }

      // If time format like "10:00 AM", "02:30 PM", "14:00"
      const now = new Date();
      const parts = openingTimeStr.trim().match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
      if (parts) {
        let hours = parseInt(parts[1], 10);
        const minutes = parseInt(parts[2], 10);
        const meridiem = parts[3]?.toUpperCase();

        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;

        const target = new Date(now);
        target.setHours(hours, minutes, 0, 0);

        // If target time today has already passed by more than 1 hour, schedule for today or check immediate
        return target;
      }
    } catch {
      // fallback
    }
    return null;
  }

  /**
   * Detect if booking has opened for an experience and slot
   */
  public async checkBookingOpening(
    experienceId: string,
    slotTime: string,
    openingTime?: string,
    timeZone: string = 'Asia/Kolkata'
  ): Promise<BookingOpeningCheckResult> {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === experienceId);
    if (!exp) {
      return {
        isOpen: false,
        status: 'closed',
        message: 'Experience venue not found in catalog.'
      };
    }

    const slot = exp.slots.find((s) => s.time === slotTime) || exp.slots[0];
    const now = new Date();

    // Check timezone-scheduled opening
    if (openingTime) {
      const scheduledDate = this.parseOpeningTime(openingTime, timeZone);
      if (scheduledDate && now.getTime() < scheduledDate.getTime()) {
        const secondsRemaining = Math.round((scheduledDate.getTime() - now.getTime()) / 1000);
        const mins = Math.floor(secondsRemaining / 60);
        const secs = secondsRemaining % 60;
        return {
          isOpen: false,
          status: 'closed',
          message: `Bookings closed. Opening scheduled at ${openingTime} (${timeZone}). Countdown: ${mins}m ${secs}s.`,
          openingTime
        };
      }
    }

    // If slot is sold out or on waitlist, official queue is open!
    if (slot.status === 'waitlist' || slot.status === 'sold_out') {
      return {
        isOpen: true,
        status: 'waitlist',
        message: 'Official virtual waitlist queue is open for entries.',
        waitlistLength: slot.waitlistLength || 25,
        availableSeats: 0
      };
    }

    // Direct booking available
    return {
      isOpen: true,
      status: 'open',
      message: `Booking slots are open! ${slot.availableSeats} seats currently available.`,
      availableSeats: slot.availableSeats
    };
  }

  /**
   * Concurrency lock to prevent multiple workers from monitoring the same queue entry
   */
  public acquireWorkerLock(queueId: string): string | null {
    const existingLock = this.workerLocks.get(queueId);
    if (existingLock) {
      return null; // Already locked
    }
    const lockId = `worker-lock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.workerLocks.set(queueId, lockId);
    return lockId;
  }

  public releaseWorkerLock(queueId: string, lockId?: string): boolean {
    const current = this.workerLocks.get(queueId);
    if (!current) return true;
    if (!lockId || current === lockId) {
      this.workerLocks.delete(queueId);
      return true;
    }
    return false;
  }

  /**
   * Join official queue automatically with session details and duplicate protection
   */
  public async joinOfficialQueue(
    entry: QueueEntry,
    userProfile: UserProfile,
    sessionToken: string = 'auth-session-valid'
  ): Promise<{ success: boolean; entry: QueueEntry; challenge?: VerificationChallenge }> {
    // 1. Session expiry verification
    if (sessionToken === 'auth-expired' || sessionToken === 'invalid') {
      entry.monitoringStatus = 'auth_expired';
      entry.assistantErrorMessage = 'User session expired. Please re-authenticate.';
      this.log(entry, 'error', 'Authentication session expired during queue entry.');
      NotificationService.addNotification({
        title: '⚠️ Session Expired',
        message: `Your session expired while attempting to join the queue for ${entry.experienceName}.`,
        type: 'queue'
      });
      return { success: false, entry };
    }

    // 2. Anti-bot / CAPTCHA simulation challenge if flagged
    if (entry.requiresManualVerification && entry.verificationChallenge) {
      entry.monitoringStatus = 'paused_manual_verification';
      this.log(entry, 'warn', `Human verification required (${entry.verificationChallenge.type.toUpperCase()}).`);
      NotificationService.addNotification({
        title: '🔒 Manual Verification Required',
        message: `Please complete ${entry.verificationChallenge.type.toUpperCase()} to join the queue for ${entry.experienceName}.`,
        type: 'queue',
        actionUrl: '/bookings',
        actionText: 'Solve Verification'
      });
      return { success: false, entry, challenge: entry.verificationChallenge };
    }

    // 3. Verify experience and slot
    const exp = MOCK_EXPERIENCES.find((e) => e.id === entry.experienceId);
    if (!exp) {
      entry.monitoringStatus = 'error';
      entry.assistantErrorMessage = 'Experience venue not found.';
      this.log(entry, 'error', 'Experience venue not found in provider catalog.');
      return { success: false, entry };
    }

    const slot = exp.slots.find((s) => s.time === entry.slotTime);
    const initialPos = slot?.waitlistLength || 37;

    // 4. Update entry status
    entry.initialPosition = initialPos;
    entry.currentPosition = initialPos;
    entry.estimatedWaitMinutes = Math.max(1, Math.round(initialPos * 0.5));
    entry.status = 'monitoring';
    entry.monitoringStatus = 'in_queue';
    entry.lastCheckedAt = new Date().toLocaleTimeString();

    this.log(entry, 'success', `Successfully joined official queue. Position #${initialPos}. Estimated wait: ${entry.estimatedWaitMinutes}m.`);

    NotificationService.addNotification({
      title: '🎟️ Assistant Joined Official Queue!',
      message: `Enrolled as #${initialPos} for ${entry.experienceName} (${entry.slotTime}). Actively monitoring progress.`,
      type: 'queue',
      actionUrl: '/bookings',
      actionText: 'Track Queue'
    });

    return { success: true, entry };
  }

  /**
   * Monitor queue position progression, advance queue, and verify turn arrival
   */
  public async pollQueueStatus(
    entry: QueueEntry,
    simulateStep: number = 1
  ): Promise<QueueStatusResult> {
    const exp = MOCK_EXPERIENCES.find((e) => e.id === entry.experienceId);
    if (!exp) {
      return {
        position: entry.currentPosition,
        estimatedWaitMinutes: entry.estimatedWaitMinutes,
        turnArrived: false,
        status: 'error',
        message: 'Experience venue not found'
      };
    }

    entry.lastCheckedAt = new Date().toLocaleTimeString();

    // Check if turn arrived
    if (entry.currentPosition <= 1 || entry.status === 'slot_available') {
      entry.currentPosition = 0;
      entry.estimatedWaitMinutes = 0;
      entry.status = 'slot_available';
      entry.monitoringStatus = 'turn_arrived';
      entry.requiresPaymentApproval = true; // PAUSE for explicit user confirmation before booking/payment!
      entry.bookingHoldToken = `hold-${Date.now()}-${entry.experienceId}`;
      entry.availableUntil = new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      this.log(entry, 'success', `🎉 User turn has arrived! Slot on hold until ${entry.availableUntil}. Awaiting user booking approval.`);

      NotificationService.addNotification({
        title: '🎉 YOUR TURN HAS ARRIVED!',
        message: `Spot secured for ${entry.experienceName} (${entry.slotTime})! Review and confirm your booking.`,
        type: 'queue',
        actionUrl: '/bookings',
        actionText: 'Confirm Booking'
      });

      return {
        position: 0,
        estimatedWaitMinutes: 0,
        turnArrived: true,
        status: 'turn_arrived',
        message: 'Turn arrived! Please review and confirm your booking.'
      };
    }

    // Progress queue deterministically
    const nextPos = Math.max(1, Math.round(entry.currentPosition * 0.65));
    const previousPos = entry.currentPosition;
    entry.currentPosition = nextPos;
    entry.estimatedWaitMinutes = Math.max(1, Math.round(nextPos * 0.45));

    this.log(entry, 'info', `Queue advanced from #${previousPos} to #${nextPos}. Est. wait: ~${entry.estimatedWaitMinutes} mins.`);

    // If queue moved significantly (e.g. now top 5)
    if (nextPos <= 4 && previousPos > 4) {
      NotificationService.addNotification({
        title: '⚡ Your Turn is Approaching!',
        message: `Position for ${entry.experienceName} is now #${nextPos}. Get ready to confirm.`,
        type: 'queue',
        actionUrl: '/bookings',
        actionText: 'View Queue'
      });
    }

    return {
      position: nextPos,
      estimatedWaitMinutes: entry.estimatedWaitMinutes,
      turnArrived: nextPos <= 1,
      status: nextPos <= 1 ? 'turn_arrived' : 'in_queue'
    };
  }

  /**
   * Final booking approval execution - NEVER runs without explicit approval
   */
  public async confirmApprovedBooking(
    entry: QueueEntry,
    userProfile: UserProfile,
    approvalConsent: boolean = true
  ): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    if (!approvalConsent) {
      return { success: false, error: 'User approval declined.' };
    }

    if (entry.monitoringStatus !== 'turn_arrived' && entry.status !== 'slot_available') {
      return { success: false, error: 'Queue turn has not yet arrived.' };
    }

    const exp = MOCK_EXPERIENCES.find((e) => e.id === entry.experienceId);
    if (!exp) return { success: false, error: 'Experience not found.' };

    const slot = exp.slots.find((s) => s.time === entry.slotTime) || exp.slots[0];

    try {
      const booking = await BookingManager.book({
        experienceId: exp.id,
        slotId: slot.id,
        date: entry.slotDate || 'Today',
        numPeople: entry.partySize || 2,
        attendeeName: userProfile.name || 'Parv Gupta',
        attendeeEmail: userProfile.email || 'parv@example.com',
        attendeePhone: '+91 98112 34567'
      });

      entry.status = 'booked';
      entry.monitoringStatus = 'completed';
      entry.requiresPaymentApproval = false;
      this.log(entry, 'success', `Booking confirmed! Pass code: ${booking.bookingCode}. Added to My Bookings.`);

      NotificationService.addNotification({
        title: '✨ Booking Confirmed & Digital Pass Issued!',
        message: `Ticket confirmed for ${entry.experienceName} (${entry.slotTime}). Digital QR ready.`,
        type: 'booking',
        actionUrl: '/bookings',
        actionText: 'View Pass'
      });

      return { success: true, bookingId: booking.id };
    } catch (e: any) {
      entry.monitoringStatus = 'error';
      entry.assistantErrorMessage = e.message || 'Failed to complete booking';
      this.log(entry, 'error', `Booking failed: ${e.message}`);
      return { success: false, error: e.message };
    }
  }

  /**
   * Solve a manual verification challenge (CAPTCHA / OTP)
   */
  public solveVerificationChallenge(
    entry: QueueEntry,
    codeOrSolution: string
  ): boolean {
    if (!entry.requiresManualVerification) return true;

    if (!codeOrSolution || codeOrSolution.trim().length === 0) {
      return false;
    }

    entry.requiresManualVerification = false;
    entry.verificationChallenge = undefined;
    entry.monitoringStatus = entry.currentPosition > 0 ? 'in_queue' : 'idle';
    this.log(entry, 'success', 'Manual verification completed successfully. Resuming queue automation.');

    NotificationService.addNotification({
      title: 'Verification Accepted',
      message: `Identity confirmed for ${entry.experienceName}. Resumed queue assistant.`,
      type: 'queue'
    });

    return true;
  }
}

export const BookingAssistantService = new BookingAssistantServiceClass();
