// frontend/src/features/calendar/components/DuePayments/DuePayments.tsx
import React, { useState } from 'react';
import { CalendarDays, CalendarClock, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/formatters';
import type { CalendarEvent } from '../../types';
import '../../../../styles/calendar/DuePayments.css';

const PAGE_SIZE = 3;

interface RangeCardProps {
  title: string;
  icon: React.ReactNode;
  events: CalendarEvent[];
}

const RangeCard: React.FC<RangeCardProps> = ({ title, icon, events }) => {
  const [page, setPage] = useState(0);

  if (events.length === 0) return null;

  const totalPages = Math.ceil(events.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const shown = events.slice(start, start + PAGE_SIZE);

  return (
    <div className="due-card">
      <div className="due-card-header">
        <h4 className="due-card-title">
          <span className="due-card-icon">{icon}</span>
          {title}
        </h4>
        {totalPages > 1 && (
          <div className="due-card-nav">
            <button
              type="button"
              className="due-card-arrow"
              onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
              aria-label="Anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="due-card-page">{page + 1}/{totalPages}</span>
            <button
              type="button"
              className="due-card-arrow"
              onClick={() => setPage((p) => (p + 1) % totalPages)}
              aria-label="Siguiente"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="due-card-list">
        {shown.map((event, index) => (
          <div key={index} className="due-card-item">
            <span className="due-card-name">{event.title}</span>
            <span className={`due-card-amount ${event.status === 'pending' ? 'pending' : 'paid'}`}>
              {formatCurrency(event.amount, event.currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DuePaymentsProps {
  todayEvents: CalendarEvent[];
  threeDayEvents: CalendarEvent[];
  sevenDayEvents: CalendarEvent[];
}

export const DuePayments: React.FC<DuePaymentsProps> = ({ todayEvents, threeDayEvents, sevenDayEvents }) => {
  return (
    <div className="due-payments">
      <RangeCard title="Vencen hoy" icon={<CalendarDays size={16} />} events={todayEvents} />
      <RangeCard title="Vencen en 3 días" icon={<CalendarClock size={16} />} events={threeDayEvents} />
      <RangeCard title="Vencen en 7 días" icon={<CalendarRange size={16} />} events={sevenDayEvents} />
    </div>
  );
};

export default DuePayments;
