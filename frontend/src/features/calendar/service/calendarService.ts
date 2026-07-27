// frontend/src/features/calendar/service/calendarService.ts
import api from '../../../shared/services/api';
import { normalizeCalendarEvent } from '../mappers/calendarMapper';
import type { CalendarEvent, UpcomingPayment } from '../types';
import type { Debt } from '../../../shared/types';
import type { Subscription } from '../../../shared/types';

const normalizeDebtEvent = (debt: Debt): CalendarEvent => ({
  id: `debt-${debt.id}`,
  title: debt.name,
  amount: Number(debt.amount) || 0,
  currency: debt.currency || 'ARS',
  date: debt.due_date,
  billingCycle: 'once',
  status: debt.status === 'paid' ? 'paid' : 'pending',
  categoryName: debt.category_name || 'Sin categoría',
  categoryColor: debt.category_color || '#6B7280',
});

const filterByMonth = (events: CalendarEvent[], month: number, year: number) =>
  events.filter((event) => {
    try {
      const d = new Date(event.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    } catch {
      console.warn('Fecha inválida:', event.date);
      return false;
    }
  });

export const getCalendarEvents = async (month?: number, year?: number): Promise<CalendarEvent[]> => {
    const [subRes, debtRes] = await Promise.all([
      api.get('/subscriptions?status=active').catch(() => ({ data: { subscriptions: [] } })),
      api.get('/debts').catch(() => ({ data: { debts: [] } })),
    ]);

  const subEvents: CalendarEvent[] = (subRes.data.subscriptions || []).map(normalizeCalendarEvent);
  const debtEvents: CalendarEvent[] = (debtRes.data.debts || []).map(normalizeDebtEvent);

  const allEvents = [...subEvents, ...debtEvents];

  if (month !== undefined && year !== undefined) {
    return filterByMonth(allEvents, month, year);
  }

  return allEvents;
};

export const getUpcomingPayments = async (days: number = 30): Promise<UpcomingPayment[]> => {
  try {
    const response = await api.get('/subscriptions?status=all');
    const subscriptions = response.data.subscriptions;

    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    const upcomingPayments = subscriptions
      .filter((sub: Subscription) => {
        if (!['active', 'pending'].includes(sub.status)) return false;

        try {
          const billingDate = new Date(sub.next_billing_date);
          return billingDate >= today && billingDate <= futureDate;
        } catch {
          console.warn('Fecha inválida:', sub.next_billing_date);
          return false;
        }
      })
      .map((sub: Subscription): UpcomingPayment => ({
        id: sub.id,
        name: sub.name,
        amount: typeof sub.amount === 'number' ? sub.amount : parseFloat(sub.amount),
        currency: sub.currency,
        next_billing_date: sub.next_billing_date,
        billing_cycle: sub.billing_cycle,
        categoryName: sub.category_name || 'Otros',
        categoryColor: sub.category_color || '#6B7280',
        status: sub.status
      }));

    return upcomingPayments;
  } catch (error) {
    console.error('Error obteniendo próximos pagos:', error);
    return [];
  }
};

export const calendarService = {
  getEvents: getCalendarEvents,
  getUpcomingPayments
};
