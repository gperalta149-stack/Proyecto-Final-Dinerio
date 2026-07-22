// frontend/src/features/calendar/utils/calendar.ts
import type { CalendarEvent, CalendarDay } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, getDaysInPrevMonth, formatDateKey } from './date';

export const buildCalendarGrid = (currentDate: Date): CalendarDay[] => {
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: CalendarDay[] = [];

  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const daysInPrevMonth = getDaysInPrevMonth(prevMonth);

  // Días del mes anterior
  for (let i = 0; i < firstDay; i++) {
    days.push({
      day: daysInPrevMonth - firstDay + i + 1,
      isCurrentMonth: false,
      isPrevMonth: true
    });
  }

  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      isCurrentMonth: true,
      isPrevMonth: false
    });
  }

  // Días del mes siguiente
  const totalDays = days.length;
  const remainingDays = 42 - totalDays;
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      day,
      isCurrentMonth: false,
      isPrevMonth: false
    });
  }

  return days;
};

export const groupEventsByDay = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
  return events.reduce((acc, event) => {
    const key = formatDateKey(new Date(event.date));
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
};

export const getEventsForDay = (
  day: number,
  currentDate: Date,
  eventsByDay: Record<string, CalendarEvent[]>
): CalendarEvent[] => {
  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
  const key = formatDateKey(date);
  return eventsByDay[key] || [];
};

export const calculateCalendarStats = (events: CalendarEvent[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateKey(today);

  const total = events.length;
  const paid = events.filter(e => e.status === 'paid').length;
  const overdue = events.filter(e => e.status === 'pending' && e.date < todayStr).length;
  const dueToday = events.filter(e => e.status === 'pending' && e.date === todayStr).length;

  return { total, paid, overdue, dueToday };
};