// frontend/src/features/notifications/types.ts
import type { Notification } from '../../shared/types';

// Re-exportar desde shared
export type { Notification };

export type NotificationType = 
  | 'payment_due'
  | 'payment_overdue'
  | 'payment_paid'
  | 'budget_warning'
  | 'budget_exceeded'
  | 'subscription_created'
  | 'subscription_deleted'
  | 'subscription_price_changed'
  | 'system'
  | 'welcome'
  | 'exchange_rate'
  | 'subscription_inactive'
  | 'report_available';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  is_read?: boolean;
  search?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byType: Record<NotificationType, number>;
}