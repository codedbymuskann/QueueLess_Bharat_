export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'emergency';
  title: string;
  message: string;
  timestamp: string;
}

type Listener = (notification: AppNotification) => void;

class NotificationService {
  private listeners: Listener[] = [];

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public notify(notification: Omit<AppNotification, 'id' | 'timestamp'>): void {
    const item: AppNotification = {
      ...notification,
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    this.listeners.forEach(fn => fn(item));
  }
}

export const notificationService = new NotificationService();
