import React, { useMemo } from "react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import "./PeriodComparison.css";

interface MonthlyData {
  month: number;
  monthName: string;
  monthly_total: number;
}

interface PeriodComparisonProps {
  monthlyEvolution: MonthlyData[];
  currency?: string;
}

export const PeriodComparison: React.FC<PeriodComparisonProps> = ({
  monthlyEvolution,
  currency = "ARS",
}) => {
  const recent = useMemo(() => {
    if (!monthlyEvolution || monthlyEvolution.length === 0) return [];
    return [...monthlyEvolution]
      .sort((a, b) => b.month - a.month)
      .slice(0, 3);
  }, [monthlyEvolution]);

  const maxAmount = Math.max(...recent.map(m => m.monthly_total), 1);

  if (recent.length === 0) return null;

  return (
    <div className="pc-wrapper">
      <h3 className="pc-title">Comparación</h3>
      <div className="pc-bars">
        {recent.map((period, index) => {
          const width = (period.monthly_total / maxAmount) * 100;
          return (
            <div key={period.month} className="pc-row">
              <span className="pc-month">{period.monthName}</span>
              <div className="pc-track">
                <div
                  className="pc-fill"
                  style={{
                    width: `${width}%`,
                    background: index === 0
                      ? "linear-gradient(90deg, #6366f1, #818cf8)"
                      : index === 1
                      ? "linear-gradient(90deg, #8b5cf6, #a78bfa)"
                      : "linear-gradient(90deg, #a78bfa, #c4b5fd)",
                    animationDelay: `${index * 0.15}s`,
                  }}
                />
              </div>
              <span className="pc-value">{formatCurrency(period.monthly_total, currency)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PeriodComparison;
