import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import "./AnnualDistribution.css";

interface CategoryData {
  name: string;
  monthly_total_ars: number;
  monthly_total_usd: number;
  color?: string;
}

interface MonthlyData {
  month: number;
  monthName: string;
  monthly_total: number;
}

interface AnnualDistributionProps {
  categories: CategoryData[];
  monthlyEvolution: MonthlyData[];
  monthlyTotal: number;
  currency?: string;
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ef4444", "#84cc16"];

const PAGE_SIZE = 3;

export const AnnualDistribution: React.FC<AnnualDistributionProps> = ({
  categories,
  monthlyEvolution,
  monthlyTotal,
  currency = "ARS",
}) => {
  const [page, setPage] = useState(0);

  const { segments, total } = useMemo(() => {
    const withTotal = categories.map((cat) => {
      const ars = Number(cat.monthly_total_ars || 0);
      const usd = Number(cat.monthly_total_usd || 0);
      const converted = ars + usd * 1450 * 1.75;
      return { ...cat, monthly_total: converted };
    });
    const total = withTotal.reduce((sum, c) => sum + c.monthly_total, 0);
    const segments = withTotal.map((cat, index) => ({
      name: cat.name,
      amount: cat.monthly_total,
      percentage: total > 0 ? (cat.monthly_total / total) * 100 : 0,
      color: cat.color || COLORS[index % COLORS.length],
    })).sort((a, b) => b.amount - a.amount);
    return { segments, total };
  }, [categories]);

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

  const radius = 74;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="ad-wrapper">
      <div className="ad-body">
        <div className="ad-left">
          <div className="ad-chart">
            <svg viewBox="0 0 180 180" className="ad-donut">
            <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
            {segments.map((seg) => {
              const dashArray = (seg.percentage / 100) * circumference;
              const dashOffset = -accumulated;
              accumulated += dashArray;
              return (
                <circle
                  key={seg.name}
                  cx="90" cy="90" r={radius}
                  fill="none" stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 90 90)"
                  style={{ transition: "all 0.6s ease" }}
                />
              );
            })}
            <text x="90" y="84" textAnchor="middle" className="ad-total">
              {formatCurrency(total, currency)}
            </text>
            <text x="90" y="102" textAnchor="middle" className="ad-label">
              Total
            </text>
            </svg>
          </div>
        </div>
        <div className="ad-legend">
          <div className="ad-legend-header">
            {segments.length > PAGE_SIZE && (
              <button className="ad-legend-arrow" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                <ChevronLeft size={14} />
              </button>
            )}
            <span className="ad-legend-title">Categorías</span>
            {segments.length > PAGE_SIZE && (
              <button className="ad-legend-arrow" onClick={() => setPage(Math.min(page + 1, Math.ceil(segments.length / PAGE_SIZE) - 1))} disabled={page >= Math.ceil(segments.length / PAGE_SIZE) - 1}>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
          {segments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((seg) => (
            <div key={seg.name} className="ad-legend-item app-card">
              <span className="ad-legend-dot" style={{ background: seg.color }} />
              <span className="ad-legend-name">{seg.name}</span>
              <span className="ad-legend-amount">{formatCurrency(seg.amount, currency)}</span>
              <span className="ad-legend-pct">{seg.percentage.toFixed(0)}%</span>
            </div>
          ))}
          {trend !== null && (
            <div className={`ad-trend ${trend >= 0 ? "up" : "down"}`}>
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend >= 0 ? "+" : ""}{trend.toFixed(1)}% respecto al período anterior
            </div>
          )}
        </div>
      </div>
    </div>
  );
};