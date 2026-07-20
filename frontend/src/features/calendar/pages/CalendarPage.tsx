// frontend/src/features/calendar/pages/CalendarPage.tsx
import React, { useState } from 'react';
import { MonthSelector } from '../components/MonthSelector/MonthSelector';
import { CalendarView } from '../components/CalendarView/CalendarView';
import { CalendarStats } from '../components/CalendarStats/CalendarStats';
import { TodayPayments } from '../components/TodayPayments/TodayPayments';
import { UpcomingPayments } from '../components/UpcomingPayments/UpcomingPayments';
import { PaymentsList } from '../components/PaymentsList/PaymentsList';
import { useCalendar } from '../hooks/useCalendar';
import { MONTHS } from '../constants/calendar';
import '../styles/calendar.css';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'list'>('month');
  const { events, loading, stats, todayEvents, upcomingEvents, eventsByDay } = useCalendar(currentDate);

  if (loading) {
    return (
      <div className="calendar-page">
        <div className="calendar-container">
          <div className="calendar-loading">
            <div className="loading-spinner" />
            <p>Cargando calendario...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="calendar-container">
        <div className="calendar-header">
    
          <div className="calendar-actions">
            <button
              onClick={() => setView('month')}
              className={`calendar-btn ${view === 'month' ? 'primary' : 'secondary'}`}
            >
              Vista Mes
            </button>
            <button
              onClick={() => setView('list')}
              className={`calendar-btn ${view === 'list' ? 'primary' : 'secondary'}`}
            >
              Vista Lista
            </button>
          </div>
        </div>

        <div className="calendar-grid-layout">
          <div className="calendar-main">
            <MonthSelector currentDate={currentDate} onDateChange={setCurrentDate} />

            {view === 'month' ? (
              <CalendarView
                currentDate={currentDate}
                eventsByDay={eventsByDay}
              />
            ) : (
              <PaymentsList
                events={events}
                currentDate={currentDate}
              />
            )}
          </div>

          <div className="calendar-sidebar">
            <CalendarStats stats={stats} />
            {todayEvents.length > 0 && <TodayPayments events={todayEvents} />}
            <UpcomingPayments events={upcomingEvents} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;