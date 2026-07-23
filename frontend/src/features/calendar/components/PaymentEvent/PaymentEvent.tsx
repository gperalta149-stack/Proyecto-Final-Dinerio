// frontend/src/features/calendar/components/PaymentEvent/PaymentEvent.tsx
import React from 'react';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { BILLING_CYCLE_LABELS, STATUS_LABELS } from '../../constants/calendar';
import type { CalendarEvent } from '../../types';
import '../../../../styles/calendar/PaymentEvent.css';

interface PaymentEventProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

export const PaymentEvent: React.FC<PaymentEventProps> = ({
  event,
  onClick,
  compact = false,
}) => {
  const statusClass = event.status === 'cancelled' ? 'cancelled' 
    : event.status === 'paid' ? 'paid' 
    : 'pending';

  const accentColor = event.categoryColor || '#667eea';

  if (compact) {
    return (
      <div
        className={`payment-event compact ${statusClass}`}
        onClick={() => onClick?.(event)}
        title={`${event.title} - ${formatCurrency(event.amount, event.currency)}`}
        style={{ borderLeft: `3px solid ${accentColor}` }}
      >
        <span className="payment-event-title">{event.title}</span>
        <span className="payment-event-amount">
          {formatCurrency(event.amount, event.currency)}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`payment-event expanded ${statusClass}`}
      onClick={() => onClick?.(event)}
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      <div className="payment-event-header">
        <div 
          className="payment-event-dot" 
          style={{ backgroundColor: accentColor }} 
        />
        <h4 className="payment-event-title">{event.title}</h4>
        <span className="payment-event-cycle">
          {BILLING_CYCLE_LABELS[event.billingCycle] || event.billingCycle}
        </span>
      </div>

      <div className="payment-event-footer">
        <span className="payment-event-amount">
          {formatCurrency(event.amount, event.currency)}
        </span>
        <span className={`payment-event-status ${statusClass}`}>
          {STATUS_LABELS[event.status] || event.status}
        </span>
      </div>
    </div>
  );
};

export default PaymentEvent;