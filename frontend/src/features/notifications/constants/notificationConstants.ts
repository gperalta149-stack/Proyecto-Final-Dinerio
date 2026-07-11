// frontend/src/features/notifications/constants/notificationConstants.ts
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Gift,
  FileText,
  Clock,
  Info,
  Wallet,
  Calendar,
  Bell,
  Zap
} from 'lucide-react';
import type { NotificationType, NotificationPriority } from '../types';

export const NOTIFICATION_ICONS: Record<NotificationType, any> = {
  payment_due: CreditCard,
  payment_overdue: AlertTriangle,
  payment_paid: CheckCircle2,
  budget_warning: AlertTriangle,
  budget_exceeded: AlertTriangle,
  subscription_created: Gift,
  subscription_deleted: AlertTriangle,
  subscription_price_changed: TrendingUp,
  system: Info,
  welcome: Gift,
  exchange_rate: DollarSign,
  subscription_inactive: Clock,
  report_available: FileText,
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  payment_due: '#f59e0b',
  payment_overdue: '#ef4444',
  payment_paid: '#22c55e',
  budget_warning: '#f59e0b',
  budget_exceeded: '#ef4444',
  subscription_created: '#22c55e',
  subscription_deleted: '#ef4444',
  subscription_price_changed: '#8b5cf6',
  system: '#6b7280',
  welcome: '#22c55e',
  exchange_rate: '#06b6d4',
  subscription_inactive: '#ef4444',
  report_available: '#6366f1',
};

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, { label: string; color: string }> = {
  critical: { label: 'Crítica', color: '#ef4444' },
  high: { label: 'Alta', color: '#f59e0b' },
  medium: { label: 'Media', color: '#6366f1' },
  low: { label: 'Baja', color: '#6b7280' },
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  payment_due: 'Pago próximo',
  payment_overdue: 'Pago vencido',
  payment_paid: 'Pago realizado',
  budget_warning: 'Alerta de presupuesto',
  budget_exceeded: 'Presupuesto excedido',
  subscription_created: 'Suscripción creada',
  subscription_deleted: 'Suscripción eliminada',
  subscription_price_changed: 'Cambio de precio',
  system: 'Sistema',
  welcome: 'Bienvenida',
  exchange_rate: 'Tipo de cambio',
  subscription_inactive: 'Suscripción inactiva',
  report_available: 'Reporte disponible',
};