import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, BarChart3, Minus } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import "./InsightsPanel.css";

interface CategoryData {
  name: string;
  monthly_total: number;
  color?: string;
}

interface MonthlyData {
  month: number;
  monthName: string;
  monthly_total: number;
}

interface InsightsPanelProps {
  categories: CategoryData[];
  monthlyEvolution: MonthlyData[];
  monthlyTotal: number;
  currency?: string;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  categories,
  monthlyEvolution,
  monthlyTotal,
  currency = "ARS",
}) => {
  const insights = useMemo(() => {
    const result: Array<{ icon: React.ReactNode; text: React.ReactNode; color: string }> = [];

    // 1. Month-over-month growth
    if (monthlyEvolution.length >= 2) {
      const sorted = [...monthlyEvolution].sort((a, b) => a.month - b.month);
      const last = sorted[sorted.length - 1];
      const prev = sorted[sorted.length - 2];
      if (prev.monthly_total > 0) {
        const growth = ((last.monthly_total - prev.monthly_total) / prev.monthly_total) * 100;
        result.push({
          icon: growth >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />,
          text: (
            <>
              Tus gastos <span className="insight-highlight">{growth >= 0 ? "crecieron" : "bajaron"} un {Math.abs(growth).toFixed(0)}%</span> respecto al mes anterior.
            </>
          ),
          color: growth >= 0 ? "#f59e0b" : "#22c55e",
        });
      }
    }

    // 2. Top category percentage
    if (categories.length > 0 && monthlyTotal > 0) {
      const top = categories.reduce((a, b) => a.monthly_total > b.monthly_total ? a : b);
      const pct = ((top.monthly_total / monthlyTotal) * 100).toFixed(0);
      result.push({
        icon: <BarChart3 size={18} />,
        text: (
          <>
            <strong>{top.name}</strong> representa el <span className="insight-highlight">{pct}%</span> del gasto.
          </>
        ),
        color: "#6366f1",
      });
    }

    // 3. Consecutive months of increase
    if (monthlyEvolution.length >= 3) {
      const sorted = [...monthlyEvolution].sort((a, b) => a.month - b.month);
      let streak = 0;
      for (let i = sorted.length - 1; i >= 1; i--) {
        if (sorted[i].monthly_total > sorted[i - 1].monthly_total) streak++;
        else break;
      }
      if (streak > 0) {
        result.push({
          icon: <TrendingUp size={18} />,
          text: (
            <>
              Hace <span className="insight-highlight">{streak} mes{streak > 1 ? "es" : ""}</span>{" "}
              que el gasto aumenta.
            </>
          ),
          color: "#ef4444",
        });
      }
    }

    // 4. Highest spending month
    if (monthlyEvolution.length >= 3) {
      const sorted = [...monthlyEvolution].sort((a, b) => b.monthly_total - a.monthly_total);
      result.push({
        icon: <BarChart3 size={18} />,
        text: (
          <>
            <strong>{sorted[0].monthName || `Mes ${sorted[0].month}`}</strong> fue el mes de{" "}
            <span className="insight-highlight">mayor gasto</span> con {formatCurrency(sorted[0].monthly_total, currency)}.
          </>
        ),
        color: "#8b5cf6",
      });
    }

    // 5. No new expenses
    if (categories.length === 0 || monthlyTotal === 0) {
      result.push({
        icon: <Minus size={18} />,
        text: <>No registraste gastos nuevos este mes.</>,
        color: "#6b7280",
      });
    }

    return result;
  }, [categories, monthlyEvolution, monthlyTotal, currency]);

  if (insights.length === 0) return null;

  return (
    <div className="ip-wrapper">
      <div className="ip-list">
        {insights.map((insight, index) => (
          <div key={index} className="ip-card">
            <div className="ip-icon" style={{ background: `${insight.color}15`, color: insight.color }}>
              {insight.icon}
            </div>
            <div className="ip-text">{insight.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};