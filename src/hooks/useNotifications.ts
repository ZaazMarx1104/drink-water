import { useCallback, useEffect, useState } from 'react';

interface NotificationSettings {
  enabled: boolean;
  reminderInterval: number; // minutes
  quietHoursStart: number; // hour (0-23)
  quietHoursEnd: number; // hour (0-23)
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  reminderInterval: 60,
  quietHoursStart: 22,
  quietHoursEnd: 7,
};

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('drinkwater_notification_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('drinkwater_notification_settings', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const sendNotification = useCallback((title: string, body: string, tag?: string) => {
    if (permission !== 'granted') return;

    const hour = new Date().getHours();
    const { quietHoursStart, quietHoursEnd } = settings;

    // Check if we're in quiet hours
    const inQuietHours =
      quietHoursStart > quietHoursEnd
        ? hour >= quietHoursStart || hour < quietHoursEnd
        : hour >= quietHoursStart && hour < quietHoursEnd;

    if (inQuietHours) return;

    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: tag || 'drinkwater-reminder',
      requireInteraction: false,
    });
  }, [permission, settings]);

  const scheduleReminder = useCallback((message: string, delayMinutes: number = settings.reminderInterval) => {
    if (!settings.enabled || permission !== 'granted') return;

    const timeoutId = setTimeout(() => {
      sendNotification('💧 Hydration Reminder', message);
    }, delayMinutes * 60 * 1000);

    return () => clearTimeout(timeoutId);
  }, [settings, permission, sendNotification]);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    settings,
    permission,
    requestPermission,
    sendNotification,
    scheduleReminder,
    updateSettings,
  };
}
