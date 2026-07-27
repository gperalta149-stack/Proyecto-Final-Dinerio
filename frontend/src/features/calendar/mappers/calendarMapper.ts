// frontend/src/features/calendar/mappers/calendarMapper.ts
import type { CalendarEvent } from '../types';
import type { Subscription } from '../../../shared/types';

export const normalizeCalendarEvent = (subscription: Subscription): CalendarEvent => {
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

  const amount = typeof subscription.amount === 'number' ? subscription.amount : parseFloat(subscription.amount as string) || 0;
  return {
    id: subscription.id,
    title: subscription.name,
    amount,
    currency: subscription.currency || 'USD',
    date: subscription.next_billing_date,
    billingCycle: subscription.billing_cycle || 'monthly',
    status: eventStatus,
    categoryName: subscription.category_name || 'Sin categoría',
    categoryColor: subscription.category_color || '#6B7280'
  };
};