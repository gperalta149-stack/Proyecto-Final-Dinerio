// frontend/src/features/debts/components/DebtStats/DebtStats.tsx
import React from 'react';
import { Wallet, Clock, AlertTriangle, CalendarClock, CheckCircle2, type LucideIcon } from 'lucide-react';
import { formatCurrency } from '../../../../shared/utils/formatters';
import type { DebtsSummary } from '../../types';
import './DebtStats.css';

interface DebtStatsProps {
  summary: DebtsSummary;
  pendingCount: number;
  overdueCount: number;
  upcomingCount: number;
  paidCount: number;
}

export const DebtStats: React.FC<DebtStatsProps> = ({
  summary,
  pendingCount,
  overdueCount,
  upcomingCount,
  paidCount,
}) => {
  const stats: { label: string; value: string; color: string; icon: LucideIcon }[] = [
    { label: 'Total adeudado', value: formatCurrency(summary.totalOwed, 'ARS'), color: 'danger', icon: Wallet },
    { label: 'Pendientes', value: String(pendingCount), color: 'warning', icon: Clock },
    { label: 'Vencidas', value: String(overdueCount), color: 'danger', icon: AlertTriangle },
    { label: 'Próximas (7 días)', value: String(upcomingCount), color: 'info', icon: CalendarClock },
    { label: 'Pagadas', value: String(paidCount), color: 'success', icon: CheckCircle2 },
  ];

  return (
    <div className="debt-stats">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
            <div key={stat.label} className={`debt-stat ${stat.color}`}>
              <div className="debt-stat-icon">
                <Icon size={20} />
              </div>
              <div className="debt-stat-info">
                <span className="debt-stat-value">{stat.value}</span>
                <span className="debt-stat-label">{stat.label}</span>
              </div>
            </div>
        );
      })}
    </div>
  );
};

export default DebtStats;
