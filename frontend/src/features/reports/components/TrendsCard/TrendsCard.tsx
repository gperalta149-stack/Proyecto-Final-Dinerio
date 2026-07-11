import React, { useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import "./TrendsCard.css";

interface MonthlyData {
  month: number;
  monthly_total: number;
}

interface TrendsCardProps {
  monthlyEvolution: MonthlyData[];
}

export const TrendsCard: React.FC<TrendsCardProps> = ({ monthlyEvolution }) => {
  const trend = useMemo(() => {
    if (!monthlyEvolution || monthlyEvolution.length < 4) return null;

    const sorted = [...monthlyEvolution].sort((a, b) => a.month - b.month);
    const len = sorted.length;

    const currentQuarter = sorted.slice(-3);
    const previousQuarter = sorted.slice(-6, -3);

    const currentAvg = currentQuarter.reduce((s, m) => s + m.monthly_total, 0) / 3;
    const previousAvg = previousQuarter.length > 0
      ? previousQuarter.reduce((s, m) => s + m.monthly_total, 0) / previousQuarter.length
      : 0;

    if (previousAvg === 0) return null;

    const change = ((currentAvg - previousAvg) / previousAvg) * 100;
    return { change: Math.abs(change), isDown: change < 0 };
  }, [monthlyEvolution]);

  if (!trend) return null;

  return (
    <div className="trends-card">
      <div className="trends-icon-wrapper">
        {trend.isDown ? <TrendingDown size={28} /> : <TrendingUp size={28} />}
      </div>
      <div className="trends-text">
        <span className="trends-highlight">
          Tus gastos {trend.isDown ? "bajaron" : "subieron"}
        </span>
        <span className="trends-percentage">{trend.change.toFixed(0)}%</span>
        <span className="trends-context">respecto al trimestre pasado</span>
      </div>
    </div>
  );
};

export default TrendsCard;
