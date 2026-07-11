// frontend/src/features/notifications/utils/notificationUtils.ts
import type { Notification, NotificationGroup } from '../types';

export const getRelativeTime = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Hace unos segundos';
  if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`;
  if (diffHour < 24) return `Hace ${diffHour} hora${diffHour !== 1 ? 's' : ''}`;
  if (diffDay === 1) return 'Ayer';
  if (diffDay < 7) return `Hace ${diffDay} días`;
  if (diffDay < 30) return `Hace ${Math.floor(diffDay / 7)} semana${Math.floor(diffDay / 7) !== 1 ? 's' : ''}`;
  if (diffDay < 365) return `Hace ${Math.floor(diffDay / 30)} mes${Math.floor(diffDay / 30) !== 1 ? 'es' : ''}`;
  return `Hace ${Math.floor(diffDay / 365)} año${Math.floor(diffDay / 365) !== 1 ? 's' : ''}`;
};

export const groupNotificationsByDate = (notifications: Notification[]): NotificationGroup[] => {
  const groups: Record<string, Notification[]> = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.created_at);
    const today = new Date();
    const key = date.toDateString();
    
    let label = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    if (key === today.toDateString()) {
      label = 'Hoy';
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (key === yesterday.toDateString()) {
        label = 'Ayer';
      }
    }
    
    if (!groups[label]) groups[label] = [];
    groups[label].push(notification);
  });
  
  return Object.entries(groups).map(([date, notifications]) => ({
    date,
    notifications: notifications.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }));
};