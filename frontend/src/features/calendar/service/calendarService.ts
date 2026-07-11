// frontend/src/features/calendar/service/calendarService.ts
import api from '../../../shared/services/api';
import { normalizeCalendarEvent } from '../mappers/calendarMapper';
import type { CalendarEvent } from '../types';
import type { UpcomingPayment } from '../types';

export const getCalendarEvents = async (month?: number, year?: number): Promise<CalendarEvent[]> => {
  try {
    const response = await api.get('/subscriptions');

    if (!response.data.subscriptions) {
      return [];
    }

    const calendarEvents: CalendarEvent[] = response.data.subscriptions.map(normalizeCalendarEvent);

    if (month !== undefined && year !== undefined) {
      const filteredEvents = calendarEvents.filter((event: CalendarEvent) => {
        try {
          const eventDate = new Date(event.date);
          return eventDate.getMonth() + 1 === month && eventDate.getFullYear() === year;
        } catch (error) {
          console.warn('Fecha inválida:', event.date);
          return false;
        }
      });

      return filteredEvents;
    }

    return calendarEvents;

  } catch (error) {
    console.error('Error obteniendo suscripciones:', error);
    return [];
  }
};

export const getUpcomingPayments = async (days: number = 30): Promise<UpcomingPayment[]> => {
  try {
    const response = await api.get('/subscriptions');
    const subscriptions = response.data.subscriptions;

    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    const upcomingPayments = subscriptions
      .filter((sub: any) => {
        if (!['active', 'pending'].includes(sub.status)) return false;

        try {
          const billingDate = new Date(sub.next_billing_date);
          return billingDate >= today && billingDate <= futureDate;
        } catch (error) {
          console.warn('Fecha inválida:', sub.next_billing_date);
          return false;
        }
      })
      .map((sub: any): UpcomingPayment => ({
        id: sub.id,
        name: sub.name,
        amount: sub.amount,
        currency: sub.currency,
        next_billing_date: sub.next_billing_date,
        billing_cycle: sub.billing_cycle,
        categoryName: sub.category_name || sub.category?.name || 'Otros',
        categoryColor: sub.category_color || sub.category?.color || '#6B7280',
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