import React, { useMemo } from "react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import "./AnnualDistribution.css";

interface CategoryData {
  name: string;
  monthly_total: number;
  color?: string;
}

interface AnnualDistributionProps {
  categories: CategoryData[];
  currency?: string;
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ef4444", "#84cc16"];

export const AnnualDistribution: React.FC<AnnualDistributionProps> = ({
  categories,
  currency = "ARS",
}) => {
  const { segments, total } = useMemo(() => {
    const total = categories.reduce((sum, c) => sum + c.monthly_total * 12, 0);
    const segments = categories.map((cat, index) => ({
      name: cat.name,
      annual: cat.monthly_total * 12,
      percentage: total > 0 ? ((cat.monthly_total * 12) / total) * 100 : 0,
      color: cat.color || COLORS[index % COLORS.length],
    })).sort((a, b) => b.annual - a.annual);
    return { segments, total };
  }, [categories]);

  if (segments.length === 0) return null;

  const radius = 60;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="ad-wrapper">
      <h3 className="ad-title">Distribución anual</h3>
      <div className="ad-content">
        <div className="ad-chart">
          <svg viewBox="0 0 160 160" className="ad-donut">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
            {segments.map((seg) => {
              const dashArray = (seg.percentage / 100) * circumference;
              const dashOffset = -accumulated;
              accumulated += dashArray;
              return (
                <circle
                  key={seg.name}
                  cx="80" cy="80" r={radius}
                  fill="none" stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                  style={{ transition: "all 0.6s ease" }}
                />
              );
            })}
            <text x="80" y="76" textAnchor="middle" className="ad-total">
              {formatCurrency(total, currency)}
            </text>
            <text x="80" y="94" textAnchor="middle" className="ad-label">
              Total anual
            </text>
          </svg>
        </div>
        <div className="ad-legend">
          {segments.map((seg) => (
            <div key={seg.name} className="ad-legend-item">
              <span className="ad-legend-dot" style={{ background: seg.color }} />
              <span className="ad-legend-name">{seg.name}</span>
              <span className="ad-legend-pct">{seg.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnualDistribution;
