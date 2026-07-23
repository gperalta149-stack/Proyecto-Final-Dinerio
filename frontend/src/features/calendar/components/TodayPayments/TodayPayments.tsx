// frontend/src/features/calendar/components/TodayPayments/TodayPayments.tsx
import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/formatters';
import type { CalendarEvent } from '../../types';
import '../../../../styles/calendar/TodayPayments.css';

interface TodayPaymentsProps {
  events: CalendarEvent[];
}

export const TodayPayments: React.FC<TodayPaymentsProps> = ({ events }) => {
  const hasPending = events.some(e => e.status === 'pending');

  if (events.length === 0) return null;

  return (
    <div className={`today-payments ${hasPending ? 'warning' : 'success'}`}>
      <h3 className="today-payments-title">
        <span className="today-payments-icon">
          {hasPending ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        </span>
        Pagos de Hoy
      </h3>
      <div className="today-payments-list">
        {events.map((event, index) => (
          <div key={index} className="today-payments-item">
            <span className="today-payments-name">{event.title}</span>
            <span className={`today-payments-amount ${event.status === 'pending' ? 'pending' : 'paid'}`}>
              {formatCurrency(event.amount, event.currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayPayments;