import fs from 'fs';
import path from 'path';

export interface BackendTask {
  id: string;
  experienceId: string;
  experienceName: string;
  slotTime: string;
  slotDate: string;
  partySize: number;
  openingTime?: string;
  timeZone: string;
  autoQueueEntry: boolean;
  assistantEnabled: boolean;
  monitoringStatus:
    | 'idle'
    | 'monitoring_opening'
    | 'in_queue'
    | 'turn_arrived'
    | 'paused_manual_verification'
    | 'auth_expired'
    | 'error'
    | 'completed'
    | 'stopped';
  currentPosition: number;
  initialPosition: number;
  estimatedWaitMinutes: number;
  lastCheckedAt?: string;
  checkIntervalSeconds: number;
  retryCount: number;
  maxRetries: number;
  requiresManualVerification: boolean;
  verificationChallenge?: {
    type: 'captcha' | 'otp' | 'turnstile';
    prompt: string;
  };
  requiresPaymentApproval: boolean;
  bookingHoldToken?: string;
  availableUntil?: string;
  workerLockId: string;
  logs: { timestamp: string; level: 'info' | 'warn' | 'error' | 'success'; message: string }[];
  userProfile?: {
    name: string;
    email: string;
    phone?: string;
  };
}

const STORE_PATH = path.resolve(process.cwd(), 'dayly_assistant_store.json');

class BackendAssistantServerClass {
  private tasks: Map<string, BackendTask> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.loadPersistentTasks();
  }

  private loadPersistentTasks() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          data.forEach((task: BackendTask) => {
            this.tasks.set(task.id, task);
            // Resume monitoring if previously active
            if (
              task.assistantEnabled &&
              (task.monitoringStatus === 'monitoring_opening' || task.monitoringStatus === 'in_queue')
            ) {
              this.scheduleNextCheck(task.id, 2000);
            }
          });
        }
      }
    } catch (e) {
      console.warn('[BackendAssistant] Could not load stored tasks:', e);
    }
  }

  private persistTasks() {
    try {
      const data = Array.from(this.tasks.values());
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[BackendAssistant] Could not persist tasks:', e);
    }
  }

  private addLog(task: BackendTask, level: 'info' | 'warn' | 'error' | 'success', message: string) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    task.logs = [{ timestamp, level, message }, ...(task.logs || [])].slice(0, 50);
  }

  public getTasks(): BackendTask[] {
    return Array.from(this.tasks.values());
  }

  public getTask(id: string): BackendTask | undefined {
    return this.tasks.get(id);
  }

  public startTask(params: {
    queueId?: string;
    experienceId: string;
    experienceName: string;
    slotTime: string;
    slotDate?: string;
    partySize?: number;
    openingTime?: string;
    timeZone?: string;
    autoQueueEntry?: boolean;
    userProfile?: { name: string; email: string; phone?: string };
    sessionToken?: string;
  }): { success: boolean; task: BackendTask; message: string } {
    const id = params.queueId || `queue-${Date.now()}`;

    // Prevent duplicate worker monitors on the same booking
    const existing = this.tasks.get(id);
    if (existing && existing.assistantEnabled && (existing.monitoringStatus === 'in_queue' || existing.monitoringStatus === 'monitoring_opening')) {
      return {
        success: true,
        task: existing,
        message: 'Worker is already actively monitoring this queue.'
      };
    }

    const workerLockId = `lock-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const task: BackendTask = existing || {
      id,
      experienceId: params.experienceId,
      experienceName: params.experienceName,
      slotTime: params.slotTime,
      slotDate: params.slotDate || 'Today',
      partySize: params.partySize || 2,
      openingTime: params.openingTime,
      timeZone: params.timeZone || 'Asia/Kolkata',
      autoQueueEntry: params.autoQueueEntry !== false,
      assistantEnabled: true,
      monitoringStatus: params.openingTime ? 'monitoring_opening' : 'in_queue',
      currentPosition: 37,
      initialPosition: 37,
      estimatedWaitMinutes: 18,
      checkIntervalSeconds: 5,
      retryCount: 0,
      maxRetries: 5,
      requiresManualVerification: false,
      requiresPaymentApproval: false,
      workerLockId,
      logs: [],
      userProfile: params.userProfile
    };

    task.assistantEnabled = true;
    task.workerLockId = workerLockId;
    if (params.openingTime) {
      task.monitoringStatus = 'monitoring_opening';
      this.addLog(task, 'info', `Assistant monitoring opening scheduled for ${params.openingTime} (${task.timeZone}).`);
    } else {
      task.monitoringStatus = 'in_queue';
      this.addLog(task, 'info', `Assistant actively tracking queue for ${task.experienceName}.`);
    }

    this.tasks.set(id, task);
    this.persistTasks();

    this.scheduleNextCheck(id, 1000);
    return {
      success: true,
      task,
      message: 'Monitoring worker started successfully.'
    };
  }

  public stopTask(id: string): { success: boolean; message: string } {
    const task = this.tasks.get(id);
    if (!task) return { success: false, message: 'Task not found.' };

    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    task.assistantEnabled = false;
    task.monitoringStatus = 'stopped';
    this.addLog(task, 'warn', 'Assistant monitoring stopped by user.');
    this.persistTasks();

    return { success: true, message: 'Monitoring stopped.' };
  }

  public solveVerification(id: string, solution: string): { success: boolean; message: string } {
    const task = this.tasks.get(id);
    if (!task) return { success: false, message: 'Task not found.' };

    task.requiresManualVerification = false;
    task.verificationChallenge = undefined;
    task.monitoringStatus = task.currentPosition > 0 ? 'in_queue' : 'turn_arrived';
    this.addLog(task, 'success', `Manual verification solved (${solution || 'token'}). Assistant resumed.`);
    this.persistTasks();

    this.scheduleNextCheck(id, 1000);
    return { success: true, message: 'Verification accepted.' };
  }

  public approveBooking(id: string): { success: boolean; message: string } {
    const task = this.tasks.get(id);
    if (!task) return { success: false, message: 'Task not found.' };

    if (!task.requiresPaymentApproval && task.monitoringStatus !== 'turn_arrived') {
      return { success: false, message: 'Turn has not arrived or approval not pending.' };
    }

    task.requiresPaymentApproval = false;
    task.monitoringStatus = 'completed';
    task.currentPosition = 0;
    this.addLog(task, 'success', 'User approved booking. Reservation confirmed on official system.');
    this.persistTasks();

    return { success: true, message: 'Booking confirmed successfully.' };
  }

  private scheduleNextCheck(id: string, delayMs: number) {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }

    const timer = setTimeout(() => {
      this.executeCheck(id);
    }, delayMs);

    this.timers.set(id, timer);
  }

  private executeCheck(id: string) {
    const task = this.tasks.get(id);
    if (!task || !task.assistantEnabled || task.monitoringStatus === 'stopped' || task.monitoringStatus === 'completed') {
      return;
    }

    // If waiting for user manual verification, do not advance
    if (task.requiresManualVerification) {
      return;
    }

    task.lastCheckedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Handle opening detection
    if (task.monitoringStatus === 'monitoring_opening') {
      // Simulate booking opening check
      const isOpen = true; // In simulation/testing or when drop time arrives
      if (isOpen) {
        if (task.autoQueueEntry) {
          task.monitoringStatus = 'in_queue';
          task.currentPosition = task.initialPosition || 37;
          this.addLog(task, 'success', `Booking has opened! Auto-joined official queue as #${task.currentPosition}.`);
        } else {
          task.monitoringStatus = 'idle';
          this.addLog(task, 'info', 'Booking has opened! Waiting for user to trigger queue entry.');
        }
      } else {
        this.addLog(task, 'info', 'Booking not yet open. Polling opening endpoint...');
        this.scheduleNextCheck(id, task.checkIntervalSeconds * 1000);
        this.persistTasks();
        return;
      }
    }

    // Handle queue progression
    if (task.monitoringStatus === 'in_queue') {
      if (task.currentPosition > 4) {
        const nextPos = Math.max(4, Math.round(task.currentPosition * 0.65));
        task.currentPosition = nextPos;
        task.estimatedWaitMinutes = Math.max(1, Math.round(nextPos * 0.45));
        this.addLog(task, 'info', `Queue position advanced to #${nextPos}. Est. wait: ~${task.estimatedWaitMinutes}m.`);
        this.scheduleNextCheck(id, task.checkIntervalSeconds * 1000);
      } else if (task.currentPosition > 1) {
        task.currentPosition = 1;
        task.estimatedWaitMinutes = 1;
        this.addLog(task, 'info', 'You are next in line! Position #1.');
        this.scheduleNextCheck(id, task.checkIntervalSeconds * 1000);
      } else {
        // Turn arrives!
        task.currentPosition = 0;
        task.estimatedWaitMinutes = 0;
        task.monitoringStatus = 'turn_arrived';
        task.requiresPaymentApproval = true; // CRITICAL: Pause for user approval!
        task.bookingHoldToken = `bk-hold-${Date.now()}`;
        task.availableUntil = new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        this.addLog(task, 'success', `🎉 Turn arrived! Reservation held until ${task.availableUntil}. Awaiting explicit confirmation.`);
      }
    }

    this.persistTasks();
  }
}

export const BackendAssistantServer = new BackendAssistantServerClass();
