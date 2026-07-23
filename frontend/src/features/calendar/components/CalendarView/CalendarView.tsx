// frontend/src/features/calendar/components/CalendarView/CalendarView.tsx
import React, { useState, useMemo } from 'react';
import { buildCalendarGrid, getEventsForDay } from '../../utils/calendar';
import { isToday, formatDateKey } from '../../utils/date';
import { DAY_NAMES } from '../../constants/calendar';
import { PaymentEvent } from '../PaymentEvent/PaymentEvent';
import type { CalendarEvent } from '../../types';
import '../../../../styles/calendar/CalendarView.css';

const getDayStatusClass = (events: CalendarEvent[], todayStr: string): string => {
  let hasPaid = false;
  let hasOverdue = false;
  let hasPending = false;

  for (const e of events) {
    if (e.status === 'paid') hasPaid = true;
    else if (e.status === 'pending' && e.date < todayStr) hasOverdue = true;
    else if (e.status === 'pending') hasPending = true;
  }

  if (hasOverdue) return 'status-overdue';
  if (hasPaid) return 'status-paid';
  if (hasPending) return 'status-pending';
  return '';
};

interface CalendarViewProps {
  currentDate: Date;
  eventsByDay: Record<string, CalendarEvent[]>;
  onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  eventsByDay,
  onEventClick,
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const grid = useMemo(() => buildCalendarGrid(currentDate), [currentDate]);
  const todayStr = useMemo(() => formatDateKey(new Date()), []);

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    setSelectedDay(day === selectedDay ? null : day);
  };

  return (
    <div className="calendar-view">
      <div className="calendar-weekdays">
        {DAY_NAMES.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {grid.map((dayObj, index) => {
          const { day, isCurrentMonth } = dayObj;
          const isTodayDay = isCurrentMonth && isToday(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
          );
          const isSelected = isCurrentMonth && day === selectedDay;
          const dayEvents = getEventsForDay(day, currentDate, eventsByDay);
          const statusClass = dayEvents.length > 0 ? getDayStatusClass(dayEvents, todayStr) : '';

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDay ? 'today' : ''} ${isSelected ? 'selected' : ''} ${statusClass}`}
              onClick={() => handleDayClick(day, isCurrentMonth)}
            >
              <div className="day-number">
                {day}
                {dayEvents.length > 0 && <span className={`event-dot ${statusClass}`} />}
              </div>

              {isCurrentMonth && dayEvents.length > 0 && (
                <div className="day-events">
                  {dayEvents.slice(0, 2).map((event, eventIndex) => (
                    <PaymentEvent
                      key={`${event.id}-${eventIndex}`}
                      event={event}
                      onClick={() => onEventClick?.(event)}
                      compact
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="more-events">+{dayEvents.length - 2} más</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color status-pending" />
          <span>Pendiente</span>
        </div>
        <div className="legend-item">
          <div className="legend-color status-paid" />
          <span>Pagado</span>
        </div>
        <div className="legend-item">
          <div className="legend-color status-overdue" />
          <span>Vencido</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today" />
          <span>Hoy</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected" />
          <span>Seleccionado</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;