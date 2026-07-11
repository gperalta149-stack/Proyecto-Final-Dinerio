import React, { useMemo } from "react";
import { Lightbulb, Clock, Shield } from "lucide-react";
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

    if (categories.length > 0 && monthlyTotal > 0) {
      const top = categories.reduce((a, b) => a.monthly_total > b.monthly_total ? a : b);
      const pct = ((top.monthly_total / monthlyTotal) * 100).toFixed(0);
      result.push({
        icon: <Lightbulb size={18} />,
        text: (
          <>
            <strong>{top.name}</strong> representa{" "}
            <span className="insight-highlight">{pct}%</span> del gasto anual.
          </>
        ),
        color: "#6366f1",
      });
    }

    if (monthlyEvolution.length >= 4) {
      const sorted = [...monthlyEvolution].sort((a, b) => a.month - b.month);
      let streak = 0;
      for (let i = sorted.length - 1; i >= 1; i--) {
        if (sorted[i].monthly_total < sorted[i - 1].monthly_total) streak++;
        else break;
      }
      if (streak > 0) {
        result.push({
          icon: <Clock size={18} />,
          text: (
            <>
              Hace <span className="insight-highlight">{streak} mes{streak > 1 ? "es" : ""}</span>{" "}
              que reducís gastos.
            </>
          ),
          color: "#22c55e",
        });
      }
    }

    if (monthlyEvolution.length >= 2) {
      const sorted = [...monthlyEvolution].sort((a, b) => a.month - b.month);
      const last = sorted[sorted.length - 1];
      const prev = sorted[sorted.length - 2];
      if (prev.monthly_total > 0) {
        const growth = ((last.monthly_total - prev.monthly_total) / prev.monthly_total * 100);
        if (Math.abs(growth) > 5) {
          result.push({
            icon: <Shield size={18} />,
            text: (
              <>
                Tu gasto promedio{" "}
                <span className="insight-highlight">{growth >= 0 ? "creció" : "bajó"}{" "}
                  {Math.abs(growth).toFixed(0)}%</span>{" "}
                en el último mes.
              </>
            ),
            color: growth >= 0 ? "#f59e0b" : "#22c55e",
          });
        }
      }
    }

    if (monthlyEvolution.length >= 3) {
      const sorted = [...monthlyEvolution].sort((a, b) => b.monthly_total - a.monthly_total);
      result.push({
        icon: <Lightbulb size={18} />,
        text: (
          <>
            El mes de <strong>{sorted[0].monthName || `Mes ${sorted[0].month}`}</strong> fue el de{" "}
            <span className="insight-highlight">mayor gasto</span>.
          </>
        ),
        color: "#8b5cf6",
      });
    }

    return result;
  }, [categories, monthlyEvolution, monthlyTotal, currency]);

  if (insights.length === 0) return null;

  return (
    <div className="ip-wrapper">
      <h3 className="ip-title">Insights</h3>
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

export default InsightsPanel;
