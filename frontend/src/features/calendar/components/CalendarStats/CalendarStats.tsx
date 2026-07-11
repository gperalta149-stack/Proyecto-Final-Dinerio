// frontend/src/features/calendar/components/CalendarStats/CalendarStats.tsx
import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/formatters';
import type { CalendarStats as CalendarStatsType } from '../../types';
import './CalendarStats.css';

interface CalendarStatsProps {
  stats: CalendarStatsType;
}

const RADIUS = 26;
const STROKE = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CalendarStats: React.FC<CalendarStatsProps> = ({ stats }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const paidRatio = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;
  const offset = mounted
    ? CIRCUMFERENCE - (Math.min(paidRatio, 100) / 100) * CIRCUMFERENCE
    : CIRCUMFERENCE;

  const items = [
    {
      label: 'Total de pagos',
      value: stats.total,
      color: 'total',
    },
    {
      label: 'Pagados',
      value: stats.paid,
      color: 'paid',
    },
    {
      label: 'Pendientes',
      value: stats.pending,
      color: 'pending',
    },
    {
      label: 'Cancelados',
      value: stats.cancelled,
      color: 'cancelled',
    },
  ];

  return (
    <div className="calendar-stats">
      <div className="calendar-stats-header">
        <h3 className="calendar-stats-title"><BarChart3 size={18} /> Resumen del Mes</h3>

        {stats.total > 0 && (
          <div className="calendar-stats-ring" title={`${paidRatio.toFixed(0)}% pagado`}>
            <svg viewBox="0 0 64 64" className="calendar-stats-ring-svg" aria-hidden="true">
              <circle
                cx="32"
                cy="32"
                r={RADIUS}
                fill="none"
                stroke="var(--calendar-border-subtle)"
                strokeWidth={STROKE}
              />
              <circle
                cx="32"
                cy="32"
                r={RADIUS}
                fill="none"
                stroke="var(--calendar-green)"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                transform="rotate(-90 32 32)"
                className="calendar-stats-ring-fill"
              />
            </svg>
            <span className="calendar-stats-ring-value">{paidRatio.toFixed(0)}%</span>
          </div>
        )}
      </div>

      <div className="calendar-stats-grid">
        {items.map((item) => (
          <div key={item.label} className={`calendar-stats-item ${item.color}`}>
            <span className="calendar-stats-label">{item.label}</span>
            <span className="calendar-stats-value">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="calendar-stats-total">
        <span className="calendar-stats-total-label">Monto pendiente</span>
        <span className="calendar-stats-total-value">
          {formatCurrency(stats.totalAmount, 'ARS')}
        </span>
      </div>
    </div>
  );
};

export default CalendarStats;