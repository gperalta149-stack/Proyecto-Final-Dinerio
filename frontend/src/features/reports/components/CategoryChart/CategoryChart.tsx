// frontend/src/features/reports/components/CategoryChart/CategoryChart.tsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import "./CategoryChart.css";

interface CategoryData {
  name: string;
  monthly_total: number;
  subscription_count: number;
  color?: string;
}

interface CategoryChartProps {
  data: CategoryData[];
  total: number;
  currency?: string;
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ef4444", "#84cc16"];

export const CategoryChart: React.FC<CategoryChartProps> = ({
  data,
  total,
  currency = "ARS",
}) => {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: item.color || COLORS[index % COLORS.length],
      percentage: total > 0 ? (item.monthly_total / total) * 100 : 0,
    }));
  }, [data, total]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="category-chart">
      <h3 className="category-title">Distribución por categoría</h3>
      
      <div className="category-list">
        {chartData.map((item, index) => (
          <motion.div
            key={item.name}
            className="category-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <div className="category-item-left">
              <span className="category-dot" style={{ background: item.color }} />
              <span className="category-name">{item.name}</span>
              <span className="category-count">{item.subscription_count} sub.</span>
            </div>
            <div className="category-item-right">
              <span className="category-amount">{formatCurrency(item.monthly_total, currency)}</span>
              <span className="category-percentage">{item.percentage.toFixed(0)}%</span>
              <div className="category-bar">
                <div 
                  className="category-bar-fill" 
                  style={{ 
                    width: `${Math.min(item.percentage, 100)}%`,
                    background: item.color 
                  }} 
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryChart;