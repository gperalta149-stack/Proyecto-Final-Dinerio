// frontend/src/features/calendar/hooks/useCalendar.ts
import { useState, useEffect, useMemo } from 'react';
import { getCalendarEvents } from '../service/calendarService';
import type { CalendarEvent, CalendarStats } from '../types';
import { calculateCalendarStats, groupEventsByDay } from '../utils/calendar';
import { isToday, isWithinNextDays, isCurrentMonth } from '../utils/date';

interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  stats: CalendarStats;
  todayEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  eventsByDay: Record<string, CalendarEvent[]>;
  refresh: () => Promise<void>;
}

export const useCalendar = (currentDate: Date): UseCalendarReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const stats = useMemo(() => calculateCalendarStats(events), [events]);

  const todayEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isToday(eventDate);
    });
  }, [events]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return isWithinNextDays(eventDate, 7);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const currentMonthEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isCurrentMonth(eventDate, currentDate);
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
    eventsByDay,
    refresh: loadEvents,
  };
};