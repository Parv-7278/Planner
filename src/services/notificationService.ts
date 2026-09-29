import { NotificationItem } from '../types';

const STORAGE_KEY_NOTIFS = 'dayly_notifications_store';

type NotificationListener = (notifications: NotificationItem[]) => void;
type ToastListener = (toast: NotificationItem) => void;

class NotificationServiceClass {
  private listeners: Set<NotificationListener> = new Set();
  private toastListeners: Set<ToastListener> = new Set();

  private getStored(): NotificationItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    // Default initial notifications to wow user right out of the box
    return [
      {
        id: 'notif-1',
        title: 'Pottery Workshop Today',
        message: 'Your workshop at The Clay Company begins in 1 hour. Hauz Khas traffic is light.',
        timestamp: '15 mins ago',
        read: false,
        type: 'booking',
        actionUrl: '/day-mode',
        actionText: 'View in Day Mode'
      },
      {
        id: 'notif-2',
        title: 'DAYLY Queue Active',
        message: 'Your DAYLY Queue position for PVR Director’s Cut (7:30 PM) is now #4.',
        timestamp: '32 mins ago',
        read: false,
        type: 'queue',
        actionUrl: '/my-day',
        actionText: 'Check Queue'
      },
      {
        id: 'notif-3',
        title: 'Smart Transit Tip',
        message: 'Leave now for Olive Bar & Kitchen. Evening traffic on Mehrauli-Gurgaon road is picking up (+12 mins).',
        timestamp: '1 hour ago',
        read: true,
        type: 'traffic'
      }
    ];
  }

  private save(items: NotificationItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    const current = this.getStored();
    this.listeners.forEach((fn) => fn(current));
  }

  subscribe(listener: NotificationListener) {
    this.listeners.add(listener);
    listener(this.getStored());
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeToast(listener: ToastListener) {
    this.toastListeners.add(listener);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  getNotifications(): NotificationItem[] {
    return this.getStored();
  }

  getUnreadCount(): number {
    return this.getStored().filter((n) => !n.read).length;
  }

  addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): NotificationItem {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'Just now',
      read: false
    };

    const current = this.getStored();
    this.save([newItem, ...current]);

    // Dispatch toast popup
    this.toastListeners.forEach((fn) => fn(newItem));

    return newItem;
  }

  markAsRead(id: string) {
    const current = this.getStored();
    const updated = current.map((item) => (item.id === id ? { ...item, read: true } : item));
    this.save(updated);
  }

  markAllAsRead() {
    const current = this.getStored();
    const updated = current.map((item) => ({ ...item, read: true }));
    this.save(updated);
  }

  clearAll() {
    this.save([]);
  }
}

export const NotificationService = new NotificationServiceClass();
