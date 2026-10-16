import test from 'node:test';
import assert from 'node:assert/strict';
import { BookingAssistantService } from '../bookingAssistantService.ts';
import { NotificationService } from '../notificationService.ts';
import { QueueService } from '../queueService.ts';
import { BackendAssistantServer } from '../backendAssistantServer.ts';
import type { QueueEntry, UserProfile } from '../../types/index.ts';

const mockUserProfile: UserProfile = {
  id: 'usr-test-1',
  name: 'Parv Gupta',
  email: 'parv@example.com',
  avatar: '',
  savedPlaces: [],
  wishlistIds: [],
  preferredCity: 'Delhi NCR',
  preferredCategories: ['food'],
  budgetTier: 'moderate',
  dietaryPreference: 'Vegetarian friendly'
};

// TEST 1: Booking-opening detection
test('TEST 1: Booking-opening detection - detects closed to open transition with timezone awareness', async () => {
  // Test future scheduled opening
  const futureHour = (new Date().getHours() + 2) % 24;
  const futureTimeStr = `${futureHour > 12 ? futureHour - 12 : futureHour || 12}:00 ${futureHour >= 12 ? 'PM' : 'AM'}`;

  const closedResult = await BookingAssistantService.checkBookingOpening(
    'exp-food-1',
    '07:30 PM',
    futureTimeStr,
    'Asia/Kolkata'
  );
  assert.strictEqual(closedResult.isOpen, false);
  assert.strictEqual(closedResult.status, 'closed');
  assert.match(closedResult.message, /Bookings closed/i);

  // Test slot with open waitlist
  const openWaitlistResult = await BookingAssistantService.checkBookingOpening(
    'exp-food-1',
    '07:30 PM', // Sold out slot with waitlist in mockExperiences
    undefined,
    'Asia/Kolkata'
  );
  assert.strictEqual(openWaitlistResult.isOpen, true);
  assert.strictEqual(openWaitlistResult.status, 'waitlist');
  assert.ok((openWaitlistResult.waitlistLength || 0) > 0);

  // Test available slot
  const availableResult = await BookingAssistantService.checkBookingOpening(
    'exp-food-1',
    '12:30 PM', // Available slot in mockExperiences
    undefined,
    'Asia/Kolkata'
  );
  assert.strictEqual(availableResult.isOpen, true);
  assert.strictEqual(availableResult.status, 'open');
  assert.ok((availableResult.availableSeats || 0) > 0);
});

// TEST 2: Duplicate queue entry prevention & concurrency locking
test('TEST 2: Duplicate queue entry prevention and worker concurrency lock', async () => {
  const queueId = `test-queue-dup-${Date.now()}`;

  // Acquire worker lock
  const lock1 = BookingAssistantService.acquireWorkerLock(queueId);
  assert.ok(lock1 !== null, 'First worker lock acquisition should succeed');

  // Attempt duplicate lock acquisition by another worker
  const lock2 = BookingAssistantService.acquireWorkerLock(queueId);
  assert.strictEqual(lock2, null, 'Duplicate worker lock must be prevented');

  // Release lock
  const released = BookingAssistantService.releaseWorkerLock(queueId, lock1);
  assert.strictEqual(released, true);

  // Should be able to acquire again once released
  const lock3 = BookingAssistantService.acquireWorkerLock(queueId);
  assert.ok(lock3 !== null);
  BookingAssistantService.releaseWorkerLock(queueId, lock3);
});

// TEST 3: Session authentication and expiration handling
test('TEST 3: Session authentication - expired session pauses queue entry and triggers alert', async () => {
  const entry: QueueEntry = {
    id: `queue-auth-${Date.now()}`,
    experienceId: 'exp-food-1',
    experienceName: 'Olive Bar & Kitchen',
    experienceImage: '',
    venueName: 'Olive Bar & Kitchen',
    slotTime: '07:30 PM',
    slotDate: 'Today',
    partySize: 2,
    currentPosition: 0,
    initialPosition: 0,
    estimatedWaitMinutes: 0,
    status: 'monitoring',
    autoBook: false,
    joinedAt: '10:00 AM'
  };

  // Attempt with expired session token
  const result = await BookingAssistantService.joinOfficialQueue(entry, mockUserProfile, 'auth-expired');
  assert.strictEqual(result.success, false);
  assert.strictEqual(entry.monitoringStatus, 'auth_expired');
  assert.match(entry.assistantErrorMessage || '', /session expired/i);

  // Attempt with valid session token
  const validResult = await BookingAssistantService.joinOfficialQueue(entry, mockUserProfile, 'auth-session-valid');
  assert.strictEqual(validResult.success, true);
  assert.strictEqual(entry.monitoringStatus, 'in_queue');
  assert.ok(entry.currentPosition > 0);
});

// TEST 4: Anti-bot / CAPTCHA / OTP challenge workflow
test('TEST 4: Human verification challenge - pauses queue and resumes on solution', async () => {
  const entry: QueueEntry = {
    id: `queue-captcha-${Date.now()}`,
    experienceId: 'exp-food-1',
    experienceName: 'Olive Bar & Kitchen',
    experienceImage: '',
    venueName: 'Olive Bar & Kitchen',
    slotTime: '07:30 PM',
    slotDate: 'Today',
    partySize: 2,
    currentPosition: 20,
    initialPosition: 20,
    estimatedWaitMinutes: 10,
    status: 'monitoring',
    autoBook: false,
    joinedAt: '10:00 AM',
    requiresManualVerification: true,
    verificationChallenge: {
      type: 'captcha',
      prompt: 'Enter alphanumeric code 7K9X',
      issuedAt: new Date().toISOString()
    }
  };

  // Joining queue with pending challenge pauses and returns challenge
  const res = await BookingAssistantService.joinOfficialQueue(entry, mockUserProfile, 'valid-token');
  assert.strictEqual(res.success, false);
  assert.strictEqual(entry.monitoringStatus, 'paused_manual_verification');

  // Solving verification with empty string fails
  const emptySolve = BookingAssistantService.solveVerificationChallenge(entry, '');
  assert.strictEqual(emptySolve, false);
  assert.strictEqual(entry.requiresManualVerification, true);

  // Solving verification with valid answer succeeds and clears challenge
  const validSolve = BookingAssistantService.solveVerificationChallenge(entry, '7K9X');
  assert.strictEqual(validSolve, true);
  assert.strictEqual(entry.requiresManualVerification, false);
  assert.strictEqual(entry.verificationChallenge, undefined);
  assert.strictEqual(entry.monitoringStatus, 'in_queue');
});

// TEST 5: Queue monitoring and progression tracking
test('TEST 5: Queue monitoring - tracks progression, decreases wait time, and detects approaching turn', async () => {
  const entry: QueueEntry = {
    id: `queue-poll-${Date.now()}`,
    experienceId: 'exp-food-1',
    experienceName: 'Olive Bar & Kitchen',
    experienceImage: '',
    venueName: 'Olive Bar & Kitchen',
    slotTime: '07:30 PM',
    slotDate: 'Today',
    partySize: 2,
    currentPosition: 20,
    initialPosition: 20,
    estimatedWaitMinutes: 10,
    status: 'monitoring',
    autoBook: false,
    joinedAt: '10:00 AM'
  };

  // Poll 1: advances from #20
  const step1 = await BookingAssistantService.pollQueueStatus(entry);
  assert.ok(step1.position < 20, 'Queue position should advance');
  assert.ok(step1.estimatedWaitMinutes <= 10);
  assert.strictEqual(step1.turnArrived, false);

  // Fast forward position to #2
  entry.currentPosition = 2;
  const step2 = await BookingAssistantService.pollQueueStatus(entry);
  assert.strictEqual(step2.position, 1, 'Queue should advance to #1');

  // Next step: turn arrives!
  const step3 = await BookingAssistantService.pollQueueStatus(entry);
  assert.strictEqual(step3.turnArrived, true);
  assert.strictEqual(step3.position, 0);
  assert.strictEqual(entry.monitoringStatus, 'turn_arrived');
  assert.strictEqual(entry.status, 'slot_available');
});

// TEST 6: Turn arrival and user approval requirement before booking
test('TEST 6: Booking confirmation safety - pauses for user approval before payment/booking', async () => {
  const entry: QueueEntry = {
    id: `queue-confirm-${Date.now()}`,
    experienceId: 'exp-food-1',
    experienceName: 'Olive Bar & Kitchen',
    experienceImage: '',
    venueName: 'Olive Bar & Kitchen',
    slotTime: '07:30 PM',
    slotDate: 'Today',
    partySize: 2,
    currentPosition: 0,
    initialPosition: 25,
    estimatedWaitMinutes: 0,
    status: 'slot_available',
    monitoringStatus: 'turn_arrived',
    requiresPaymentApproval: true,
    autoBook: true,
    joinedAt: '10:00 AM'
  };

  // Attempting to finalize booking when user declined/denied approval
  const declined = await BookingAssistantService.confirmApprovedBooking(entry, mockUserProfile, false);
  assert.strictEqual(declined.success, false);
  assert.match(declined.error || '', /declined/i);
  assert.notStrictEqual(entry.status, 'booked');

  // Finalizing booking with explicit user approval
  const approved = await BookingAssistantService.confirmApprovedBooking(entry, mockUserProfile, true);
  assert.strictEqual(approved.success, true);
  assert.ok(approved.bookingId);
  assert.strictEqual(entry.status, 'booked');
  assert.strictEqual(entry.monitoringStatus, 'completed');
  assert.strictEqual(entry.requiresPaymentApproval, false);
});

// TEST 7: Notifications delivery
test('TEST 7: Notification delivery - assistant emits alerts for queue events', () => {
  const initialCount = NotificationService.getNotifications().length;

  NotificationService.addNotification({
    title: 'Test Opening Alert',
    message: 'Bookings are now open.',
    type: 'queue'
  });

  const afterCount = NotificationService.getNotifications().length;
  assert.strictEqual(afterCount, initialCount + 1);

  const latest = NotificationService.getNotifications()[0];
  assert.strictEqual(latest.title, 'Test Opening Alert');
  assert.strictEqual(latest.type, 'queue');
});

// TEST 8: Backend assistant server task management
test('TEST 8: Backend assistant server - starts, tracks, and stops background task', () => {
  const startResult = BackendAssistantServer.startTask({
    queueId: `srv-test-${Date.now()}`,
    experienceId: 'exp-food-1',
    experienceName: 'Olive Bar & Kitchen',
    slotTime: '07:30 PM',
    slotDate: 'Today',
    partySize: 2,
    autoQueueEntry: true
  });

  assert.strictEqual(startResult.success, true);
  assert.ok(startResult.task);
  assert.strictEqual(startResult.task.assistantEnabled, true);

  // Stop task
  const stopResult = BackendAssistantServer.stopTask(startResult.task.id);
  assert.strictEqual(stopResult.success, true);

  const stoppedTask = BackendAssistantServer.getTask(startResult.task.id);
  assert.strictEqual(stoppedTask?.assistantEnabled, false);
  assert.strictEqual(stoppedTask?.monitoringStatus, 'stopped');
});
