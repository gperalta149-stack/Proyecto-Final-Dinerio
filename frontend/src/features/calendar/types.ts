// frontend/src/features/calendar/types.ts
export interface CalendarEvent {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  billingCycle: string;
  status: 'pending' | 'paid' | 'cancelled';
  categoryName: string;
  categoryColor: string;
}

export interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isPrevMonth: boolean;
}

export interface CalendarStats {
  total: number;
  paid: number;
  pending: number;
  cancelled: number;
  totalAmount: number;
}

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