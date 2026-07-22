import React, { useState, useMemo } from "react";
import { ChartLine, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import "./MonthlyEvolution.css";

interface MonthlyData {
  month: string;
  amount: number;
  monthIndex?: number;
  year?: number;
}

interface MonthlyEvolutionProps {
  data: MonthlyData[];
  currency?: string;
  loading?: boolean;
  showAll?: boolean;
  large?: boolean;
  range?: number | null;
  onRangeChange?: (range: number | null) => void;
}

export const MonthlyEvolution: React.FC<MonthlyEvolutionProps> = ({
  data,
  currency = "ARS",
  loading = false,
  showAll = false,
  large = false,
  range: externalRange,
  onRangeChange,
}) => {
  const [internalRange, setInternalRange] = useState<number | null>(showAll ? null : 6);
  const range = externalRange !== undefined ? externalRange : internalRange;
  const setRange = onRangeChange || setInternalRange;

  const filtered = useMemo(() => {
    if (range === null) {
      return [...data]
        .filter(d => d.monthIndex != null)
        .sort((a, b) => {
          const aKey = (a.year || 0) * 12 + (a.monthIndex || 0);
          const bKey = (b.year || 0) * 12 + (b.monthIndex || 0);
          return aKey - bKey;
        });
    }
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const cutoffKey = currentYear * 12 + currentMonth;
    return [...data]
      .filter(d => {
        if (d.monthIndex == null) return true;
        const key = (d.year || 0) * 12 + d.monthIndex;
        return key <= cutoffKey && key > cutoffKey - range;
      })
      .sort((a, b) => {
        const aKey = (a.year || 0) * 12 + (a.monthIndex || 0);
        const bKey = (b.year || 0) * 12 + (b.monthIndex || 0);
        return aKey - bKey;
      });
  }, [data, range]);

  const maxAmount = Math.max(...filtered.map((d) => d.amount), 1);
  const chartHeight = large ? 500 : 240;
  const padding = large ? 50 : 36;

  if (loading) {
    return (
      <div className="me-loading">
        <div className="loading-spinner-small" />
        <span>Cargando evolución...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="me-empty">
        <TrendingUp size={40} />
        <p>No hay datos de evolución mensual</p>
      </div>
    );
  }



  return (
    <div className={`me-wrapper${large ? " me-large" : ""}`}>
      <div className="me-header">
        <div className="me-header-left">
          <span className="me-title">
            <ChartLine size={14} />
            Evolución de gastos
          </span>
        </div>
      </div>

      <div className="me-chart">
        <svg viewBox={`0 0 ${filtered.length * 70 + 60} ${chartHeight}`} className="me-svg">
          {[0, 1, 2, 3].map((i) => {
            const y = padding + (i * (chartHeight - padding * 2)) / 3;
            const value = maxAmount - (i * maxAmount) / 3;
            return (
              <g key={i}>
                <line x1={40} y1={y} x2={filtered.length * 70 + 40} y2={y}
                  stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
                <text x={36} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">
                  {formatCurrency(value, currency)}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="meAreaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <polygon
            points={`
              40,${chartHeight - padding}
              ${filtered.map((d, i) => {
                const x = 40 + i * 70 + 35;
                const y = chartHeight - padding - (d.amount / maxAmount) * (chartHeight - padding * 2);
                return `${x},${y}`;
              }).join(" ")}
              ${40 + (filtered.length - 1) * 70 + 35},${chartHeight - padding}
            `}
            fill="url(#meAreaGrad)"
          />

          <polyline
            points={filtered.map((d, i) => {
              const x = 40 + i * 70 + 35;
              const y = chartHeight - padding - (d.amount / maxAmount) * (chartHeight - padding * 2);
              return `${x},${y}`;
            }).join(" ")}
            fill="none" stroke="#6366f1" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          />

          {filtered.map((d, i) => {
            const x = 40 + i * 70 + 35;
            const y = chartHeight - padding - (d.amount / maxAmount) * (chartHeight - padding * 2);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="#6366f1" stroke="#0b0d14" strokeWidth="2.5" />
                <text x={x} y={y - 14} fill="rgba(255,255,255,0.8)" fontSize="10" textAnchor="middle" fontWeight="600">
                  {formatCurrency(d.amount, currency)}
                </text>
              </g>
            );
          })}

          {filtered.map((d, i) => {
            const x = 40 + i * 70 + 35;
            return (
              <text key={i} x={x} y={chartHeight - 8} fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">
                {d.month}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default MonthlyEvolution;
