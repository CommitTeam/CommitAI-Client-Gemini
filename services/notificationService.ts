
import { AppNotification } from '../types';

type NotificationListener = (notification: AppNotification) => void;

const listeners: Set<NotificationListener> = new Set();

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
    await Notification.requestPermission();
  }
};

export const sendNotification = (title: string, message: string, type: 'social' | 'streak' | 'vote') => {
  // 1. Trigger Browser Notification (if backgrounded or allowed)
  if (Notification.permission === 'granted' && document.visibilityState === 'hidden') {
    new Notification(title, {
      body: message,
      icon: '/icon.png', // Assuming icon exists or fallback
    });
  }

  // 2. Trigger In-App Notification
  const newNotification: AppNotification = {
    id: Date.now().toString(),
    title,
    message,
    type,
    timestamp: Date.now(),
  };

  listeners.forEach(listener => listener(newNotification));
};

export const subscribeToNotifications = (listener: NotificationListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
