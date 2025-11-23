import api from './api';
import type { CalendarEvent } from '../types';

export interface UpcomingPayment {
  id: string;
  name: string;
  amount: number;
  currency: string;
  next_billing_date: string;
  billing_cycle: string;
  categoryName: string;
  categoryColor: string;
  status: string;
}

const normalizeCalendarEvent = (subscription: any): CalendarEvent => {
  let eventStatus: 'pending' | 'paid' | 'cancelled';
  
  switch (subscription.status) {
    case 'active':
      const nextBilling = new Date(subscription.next_billing_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      eventStatus = nextBilling > today ? 'pending' : 'paid';
      break;
    case 'cancelled':
      eventStatus = 'cancelled';
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
  }
}

export const getCalendarEvents = async (month?: number, year?: number): Promise<CalendarEvent[]> => {
    try {
        console.log('📅 [CALENDAR] Obteniendo suscripciones para el calendario...');
        
        const response = await api.get('/subscriptions');
        
        if (!response.data.subscriptions) {
            console.warn('⚠️ [CALENDAR] No hay propiedad "subscriptions" en la respuesta:', response.data);
            return [];
        }
        
        console.log('📦 [CALENDAR] Suscripciones obtenidas:', response.data.subscriptions.length);
        
        const calendarEvents: CalendarEvent[] = response.data.subscriptions.map(normalizeCalendarEvent);
        
        if (month !== undefined && year !== undefined) {
            const filteredEvents = calendarEvents.filter((event: CalendarEvent) => {
                try {
                    const eventDate = new Date(event.date);
                    return eventDate.getMonth() + 1 === month && eventDate.getFullYear() === year;
                } catch (error) {
                    console.warn('❌ Fecha inválida:', event.date);
                    return false;
                }
            });
            
            console.log(`📅 Eventos filtrados para ${month}/${year}:`, filteredEvents.length);
            
            const statusCount = filteredEvents.reduce((acc: Record<string, number>, event) => {
                acc[event.status] = (acc[event.status] || 0) + 1;
                return acc;
            }, {});
            
            console.log('📊 Distribución de estados:', statusCount);
            
            return filteredEvents;
        }
        
        return calendarEvents;
        
    } catch (error) {
        console.error('❌ Error obteniendo suscripciones:', error);
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
          console.warn('❌ Fecha inválida:', sub.next_billing_date);
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
    console.error('❌ Error obteniendo próximos pagos:', error);
    return [];
  }
};

export const calendarService = {
  getEvents: getCalendarEvents,
  getUpcomingPayments
};