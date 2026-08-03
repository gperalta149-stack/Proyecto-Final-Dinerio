// frontend/src/features/calendar/hooks/useCalendar.ts
import { useState, useEffect, useMemo } from 'react';
import { getCalendarEvents } from '../service/calendarService';
import type { CalendarEvent, CalendarStats } from '../types';
import { calculateCalendarStats, groupEventsByDay } from '../utils/calendar';
import { isToday, daysUntil, isWithinNextDays, isCurrentMonth, parseDateString } from '../utils/date';

interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  stats: CalendarStats;
  todayEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  eventsIn3Days: CalendarEvent[];
  eventsIn7Days: CalendarEvent[];
  eventsByDay: Record<string, CalendarEvent[]>;
  refresh: () => Promise<void>;
}

// useCalendar agrupa los eventos del mes: calcula con daysUntil cuántos días faltan y
  // arma los paneles Hoy / en 3 días / en 7 días. Recibe la fecha seleccionada para recargar.
export const useCalendar = (currentDate: Date): UseCalendarReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Pide los eventos de suscripciones y deudas para el mes/año seleccionados.
      const monthEvents = await getCalendarEvents(
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );
      setEvents(monthEvents);
    } catch (error) {
      console.error('[useCalendar] Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Re-carga cada vez que cambia la fecha seleccionada del calendario.
  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const stats = useMemo(() => calculateCalendarStats(events), [events]);

  // Eventos con fecha igual al día de hoy (comparación por clave local).
  const todayEvents = useMemo(() => {
    return events.filter(event => {
      return isToday(parseDateString(event.date));
    });
  }, [events]);

  // Próximos pagos a 7 días, filtrados y ordenados cronológicamente.
  const upcomingEvents = useMemo(() => {
    return events
      .filter(event => {
        return isWithinNextDays(event.date, 7);
      })
      .sort((a, b) => parseDateString(a.date).getTime() - parseDateString(b.date).getTime());
  }, [events]);

  const sortByDate = (a: CalendarEvent, b: CalendarEvent) =>
    parseDateString(a.date).getTime() - parseDateString(b.date).getTime();

  // Franjas de urgencia usando daysUntil: de 1 a 3 días (próximos) y de 4 a 7 días.
  const eventsIn3Days = useMemo(() => {
    return events
      .filter(event => {
        const diff = daysUntil(event.date);
        return diff >= 1 && diff <= 3;
      })
      .sort(sortByDate);
  }, [events]);

  const eventsIn7Days = useMemo(() => {
    return events
      .filter(event => {
        const diff = daysUntil(event.date);
        return diff >= 4 && diff <= 7;
      })
      .sort(sortByDate);
  }, [events]);

  const currentMonthEvents = useMemo(() => {
    return events.filter(event => {
      return isCurrentMonth(parseDateString(event.date), currentDate);
    });
  }, [events, currentDate]);

  const eventsByDay = useMemo(() => {
    return groupEventsByDay(currentMonthEvents);
  }, [currentMonthEvents]);

  return {
    events: currentMonthEvents,
    loading,
    stats,
    todayEvents,
    upcomingEvents,
    eventsIn3Days,
    eventsIn7Days,
    eventsByDay,
    refresh: loadEvents,
  };
};