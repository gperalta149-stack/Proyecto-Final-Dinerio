import React, { useMemo } from "react";
import { DollarSign, BarChart3, TrendingUp, ArrowUp, ArrowDown, Trophy } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import "./HistoricalKPIs.css";

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

  const kpis = [
    {
      icon: <DollarSign size={16} />,
      label: "Total anual",
      value: formatCurrency(stats.totalYearly, currency),
      color: "spent" as const,
    },
    {
      icon: <BarChart3 size={16} />,
      label: "Promedio mensual",
      value: formatCurrency(stats.avgMonthly, currency),
      color: "subscriptions" as const,
    },
    {
      icon: <TrendingUp size={16} />,
      label: "Variación anual",
      value: `${stats.annualVariation >= 0 ? "+" : ""}${stats.annualVariation.toFixed(1)}%`,
      color: "next-payment" as const,
    },
    {
      icon: <ArrowUp size={16} />,
      label: "Mes más caro",
      value: stats.mostExpensive?.monthName || "—",
      sub: formatCurrency(stats.mostExpensive?.monthly_total || 0, currency),
      color: "spent" as const,
    },
    {
      icon: <ArrowDown size={16} />,
      label: "Mes más barato",
      value: stats.cheapest?.monthName || "—",
      sub: formatCurrency(stats.cheapest?.monthly_total || 0, currency),
      color: "budget" as const,
    },
    {
      icon: <Trophy size={16} />,
      label: "Mayor pago",
      value: formatCurrency(stats.highestPayment, currency),
      color: "next-payment" as const,
    },
  ];

  return (
    <div className="hkpi-wrapper">
      <div className="hkpi-row">
        {kpis.slice(0, 3).map((kpi) => (
          <div key={kpi.label} className={`hkpi-card hkpi-${kpi.color}`}>
            <div className="hkpi-icon-wrapper">
              {kpi.icon}
            </div>
            <div className="hkpi-content">
              <span className="hkpi-label">{kpi.label}</span>
              <span className="hkpi-value">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="hkpi-row">
        {kpis.slice(3).map((kpi) => (
          <div key={kpi.label} className={`hkpi-card hkpi-${kpi.color}`}>
            <div className="hkpi-icon-wrapper">
              {kpi.icon}
            </div>
            <div className="hkpi-content">
              <span className="hkpi-label">{kpi.label}</span>
              <span className="hkpi-value">{kpi.value}</span>
              {kpi.sub && <span className="hkpi-sub">{kpi.sub}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoricalKPIs;
