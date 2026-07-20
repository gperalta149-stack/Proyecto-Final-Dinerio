import React, { useMemo } from "react";
import { DollarSign, BarChart3, TrendingUp, ArrowUp, ArrowDown, Trophy } from "lucide-react";
import { KpiCard } from "../../../../shared/components/ui/KpiCard";
import { formatCurrency } from "../../../../shared/utils/formatters";

interface MonthlyData {
  month: number;
  monthName: string;
  monthly_total: number;
  subscription_count: number;
}

interface HistoricalKPIsProps {
  monthlyEvolution: MonthlyData[];
  currency?: string;
}

export const HistoricalKPIs: React.FC<HistoricalKPIsProps> = ({ monthlyEvolution, currency = "ARS" }) => {
  const stats = useMemo(() => {
    if (!monthlyEvolution || monthlyEvolution.length === 0) return null;

    const sorted = [...monthlyEvolution].sort((a, b) => a.month - b.month);

    const totalYearly = sorted.reduce((sum, m) => sum + m.monthly_total, 0);
    const avgMonthly = totalYearly / sorted.length;

    const mostExpensive = [...sorted].sort((a, b) => b.monthly_total - a.monthly_total)[0];
    const cheapest = [...sorted].sort((a, b) => a.monthly_total - b.monthly_total)[0];

    const highestPayment = mostExpensive?.monthly_total || 0;

    let annualVariation = 0;
    if (sorted.length >= 2) {
      const first = sorted[0].monthly_total;
      const last = sorted[sorted.length - 1].monthly_total;
      annualVariation = first > 0 ? ((last - first) / first) * 100 : 0;
    }

    return { totalYearly, avgMonthly, annualVariation, mostExpensive, cheapest, highestPayment };
  }, [monthlyEvolution]);

  if (!stats) return null;

  return (
    <div className="dashboard-kpis">
      <KpiCard
        title="Total anual"
        value={formatCurrency(stats.totalYearly, currency)}
        icon={<DollarSign size={16} />}
        color="spent"
      />
      <KpiCard
        title="Promedio mensual"
        value={formatCurrency(stats.avgMonthly, currency)}
        icon={<BarChart3 size={16} />}
        color="subscriptions"
      />
      <KpiCard
        title="Variación anual"
        value={`${stats.annualVariation >= 0 ? "+" : ""}${stats.annualVariation.toFixed(1)}%`}
        icon={<TrendingUp size={16} />}
        color="next-payment"
      />
      <KpiCard
        title="Mes más caro"
        value={stats.mostExpensive?.monthName || "—"}
        subtitle={formatCurrency(stats.mostExpensive?.monthly_total || 0, currency)}
        icon={<ArrowUp size={16} />}
        color="budget"
      />
      <KpiCard
        title="Mes más barato"
        value={stats.cheapest?.monthName || "—"}
        subtitle={formatCurrency(stats.cheapest?.monthly_total || 0, currency)}
        icon={<ArrowDown size={16} />}
        color="success"
      />
      <KpiCard
        title="Mayor pago"
        value={formatCurrency(stats.highestPayment, currency)}
        icon={<Trophy size={16} />}
        color="info"
      />
    </div>
  );
};

export default HistoricalKPIs;