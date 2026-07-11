// frontend/src/features/calendar/components/CalendarView/CalendarView.tsx
import React, { useState, useMemo } from 'react';
import { buildCalendarGrid, getEventsForDay } from '../../utils/calendar';
import { isToday } from '../../utils/date';
import { DAY_NAMES } from '../../constants/calendar';
import { PaymentEvent } from '../PaymentEvent/PaymentEvent';
import type { CalendarEvent } from '../../types';
import './CalendarView.css';

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

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDay ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
              onClick={() => handleDayClick(day, isCurrentMonth)}
            >
              <div className="day-number">
                {day}
                {dayEvents.length > 0 && <span className="event-dot" />}
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
          <div className="legend-color today" />
          <span>Hoy</span>
        </div>
        <div className="legend-item">
          <div className="legend-color has-events" />
          <span>Con pagos</span>
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