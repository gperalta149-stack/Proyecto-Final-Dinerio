import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ChartPie, BarChart3 } from "lucide-react";
import type { Subscription } from "../../../../shared/types";
import { formatCurrency, parseAmount } from "../../../../shared/utils/formatters";
import "./CategoryChart.css";

interface CategoryChartProps {
  subscriptions: Subscription[];
  currency?: string;
}

const COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", 
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
];

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CategoryChart: React.FC<CategoryChartProps> = ({ 
  subscriptions, 
  currency = "ARS" 
}) => {
  const { categoryData, total } = useMemo(() => {
    const categories: Record<string, number> = {};
    
    (subscriptions || []).forEach((sub) => {
      const category = sub.category_name || sub.category || "Otros";
      const amount = parseAmount(sub.amount);
      if (amount === 0) return;
      
      let monthlyCost = amount;
      if (sub.billing_cycle === "yearly") monthlyCost = amount / 12;
      else if (sub.billing_cycle === "weekly") monthlyCost = amount * 4;
      
      categories[category] = (categories[category] || 0) + monthlyCost;
    });
    
    const data = Object.entries(categories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
    
    const total = data.reduce((sum, cat) => sum + cat.amount, 0);
    
    return { categoryData: data, total };
  }, [subscriptions]);

  if (categoryData.length === 0) {
    return (
      <div className="category-chart-empty">
        <span className="empty-icon"><BarChart3 size={48} /></span>
        <p>No hay suscripciones para mostrar</p>
      </div>
    );
  }

  let accumulatedPercent = 0;

  return (
    <div className="category-chart-wrapper">
      <div className="category-chart-header">
        <span className="category-top-label"><ChartPie size={12} style={{ marginRight: 4, verticalAlign: -1 }} />Categoría principal</span>
      </div>

      <div className="category-chart-body">
        <motion.div 
          className="category-chart-donut"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <svg viewBox="0 0 100 100" className="donut-svg">
            {categoryData.map((cat, index) => {
              const percentage = total > 0 ? (cat.amount / total) * 100 : 0;
              const offset = accumulatedPercent * CIRCUMFERENCE / 100;
              const length = percentage * CIRCUMFERENCE / 100;
              accumulatedPercent += percentage;
              
              return (
                <motion.circle
                  key={cat.name}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth="10"
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 50 50)"
                  className="donut-segment"
                  initial={{ strokeDashoffset: CIRCUMFERENCE }}
                  animate={{ strokeDashoffset: -offset }}
                  transition={{ duration: 1, delay: index * 0.15, ease: "easeInOut" }}
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="var(--dashboard-bg-card)" />
          </svg>
          <div className="donut-center">
            <span className="donut-center-value">
              {categoryData[0]?.name || "—"}
            </span>
            <span className="donut-center-caption">
              {total > 0 ? ((categoryData[0]?.amount || 0) / total * 100).toFixed(0) + "%" : "0%"}
            </span>
          </div>
        </motion.div>

        <div className="category-list-section">
              <span className="category-list-title"><ChartPie size={11} style={{ marginRight: 4, verticalAlign: -1 }} />Desglose</span>
          <div className="category-list">
            {categoryData.map((cat, index) => {
              const percentage = total > 0 ? (cat.amount / total) * 100 : 0;
              return (
                <motion.div
                  key={cat.name}
                  className={`category-item ${index === 0 ? "top" : ""}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <div className="category-item-left">
                    <span 
                      className="category-dot" 
                      style={{ background: COLORS[index % COLORS.length] }}
                    />
                    <span className="category-name">{cat.name}</span>
                  </div>
                  <div className="category-item-right">
                    <span className="category-amount">
                      {formatCurrency(cat.amount, currency)}
                    </span>
                    <span className="category-percentage">{percentage.toFixed(0)}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="category-total-row">
            <span>Total</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;