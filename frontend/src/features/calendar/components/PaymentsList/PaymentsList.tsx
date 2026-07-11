// frontend/src/features/calendar/components/PaymentsList/PaymentsList.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { STATUS_LABELS } from '../../constants/calendar';
import type { CalendarEvent } from '../../types';
import './PaymentsList.css';

interface PaymentsListProps {
  events: CalendarEvent[];
  currentDate: Date;
}

export const PaymentsList: React.FC<PaymentsListProps> = ({ events, currentDate }) => {
  if (events.length === 0) {
    return (
      <div className="payments-list">
        <div className="payments-list-empty">
          <div className="payments-list-empty-icon"><Calendar size={40} /></div>
          <h3 className="payments-list-empty-title">No hay pagos este mes</h3>
          <p className="payments-list-empty-description">
            No se encontraron pagos programados para{' '}
            {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}.
          </p>
        </div>
      </div>
    );
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="payments-list">
      <div className="payments-list-header">
        <h2 className="payments-list-title">
          Lista de Pagos — {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h2>
        <span className="payments-list-count">{events.length}</span>
      </div>

      <div className="payments-list-items">
        {sortedEvents.map((event, index) => (
          <div
            key={`${event.id}-${index}`}
            className="payments-list-item"
            style={{ borderLeft: `3px solid ${event.categoryColor || '#667eea'}` }}
          >
            <div className="payments-list-left">
              <div>
                <div className="payments-list-name">{event.title}</div>
                <div className="payments-list-date">
                  {new Date(event.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="payments-list-right">
              <span className="payments-list-amount">
                {formatCurrency(event.amount, event.currency)}
              </span>
              <span className={`payments-list-status ${event.status}`}>
                {STATUS_LABELS[event.status] || event.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentsList;