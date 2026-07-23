// frontend/src/features/calendar/components/CalendarStats/CalendarStats.tsx
import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { CalendarStats as CalendarStatsType } from '../../types';
import '../../../../styles/calendar/CalendarStats.css';

interface CalendarStatsProps {
  stats: CalendarStatsType;
}

export const CalendarStats: React.FC<CalendarStatsProps> = ({ stats }) => {
  const items = [
    {
      label: 'Total del mes',
      value: stats.total,
      color: 'total',
    },
    {
      label: 'Pagados',
      value: stats.paid,
      color: 'paid',
    },
    {
      label: 'Vencidos',
      value: stats.overdue,
      color: 'overdue',
    },
    {
      label: 'Vence hoy',
      value: stats.dueToday,
      color: 'dueToday',
    },
  ];

  return (
    <div className="calendar-stats">
      <div className="calendar-stats-header">
        <h3 className="calendar-stats-title"><BarChart3 size={18} /> Resumen del Mes</h3>
      </div>

      <div className="calendar-stats-grid">
        {items.map((item) => (
          <div key={item.label} className={`calendar-stats-item ${item.color}`}>
            <span className="calendar-stats-label">{item.label}</span>
            <span className="calendar-stats-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarStats;