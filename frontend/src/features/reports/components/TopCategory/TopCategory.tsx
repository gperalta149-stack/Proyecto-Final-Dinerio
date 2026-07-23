import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import '../../../../styles/reports/TopCategory.css';

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

interface TopCategoryProps {
  categories: CategoryData[];
  monthlyEvolution: MonthlyData[];
  monthlyTotal: number;
  currency?: string;
}

export const TopCategory: React.FC<TopCategoryProps> = ({
  categories,
  monthlyEvolution,
  monthlyTotal,
  currency = "ARS",
}) => {
  const top = categories.reduce((a, b) => a.monthly_total > b.monthly_total ? a : b);
  const pct = monthlyTotal > 0 ? ((top.monthly_total / monthlyTotal) * 100) : 0;

  const trend = (() => {
    if (monthlyEvolution.length < 2) return null;
    const sorted = [...monthlyEvolution].sort((a, b) => a.month - b.month);
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    if (prev.monthly_total > 0) {
      return ((last.monthly_total - prev.monthly_total) / prev.monthly_total) * 100;
    }
    return null;
  })();

  return (
    <div className="tc-wrapper">
      <div className="tc-header">
        <span className="tc-label">Categoría principal</span>
      </div>
      <div className="tc-body">
        <div className="tc-name" style={{ color: top.color || "#6366f1" }}>{top.name}</div>
        <div className="tc-amount">{formatCurrency(top.monthly_total, currency)}</div>
        <div className="tc-pct">{pct.toFixed(0)}% del gasto total</div>
        {trend !== null && (
          <div className={`tc-trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend >= 0 ? "+" : ""}{trend.toFixed(1)}% respecto al período anterior
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCategory;