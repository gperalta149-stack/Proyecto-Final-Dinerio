// frontend/src/features/calendar/mappers/calendarMapper.ts
import type { CalendarEvent } from '../types';

export const normalizeCalendarEvent = (subscription: any): CalendarEvent => {
  let eventStatus: 'pending' | 'paid' | 'cancelled';

  switch (subscription.status) {
    case 'active':
      eventStatus = 'pending';
      break;
    case 'cancelled':
      eventStatus = 'paid';
      break;
    case 'paused':
      eventStatus = 'pending';
      break;
    default:
      eventStatus = 'pending';
  }

  return {
    id: subscription.id,
    title: subscription.name,
    amount: subscription.amount || subscription.cost || 0,
    currency: subscription.currency || 'USD',
    date: subscription.next_billing_date,
    billingCycle: subscription.billing_cycle || 'monthly',
    status: eventStatus,
    categoryName: subscription.category_name || subscription.category?.name || 'Sin categoría',
    categoryColor: subscription.category_color || subscription.category?.color || '#6B7280'
  };
};