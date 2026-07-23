import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import '../../../../styles/reports/CategoryTrends.css';

interface CategoryData {
  name: string;
  monthly_total: number;
  subscription_count: number;
  color?: string;
}

interface CategoryTrendsProps {
  currentCategories: CategoryData[];
  previousCategories?: CategoryData[];
  currency?: string;
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ef4444", "#84cc16"];

export const CategoryTrends: React.FC<CategoryTrendsProps> = ({
  currentCategories,
  previousCategories = [],
  currency = "ARS",
}) => {
  const trends = useMemo(() => {
    return currentCategories.map((cat, index) => {
      const prev = previousCategories.find(p => p.name === cat.name);
      const change = prev && prev.monthly_total > 0
        ? ((cat.monthly_total - prev.monthly_total) / prev.monthly_total) * 100
        : cat.monthly_total > 0 ? 100 : 0;
      return {
        name: cat.name,
        amount: cat.monthly_total,
        change,
        color: cat.color || COLORS[index % COLORS.length],
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [currentCategories, previousCategories]);

  if (trends.length === 0) return null;

  return (
    <div className="ct-wrapper">
      <h3 className="ct-title">Tendencias</h3>
      <div className="ct-list">
        {trends.map((trend, index) => (
          <motion.div
            key={trend.name}
            className="ct-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="ct-left">
              <span className="ct-dot" style={{ background: trend.color }} />
              <span className="ct-name">{trend.name}</span>
            </div>
            <div className="ct-right">
              <span className="ct-amount">{formatCurrency(trend.amount, currency)}</span>
              <span className={`ct-badge ${trend.change >= 0 ? "up" : "down"}`}>
                {trend.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {trend.change >= 0 ? "+" : ""}{trend.change.toFixed(0)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTrends;
