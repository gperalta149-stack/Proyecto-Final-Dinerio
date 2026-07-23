// frontend/src/features/reports/components/InsightsCard/InsightsCard.tsx
import React from "react";
import { Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import '../../../../styles/reports/InsightsCard.css';

interface InsightsCardProps {
  budgetUsage: number;
  topCategory: string;
  topCategoryPercentage: number;
  totalSubscriptions: number;
  monthlyTotal: number;
}

export const InsightsCard: React.FC<InsightsCardProps> = ({
  budgetUsage,
  topCategory,
  topCategoryPercentage,
  totalSubscriptions,
  monthlyTotal,
}) => {
  const insights = [];

  if (budgetUsage > 100) {
    insights.push({
      type: "danger",
      icon: AlertTriangle,
      title: "Presupuesto excedido",
      description: `Has excedido tu presupuesto mensual en ${(budgetUsage - 100).toFixed(1)}%`,
    });
  } else if (budgetUsage > 80) {
    insights.push({
      type: "warning",
      icon: AlertTriangle,
      title: "Cerca del límite",
      description: `Estás utilizando el ${budgetUsage.toFixed(1)}% de tu presupuesto mensual`,
    });
  } else if (budgetUsage > 0) {
    insights.push({
      type: "success",
      icon: CheckCircle,
      title: "Presupuesto saludable",
      description: `Has utilizado el ${budgetUsage.toFixed(1)}% de tu presupuesto mensual`,
    });
  }

  if (topCategory) {
    insights.push({
      type: "info",
      icon: Lightbulb,
      title: `Categoría principal`,
      description: `${topCategory} representa el ${topCategoryPercentage.toFixed(0)}% del gasto mensual (${formatCurrency(monthlyTotal * (topCategoryPercentage / 100), "ARS")})`,
    });
  }

  if (totalSubscriptions === 0) {
    insights.push({
      type: "info",
      icon: Lightbulb,
      title: "Sin suscripciones activas",
      description: "No hay suscripciones activas para mostrar este mes",
    });
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="insights-card">
      <h4 className="insights-title"><Lightbulb size={18} /> Insights</h4>
      <div className="insights-list">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className={`insight-item ${insight.type}`}>
              <div className="insight-icon">
                <Icon size={16} />
              </div>
              <div className="insight-content">
                <div className="insight-item-title">{insight.title}</div>
                <div className="insight-item-description">{insight.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsCard;