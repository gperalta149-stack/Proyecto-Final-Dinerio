// frontend/src/features/calendar/index.ts
export { CalendarPage } from './pages/CalendarPage';
export { default } from './pages/CalendarPage';

// Components
export { CalendarView } from './components/CalendarView/CalendarView';
export { MonthSelector } from './components/MonthSelector/MonthSelector';
export { PaymentEvent } from './components/PaymentEvent/PaymentEvent';
export { CalendarStats } from './components/CalendarStats/CalendarStats';
export { TodayPayments } from './components/TodayPayments/TodayPayments';
export { UpcomingPayments } from './components/UpcomingPayments/UpcomingPayments';
export { PaymentsList } from './components/PaymentsList/PaymentsList';

// Hooks
export { useCalendar } from './hooks/useCalendar';

// Services
export { calendarService, getCalendarEvents, getUpcomingPayments } from './service/calendarService';

// Types
export * from './types';