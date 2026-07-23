import React, { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import '../../../../styles/reports/PredictionsCard.css';

interface MonthlyData {
  month: number;
  monthly_total: number;
}

interface PredictionsCardProps {
  monthlyEvolution: MonthlyData[];
  currency?: string;
}

export const PredictionsCard: React.FC<PredictionsCardProps> = ({
  monthlyEvolution,
  currency = "ARS",
}) => {
  const prediction = useMemo(() => {
    if (!monthlyEvolution || monthlyEvolution.length < 2) return null;
    const sorted = [...monthlyEvolution].sort((a, b) => a.month - b.month);
    const totalSoFar = sorted.reduce((s, m) => s + m.monthly_total, 0);
    const avgMonthly = totalSoFar / sorted.length;
    const monthsRemaining = 12 - sorted.length;
    const projected = totalSoFar + avgMonthly * monthsRemaining;
    return { projected };
  }, [monthlyEvolution]);

  if (!prediction) return null;

  return (
    <div className="pred-wrapper">
      <div className="pred-icon">
        <Sparkles size={22} />
      </div>
      <div className="pred-text">
        <span className="pred-prefix">Si mantenés este ritmo</span>
        <span className="pred-main">terminarás el año con</span>
        <span className="pred-amount">{formatCurrency(prediction.projected, currency)}</span>
      </div>
    </div>
  );
};

export default PredictionsCard;
