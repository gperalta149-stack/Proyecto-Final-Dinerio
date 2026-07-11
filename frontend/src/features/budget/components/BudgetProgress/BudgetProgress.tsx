// frontend/src/features/budget/components/BudgetProgress/BudgetProgress.tsx
import React from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";

import "./BudgetProgress.css";

interface BudgetProgressProps {
  spent: number;
  budget: number;
  percentageUsed: number;
  alertThreshold: number;
  daysRemaining: number;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  spent,
  budget,
  percentageUsed,
  alertThreshold,
  daysRemaining,
}) => {
  const dailyAllowance = daysRemaining > 0 ? (budget - spent) / daysRemaining : 0;
  const projectedSpending = daysRemaining > 0 
    ? spent + (spent / (30 - daysRemaining)) * daysRemaining 
    : spent;

  const getStatusColor = () => {
    if (percentageUsed >= 100) return "danger";
    if (percentageUsed >= alertThreshold) return "warning";
    return "success";
  };

  const statusColor = getStatusColor();
  const isExceeded = percentageUsed >= 100;

  return (
    <div className={`budget-progress budget-progress--${statusColor}`}>
      <div className="budget-progress-header">
        <div className="budget-progress-info">
          <span className="budget-progress-label">Gastado</span>
          <span className="budget-progress-amount">{formatCurrency(spent, "ARS")}</span>
        </div>
        <div className="budget-progress-info budget-progress-info--end">
          <span className="budget-progress-label">Presupuesto</span>
          <span className="budget-progress-amount">{formatCurrency(budget, "ARS")}</span>
        </div>
      </div>

      <div className="budget-progress-bar-wrapper">
        <div className="budget-progress-bar">
          <div 
            className={`budget-progress-fill ${statusColor}`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
          {/* Marcador de umbral */}
          <div 
            className="budget-progress-threshold"
            style={{ left: `${Math.min(alertThreshold, 100)}%` }}
          >
            <div className="budget-progress-threshold-flag">{alertThreshold}%</div>
            <div className="budget-progress-threshold-line" />
          </div>
        </div>
        
        <div className="budget-progress-markers">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {isExceeded && (
        <div className="budget-progress-exceeded">
          <AlertTriangle size={16} />
          Exceso: {formatCurrency(spent - budget, "ARS")} (+{((percentageUsed - 100)).toFixed(0)}%)
        </div>
      )}

      <div className="budget-progress-details">
        <div className="budget-progress-detail">
          <span className="budget-progress-detail-label">Disponible por día</span>
          <span className="budget-progress-detail-value">
            {dailyAllowance > 0 ? formatCurrency(dailyAllowance, "ARS") : "—"}
          </span>
        </div>
        <div className="budget-progress-detail">
          <span className="budget-progress-detail-label">Días restantes</span>
          <span className="budget-progress-detail-value">{daysRemaining}</span>
        </div>
        <div className="budget-progress-detail">
          <span className="budget-progress-detail-label">Proyección</span>
          <span className={`budget-progress-detail-value ${projectedSpending > budget ? "danger" : ""}`}>
            {formatCurrency(projectedSpending, "ARS")}
          </span>
        </div>
      </div>

      {percentageUsed < 50 && (
        <div className="budget-progress-success">
          <Sparkles size={18} /> Excelente — vas muy por debajo del presupuesto
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;