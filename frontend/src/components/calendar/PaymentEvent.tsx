import React from 'react';
import type { CalendarEvent } from '../../types';

interface PaymentEventProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
  eventType?: string;
}

export const PaymentEvent: React.FC<PaymentEventProps> = ({
  event,
  onClick,
  compact = false,
  eventType = ''
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getBillingCycleText = (cycle: string) => {
    const cycles: { [key: string]: string } = {
      monthly: 'mes',
      yearly: 'año',
      weekly: 'semana',
      quarterly: 'trimestre'
    };
    return cycles[cycle] || cycle;
  };

  const eventClass = `payment-event ${event.status === 'cancelled' ? 'cancelled' : event.status === 'paid' ? 'paid' : 'pending'} ${compact ? 'compact' : ''} ${eventType}`;
  if (compact) {
    return (
      <div
        onClick={() => onClick?.(event)}
        className={eventClass}
        title={`${event.title} - ${formatCurrency(event.amount, event.currency)}`}
      >
        <div className="event-color" style={{ backgroundColor: event.categoryColor || '#667eea' }}></div>
        <div className="event-content">
          <span className="event-title">{event.title}</span>
          <span className="event-amount">{formatCurrency(event.amount, event.currency)}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick?.(event)}
      className={eventClass}
    >
      <div className="event-header">
        <div className="event-color" style={{ backgroundColor: event.categoryColor || '#667eea' }}></div>
        <h3 className="event-title">
          {event.title}
        </h3>
        <span className="event-cycle">
          {getBillingCycleText(event.billingCycle)}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="event-amount">
          {formatCurrency(event.amount, event.currency)}
        </span>
        {event.status === 'cancelled' && (
          <span className="event-status status-cancelled">
            Cancelada
          </span>
        )}
        {event.status === 'paid' && (
          <span className="event-status status-paid">
            Pagado
          </span>
        )}
        {event.status === 'pending' && (
          <span className="event-status status-pending">
            Pendiente
          </span>
        )}
      </div>
    </div>
  );
};