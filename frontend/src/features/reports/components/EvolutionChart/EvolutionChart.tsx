// frontend/src/features/reports/components/EvolutionChart/EvolutionChart.tsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import '../../../../styles/reports/EvolutionChart.css';

interface EvolutionData {
  month: number;
  monthName: string;
  monthly_total: number;
  subscription_count: number;
}

interface EvolutionChartProps {
  data: EvolutionData[];
  currency?: string;
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({
  data,
  currency = "ARS",
}) => {
  const maxAmount = Math.max(...data.map((d) => d.monthly_total), 1);
  const chartHeight = 200;
  const padding = 32;

  const totalYearly = data.reduce((sum, d) => sum + d.monthly_total, 0);
  const avgMonthly = totalYearly / data.length;

  if (data.length === 0) {
    return (
      <div className="evolution-empty">
        <TrendingUp size={32} />
        <p>No hay datos de evolución</p>
      </div>
    );
  }

  return (
    <div className="evolution-chart">
      <div className="evolution-header">
        <h3 className="evolution-title">Evolución mensual</h3>
        <div className="evolution-stats">
          <div className="evolution-stat">
            <span className="evolution-stat-label">Total anual</span>
            <span className="evolution-stat-value">{formatCurrency(totalYearly, currency)}</span>
          </div>
          <div className="evolution-stat">
            <span className="evolution-stat-label">Promedio mensual</span>
            <span className="evolution-stat-value">{formatCurrency(avgMonthly, currency)}</span>
          </div>
        </div>
      </div>

      <div className="evolution-chart-container">
        <svg viewBox={`0 0 ${data.length * 60 + 40} ${chartHeight}`} className="evolution-svg">
          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => {
            const y = padding + (i * (chartHeight - padding * 2)) / 3;
            const value = maxAmount - (i * maxAmount) / 3;
            return (
              <g key={i}>
                <line
                  x1={20}
                  y1={y}
                  x2={data.length * 60 + 20}
                  y2={y}
                  stroke="var(--reports-border-subtle)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={16}
                  y={y + 4}
                  fill="var(--reports-text-tertiary)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {formatCurrency(value, currency)}
                </text>
              </g>
            );
          })}

          {/* Area under line */}
          <polygon
            points={`
              20,${chartHeight - padding}
              ${data
                .map((d, i) => {
                  const x = 20 + i * 60 + 30;
                  const y = chartHeight - padding - (d.monthly_total / maxAmount) * (chartHeight - padding * 2);
                  return `${x},${y}`;
                })
                .join(" ")}
              ${20 + (data.length - 1) * 60 + 30},${chartHeight - padding}
            `}
            fill="url(#areaGradient)"
            opacity="0.3"
          />

          <defs>
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--reports-accent-1)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--reports-accent-1)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Line */}
          <polyline
            points={data
              .map((d, i) => {
                const x = 20 + i * 60 + 30;
                const y = chartHeight - padding - (d.monthly_total / maxAmount) * (chartHeight - padding * 2);
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="var(--reports-accent-1)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {data.map((d, i) => {
            const x = 20 + i * 60 + 30;
            const y = chartHeight - padding - (d.monthly_total / maxAmount) * (chartHeight - padding * 2);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="var(--reports-accent-1)" stroke="var(--reports-bg-primary)" strokeWidth="2" />
                <text x={x} y={y - 12} fill="var(--reports-text-primary)" fontSize="10" textAnchor="middle" fontWeight="500">
                  {formatCurrency(d.monthly_total, currency)}
                </text>
              </g>
            );
          })}

          {/* Month labels */}
          {data.map((d, i) => {
            const x = 20 + i * 60 + 30;
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 6}
                fill="var(--reports-text-tertiary)"
                fontSize="11"
                textAnchor="middle"
              >
                {d.monthName}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default EvolutionChart;