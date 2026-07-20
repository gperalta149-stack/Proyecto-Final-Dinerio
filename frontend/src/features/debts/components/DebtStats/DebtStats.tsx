import React from 'react';
import { Wallet, Clock, AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { KpiCard } from '../../../../shared/components/ui/KpiCard';
import { formatCurrency } from '../../../../shared/utils/formatters';
import type { DebtsSummary } from '../../types';

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
  return (
    <div className="dashboard-kpis">
      <KpiCard
        title="Total adeudado"
        value={formatCurrency(summary.totalOwed, "ARS")}
        icon={<Wallet size={16} />}
        color="danger"
      />
      <KpiCard
        title="Pendientes"
        value={String(pendingCount)}
        icon={<Clock size={16} />}
        color="warning"
      />
      <KpiCard
        title="Vencidas"
        value={String(overdueCount)}
        icon={<AlertTriangle size={16} />}
        color="red"
      />
      <KpiCard
        title="Próximas (7 días)"
        value={String(upcomingCount)}
        icon={<CalendarClock size={16} />}
        color="info"
      />
      <KpiCard
        title="Pagadas"
        value={String(paidCount)}
        icon={<CheckCircle2 size={16} />}
        color="success"
      />
    </div>
  );
};

export default DebtStats;