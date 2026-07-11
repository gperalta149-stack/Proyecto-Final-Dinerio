// frontend/src/features/reports/components/CategoryTable/CategoryTable.tsx
import React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import "./CategoryTable.css";

interface CategoryData {
  name: string;
  subscription_count: number;
  monthly_total: number;
  percentage: number;
  color?: string;
}

interface CategoryTableProps {
  data: CategoryData[];
  total: number;
  currency?: string;
  previousData?: CategoryData[];
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  data,
  total,
  currency = "ARS",
  previousData = [],
}) => {
  if (data.length === 0) {
    return null;
  }

  const getTrend = (current: CategoryData) => {
    const prev = previousData.find(p => p.name === current.name);
    if (!prev) return { icon: Minus, color: "neutral", label: "Nuevo" };
    const diff = current.monthly_total - prev.monthly_total;
    if (diff > 0) return { icon: ArrowUp, color: "up", label: `+${formatCurrency(diff, currency)}` };
    if (diff < 0) return { icon: ArrowDown, color: "down", label: `${formatCurrency(diff, currency)}` };
    return { icon: Minus, color: "neutral", label: "=" };
  };

  const colors = ["#6366f1", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ef4444", "#84cc16"];

  return (
    <div className="category-table">
      <h3 className="category-table-title">Detalle por categoría</h3>
      <div className="category-table-wrapper">
        <table className="category-table-content">
          <thead>
            <tr>
              <th>Categoría</th>
              <th className="text-right">Suscripciones</th>
              <th className="text-right">Gasto mensual</th>
              <th className="text-right">Porcentaje</th>
              <th className="text-right">Tendencia</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const trend = getTrend(item);
              const TrendIcon = trend.icon;
              const color = item.color || colors[index % colors.length];
              
              return (
                <tr key={item.name}>
                  <td>
                    <div className="category-cell">
                      <span className="category-dot" style={{ background: color }} />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="text-right">{item.subscription_count}</td>
                  <td className="text-right font-semibold">{formatCurrency(item.monthly_total, currency)}</td>
                  <td className="text-right">
                    <div className="percentage-cell">
                      <span>{item.percentage.toFixed(1)}%</span>
                      <div className="percentage-bar">
                        <div 
                          className="percentage-fill" 
                          style={{ width: `${Math.min(item.percentage, 100)}%`, background: color }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="text-right">
                    <span className={`trend-badge ${trend.color}`}>
                      <TrendIcon size={14} />
                      {trend.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryTable;