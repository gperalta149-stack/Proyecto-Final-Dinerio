// frontend/src/features/budget/components/BudgetKPIs/BudgetKPIs.tsx
import React, { useEffect, useRef, useState } from "react";
import { Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import "./BudgetKPIs.css";

interface BudgetKPIsProps {
  budget: number;
  spent: number;
  available: number;
  percentageUsed: number;
}

/** Animates a number from 0 to `target` with an ease-out curve. */
function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>();
  const startRef = useRef<number>();

  useEffect(() => {
    startRef.current = undefined;

    const step = (timestamp: number) => {
      if (startRef.current === undefined) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

const RADIUS = 74;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Status = "success" | "warning" | "danger";

const getStatus = (pct: number): Status => {
  if (pct >= 100) return "danger";
  if (pct >= 80) return "warning";
  return "success";
};

const STROKE_COLOR: Record<Status, string> = {
  success: "var(--budget-green)",
  warning: "var(--budget-orange)",
  danger: "var(--budget-red)",
};

export const BudgetKPIs: React.FC<BudgetKPIsProps> = ({
  budget,
  spent,
  available,
  percentageUsed,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const animatedBudget = useCountUp(budget);
  const animatedSpent = useCountUp(spent);
  const animatedAvailable = useCountUp(available);

  const status = getStatus(percentageUsed);
  const clamped = Math.min(Math.max(percentageUsed, 0), 100);
  const offset = mounted
    ? CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE
    : CIRCUMFERENCE;

  const tiles = [
    {
      label: "Presupuesto",
      value: animatedBudget,
      icon: Wallet,
      color: "indigo" as const,
    },
    {
      label: "Gastado",
      value: animatedSpent,
      icon: TrendingDown,
      color: "blue" as const,
    },
    {
      label: "Disponible",
      value: animatedAvailable,
      icon: TrendingUp,
      color: available < 0 ? ("red" as const) : ("green" as const),
    },
  ];

  const colorMap = {
    indigo: { bg: "rgba(99, 102, 241, 0.1)", text: "var(--budget-accent-1)" },
    green: { bg: "rgba(34, 197, 94, 0.1)", text: "var(--budget-green)" },
    blue: { bg: "rgba(6, 182, 212, 0.1)", text: "var(--budget-blue)" },
    red: { bg: "rgba(239, 68, 68, 0.1)", text: "var(--budget-red)" },
  };

  return (
    <div className="budget-hero">
      <div className={`budget-hero-gauge budget-hero-gauge--${status}`}>
        <svg viewBox="0 0 180 180" className="budget-hero-ring" aria-hidden="true">
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke="var(--budget-border-subtle)"
            strokeWidth={STROKE}
          />
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke={STROKE_COLOR[status]}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 90 90)"
            className="budget-hero-ring-fill"
          />
        </svg>

        <div className="budget-hero-gauge-center">
          <span className="budget-hero-gauge-value">
            {percentageUsed.toFixed(0)}
            <span className="budget-hero-gauge-percent">%</span>
          </span>
          <span className="budget-hero-gauge-caption">utilizado</span>
        </div>

        {percentageUsed > 100 && (
          <div className="budget-hero-gauge-badge">
            +{(percentageUsed - 100).toFixed(0)}% excedido
          </div>
        )}
      </div>

      <div className="budget-hero-tiles">
        {tiles.map((tile, index) => {
          const Icon = tile.icon;
          const colors = colorMap[tile.color];
          return (
            <div
              key={index}
              className="budget-hero-tile"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div
                className="budget-hero-tile-icon"
                style={{ background: colors.bg, color: colors.text }}
              >
                <Icon size={18} />
              </div>
              <div className="budget-hero-tile-content">
                <span className="budget-hero-tile-label">{tile.label}</span>
                <span className="budget-hero-tile-value">
                  {formatCurrency(tile.value, "ARS")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetKPIs;