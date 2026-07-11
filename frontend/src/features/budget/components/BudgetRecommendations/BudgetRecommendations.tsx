// frontend/src/features/budget/components/BudgetRecommendations/BudgetRecommendations.tsx
import React from "react";
import { TrendingUp, Target, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import type { BudgetRecommendation } from "../../types";
import "./BudgetRecommendations.css";

interface BudgetRecommendationsProps {
  spent: number;
  budget: number;
  percentageUsed: number;
}

export const BudgetRecommendations: React.FC<BudgetRecommendationsProps> = ({
  spent,
  budget,
  percentageUsed,
}) => {
  const getRecommendations = (): BudgetRecommendation[] => {
    const recommendations: BudgetRecommendation[] = [];

    if (percentageUsed > 100) {
      recommendations.push({
        type: 'danger',
        icon: <AlertTriangle size={16} />,
        title: 'Presupuesto excedido',
        description: `Superaste tu presupuesto en ${formatCurrency(spent - budget)}. Revisá tus suscripciones no esenciales.`,
      });
    } else if (percentageUsed > 80) {
      recommendations.push({
        type: 'warning',
        icon: <AlertTriangle size={16} />,
        title: 'Cerca del límite',
        description: `Estás utilizando el ${percentageUsed.toFixed(0)}% de tu presupuesto. Monitoreá tus gastos cuidadosamente.`,
      });
    } else if (percentageUsed <= 50 && percentageUsed > 0) {
      recommendations.push({
        type: 'success',
        icon: <CheckCircle2 size={16} />,
        title: 'Dentro del presupuesto',
        description: <>Tus gastos están bajo control. Seguí así! <Target size={16} /></>,
      });
    } else if (percentageUsed === 0 && budget > 0) {
      recommendations.push({
        type: 'info',
        icon: <Info size={16} />,
        title: 'Sin gastos registrados',
        description: 'Todavía no has gastado este mes. ¡Perfecto para empezar con buen pie!',
      });
    }

    if (budget === 0) {
      recommendations.push({
        type: 'info',
        icon: <Info size={16} />,
        title: 'Sin presupuesto definido',
        description: 'Establecé un presupuesto mensual para controlar mejor tus gastos.',
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="budget-recommendations">
      <h3 className="budget-recommendations-title">Recomendaciones</h3>
      <div className="budget-recommendations-list">
        {recommendations.map((rec, index) => (
          <div key={index} className={`budget-recommendation-item ${rec.type}`}>
            <div className="budget-recommendation-icon">{rec.icon}</div>
            <div className="budget-recommendation-content">
              <div className="budget-recommendation-title">{rec.title}</div>
              <div className="budget-recommendation-description">{rec.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetRecommendations;