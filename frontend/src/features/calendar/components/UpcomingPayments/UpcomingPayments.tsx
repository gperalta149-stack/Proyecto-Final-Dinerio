// frontend/src/features/calendar/components/UpcomingPayments/UpcomingPayments.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/formatters';
import type { CalendarEvent } from '../../types';
import '../../../../styles/calendar/UpcomingPayments.css';

interface UpcomingPaymentsProps {
  events: CalendarEvent[];
}

export const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ events }) => {
  return (
    <div className="upcoming-payments">
      <h3 className="upcoming-payments-title">
        <span className="upcoming-payments-icon"><Calendar size={16} /></span>
        Próximos 7 Días
      </h3>

      {events.length === 0 ? (
        <p className="upcoming-payments-empty">
          No hay pagos programados para la próxima semana.
        </p>
      ) : (
        <div className="upcoming-payments-list">
          {events.slice(0, 5).map((event, index) => (
            <div
              key={index}
              className="upcoming-payments-item"
              style={{ borderLeft: `3px solid ${event.categoryColor || '#667eea'}` }}
            >
              <div className="upcoming-payments-left">
                <div>
                  <div className="upcoming-payments-name">{event.title}</div>
                  <div className="upcoming-payments-date">
                    {new Date(event.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                </div>
              </div>
              <span className="upcoming-payments-amount">
                {formatCurrency(event.amount, event.currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingPayments;